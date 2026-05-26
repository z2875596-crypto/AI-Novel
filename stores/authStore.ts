import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  isGuest: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setIsGuest: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsGuest: (v) => set({ isGuest: v }),
  setIsLoading: (v) => set({ isLoading: v }),
  signOut: () => set({ user: null, isGuest: false }),
}))
