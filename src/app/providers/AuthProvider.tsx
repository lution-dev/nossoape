import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setProfile, setBoard, setBoardMembers, setLoading } = useAuthStore()
  // Use a ref so the effect never has stale deps and never re-runs
  const storeRef = useRef({ setUser, setProfile, setBoard, setBoardMembers, setLoading })
  useEffect(() => {
    storeRef.current = { setUser, setProfile, setBoard, setBoardMembers, setLoading }
  })

  useEffect(() => {
    const { setUser, setProfile, setBoard, setBoardMembers, setLoading } = storeRef.current

    /** Fetch the user's full profile + board, store in Zustand */
    const loadProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", userId)
        .single()

      if (profile) {
        setProfile(profile)
        if (profile.board_id) {
          const { data: board } = await supabase
            .from("boards")
            .select("*")
            .eq("id", profile.board_id)
            .single()
          if (board) {
            setBoard(board)
            const { data: members } = await supabase
              .from("users_profile")
              .select("*")
              .eq("board_id", board.id)
            if (members) setBoardMembers(members)
          }
        }
      }
      return profile
    }

    /** Sync Google avatar if not set yet (best-effort, silent) */
    const syncAvatar = async (userId: string, googleAvatarUrl?: string) => {
      if (!googleAvatarUrl) return
      await supabase
        .from("users_profile")
        .update({ avatar_url: googleAvatarUrl })
        .eq("id", userId)
        .is("avatar_url", null)
    }

    /** One-time session bootstrap on mount */
    const initSession = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! })
          const profile = await loadProfile(session.user.id)
          if (!profile?.avatar_url) {
            const googleAvatar =
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture
            await syncAvatar(session.user.id, googleAvatar)
            if (googleAvatar) await loadProfile(session.user.id)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes (OAuth redirect fires SIGNED_IN here)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const { setUser, setProfile, setBoard, setBoardMembers, setLoading } =
          storeRef.current
        if (event === "SIGNED_IN" && session?.user) {
          setLoading(true)
          try {
            setUser({ id: session.user.id, email: session.user.email! })
            const profile = await loadProfile(session.user.id)
            if (!profile?.avatar_url) {
              const googleAvatar =
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture
              await syncAvatar(session.user.id, googleAvatar)
              if (googleAvatar) await loadProfile(session.user.id)
            }
          } finally {
            setLoading(false)
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
          setBoard(null)
          setBoardMembers([])
        }
      }
    )

    return () => { subscription.unsubscribe() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps — runs once on mount, uses storeRef for fresh store access

  return <>{children}</>
}
