import { useLocation, useNavigate, useSearchParams } from "react-router"
import { ArrowLeft, Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppIcon } from "@/components/shared/AppIcon"
import { APP_NAME } from "@/lib/constants"
import { useAuthStore } from "@/stores/authStore"
import { useState, useEffect } from "react"

// Maps pathname to page title for desktop navbar
const PAGE_TITLES: Record<string, string> = {
  "/": "Imóveis",
  "/profile": "Perfil",
  "/search": "Buscar",
}

interface HeaderProps {
  showBack?: boolean
  title?: string
  /** Desktop mode: expands width, hides avatar, shows search */
  isDesktop?: boolean
}

export function Header({ showBack = false, title, isDesktop = false }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const isHome = location.pathname === "/"
  const isScheduleView = searchParams.get("view") === "schedule"

  // Determine page title
  const pageTitle = isScheduleView
    ? "Agendamentos"
    : PAGE_TITLES[location.pathname] || title || ""

  // Mobile title logic
  const mobileTitle = title || (isHome ? APP_NAME : "")

  const initial = profile?.display_name?.charAt(0)?.toUpperCase() || "?"
  const avatarUrl = profile?.avatar_url

  // Local search state synced with URL params
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "")

  // Sync local state when URL params change externally
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "")
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams)
    if (value.trim()) {
      params.set("q", value)
    } else {
      params.delete("q")
    }
    setSearchParams(params, { replace: true })
  }

  const clearSearch = () => {
    setSearchValue("")
    const params = new URLSearchParams(searchParams)
    params.delete("q")
    setSearchParams(params, { replace: true })
  }

  // Show search only on home page (dashboard)
  const showSearch = isDesktop && isHome && !isScheduleView

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
      <div className={`flex h-14 items-center gap-4 ${isDesktop ? "mx-auto max-w-6xl px-6" : "mx-auto max-w-lg px-4"}`}>
        {/* Left: Back button + Icon + Title */}
        <div className="flex items-center gap-2 shrink-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {/* Mobile: show app icon next to title */}
          {!isDesktop && isHome && <AppIcon className="h-5 w-5" />}
          <h1 className="text-lg font-semibold tracking-tight">
            {isDesktop ? pageTitle : mobileTitle}
          </h1>
        </div>

        {/* Center/Right: Search field (desktop only, home page) */}
        {showSearch && (
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar imóveis..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-9 h-9 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:bg-card transition-colors"
              />
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Avatar only on mobile home */}
        {!isDesktop && isHome && (
          <button onClick={() => navigate("/profile")} className="rounded-full ml-auto">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl ?? undefined} alt={profile?.display_name ?? ""} />
              <AvatarFallback className="bg-secondary text-xs font-medium">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </header>
  )
}
