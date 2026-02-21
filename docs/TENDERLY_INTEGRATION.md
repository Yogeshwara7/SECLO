# Tenderly Integration Guide

## Overview

Tenderly provides blockchain simulation and monitoring for the SECLO payroll system. It allows testing transactions before execution, reducing gas costs and preventing failed transactions.

## Setup

### Create Tenderly Account

1. Visit tenderly.co and create an account
2. Create a new project
3. Navigate to Settings and generate an API key
4. Note your account name and project name

### Configure Tenderly Node

1. In Tenderly dashboard, navigate to Node section
2. Add Hoodi network (Chain ID: 40875)
3. Copy your Tenderly RPC endpoint

### Environment Configuration

Update backend/.env:
```env
TENDERLY_API_KEY=your_api_key
TENDERLY_ACCOUNT=your_account_name
TENDERLY_PROJECT=your_project_name
HOODI_RPC_URL=https://hoodi.gateway.tenderly.co/YOUR_KEY
HOODI_WSS_URL=wss://hoodi.gateway.tenderly.co/YOUR_KEY
```

Update cre-payroll-workflow/.env:
```env
HOODI_RPC_URL=https://hoodi.gateway.tenderly.co/YOUR_KEY
```

### Update Workflow Configuration

The workflow.yaml file uses Tenderly RPC for Hoodi network, providing transaction simulation and debugging capabilities.

## Transaction Flow

1. User submits payroll request
2. Backend validates records
3. CRE workflow fetches employee registry via Confidential HTTP
4. Policy enforcement validates employees and amounts
5. Tenderly RPC simulates transactions
6. Approved transactions execute on Hoodi network
7. Activity monitored in Tenderly dashboard

## Backend Integration

The tenderlyService.ts file provides transaction simulation:

```typescript
import { simulatePayrollTransaction } from './services/tenderlyService';

const result = await simulatePayrollTransaction(
  ['0xAlice...', '0xBob...'],
  [1000, 2000],
  '0xTokenAddress',
  '0xConsumerAddress'
);
```

## Testing

Start the backend:
```bash
cd backend
npm run dev
```

Submit a payroll request via AI interface:
```
Pay Alice 1000 SCLO
```

Check Tenderly dashboard for transaction details, traces, and logs.

Run CRE workflow simulation:
```bash
cd cre-payroll-workflow
cre workflow simulate Seclo -R . --non-interactive --trigger-index 0 --http-payload "@payload.json"
```

## Benefits

### Public RPC Limitations
- Basic transaction submission
- No debugging capabilities
- No simulation
- Limited monitoring

### Tenderly RPC Advantages
- Transaction simulation before execution
- Detailed debugging traces
- Event log monitoring
- Gas profiling and optimization
- Failure analysis
- Real-time transaction monitoring

All transactions routed through Tenderly RPC are automatically simulated, traced, and logged in the dashboard.

## Privacy Integration

For privacy-focused applications:

- Confidential HTTP fetches employee registry from secure endpoint
- Registry data never exposed on-chain
- Employee information protected throughout the flow
- Only approved transfers execute on-chain

### Complete Flow

1. User submits payroll
2. Backend validates records
3. CRE workflow fetches registry via Confidential HTTP
4. Policy enforcement validates employees and amounts
5. Tenderly RPC simulates transactions
6. Approved transactions execute on Hoodi network
7. All activity monitored in Tenderly dashboard

This architecture ensures employee data privacy while maintaining transaction transparency and debugging capabilities.

## Deployment

Deploy PayrollConsumer contract to Hoodi testnet with:
- Forwarder Address: from CRE documentation
- SCLO Token Address: 0xD2C2f3FAA1517582a37652c6B1BFCFF147CbA626

Update consumer address in cre-payroll-workflow/Seclo/config.staging.json:
```json
{
  "consumerAddress": "0xYourDeployedContractAddress"
}
```

## Support

For issues:
1. Check Tenderly dashboard for transaction details
2. Review simulation logs
3. Verify RPC configuration in .env files
4. Ensure backend is running before CRE simulation
