//go:build wasip1

package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"

	"github.com/smartcontractkit/cre-sdk-go/capabilities/networking/http"
	"github.com/smartcontractkit/cre-sdk-go/cre"
	"github.com/smartcontractkit/cre-sdk-go/cre/wasm"
)

type ExecutionResult struct {
	Result  string         `json:"result"`
	Payouts []PayoutResult `json:"payouts"`
	Errors  []string       `json:"errors,omitempty"`
}

type PayoutResult struct {
	Employee   string `json:"employee"`
	Name       string `json:"name,omitempty"`
	Amount     string `json:"amount"`
	Status     string `json:"status"`
	Message    string `json:"message"`
	Department string `json:"department,omitempty"`
}

type Config struct {
	TokenAddress         string `json:"tokenAddress"`
	ChainSelector        uint64 `json:"chainSelector"`
	EmployeeRegistryPath string `json:"employeeRegistryPath"`
}

type PayrollRequest struct {
	BatchID string `json:"batchId"`
	Records []struct {
		EmployeeID string  `json:"employeeId"`
		Amount     float64 `json:"amount"`
	} `json:"records"`
}

func InitWorkflow(config *Config, logger *slog.Logger, secretsProvider cre.SecretsProvider) (cre.Workflow[*Config], error) {
	httpTrigger := http.Trigger(&http.Config{})

	return cre.Workflow[*Config]{
		cre.Handler(httpTrigger, onHttpTrigger),
	}, nil
}

func onHttpTrigger(config *Config, runtime cre.Runtime, payload *http.Payload) (*ExecutionResult, error) {
	logger := runtime.Logger()

	logger.Info("═══════════════════════════════════════════════════")
	logger.Info("🔒 SECLO PAYROLL - CRE POLICY ENFORCEMENT")
	logger.Info("═══════════════════════════════════════════════════")

	var requestData PayrollRequest

	if err := json.Unmarshal([]byte(payload.Input), &requestData); err != nil {
		logger.Error("❌ Failed to parse JSON input", "error", err)
		return &ExecutionResult{
			Result: "Error: Invalid JSON",
			Errors: []string{err.Error()},
		}, nil
	}

	if requestData.BatchID == "" || len(requestData.Records) == 0 {
		return &ExecutionResult{
			Result: "Error: Missing required fields",
			Errors: []string{"batchId or records missing"},
		}, nil
	}

	logger.Info(fmt.Sprintf("📦 Batch ID: %s", requestData.BatchID))
	logger.Info(fmt.Sprintf("📊 Total Records: %d", len(requestData.Records)))
	logger.Info(fmt.Sprintf("💰 Token: %s", config.TokenAddress))
	logger.Info(fmt.Sprintf("⛓️  Chain: %d (Hoodi)", config.ChainSelector))
	logger.Info("")
	logger.Info("🔍 VALIDATING AGAINST EMPLOYEE REGISTRY...")
	logger.Info("─────────────────────────────────────────────────")

	// Load employee registry
	registry := GetEmployeeRegistry()
	logger.Info(fmt.Sprintf("📋 Loaded %d authorized employees", len(registry.AuthorizedEmployees)))

	// Process each record with policy enforcement
	var payouts []PayoutResult
	var errors []string
	totalAmount := 0.0
	successCount := 0
	rejectedCount := 0

	for i, record := range requestData.Records {
		logger.Info(fmt.Sprintf("\n� Record %d/%d", i+1, len(requestData.Records)))
		logger.Info(fmt.Sprintf("   Address: %s", record.EmployeeID))
		logger.Info(fmt.Sprintf("   Amount: %.2f SCLO", record.Amount))

		// Validate against employee registry
		employee, authorized := validateEmployee(record.EmployeeID, record.Amount, registry, logger)

		payout := PayoutResult{
			Employee: record.EmployeeID,
			Amount:   fmt.Sprintf("%.2f", record.Amount),
		}

		if !authorized {
			logger.Error(fmt.Sprintf("   ❌ REJECTED: Unauthorized employee or amount exceeds limit"))
			payout.Status = "rejected"
			payout.Message = "POLICY VIOLATION: Employee not authorized or amount exceeds limit"
			errors = append(errors, fmt.Sprintf("Unauthorized: %s", record.EmployeeID))
			rejectedCount++
		} else {
			logger.Info(fmt.Sprintf("   ✅ AUTHORIZED: %s (%s)", employee.Name, employee.Department))
			logger.Info(fmt.Sprintf("   📋 Max Allowed: %.2f SCLO", employee.MaxAmount))
			payout.Status = "authorized"
			payout.Name = employee.Name
			payout.Department = employee.Department
			payout.Message = fmt.Sprintf("Transfer of %.2f SCLO to %s authorized", record.Amount, employee.Name)
			totalAmount += record.Amount
			successCount++
		}

		payouts = append(payouts, payout)
	}

	logger.Info("")
	logger.Info("═══════════════════════════════════════════════════")
	logger.Info("📊 EXECUTION SUMMARY")
	logger.Info("═══════════════════════════════════════════════════")
	logger.Info(fmt.Sprintf("✅ Authorized: %d", successCount))
	logger.Info(fmt.Sprintf("❌ Rejected: %d", rejectedCount))
	logger.Info(fmt.Sprintf("💵 Total Amount: %.2f SCLO", totalAmount))

	var result string
	if rejectedCount > 0 {
		result = fmt.Sprintf("⚠️  Batch %s: %d authorized, %d REJECTED due to policy violations", 
			requestData.BatchID, successCount, rejectedCount)
		logger.Error(result)
	} else {
		result = fmt.Sprintf("✅ Batch %s: All %d transfers authorized, Total: %.2f SCLO", 
			requestData.BatchID, successCount, totalAmount)
		logger.Info(result)
	}

	logger.Info("═══════════════════════════════════════════════════")

	return &ExecutionResult{
		Result:  result,
		Payouts: payouts,
		Errors:  errors,
	}, nil
}

func validateEmployee(wallet string, amount float64, registry EmployeeRegistry, logger *slog.Logger) (*AuthorizedEmployee, bool) {
	// Normalize wallet address for comparison
	walletLower := strings.ToLower(wallet)

	for _, emp := range registry.AuthorizedEmployees {
		if strings.ToLower(emp.Wallet) == walletLower {
			// Check if amount exceeds max allowed
			if amount > emp.MaxAmount {
				logger.Error(fmt.Sprintf("   ⚠️  Amount %.2f exceeds max allowed %.2f for %s", 
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
