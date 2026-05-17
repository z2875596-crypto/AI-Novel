import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorldConfig, EMPTY_WORLD_CONFIG } from '@/types/world'

interface WorldStore {
  worldConfig: WorldConfig
  setWorldConfig: (config: WorldConfig) => void
  updateField: <K extends keyof WorldConfig>(key: K, value: WorldConfig[K]) => void
  reset: () => void
}

export const useWorldStore = create<WorldStore>()(
  persist(
    (set) => ({
      worldConfig: EMPTY_WORLD_CONFIG,
      setWorldConfig: (config) => set({ worldConfig: config }),
      updateField: (key, value) =>
        set((state) => ({
          worldConfig: { ...state.worldConfig, [key]: value },
        })),
      reset: () => set({ worldConfig: EMPTY_WORLD_CONFIG }),
    }),
    { name: 'world-store' }
  )
)