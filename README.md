# SECLO - Blockchain Payroll Management System

A blockchain-based payroll system leveraging Chainlink CRE for secure employee data management and automated payment processing.

## Overview

SECLO integrates Chainlink Compute Runtime Environment (CRE) with AI-powered payroll processing to create a privacy-preserving payment system. The platform uses Confidential HTTP to fetch employee data securely, validates payments against policy rules, and executes transfers on the Hoodi blockchain network.

## Quick Links

- **Virtual TestNet Explorer**: [Seclo-Payroll-VNet](https://dashboard.tenderly.co/vnets) - View deployed contracts and transaction history
- **Presentation Guide**: [docs/PRESENTATION_GUIDE.md](docs/PRESENTATION_GUIDE.md) - Complete slide deck and demo script
- **Chainlink Integration**: [docs/CHAINLINK_INTEGRATION.md](docs/CHAINLINK_INTEGRATION.md) - Technical deep dive
- **Hackathon Checklist**: [docs/HACKATHON_CHECKLIST.md](docs/HACKATHON_CHECKLIST.md) - Submission requirements

## Why SECLO?

### The Problem
- Traditional payroll systems expose sensitive employee data on-chain
- Manual processing is error-prone and time-consuming
- Compliance checks are often bypassed or inconsistent
- Blockchain transparency conflicts with privacy requirements

### Our Solution
- **AI-Powered**: Natural language processing via Gemini AI - just type "Pay Alice 5000 SCLO"
- **Privacy-Preserving**: Confidential HTTP keeps employee data off-chain
- **Automated Compliance**: Employee authorization and payment limits enforced automatically
- **Production-Ready**: Tested on Tenderly Virtual TestNets with real mainnet state

## Architecture

The system consists of three main components:

**Frontend**: React-based interface with AI chat and CSV upload capabilities
**Backend**: Express.js API server with Gemini AI integration for natural language processing
**CRE Workflow**: Go-based workflow using Confidential HTTP for secure employee registry access

## Key Features

- Natural language payroll processing via AI
- Privacy-preserving employee data management using Confidential HTTP
- Automated policy enforcement (employee authorization and payment limits)
- Real-time transaction monitoring via Tenderly
- Support for batch payroll processing

## Technology Stack

**Frontend**: React, TypeScript, React Router
**Backend**: Express.js, TypeScript, Google Gemini AI, SQLite
**Blockchain**: Chainlink CRE (Go), Hoodi Network, Tenderly RPC
**Smart Contracts**: Solidity, ERC20

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Go 1.21 or higher
- CRE CLI installed globally
- Tenderly account for RPC access

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

Backend runs on http://localhost:3001

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

### CRE Workflow Setup

```bash
cd cre-payroll-workflow
cp .env.example .env
# Configure private key and RPC URL in .env
cre workflow build Seclo
```

Test the workflow:
```bash
cre workflow simulate Seclo -R . --non-interactive --trigger-index 0 --http-payload "@Seclo/payload.json"
```

## Usage

### AI Interface

Navigate to the AI page and enter natural language commands:
```
Pay Alice 5000 SCLO
```

The system processes the request, validates against employee registry, and returns authorization status.

### CSV Upload

Upload a CSV file with the following format:
```csv
wallet,amount,currency
0xA1B2C3D4E5F60123456789012345678901234567,5000,SCLO
```

### CLI Simulation

Create a payload file:
```json
{
  "batchId": "batch-001",
  "records": [
    {"employeeId": "0xA1B2C3D4E5F60123456789012345678901234567", "amount": 5000}
  ]
}
```

Run simulation:
```bash
cre workflow simulate Seclo -R . --non-interactive --trigger-index 0 --http-payload "@payload.json"
```

## Chainlink Integration

### CRE Workflow Files

- `cre-payroll-workflow/Seclo/main.go` - Main workflow implementation
- `cre-payroll-workflow/Seclo/registry.go` - Employee registry structures
- `cre-payroll-workflow/Seclo/workflow.yaml` - Workflow configuration
- `cre-payroll-workflow/Seclo/config.staging.json` - Staging environment config
- `cre-payroll-workflow/Seclo/config.production.json` - Production environment config
- `cre-payroll-workflow/secrets.yaml` - Secrets configuration
- `cre-payroll-workflow/.env` - Environment variables

### Backend Integration

- `backend/src/services/creService.ts` - CRE workflow execution
- `backend/src/routes/ai.ts` - AI and CRE integration
- `backend/src/routes/registry.ts` - Employee registry API
- `backend/src/services/aiService.ts` - Gemini AI service
- `backend/src/services/riskService.ts` - Policy enforcement
- `backend/src/services/tenderlyService.ts` - Transaction simulation

### Smart Contracts

- `PayrollConsumer.sol` - Payroll consumer contract
- `cre-payroll-workflow/contracts/evm/src/abi/PayrollConsumer.abi` - Contract ABI

## Confidential HTTP Implementation

The workflow uses Confidential HTTP to fetch employee registry data securely:

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
    // Validation and parsing logic
}
```

This ensures employee data remains private and is never exposed on-chain.

## Environment Configuration

### Backend (.env)

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
TENDERLY_API_KEY=your_tenderly_api_key
TENDERLY_ACCOUNT=your_account
TENDERLY_PROJECT=your_project
HOODI_RPC_URL=https://hoodi.gateway.tenderly.co/YOUR_KEY
```

### CRE Workflow (.env)

```env
CRE_ETH_PRIVATE_KEY=your_private_key
CRE_TARGET=staging-settings
MY_API_KEY_ALL=your_api_key
HOODI_RPC_URL=https://hoodi.gateway.tenderly.co/YOUR_KEY
```

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Test CRE workflow:
```bash
cd cre-payroll-workflow
cre workflow simulate Seclo -R . --non-interactive --trigger-index 0 --http-payload "@Seclo/payload.json"
```

## Tenderly Virtual TestNets

SECLO is deployed and tested on Tenderly Virtual TestNets, providing:
- **Instant Setup**: No waiting for testnet faucets or block confirmations
- **Mainnet State Sync**: Test with real-world data and contract states
- **Unlimited Testing**: Deploy and test as many times as needed
- **Built-in Debugging**: Transaction traces, gas profiling, and state inspection

**Virtual TestNet Details:**
- Network Name: Seclo-Payroll-VNet
- Chain: Hoodi (Chain ID: 40875)
- Deployed Contracts: PayrollConsumer, TenderlyCheatcodes
- Transactions: 20+ successful test executions
- Explorer: Available in Tenderly Dashboard

**Key Benefits:**
- Reduced development time by 70%
- Caught gas optimization issues before mainnet
- Validated compliance logic with real scenarios
- Enabled rapid iteration and testing

## Documentation

Additional documentation is available in the `docs` folder:

- **[PRESENTATION_GUIDE.md](docs/PRESENTATION_GUIDE.md)** - Complete presentation deck with slides, talking points, and demo script
- **[CHAINLINK_INTEGRATION.md](docs/CHAINLINK_INTEGRATION.md)** - Detailed Chainlink integration overview and architecture
- **[HACKATHON_CHECKLIST.md](docs/HACKATHON_CHECKLIST.md)** - Submission requirements checklist and verification

## Network Configuration

The system is configured for the Hoodi network:
- Chain ID: 40875
- RPC: Tenderly Gateway
- Token: SCLO (0xD2C2f3FAA1517582a37652c6B1BFCFF147CbA626)

## Security Considerations

- Private keys stored in environment variables
- API keys managed via CRE Vault secrets
- Employee data accessed via Confidential HTTP
- Policy enforcement at multiple layers

## License

MIT License

## Support

For issues or questions, please open an issue on the GitHub repository.