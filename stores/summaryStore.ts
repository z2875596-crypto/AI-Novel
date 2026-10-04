import { localPersistence } from '@/lib/localPersistence'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Message } from '@/types/game'

export interface Summary {
  id: string
  gameId: string
  triggerTurn: number
  chapterNumber: number
  chapterTitle: string
  content: string
  statusAtTrigger: Record<string, number>
  messages: Message[]
}

interface SummaryStore {
  summaries: Summary[]
  addSummary: (summary: Summary) => void
  reset: () => void
  loadForGame: (gameId: string, allSummaries: Summary[]) => void
}

export const useSummaryStore = create<SummaryStore>()(
  persist(
    (set) => ({
      summaries: [],
      addSummary: (summary) =>
        set((s) => ({ summaries: [...s.summaries, summary] })),
      reset: () => set({ summaries: [] }),
      loadForGame: (gameId, allSummaries) =>
        set({ summaries: allSummaries.filter((s) => s.gameId === gameId) }),
    }),
    {
      name: 'summary-store',
      storage: createJSONStorage(() => localPersistence),
      skipHydration: true,
    }
  )
)
