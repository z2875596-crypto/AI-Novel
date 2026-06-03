import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface MemoryEvent {
  id: string
  turn: number
  type: 'npc_relation' | 'world_change' | 'player_action' | 'secret_revealed' | 'item_obtained'
  subject: string
  description: string
  importance: 'low' | 'medium' | 'high'
}

interface MemoryStore {
  events: MemoryEvent[]
  addEvent: (event: MemoryEvent) => void
  getHighImportanceEvents: () => MemoryEvent[]
  reset: () => void
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (event) =>
        set((s) => ({
          events: [...s.events, event]
            .sort((a, b) => {
              const imp = { high: 3, medium: 2, low: 1 }
              return imp[b.importance] - imp[a.importance]
            })
            .slice(0, 100),
        })),
      getHighImportanceEvents: () =>
        get().events.filter((e) => e.importance !== 'low').slice(0, 20),
      reset: () => set({ events: [] }),
    }),
    {
      name: 'memory-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
)
