import { useLocation, useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { APP_NAME } from "@/lib/constants"

interface HeaderProps {
  showBack?: boolean
  title?: string
}

export function Header({ showBack = false, title }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === "/"

  const displayTitle = title || (isHome ? APP_NAME : "")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold tracking-tight">
            {displayTitle}
          </h1>
        </div>

        {isHome && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-xs font-medium">
              L
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  )
}
