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

    /** Fetch the user's full profile + board — never throws */
    const loadProfile = async (userId: string) => {
      try {
        console.log("[Auth] Fetching profile for", userId)
        const { data: profile, error: profileError } = await supabase
          .from("users_profile")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("[Auth] Profile fetch error:", profileError.code, profileError.message)
          return null
        }

        if (!profile || cancelled) return profile
        console.log("[Auth] Profile loaded:", profile.display_name, "board_id:", profile.board_id)

        storeRef.current.setProfile(profile)

        if (profile.board_id) {
          const { data: board, error: boardErr } = await supabase
            .from("boards")
            .select("*")
            .eq("id", profile.board_id)
            .single()

          if (boardErr) {
            console.error("[Auth] Board fetch error:", boardErr.code, boardErr.message)
          } else if (board && !cancelled) {
            console.log("[Auth] Board loaded:", board.name)
            storeRef.current.setBoard(board)

            const { data: members } = await supabase
              .from("users_profile")
              .select("*")
              .eq("board_id", board.id)
            if (members && !cancelled) storeRef.current.setBoardMembers(members)
          }
        }
        return profile
      } catch (err) {
        console.error("[Auth] loadProfile unexpected error:", err)
        return null
      }
    }

    /** Handle an authenticated session */
    const handleSession = async (session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } } | null) => {
      if (!session?.user || cancelled) return
      console.log("[Auth] Handling session for", session.user.email)
      storeRef.current.setUser({ id: session.user.id, email: session.user.email ?? "" })
      await loadProfile(session.user.id)
    }

    // Use onAuthStateChange as SOLE source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        console.log("[Auth] Event:", event, session?.user?.email ?? "no user")

        if (event === "INITIAL_SESSION") {
          storeRef.current.setLoading(true)
          try {
            await handleSession(session)
          } finally {
            if (!cancelled) {
              console.log("[Auth] Init done. profile:", !!storeRef.current.profile, "board:", !!storeRef.current.board)
              storeRef.current.setLoading(false)
            }
          }
        } else if (event === "SIGNED_IN") {
          storeRef.current.setLoading(true)
          try {
            await handleSession(session)
          } finally {
            if (!cancelled) storeRef.current.setLoading(false)
          }
        } else if (event === "SIGNED_OUT") {
          const s = storeRef.current
          s.setUser(null)
          s.setProfile(null)
          s.setBoard(null)
          s.setBoardMembers([])
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
