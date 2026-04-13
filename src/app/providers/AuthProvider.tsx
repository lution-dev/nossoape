import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { usePropertyStore } from "@/stores/propertyStore"

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

    /** Extract Google avatar URL from session user metadata */
    const getGoogleAvatar = (user: { user_metadata?: Record<string, any> }) =>
      user.user_metadata?.avatar_url || user.user_metadata?.picture

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

    // ── Safety timeout: never hang on infinite loading (R10) ──
    const safetyTimeout = setTimeout(() => {
      if (store().isLoading) {
        console.warn("[Auth] Safety timeout (5s) — forcing loading=false")
        store().setLoading(false)
      }
    }, 5000)

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
          // ── Check if token is already expired (R7) ──
          // getSession() can return an expired token from cache.
          // Always check expires_at and use getUser() as network fallback.
          const isExpired = session.expires_at
            ? (session.expires_at * 1000) <= Date.now()
            : false

          if (!isExpired) {
            // Token valid — load profile normally
            store().setUser({ id: session.user.id, email: session.user.email! })
            await loadProfile(session.user.id, getGoogleAvatar(session.user))
          } else {
            // Token expired — force real network validation with getUser()
            console.log("[Auth] Token expired, validating with getUser()...")
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              console.log("[Auth] Refresh succeeded — loading profile")
              store().setUser({ id: user.id, email: user.email! })
              await loadProfile(user.id, getGoogleAvatar(user))
            } else {
              console.log("[Auth] Session truly expired — user must re-login")
            }
          }
        }
      } catch (err) {
        console.error("[Auth] getSession error:", err)
      } finally {
        console.log("[Auth] Init done. Loading → false")
        store().setLoading(false)
      }
    }

    init()

    // ── Auth state change listener ──
    // Handles SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT after initial load.
    // We do NOT rely on onAuthStateChange for the initial session — that
    // caused the SIGNED_IN loop when combined with StrictMode.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] onChange:", event, session?.user?.email ?? "—")

        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          // Skip duplicate SIGNED_IN if already authenticated (prevents loop)
          if (event === "SIGNED_IN" && store().isAuthenticated && store().profile) {
            console.log("[Auth] Already authenticated, skipping SIGNED_IN")
            return
          }

          // On TOKEN_REFRESHED, only re-load if profile is missing
          if (event === "TOKEN_REFRESHED" && store().profile) {
            console.log("[Auth] Token refreshed, profile intact — no action needed")
            return
          }

          store().setLoading(true)
          try {
            store().setUser({ id: session.user.id, email: session.user.email! })
            await loadProfile(session.user.id, getGoogleAvatar(session.user))
          } finally {
            store().setLoading(false)
          }
        } else if (event === "SIGNED_OUT" || (event as string) === "TOKEN_REFRESH_FAILED") {
          // ── Phantom SIGNED_OUT guard (R6) ──
          // Supabase can emit SIGNED_OUT during a token refresh cycle.
          // If we clear data immediately, user gets logged out for no reason.
          // Wait 300ms and verify with getUser() before clearing state.
          setTimeout(async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) {
                // Confirmed — really signed out
                console.log("[Auth] Confirmed SIGNED_OUT — clearing state")
                store().reset()
              } else {
                console.warn("[Auth] Phantom SIGNED_OUT ignored — session still valid")
              }
            } catch {
              // Network error during verification — don't clear (be conservative)
              console.warn("[Auth] Could not verify SIGNED_OUT — preserving state")
            }
          }, 300)
        }
      }
    )

    // ── Visibility change listener (R12) ──
    // When user returns to the tab after inactivity, re-validate session
    // and re-fetch data to catch any changes missed while away.
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return

      console.log("[Auth] Tab visible — re-validating session...")
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const current = store()

        if (!session) {
          if (current.isAuthenticated) {
            // Session gone from cache — verify with network
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
              console.log("[Auth] Session expired during inactivity — clearing state")
              store().reset()
            }
          }
          return
        }

        // Session exists — re-fetch data if authenticated and has board
        if (current.isAuthenticated && current.board) {
          console.log("[Auth] Session valid — re-fetching properties")
          usePropertyStore.getState().fetchProperties(current.board.id)
        }
      } catch (err) {
        console.error("[Auth] Visibility revalidation error:", err)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, []) // Empty — runs once on mount

  return <>{children}</>
}
