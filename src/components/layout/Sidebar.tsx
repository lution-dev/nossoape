import { useLocation, useNavigate } from "react-router"
import { Home, Calendar, Plus, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AppIcon } from "@/components/shared/AppIcon"
import { APP_NAME } from "@/lib/constants"
import { useAuthStore } from "@/stores/authStore"
import { usePropertyStore } from "@/stores/propertyStore"
import { cn } from "@/lib/utils"

const navItems = [
  { path: "/", label: "Início", icon: Home },
]

interface SidebarProps {
  onAddProperty: () => void
}

export function Sidebar({ onAddProperty }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, user } = useAuthStore()
  const { properties } = usePropertyStore()

  const initial = profile?.display_name?.charAt(0)?.toUpperCase() || "?"
  const scheduledCount = properties.filter((p) => p.status === "scheduled").length

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground"
        >
          <AppIcon className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/" && !location.search.includes("view=schedule")
            : location.pathname.startsWith(item.path)

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "stroke-[2.5px]")} />
              {item.label}
            </button>
          )
        })}

        {/* Agendamentos - special nav item with badge */}
        <button
          onClick={() => navigate("/?view=schedule")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
            location.search.includes("view=schedule")
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <Calendar className={cn("h-4 w-4", location.search.includes("view=schedule") && "stroke-[2.5px]")} />
          Agendamentos
          {scheduledCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
              {scheduledCount}
            </span>
          )}
        </button>
      </nav>

      <div className="mt-auto space-y-3 px-3 pb-4">
        {/* Add Property CTA */}
        <Button
          onClick={onAddProperty}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Imóvel
        </Button>

        <Separator />

        {/* Current User — click to go to profile */}
        <button
          onClick={() => navigate("/profile")}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? ""} />
            <AvatarFallback className="bg-secondary text-xs font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="truncate text-sm font-medium">{profile?.display_name || user?.email?.split("@")[0]}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}
