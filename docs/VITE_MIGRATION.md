# Vite Migration Guide

Successfully migrated from Create React App to Vite for faster development and better compatibility with modern packages.

## What Changed

### Configuration Files
- Added `vite.config.ts` - Vite configuration
- Added `tsconfig.node.json` - TypeScript config for Vite
- Updated `tsconfig.json` - Modern TypeScript settings
- Moved `public/index.html` to root `index.html`
- Updated `package.json` - New scripts and dependencies

### Environment Variables
- Changed from `REACT_APP_*` to `VITE_*` prefix
- Changed from `process.env.*` to `import.meta.env.*`

**Updated files:**
- `frontend/.env` - Variable names updated
- `frontend/src/config/appkit.ts` - Uses `import.meta.env.VITE_REOWN_PROJECT_ID`
- `frontend/src/services/api.ts` - Uses `import.meta.env.VITE_API_URL`

### Package Changes
**Removed:**
- `react-scripts`
- `@testing-library/*` packages
- `web-vitals`

**Added:**
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite

### Scripts
- `npm start` or `npm run dev` - Start dev server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Migration Steps

1. **Clean install dependencies:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

2. **Install Reown AppKit:**
```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi
```

3. **Start development server:**
```bash
npm run dev
```

## Benefits

- **Faster startup**: Vite starts in milliseconds vs seconds
- **Faster HMR**: Hot Module Replacement is instant
- **Better compatibility**: Works seamlessly with modern packages like Reown AppKit
- **Smaller bundle**: Optimized production builds
- **Native ESM**: Uses modern JavaScript module system

## Troubleshooting

### Port already in use
If port 3000 is busy, Vite will automatically use the next available port.

### Environment variables not working
Make sure to:
1. Restart dev server after changing `.env`
2. Use `VITE_` prefix for all variables
3. Access via `import.meta.env.VITE_*`

### Build errors
Run `npm run build` to check for TypeScript errors before deploying.
