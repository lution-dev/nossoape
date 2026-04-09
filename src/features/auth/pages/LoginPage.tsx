import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function LoginPage() {
  const navigate = useNavigate()
  const { loginWithEmail, signUpWithEmail, loginWithGoogle } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsSubmitting(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
        toast.success("Conta criada! Verifique seu e-mail para confirmar.")
      } else {
        await loginWithEmail(email, password)
        navigate("/")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao autenticar"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch {
      toast.error("Erro ao conectar com Google")
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
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Nosso Apê</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Encontre o lar perfeito juntos
          </p>
        </div>

        {/* Google Button */}
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={handleGoogleLogin}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar com Google
        </Button>

        {/* Separator */}
        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Aguarde..."
              : isSignUp
                ? "Criar conta"
                : "Entrar"}
          </Button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          por Lumi — Lucas + Mírian
        </p>
      </motion.div>
    </div>
  )
}
