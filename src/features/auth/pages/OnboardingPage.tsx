import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/stores/authStore"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Home, Users } from "lucide-react"

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, profile, board } = useAuthStore()
  const { createProfile, createBoard, joinBoard } = useAuth()

  const [step, setStep] = useState<"name" | "choice" | "create" | "join">(
    profile ? "choice" : "name"
  )
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [inviteCode, setInviteCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If the user somehow lands here but already has everything set up, send them home
  useEffect(() => {
    if (profile && board) {
      navigate("/", { replace: true })
    } else if (profile && step === "name") {
      // Profile exists but board doesn't — skip the name step
      setStep("choice")
    }
  }, [profile, board, navigate, step])

  // Safety check: query Supabase directly in case the store wasn't hydrated
  // (e.g., RLS was blocking earlier). If profile+board exist, go straight home.
  useEffect(() => {
    if (!user || profile) return // Already handled above

    console.log("[Onboarding] Safety check: querying profile for user", user.id)

    const check = async () => {
      const { setProfile, setBoard, setBoardMembers } = useAuthStore.getState()

      const { data: prof, error: profError } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profError) {
        console.error("[Onboarding] Safety check error:", profError.code, profError.message)
      }

      console.log("[Onboarding] Safety check profile:", prof ? `found (board_id: ${prof.board_id})` : "not found")

      if (!prof) return // No profile — onboarding is correct

      setProfile(prof)
      if (prof.display_name) setDisplayName(prof.display_name)

      if (prof.board_id) {
        const { data: boardData } = await supabase
          .from("boards")
          .select("*")
          .eq("id", prof.board_id)
          .single()

        if (boardData) {
          setBoard(boardData)
          const { data: members } = await supabase
            .from("users_profile")
            .select("*")
            .eq("board_id", boardData.id)
          if (members) setBoardMembers(members)
          console.log("[Onboarding] Safety check: profile+board found, navigating home")
          navigate("/", { replace: true })
          return
        }
      }
      // Has profile but no board — skip the name step
      console.log("[Onboarding] Safety check: profile found but no board, skipping to choice")
      setStep("choice")
    }

    check()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])


  const handleSetName = async () => {
    if (!displayName.trim() || !user) return

    console.log("[Onboarding] handleSetName:", user.id, displayName.trim())
    setIsSubmitting(true)
    try {
      const updatedProfile = await createProfile(user.id, displayName.trim())
      console.log("[Onboarding] Profile saved:", updatedProfile)

      // If user already had a board (returning user), go straight home
      if (updatedProfile?.board_id) {
        console.log("[Onboarding] User has board_id, fetching board...")
        const { setBoard, setBoardMembers } = useAuthStore.getState()

        const { data: boardData } = await supabase
          .from("boards")
          .select("*")
          .eq("id", updatedProfile.board_id)
          .single()

        if (boardData) {
          setBoard(boardData)
          const { data: members } = await supabase
            .from("users_profile")
            .select("*")
            .eq("board_id", boardData.id)
          if (members) setBoardMembers(members)
          console.log("[Onboarding] Navigating home (returning user)")
          navigate("/", { replace: true })
          return
        }
        console.log("[Onboarding] Board not found, showing choice step")
      }
      setStep("choice")
    } catch (err: unknown) {
      console.error("[Onboarding] handleSetName error:", err)
      const msg =
        err instanceof Error ? err.message :
        typeof err === "object" && err !== null && "message" in err ? String((err as any).message) :
        "Erro ao salvar nome"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateBoard = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const board = await createBoard(user.id)
      toast.success(`Board criado! Código: ${board.invite_code}`)
      navigate("/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar board"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinBoard = async () => {
    if (!user || !inviteCode.trim()) return

    setIsSubmitting(true)
    try {
      await joinBoard(user.id, inviteCode.trim())
      toast.success("Você entrou no board!")
      navigate("/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar no board"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 pb-[env(safe-area-inset-bottom)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {step === "name" ? "Como devemos te chamar?" : "Bem-vindo(a)! 🏠"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {step === "name"
              ? "Seu nome é exibido para seu par"
              : "Vamos encontrar o apê ideal juntos"}
          </p>
        </div>

        {/* Step: Name */}
        {step === "name" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="displayName">Seu nome</Label>
              <Input
                id="displayName"
                placeholder="Ex: Lucas"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              className="w-full h-11"
              onClick={handleSetName}
              disabled={!displayName.trim() || isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Continuar"}
            </Button>
          </motion.div>
        )}

        {/* Step: Choice */}
        {step === "choice" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Card
              className="cursor-pointer transition-colors hover:border-foreground/20"
              onClick={() => setStep("create")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Criar novo board</CardTitle>
                    <CardDescription>
                      Começa por você e convide seu par
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer transition-colors hover:border-foreground/20"
              onClick={() => setStep("join")}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Entrar com código</CardTitle>
                    <CardDescription>
                      Seu par já criou? Cole o código
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Step: Create Board */}
        {step === "create" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Um código de convite será gerado para você compartilhar com seu
              par.
            </p>
            <Button
              className="w-full h-11"
              onClick={handleCreateBoard}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar board"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep("choice")}
            >
              Voltar
            </Button>
          </motion.div>
        )}

        {/* Step: Join Board */}
        {step === "join" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Código de convite</Label>
              <Input
                id="inviteCode"
                placeholder="Ex: A3KF7N"
                value={inviteCode}
                onChange={(e) =>
                  setInviteCode(e.target.value.toUpperCase().slice(0, 6))
                }
                className="text-center text-lg font-mono tracking-[0.3em]"
                maxLength={6}
                autoFocus
              />
            </div>
            <Button
              className="w-full h-11"
              onClick={handleJoinBoard}
              disabled={inviteCode.length !== 6 || isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar no board"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep("choice")}
            >
              Voltar
            </Button>
          </motion.div>
        )}

        <Separator className="my-8" />

        <p className="text-center text-xs text-muted-foreground/50">
          por Lumi — Lucas + Mírian
        </p>
      </motion.div>
    </div>
  )
}
