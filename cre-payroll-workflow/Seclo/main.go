//go:build wasip1

package main

import (
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/smartcontractkit/cre-sdk-go/capabilities/networking/http"
	"github.com/smartcontractkit/cre-sdk-go/cre"
	"github.com/smartcontractkit/cre-sdk-go/cre/wasm"
)

type ExecutionResult struct {
	Result string
}

// Workflow configuration loaded from the config.json file
type Config struct {
	MinimumAmount float64 `json:"minimumAmount"`
}

type PayrollRequest struct {
	BatchID string `json:"batchId"`
	Records []struct {
		EmployeeID string  `json:"employeeId"`
		Amount     float64 `json:"amount"`
	} `json:"records"`
}

// Workflow implementation with a list of capability triggers
func InitWorkflow(config *Config, logger *slog.Logger, secretsProvider cre.SecretsProvider) (cre.Workflow[*Config], error) {
	// Create the HTTP trigger (empty config for simulation)
	httpTrigger := http.Trigger(&http.Config{})

	// Register a handler with the trigger and a callback function
	return cre.Workflow[*Config]{
		cre.Handler(httpTrigger, onHttpTrigger),
	}, nil
}

func onHttpTrigger(config *Config, runtime cre.Runtime, payload *http.Payload) (*ExecutionResult, error) {
	logger := runtime.Logger()
	
	logger.Info(fmt.Sprintf("Received payload: %s", payload.Input))
	
	var requestData PayrollRequest
	
	// Parse the input - payload.Input is already a JSON string
	inputBytes := []byte(payload.Input)
	if err := json.Unmarshal(inputBytes, &requestData); err != nil {
		logger.Error("Failed to parse JSON input", "error", err, "input", payload.Input)
		return &ExecutionResult{Result: fmt.Sprintf("Error: Invalid JSON - %v", err)}, nil
	}

	// Validate required fields
	if requestData.BatchID == "" || len(requestData.Records) == 0 {
		logger.Info("Missing required fields")
		return &ExecutionResult{Result: "Error: Missing required fields (batchId, records)"}, nil
	}

	logger.Info(fmt.Sprintf("Processing payroll batch: %s", requestData.BatchID))
	logger.Info(fmt.Sprintf("Total records: %d", len(requestData.Records)))

	// Process each record
	totalAmount := 0.0
	for i, record := range requestData.Records {
		logger.Info(fmt.Sprintf("Record %d: Employee %s, Amount: %.2f", i+1, record.EmployeeID, record.Amount))
		totalAmount += record.Amount
	}

	logger.Info(fmt.Sprintf("Total payroll amount: %.2f", totalAmount))

	result := fmt.Sprintf("Successfully processed batch %s with %d records. Total: %.2f", 
		requestData.BatchID, len(requestData.Records), totalAmount)
	
	return &ExecutionResult{Result: result}, nil
}

func main() {
	wasm.NewRunner(cre.ParseJSON[Config]).Run(InitWorkflow)
}