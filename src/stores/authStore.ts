import { create } from "zustand"
import type { UserProfile, Board } from "@/lib/types"

interface AuthState {
  // State
  user: { id: string; email: string } | null
  profile: UserProfile | null
  board: Board | null
  boardMembers: UserProfile[]
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: { id: string; email: string } | null) => void
  setProfile: (profile: UserProfile | null) => void
  setBoard: (board: Board | null) => void
  setBoardMembers: (members: UserProfile[]) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  profile: null,
  board: null,
  boardMembers: [],
  isLoading: true,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  setProfile: (profile) =>
    set({ profile }),

  setBoard: (board) =>
    set({ board }),

  setBoardMembers: (boardMembers) =>
    set({ boardMembers }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  reset: () =>
    set(initialState),
}))
