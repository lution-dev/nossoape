import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const storeRef = useRef(useAuthStore.getState())
  useEffect(() => useAuthStore.subscribe((s) => { storeRef.current = s }), [])

  useEffect(() => {
    let cancelled = false

    /** Fetch the user's full profile + board — NEVER throws, always resolves */
    const loadProfile = async (userId: string) => {
      try {
        const { setProfile, setBoard, setBoardMembers } = storeRef.current

        const { data: profile, error: profileError } = await supabase
          .from("users_profile")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.warn("[AuthProvider] loadProfile error:", profileError.message)
          return null
        }

        if (!profile || cancelled) return profile

        setProfile(profile)

        if (profile.board_id) {
          const { data: board } = await supabase
            .from("boards")
            .select("*")
            .eq("id", profile.board_id)
            .single()

          if (board && !cancelled) {
            setBoard(board)
            const { data: members } = await supabase
              .from("users_profile")
              .select("*")
              .eq("board_id", board.id)
            if (members && !cancelled) setBoardMembers(members)
          }
        }
        return profile
      } catch (err) {
        console.warn("[AuthProvider] loadProfile unexpected error:", err)
        return null
      }
    }

    /** Sync Google avatar if missing (best-effort, silent) */
    const syncAvatar = async (userId: string, avatarUrl?: string) => {
      if (!avatarUrl) return
      try {
        await supabase
          .from("users_profile")
          .update({ avatar_url: avatarUrl })
          .eq("id", userId)
          .is("avatar_url", null)
      } catch { /* best-effort, ignore */ }
    }

    /** Handle an authenticated session object */
    const handleSession = async (
      session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } } | null
    ) => {
      if (!session?.user || cancelled) return
      const { setUser } = storeRef.current
      setUser({ id: session.user.id, email: session.user.email ?? "" })

      const profile = await loadProfile(session.user.id)
      if (!profile?.avatar_url && !cancelled) {
        const googleAvatar =
          session.user.user_metadata?.["avatar_url"] ||
          session.user.user_metadata?.["picture"]
        await syncAvatar(session.user.id, googleAvatar)
        if (googleAvatar) await loadProfile(session.user.id)
      }
    }

    // Use onAuthStateChange as the SINGLE source of truth.
    // It fires reliably for: initial session restore, SIGNED_IN, SIGNED_OUT.
    // We do NOT call initSession separately to avoid race conditions.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        const { setUser, setProfile, setBoard, setBoardMembers, setLoading } =
          storeRef.current

        console.debug("[AuthProvider] event:", event)

        if (event === "INITIAL_SESSION") {
          // Fires once on mount with the current session (or null)
          setLoading(true)
          try {
            await handleSession(session)
          } finally {
            if (!cancelled) setLoading(false)
          }
        } else if (event === "SIGNED_IN") {
          // Fires on OAuth callback / explicit sign-in
          setLoading(true)
          try {
            await handleSession(session)
          } finally {
            if (!cancelled) setLoading(false)
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
          setBoard(null)
          setBoardMembers([])
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
