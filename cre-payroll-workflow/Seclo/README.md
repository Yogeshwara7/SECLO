# SECLO Payroll CRE Workflow (Simulation)

This workflow is the **onchain execution/orchestration layer** for SECLO payroll. It:

- Accepts an HTTP payload (`batchId`, `records[]`)
- Executes ERC-20 `transfer()` calls on the configured chain (Hoodi selector `40875`)
- Returns a formatted summary of payouts and tx hashes

## Files that matter (Chainlink / CRE)

- `workflow.yaml`: CRE workflow definition (HTTP trigger → validate → for-each EVM contract call)
- `config.staging.json` / `config.production.json`: CRE workflow config
- `employee-registry.json`: example registry (currently **not enforced** by `workflow.yaml`)

## Required environment

For simulations that perform chain writes, CRE typically needs a funded private key:

```bash
CRE_ETH_PRIVATE_KEY=...your funded key...
```

## Simulate via CRE CLI

Run from the `cre-payroll-workflow/` directory:

```bash
cre workflow simulate Seclo --non-interactive --trigger-index 0 --http-payload "{\"batchId\":\"demo\",\"records\":[{\"employeeId\":\"0x...\",\"amount\":5}]}" --target staging-settings
```

Or run the full app flow (recommended): call the backend `/ai/query` endpoint and let it trigger the CRE simulation.
