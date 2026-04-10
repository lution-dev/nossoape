import { Outlet, useLocation } from "react-router"
import { Header } from "./Header"
import { ClipboardBanner } from "@/components/shared/ClipboardBanner"

// Pages that should NOT show the default header
const STANDALONE_PAGES = ["/login", "/onboarding"]
// Pages that should show a back button in the header
const BACK_PAGES = ["/search", "/profile"]

export function AppShell() {
  const location = useLocation()
  const isStandalone = STANDALONE_PAGES.some((p) => location.pathname.startsWith(p))
  const isPropertyDetail = location.pathname.startsWith("/property/")
  const showBack = BACK_PAGES.some((p) => location.pathname === p)

  // Standalone pages (login, onboarding) render without shell
  if (isStandalone) {
    return <Outlet />
  }

  // Property detail has its own header
  if (isPropertyDetail) {
    return (
      <div className="min-h-svh bg-background">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <Header showBack={showBack} />
      <ClipboardBanner />
      <main className="mx-auto max-w-lg pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  )
}
