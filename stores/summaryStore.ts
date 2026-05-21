import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@/types/game'

export interface Summary {
  id: string
  triggerTurn: number
  chapterNumber: number
  chapterTitle: string
  content: string
  statusAtTrigger: Record<string, number>
  messages: Message[]   // 本章完整的 20 条对话
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
