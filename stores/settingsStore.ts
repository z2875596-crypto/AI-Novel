import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  ttsEnabled: boolean
  ttsRate: number      // 语速 0.5 - 2.0
  ttsPitch: number     // 音调 0.5 - 2.0
  ttsVolume: number    // 音量 0 - 1
  setTtsEnabled: (v: boolean) => void
  setTtsRate: (v: number) => void
  setTtsPitch: (v: number) => void
  setTtsVolume: (v: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ttsEnabled: false,
      ttsRate: 1.0,
      ttsPitch: 1.0,
      ttsVolume: 1.0,
      setTtsEnabled: (v) => set({ ttsEnabled: v }),
      setTtsRate: (v) => set({ ttsRate: v }),
      setTtsPitch: (v) => set({ ttsPitch: v }),
      setTtsVolume: (v) => set({ ttsVolume: v }),
    }),
    { name: 'settings-store' }
  )
)