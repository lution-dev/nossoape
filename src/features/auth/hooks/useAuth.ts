import { useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { generateInviteCode } from "@/lib/invite-code"

export function useAuth() {
  const { setUser, setProfile, setBoard, setBoardMembers, setLoading, reset } =
    useAuthStore()

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", userId)
        .single()

      if (data) {
        setProfile(data)

        // If user has a board, fetch it and members
        if (data.board_id) {
          const { data: board } = await supabase
            .from("boards")
            .select("*")
            .eq("id", data.board_id)
            .single()

          if (board) {
            setBoard(board)

            const { data: members } = await supabase
              .from("users_profile")
              .select("*")
              .eq("board_id", board.id)

            if (members) {
              setBoardMembers(members)
            }
          }
        }
      }

      return data
    },
    [setProfile, setBoard, setBoardMembers]
  )

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    []
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    []
  )

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    reset()
  }, [reset])

  const createProfile = useCallback(
    async (userId: string, displayName: string, avatarUrl?: string) => {
      const { data, error } = await supabase
        .from("users_profile")
        .upsert(
          {
            id: userId,
            display_name: displayName,
            avatar_url: avatarUrl || null,
          },
          { onConflict: "id" }
        )
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    },
    [setProfile]
  )

  const createBoard = useCallback(
    async (userId: string) => {
      const inviteCode = generateInviteCode()

      const { data: board, error: boardError } = await supabase
        .from("boards")
        .insert({
          name: "Nosso Apê",
          invite_code: inviteCode,
          owner_id: userId,
        })
        .select()
        .single()

      if (boardError) throw boardError

      // Link user to board
      const { error: profileError } = await supabase
        .from("users_profile")
        .update({ board_id: board.id })
        .eq("id", userId)

      if (profileError) throw profileError

      setBoard(board)
      await fetchProfile(userId)
      return board
    },
    [setBoard, fetchProfile]
  )

  const joinBoard = useCallback(
    async (userId: string, inviteCode: string) => {
      // Find board by invite code
      const { data: board, error: findError } = await supabase
        .from("boards")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single()

      if (findError || !board) {
        throw new Error("Código de convite inválido")
      }

      // Check if board already has 2 members
      const { count } = await supabase
        .from("users_profile")
        .select("*", { count: "exact", head: true })
        .eq("board_id", board.id)

      if (count && count >= 2) {
        throw new Error("Este board já tem 2 membros")
      }

      // Link user to board
      const { error: updateError } = await supabase
        .from("users_profile")
        .update({ board_id: board.id })
        .eq("id", userId)

      if (updateError) throw updateError

      setBoard(board)
      await fetchProfile(userId)
      return board
    },
    [setBoard, fetchProfile]
  )

  const initAuth = useCallback(async () => {
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
  }, [setUser, setLoading, fetchProfile])

  return {
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    logout,
    createProfile,
    createBoard,
    joinBoard,
    fetchProfile,
    initAuth,
  }
}
