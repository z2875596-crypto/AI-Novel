import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Summary {
  id: string
  triggerTurn: number
  chapterNumber: number
  chapterTitle: string
  content: string
  statusAtTrigger: Record<string, number>
}

interface SummaryStore {
  summaries: Summary[]
  addSummary: (summary: Summary) => void
  reset: () => void
}

export const useSummaryStore = create<SummaryStore>()(
  persist(
    (set) => ({
      summaries: [],
      addSummary: (summary) =>
        set((s) => ({ summaries: [...s.summaries, summary] })),
      reset: () => set({ summaries: [] }),
    }),
    { name: 'summary-store' }
  )
)