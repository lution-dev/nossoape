import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useAuth } from "@/features/auth/hooks/useAuth"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore()
  const { fetchProfile } = useAuth()

  useEffect(() => {
    // Initial session check
    const initSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! })
          await fetchProfile(session.user.id)
        }
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({ id: session.user.id, email: session.user.email! })
        await fetchProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading, fetchProfile])

  return <>{children}</>
}
