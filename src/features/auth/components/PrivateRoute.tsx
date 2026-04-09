import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/authStore"

export function PrivateRoute() {
  const { isAuthenticated, isLoading, profile, board } = useAuthStore()

  if (isLoading) {
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
