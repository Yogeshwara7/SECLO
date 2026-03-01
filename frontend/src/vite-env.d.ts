/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID: string
  readonly VITE_API_URL: string
  readonly VITE_PAYROLL_CONSUMER_ADDRESS: string
  readonly VITE_SCLO_TOKEN_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
