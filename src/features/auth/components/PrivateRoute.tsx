import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/authStore"

export function PrivateRoute() {
  const { isAuthenticated, isLoading, profile, board, setLoading } = useAuthStore()
  const [timedOut, setTimedOut] = useState(false)

  // Safety net: if loading takes more than 8s, force-release the spinner.
  // This can happen if onAuthStateChange never fires (network issue, etc.)
  useEffect(() => {
    if (!isLoading) return
    const t = setTimeout(() => {
      console.warn("[PrivateRoute] Loading timed out — forcing setLoading(false)")
      setTimedOut(true)
      setLoading(false)
    }, 8000)
    return () => clearTimeout(t)
  }, [isLoading, setLoading])

  if (isLoading && !timedOut) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!profile || !board) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
