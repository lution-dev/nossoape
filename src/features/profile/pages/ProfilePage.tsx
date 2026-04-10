import { useAuthStore } from "@/stores/authStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Copy, LogOut, Users } from "lucide-react"

export function ProfilePage() {
  const { user, profile, board, boardMembers } = useAuthStore()
  const { logout } = useAuth()

  const partner = boardMembers.find((m) => m.id !== user?.id)
  const initial = profile?.display_name?.charAt(0)?.toUpperCase() || "?"

  const copyInviteCode = async () => {
    if (!board?.invite_code) return
    await navigator.clipboard.writeText(board.invite_code)
    toast.success("Código copiado!")
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:max-w-xl lg:mx-auto">
      {/* User Info */}
      <div className="flex flex-col items-center gap-3">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? ""} />
          <AvatarFallback className="bg-secondary text-2xl font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{profile?.display_name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Separator />

      {/* Invite Code */}
      {board && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Código de Convite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
              <span className="font-mono text-2xl tracking-[0.3em]">
                {board.invite_code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyInviteCode}
                className="h-9 w-9"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compartilhe com seu par para conectar ao board
            </p>

            {/* Partner info */}
            {partner ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={partner.avatar_url ?? undefined} alt={partner.display_name ?? ""} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {partner.display_name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{partner.display_name}</p>
                  <p className="text-xs text-muted-foreground">Conectado ✓</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60">
                Aguardando seu par se conectar...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair da conta
      </Button>
    </div>
  )
}
