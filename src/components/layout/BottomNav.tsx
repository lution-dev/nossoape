import { Link, useLocation } from "react-router"
import { Home, Plus, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/add", label: "Adicionar", icon: Plus },
  { path: "/search", label: "Buscar", icon: Search },
  { path: "/profile", label: "Perfil", icon: User },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path)
          const isAdd = item.path === "/add"

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors duration-150",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {isAdd ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                  <item.icon className="h-5 w-5" />
                </div>
              ) : (
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              )}
              {!isAdd && (
                <span className="text-[11px] font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
