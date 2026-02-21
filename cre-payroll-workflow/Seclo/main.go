//go:build wasip1

package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"

	"github.com/smartcontractkit/cre-sdk-go/capabilities/networking/confidentialhttp"
	"github.com/smartcontractkit/cre-sdk-go/capabilities/networking/http"
	"github.com/smartcontractkit/cre-sdk-go/cre"
	"github.com/smartcontractkit/cre-sdk-go/cre/wasm"
)

// ExecutionResult represents the final result of payroll processing
type ExecutionResult struct {
	Result  string         `json:"result"`
	Payouts []PayoutResult `json:"payouts"`
	Errors  []string       `json:"errors,omitempty"`
}

// PayoutResult contains details of a single payroll transaction
type PayoutResult struct {
	Employee   string `json:"employee"`
	Name       string `json:"name,omitempty"`
	Amount     string `json:"amount"`
	Status     string `json:"status"`
	Message    string `json:"message"`
	Department string `json:"department,omitempty"`
}

// Config holds workflow configuration parameters
type Config struct {
	TokenAddress         string `json:"tokenAddress"`
	ChainSelector        uint64 `json:"chainSelector"`
	EmployeeRegistryPath string `json:"employeeRegistryPath"`
}

// PayrollRequest represents incoming payroll batch data
type PayrollRequest struct {
	BatchID string `json:"batchId"`
	Records []struct {
		EmployeeID string  `json:"employeeId"`
		Amount     float64 `json:"amount"`
	} `json:"records"`
}

// InitWorkflow initializes the CRE workflow with HTTP trigger
func InitWorkflow(config *Config, logger *slog.Logger, secretsProvider cre.SecretsProvider) (cre.Workflow[*Config], error) {
	httpTrigger := http.Trigger(&http.Config{})

	return cre.Workflow[*Config]{
		cre.Handler(httpTrigger, onHttpTrigger),
	}, nil
}

// fetchEmployeeRegistry retrieves the employee registry via Confidential HTTP
// This ensures employee data is fetched securely from an external API
func fetchEmployeeRegistry(config Config, runtime cre.Runtime) (EmployeeRegistry, error) {
	logger := runtime.Logger()
	logger.Info("Fetching employee registry via Confidential HTTP")

	client := confidentialhttp.Client{}
	resp, err := client.SendRequest(runtime, &confidentialhttp.ConfidentialHTTPRequest{
		Request: &confidentialhttp.HTTPRequest{
			Url:    config.EmployeeRegistryPath,
			Method: "GET",
			MultiHeaders: map[string]*confidentialhttp.HeaderValues{
				"Authorization": {
					Values: []string{"Basic {{.myApiKey}}"},
				},
			},
		},
		VaultDonSecrets: []*confidentialhttp.SecretIdentifier{
			{Key: "myApiKey"},
		},
	}).Await()
	if err != nil {
		return EmployeeRegistry{}, fmt.Errorf("confidential HTTP request failed: %w", err)
	}

	var registry EmployeeRegistry
	if err := json.Unmarshal(resp.Body, &registry); err != nil {
		return EmployeeRegistry{}, fmt.Errorf("failed to parse registry JSON: %w", err)
	}

	return registry, nil
}

// onHttpTrigger handles incoming HTTP payroll requests
// Validates employees against registry and enforces payment limits
func onHttpTrigger(config *Config, runtime cre.Runtime, payload *http.Payload) (*ExecutionResult, error) {
	logger := runtime.Logger()

	logger.Info("===================================================")
	logger.Info("SECLO PAYROLL - CRE POLICY ENFORCEMENT")
	logger.Info("===================================================")

	// Parse incoming payroll request from HTTP payload
	var requestData PayrollRequest
	if err := json.Unmarshal([]byte(payload.Input), &requestData); err != nil {
		logger.Error("Failed to parse JSON input", "error", err)
		return &ExecutionResult{
			Result: "Error: Invalid JSON",
			Errors: []string{err.Error()},
		}, nil
	}

	// Validate required fields
	if requestData.BatchID == "" || len(requestData.Records) == 0 {
		return &ExecutionResult{
			Result: "Error: Missing required fields",
			Errors: []string{"batchId or records missing"},
		}, nil
	}

	logger.Info(fmt.Sprintf("Batch ID: %s", requestData.BatchID))
	logger.Info(fmt.Sprintf("Total Records: %d", len(requestData.Records)))
	logger.Info(fmt.Sprintf("Token: %s", config.TokenAddress))
	logger.Info(fmt.Sprintf("Chain: %d (Hoodi)", config.ChainSelector))
	logger.Info("")
	logger.Info("VALIDATING AGAINST EMPLOYEE REGISTRY...")
	logger.Info("---------------------------------------------------")

	// Fetch employee registry via Confidential HTTP
	registry, err := fetchEmployeeRegistry(*config, runtime)
	if err != nil {
		logger.Error("Confidential HTTP registry fetch failed", "error", err)
		return &ExecutionResult{
			Result: "Error: Failed to fetch employee registry via Confidential HTTP",
			Errors: []string{err.Error()},
		}, nil
	}

	logger.Info(fmt.Sprintf("Loaded %d authorized employees", len(registry.AuthorizedEmployees)))

	// Process each record with policy enforcement
	// Validates employee authorization and amount limits
	var payouts []PayoutResult
	var errors []string
	totalAmount := 0.0
	successCount := 0
	rejectedCount := 0

	for i, record := range requestData.Records {
		logger.Info(fmt.Sprintf("\nRecord %d/%d", i+1, len(requestData.Records)))
		logger.Info(fmt.Sprintf("   Address: %s", record.EmployeeID))
		logger.Info(fmt.Sprintf("   Amount: %.2f SCLO", record.Amount))

		// Validate against employee registry
		employee, authorized := validateEmployee(record.EmployeeID, record.Amount, registry, logger)

		payout := PayoutResult{
			Employee: record.EmployeeID,
			Amount:   fmt.Sprintf("%.2f", record.Amount),
		}

		if !authorized {
			logger.Error("   REJECTED: Unauthorized employee or amount exceeds limit")
			payout.Status = "rejected"
			payout.Message = "POLICY VIOLATION: Employee not authorized or amount exceeds limit"
			errors = append(errors, fmt.Sprintf("Unauthorized: %s", record.EmployeeID))
			rejectedCount++
		} else {
			logger.Info(fmt.Sprintf("   AUTHORIZED: %s (%s)", employee.Name, employee.Department))
			logger.Info(fmt.Sprintf("   Max Allowed: %.2f SCLO", employee.MaxAmount))
			payout.Status = "authorized"
			payout.Name = employee.Name
			payout.Department = employee.Department
			payout.Message = fmt.Sprintf("Transfer of %.2f SCLO to %s authorized", record.Amount, employee.Name)
			totalAmount += record.Amount
			successCount++
		}

		payouts = append(payouts, payout)
	}

	// Log execution summary
	logger.Info("")
	logger.Info("===================================================")
	logger.Info("EXECUTION SUMMARY")
	logger.Info("===================================================")
	logger.Info(fmt.Sprintf("Authorized: %d", successCount))
	logger.Info(fmt.Sprintf("Rejected: %d", rejectedCount))
	logger.Info(fmt.Sprintf("Total Amount: %.2f SCLO", totalAmount))

	// Generate final result message
	var result string
	if rejectedCount > 0 {
		result = fmt.Sprintf("Batch %s: %d authorized, %d REJECTED due to policy violations",
			requestData.BatchID, successCount, rejectedCount)
		logger.Error(result)
	} else {
		result = fmt.Sprintf("Batch %s: All %d transfers authorized, Total: %.2f SCLO",
			requestData.BatchID, successCount, totalAmount)
		logger.Info(result)
	}

	logger.Info("===================================================")

	return &ExecutionResult{
		Result:  result,
		Payouts: payouts,
		Errors:  errors,
	}, nil
}

// validateEmployee checks if an employee is authorized and if the amount is within limits
// Returns the employee record and authorization status
func validateEmployee(wallet string, amount float64, registry EmployeeRegistry, logger *slog.Logger) (*AuthorizedEmployee, bool) {
	// Normalize wallet address for case-insensitive comparison
	walletLower := strings.ToLower(wallet)

	for _, emp := range registry.AuthorizedEmployees {
		if strings.ToLower(emp.Wallet) == walletLower {
			// Check if amount exceeds max allowed for this employee
			if amount > emp.MaxAmount {
				logger.Error(fmt.Sprintf("   Amount %.2f exceeds max allowed %.2f for %s",
					amount, emp.MaxAmount, emp.Name))
				return nil, false
			}
			return &emp, true
		}
	}

	return nil, false
}

func main() {
	wasm.NewRunner(cre.ParseJSON[Config]).Run(InitWorkflow)
}