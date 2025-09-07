/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_AI_ANALYSIS_ENABLED: string
  readonly VITE_AI_REALTIME_ANALYSIS: string
  readonly VITE_AI_ANALYSIS_DEBOUNCE_MS: string
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.mp4' {
  const src: string;
  export default src;
}
