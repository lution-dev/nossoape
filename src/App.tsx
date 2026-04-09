import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/app/providers/AuthProvider"
import { Router } from "@/app/Router"

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
