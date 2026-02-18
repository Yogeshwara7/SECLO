# SECLO Dashboard

A full-stack application for payroll management and status monitoring.

## Hackathon track alignment (honest assessment)

### CRE & AI ✅ (implemented end-to-end)
- **AI agent / LLM**: Backend calls Gemini and produces structured payroll instructions.
- **CRE orchestration**: Backend triggers a CRE workflow simulation which performs EVM token transfers.

Key files:
- `backend/src/services/aiService.ts` (Gemini → structured payroll JSON)
- `backend/src/routes/ai.ts` (turns AI output into a payroll batch + triggers CRE execution)
- `backend/src/services/creService.ts` (calls `cre workflow simulate ...`)
- `cre-payroll-workflow/Seclo/workflow.yaml` (CRE workflow: HTTP trigger → EVM contract calls)

### Risk & Compliance ⚠️ (partially implemented; needs wiring)
- **Implemented in backend execution path**: the `/ai/query` payroll flow enforces an employee allowlist + per-employee `maxAmount` before triggering CRE. Any violation blocks execution and returns an error with details.

To fully claim this track:
- (Optional) Also enforce the same rules inside `cre-payroll-workflow/Seclo/workflow.yaml` (defense-in-depth).
- Optionally add an external API check (HR approval / sanctions) as an additional compliance signal.

Relevant files:
- `backend/src/data/employeeRegistry.ts` (allowlist + limits)
- `backend/src/services/riskService.ts` (policy checks)
- `backend/src/routes/ai.ts` (blocks non-compliant records before CRE)

### Privacy ❌ (not truly implemented yet)
- There is a `MockPrivacyAdapter` in the backend, but it does not provide real privacy guarantees.
- To claim the Privacy track, implement **Confidential HTTP** and/or **Confidential Compute** in CRE and ensure sensitive inputs/outputs are not leaked via logs or CLI args.

## Project Structure

```
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
└── backend/           # Express.js TypeScript backend
    └── src/
```

## Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Start development server (recommended):
   ```bash
   npm run dev
   ```
   This runs TypeScript directly with auto-restart on changes.

3. Or for production:
   ```bash
   npm run build    # Compile TypeScript first
   npm start        # Then run compiled JavaScript
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - API health status

## Features

- Dashboard with navigation
- Payroll upload functionality
- Status monitoring
- Responsive design

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router
- **Backend**: Express.js, TypeScript, Node.js
- **Development**: Nodemon, ts-node

## Chainlink / CRE files index (submission requirement)

- `cre-payroll-workflow/Seclo/workflow.yaml`
- `cre-payroll-workflow/Seclo/config.staging.json`
- `cre-payroll-workflow/Seclo/config.production.json`
- `backend/src/services/creService.ts`
- `cre-payroll-workflow/confidential-http-demo/workflow.ts` (Confidential HTTP demo workflow)