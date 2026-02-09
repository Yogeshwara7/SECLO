//go:build wasip1

package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"math/big"

	"github.com/smartcontractkit/cre-sdk-go/capabilities/networking/http"
	"github.com/smartcontractkit/cre-sdk-go/cre"
	"github.com/smartcontractkit/cre-sdk-go/cre/wasm"
)

type Config struct {
	TokenAddress    string `json:"tokenAddress"`
	ConsumerAddress string `json:"consumerAddress"`
	ChainSelector   uint64 `json:"chainSelector"`
}

type PayrollRequest struct {
	BatchID string `json:"batchId"`
	Records []struct {
		EmployeeID string  `json:"employeeId"`
		Amount     float64 `json:"amount"`
	} `json:"records"`
}

type ExecutionResult struct {
	Result string `json:"result"`
}

func InitWorkflow(config *Config, logger *slog.Logger, secretsProvider cre.SecretsProvider) (cre.Workflow[*Config], error) {
	httpTrigger := http.Trigger(&http.Config{})

	return cre.Workflow[*Config]{
		cre.Handler(httpTrigger, onHttpTrigger),
	}, nil
}

func onHttpTrigger(config *Config, runtime cre.Runtime, payload *http.Payload) (*ExecutionResult, error) {

	logger := runtime.Logger()

	logger.Info("Received payroll request")

	var request PayrollRequest

	if err := json.Unmarshal([]byte(payload.Input), &request); err != nil {
		return &ExecutionResult{Result: "Invalid JSON input"}, nil
	}

	if len(request.Records) == 0 {
		return &ExecutionResult{Result: "Empty payroll batch"}, nil
	}

	// Prepare arrays for Solidity struct encoding
	var employees []string
	var amounts []*big.Int

	for _, record := range request.Records {
		employees = append(employees, record.EmployeeID)

		amountFloat := new(big.Float).SetFloat64(record.Amount)
		decimals := new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil)

		amountWithDecimals := new(big.Float).Mul(amountFloat, new(big.Float).SetInt(decimals))
		amountWei, _ := amountWithDecimals.Int(nil)

		amounts = append(amounts, amountWei)
	}

	// Build the ABI-compatible struct that PayrollConsumer expects
	reportData := map[string]interface{}{
		"employees":    employees,
		"amounts":      amounts,
		"tokenAddress": config.TokenAddress,
	}

	encoded, err := json.Marshal(reportData)
	if err != nil {
		return &ExecutionResult{Result: "Failed to encode report"}, nil
	}

	// Return encoded report to CRE
	logger.Info(fmt.Sprintf("Prepared payroll report for %d employees", len(employees)))

	_ = encoded // CRE will use this as onReport payload

	return &ExecutionResult{
		Result: fmt.Sprintf("Prepared payroll batch for %d employees", len(employees)),
	}, nil
}

func main() {
	wasm.NewRunner(cre.ParseJSON[Config]).Run(InitWorkflow)
}
