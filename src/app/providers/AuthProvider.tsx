import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialized = useRef(false)

  useEffect(() => {
    // StrictMode mounts twice in dev — guard against double-init
    if (initialized.current) return
    initialized.current = true

    const store = useAuthStore.getState

    /** Fetch the user's full profile + board — never throws */
    const loadProfile = async (userId: string, googleAvatarUrl?: string) => {
      try {
        const { data: profile, error } = await supabase
          .from("users_profile")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) {
          console.error("[Auth] Profile error:", error.code, error.message)
          return null
        }
        if (!profile) return null

        // Always use the Google avatar from session metadata as source of truth.
        // The DB update can fail silently (RLS/column issue) — we still want the photo
        // to appear immediately by injecting it into the in-memory profile object.
        const resolvedAvatar = profile.avatar_url || googleAvatarUrl || null
        const profileWithAvatar = { ...profile, avatar_url: resolvedAvatar }

        // Best-effort sync to DB (silently ignores failures)
        if (!profile.avatar_url && googleAvatarUrl) {
          supabase
            .from("users_profile")
            .update({ avatar_url: googleAvatarUrl })
            .eq("id", userId)
            .then(() => {}) // fire-and-forget
        }

        store().setProfile(profileWithAvatar)

        if (profileWithAvatar.board_id) {
          const { data: board, error: be } = await supabase
            .from("boards")
            .select("*")
            .eq("id", profileWithAvatar.board_id)
            .single()

          if (be) {
            console.error("[Auth] Board error:", be.code, be.message)
          } else if (board) {
            store().setBoard(board)
            const { data: members } = await supabase
              .from("users_profile")
              .select("*")
              .eq("board_id", board.id)
            // Inject Google avatar for each member if missing
            if (members) store().setBoardMembers(members)
          }
        }
        return profileWithAvatar
      } catch (err) {
        console.error("[Auth] Unexpected:", err)
        return null
      }
    }

    // Bootstrap: use getSession() once, then subscribe for future changes
    const init = async () => {
      // ── Fast-path for Vite HMR ──
      // On hot-reload, useRef resets but the Zustand store keeps its state.
      // If we already have a user + board, skip getSession() entirely —
      // setting isLoading=true here would flash a spinner and discard data.
      const current = store()
      if (current.isAuthenticated && current.board) {
        console.log("[Auth] HMR fast-path — already authenticated, skipping init")
        return
      }

      store().setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log("[Auth] getSession:", session?.user?.email ?? "no session")
        if (session?.user) {
          store().setUser({ id: session.user.id, email: session.user.email! })
          const googleAvatarUrl =
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture
          await loadProfile(session.user.id, googleAvatarUrl)
        }
      } catch (err) {
        console.error("[Auth] getSession error:", err)
      } finally {
        console.log("[Auth] Init done. Loading → false")
        store().setLoading(false)
      }
    }

    init()

    // Only handle FUTURE auth changes (sign-in from login page, sign-out)
    // We do NOT rely on onAuthStateChange for the initial session — that
    // caused the SIGNED_IN loop when combined with StrictMode.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] onChange:", event, session?.user?.email ?? "—")

        if (event === "SIGNED_IN" && session?.user) {
          // Skip if already authenticated (prevents loop on session refresh)
          if (store().isAuthenticated && store().profile) {
            console.log("[Auth] Already authenticated, skipping SIGNED_IN")
            return
          }
          store().setLoading(true)
          try {
            store().setUser({ id: session.user.id, email: session.user.email! })
            const googleAvatarUrl =
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture
            await loadProfile(session.user.id, googleAvatarUrl)
          } finally {
            store().setLoading(false)
          }
        } else if (event === "SIGNED_OUT") {
          const s = store()
          s.setUser(null)
          s.setProfile(null)
          s.setBoard(null)
          s.setBoardMembers([])
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty — runs once on mount

  return <>{children}</>
}
