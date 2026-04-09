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
    const syncAvatarIfNeeded = async (userId: string, googleAvatarUrl?: string) => {
      if (!googleAvatarUrl) return
      // Update profile avatar_url if not already set (silent, best-effort)
      await supabase
        .from("users_profile")
        .update({ avatar_url: googleAvatarUrl })
        .eq("id", userId)
        .is("avatar_url", null)
    }

    // Initial session check
    const initSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! })
          const profile = await fetchProfile(session.user.id)
          // If profile has no avatar, sync from Google metadata
          if (!profile?.avatar_url) {
            const googleAvatar =
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture
            await syncAvatarIfNeeded(session.user.id, googleAvatar)
            if (googleAvatar) await fetchProfile(session.user.id)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes (OAuth redirect fires SIGNED_IN here)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Set loading BEFORE fetching profile so PrivateRoute shows spinner
        // instead of redirecting to /login or /onboarding prematurely
        setLoading(true)
        try {
          setUser({ id: session.user.id, email: session.user.email! })
          const profile = await fetchProfile(session.user.id)
          if (!profile?.avatar_url) {
            const googleAvatar =
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture
            await syncAvatarIfNeeded(session.user.id, googleAvatar)
            if (googleAvatar) await fetchProfile(session.user.id)
          }
        } finally {
          setLoading(false)
        }
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
