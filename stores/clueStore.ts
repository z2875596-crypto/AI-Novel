import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Clue } from '@/types/clue'

interface ClueStore {
  clues: Clue[]
  addClue: (clue: Clue) => void
  updateClue: (id: string, updates: Partial<Clue>) => void
  addRelation: (clueId: string, relatedId: string) => void
  reset: () => void
}

export const useClueStore = create<ClueStore>()(
  persist(
    (set) => ({
      clues: [],
      addClue: (clue) =>
        set((s) => ({
          clues: s.clues.find((c) => c.id === clue.id)
            ? s.clues
            : [...s.clues, clue],
        })),
      updateClue: (id, updates) =>
        set((s) => ({
          clues: s.clues.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      addRelation: (clueId, relatedId) =>
        set((s) => ({
          clues: s.clues.map((c) => {
            if (c.id === clueId && !c.relatedClues.includes(relatedId)) {
              return { ...c, relatedClues: [...c.relatedClues, relatedId] }
            }
            if (c.id === relatedId && !c.relatedClues.includes(clueId)) {
              return { ...c, relatedClues: [...c.relatedClues, clueId] }
            }
            return c
          }),
        })),
      reset: () => set({ clues: [] }),
    }),
    {
      name: 'clue-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      skipHydration: true,
    }
  )
)