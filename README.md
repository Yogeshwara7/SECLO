# SECLO - Privacy-Preserving Blockchain Payroll with Chainlink CRE

Privacy-preserving blockchain payroll system powered by Chainlink CRE's Confidential HTTP, enabling secure employee data management while maintaining blockchain transparency for payments.

## Submission Links

- **Demo Video**: [YouTube Link - TO BE ADDED]
- **Virtual TestNet Explorer**: [Seclo-Payroll-VNet](https://dashboard.tenderly.co/explorer/vnet/8f468d9e-6664-467b-b913-619125797ad0/transactions)
- **Documentation**: [Chainlink Integration Details](docs/CHAINLINK_INTEGRATION.md)

## Overview

SECLO solves the fundamental conflict between blockchain transparency and employee privacy using Chainlink CRE's Confidential HTTP. Employee data (names, departments, salary limits) is fetched from an external API in a secure compute environment and never exposed on-chain. Only authorization decisions and payment amounts are recorded on the blockchain.

**Architecture:**
```
User Input → Backend (Gemini AI) → Chainlink CRE Workflow → Confidential HTTP (Employee Registry) → Compliance Validation → Blockchain Execution (Hoodi Network)
```

For detailed architecture diagrams, see [docs/ARCHITECTURE_MERMAID.md](docs/ARCHITECTURE_MERMAID.md)

## Chainlink CRE Integration

### Core Workflow Files

**Primary Implementation:**
- [`cre-payroll-workflow/Seclo/main.go`](cre-payroll-workflow/Seclo/main.go) - Main CRE workflow with Confidential HTTP
- [`cre-payroll-workflow/Seclo/workflow.yaml`](cre-payroll-workflow/Seclo/workflow.yaml) - Workflow configuration with risk checks
- [`cre-payroll-workflow/Seclo/registry.go`](cre-payroll-workflow/Seclo/registry.go) - Employee registry structures

**Configuration:**
- [`cre-payroll-workflow/Seclo/config.staging.json`](cre-payroll-workflow/Seclo/config.staging.json) - Staging environment
- [`cre-payroll-workflow/Seclo/config.production.json`](cre-payroll-workflow/Seclo/config.production.json) - Production environment
- [`cre-payroll-workflow/secrets.yaml`](cre-payroll-workflow/secrets.yaml) - DON secrets configuration
- [`cre-payroll-workflow/project.yaml`](cre-payroll-workflow/project.yaml) - Project metadata

**Smart Contracts:**
- [`PayrollConsumer.sol`](PayrollConsumer.sol) - Payroll consumer contract
- [`cre-payroll-workflow/contracts/evm/src/abi/PayrollConsumer.abi`](cre-payroll-workflow/contracts/evm/src/abi/PayrollConsumer.abi) - Contract ABI

### Backend Integration

- [`backend/src/services/creService.ts`](backend/src/services/creService.ts) - CRE workflow execution
- [`backend/src/routes/ai.ts`](backend/src/routes/ai.ts) - AI + CRE integration
- [`backend/src/routes/registry.ts`](backend/src/routes/registry.ts) - Employee registry API (Confidential HTTP target)
- [`backend/src/services/riskService.ts`](backend/src/services/riskService.ts) - Compliance validation
- [`backend/src/services/aiService.ts`](backend/src/services/aiService.ts) - Gemini AI service

### Confidential HTTP Implementation

```go
func fetchEmployeeRegistry(config Config, runtime cre.Runtime) (EmployeeRegistry, error) {
    client := confidentialhttp.Client{}
    resp, err := client.SendRequest(runtime, &confidentialhttp.ConfidentialHTTPRequest{
        Request: &confidentialhttp.HTTPRequest{
            Url:    config.EmployeeRegistryPath,
            Method: "GET",
            MultiHeaders: map[string]*confidentialhttp.HeaderValues{
                "Authorization": {Values: []string{"Basic {{.myApiKey}}"}},
            },
        },
        VaultDonSecrets: []*confidentialhttp.SecretIdentifier{{Key: "myApiKey"}},
    }).Await()
    
    // Employee data validated in secure environment
    // Only authorization decisions go on-chain
}
```

Employee PII (names, departments, limits) is fetched securely and never exposed on the blockchain. Only wallet addresses and payment amounts are recorded on-chain for ERC20 transfers.

## Quick Start

### Prerequisites
- Node.js 18+, Go 1.21+
- CRE CLI: `npm install -g @chainlink/cre-cli`

### Run CRE Workflow Simulation

**1. Start Backend (Employee Registry API):**
```bash
cd backend
npm install
npm run dev
```

**2. Build and Simulate CRE Workflow:**
```bash
cd cre-payroll-workflow
cre workflow build Seclo
cre workflow simulate Seclo --non-interactive --trigger-index 0 --http-payload "@Seclo/payload.json" --target staging-settings
```

**Expected Output:**
```json
{
  "batchId": "batch-001",
  "compliance": {
    "requested": 1,
    "approved": 1,
    "rejected": 0,
    "violations": []
  },
  "result": "Processed batch batch-001: 1/1 successful transfers, Total: 1000 SCLO",
  "payouts": [
    {
      "employee": "0xA1B2C3D4E5F60123456789012345678901234567",
      "amount": 1000,
      "status": "success"
    }
  ]
}
```

The workflow fetches employee registry via Confidential HTTP, validates authorization and payment limits, and returns the authorization decision.

## Tenderly Virtual TestNets

**Network:** Seclo-Payroll-VNet  
**Chain:** Hoodi (Chain ID: 40875)  
**Explorer:** [View Transactions](https://dashboard.tenderly.co/explorer/vnet/8f468d9e-6664-467b-b913-619125797ad0/transactions)

**Deployed Contracts:**
- PayrollConsumer: `0xe3b9f92b0D8e553De05051D84019748E2849750e`
- SCLO Token: `0xB4968458006519ef42a9e40E30142C0d13784e27`

Virtual TestNets provided instant setup, mainnet state synchronization, and unlimited testing iterations for development and validation.

## AI Integration (Optional)

Natural language payroll processing via Gemini AI. Users can type "Pay Alice 5000 SCLO" and the system parses the request, looks up wallet addresses, and triggers the CRE workflow.

**Start Frontend:**
```bash
cd frontend
npm install && npm start
```

## Environment Configuration

**CRE Workflow (.env):**
```env
CRE_ETH_PRIVATE_KEY=your_private_key
CRE_TARGET=staging-settings
MY_API_KEY_ALL=your_api_key
HOODI_RPC_URL=https://virtual.hoodi.eu.rpc.tenderly.co/YOUR_VNET_ID
```

**Backend (.env):**
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
HOODI_RPC_URL=https://virtual.hoodi.eu.rpc.tenderly.co/YOUR_VNET_ID
```

## Documentation

- [CHAINLINK_INTEGRATION.md](docs/CHAINLINK_INTEGRATION.md) - Complete CRE integration details and privacy implementation
- [ARCHITECTURE_MERMAID.md](docs/ARCHITECTURE_MERMAID.md) - System architecture diagrams
- [DEMO_SCRIPT_FINAL.md](docs/DEMO_SCRIPT_FINAL.md) - Presentation script and demo commands

## License

MIT License

---

Built for Convergence – A Chainlink Hackathon 2026
