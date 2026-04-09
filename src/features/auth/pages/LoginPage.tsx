import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function LoginPage() {
  const { loginWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      // Supabase will redirect — no need to navigate manually
    } catch {
      toast.error("Erro ao conectar com Google. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 pb-[env(safe-area-inset-bottom)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
              {/* House icon */}
              <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9">
                <path d="M16 6L4 18h5v8h14v-8h5L16 6z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="12" y="18" width="8" height="8" rx="1" fill="#F5A623"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Nosso Apê</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Encontre o lar perfeito juntos
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {isLoading ? "Conectando..." : "Continuar com Google"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ao entrar, você concorda com o uso do app para encontrar imóveis juntos.
        </p>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-muted-foreground/40">
          por Lumi — Lucas + Mírian
        </p>
      </motion.div>
    </div>
  )
}
