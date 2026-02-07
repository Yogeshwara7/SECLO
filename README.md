# SECLO Dashboard

A full-stack application for payroll management and status monitoring.

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