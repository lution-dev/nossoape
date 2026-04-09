import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/authStore"

export function PrivateRoute() {
  const { isAuthenticated, isLoading, profile, board } = useAuthStore()

  // Still initializing Supabase session — show nothing (avoids flash of login screen)
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but no profile or board → go to onboarding
  if (!profile || !board) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
