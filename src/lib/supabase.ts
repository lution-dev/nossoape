import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file."
  )
}

// ── HMR Singleton ──────────────────────────────────────────────────────────
// During Vite HMR, re-importing this module would create a NEW Supabase client,
// but the OLD one already holds the GoTrue auth lock in IndexedDB.
// Solution: persist the instance on globalThis so HMR hot-swaps reuse it.
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined
}

if (!globalThis.__supabaseClient) {
  globalThis.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use implicit flow — no navigator locks, works perfectly for SPAs
      flowType: "implicit",
      // Use localStorage instead of IndexedDB to avoid lock contention
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "sb-nossoape-auth",
      // Persist session across reloads
      persistSession: true,
      // Auto-refresh JWT before it expires
      autoRefreshToken: true,
      // Detect session from URL for OAuth callbacks
      detectSessionInUrl: true,
      // No-op lock — bypasses navigator.locks without jamming getSession()
      // IMPORTANT: `null` would make getSession() hang — must be a function
      lock: async (
        _name: string,
        _timeout: number,
        fn: () => Promise<any>
      ) => {
        return await fn()
      },
    },
  })
}

export const supabase = globalThis.__supabaseClient
