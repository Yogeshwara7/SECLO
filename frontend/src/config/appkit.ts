import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum, mainnet } from '@reown/appkit/networks'

// Hoodi Testnet configuration
const hoodiTestnet = {
  id: 40875,
  name: 'Hoodi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Hoodi',
    symbol: 'SCLO',
  },
  rpcUrls: {
    default: { http: ['https://hoodi.gateway.tenderly.co/4fDA7Gwm1ysQLJfnh43We1'] },
    public: { http: ['https://hoodi.gateway.tenderly.co/4fDA7Gwm1ysQLJfnh43We1'] },
  },
  blockExplorers: {
    default: { name: 'Tenderly', url: 'https://dashboard.tenderly.co' },
  },
  testnet: true,
}

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

const metadata = {
  name: 'SECLO Payroll',
  description: 'Privacy-Preserving Payroll System with Chainlink CRE',
  url: 'https://seclo-payroll.com',
  icons: ['https://seclo-payroll.com/logo.png']
}

const networks = [hoodiTestnet, mainnet, arbitrum]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: false
  }
})
