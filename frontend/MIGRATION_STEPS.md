# Quick Migration Steps

## 1. Clean Install
```bash
cd frontend
rm -rf node_modules package-lock.json build
npm install
```

## 2. Install Reown AppKit
```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi
```

## 3. Start Development Server
```bash
npm run dev
```

The app will open at http://localhost:3000

## What's Different?

- **Faster**: Vite starts instantly, HMR is immediate
- **Modern**: Uses native ESM, better tree-shaking
- **Compatible**: Works perfectly with Reown AppKit and Wagmi v3

## Environment Variables

Your `.env` file has been updated:
- `REACT_APP_*` → `VITE_*`
- Already configured with your Reown project ID

## Scripts

- `npm run dev` - Start dev server (same as `npm start`)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Verification

After starting the dev server, you should see:
1. Cyberpunk-themed UI loads instantly
2. Wallet button in navbar (top-right)
3. No console errors
4. Fast hot reload when editing files

## Rollback (if needed)

If you need to rollback, the old `react-scripts` setup is still in git history.
