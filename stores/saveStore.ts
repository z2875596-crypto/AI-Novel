import { create } from 'zustand'
import { SaveRecord } from '@/types/save'
import { loadSaves, upsertSave, deleteSave } from '@/lib/saveManager'

interface SaveStore {
  saves: SaveRecord[]
  loadFromStorage: () => void
  addOrUpdate: (record: SaveRecord) => void
  remove: (id: string) => void
}

export const useSaveStore = create<SaveStore>()((set) => ({
  saves: [],
  loadFromStorage: () => set({ saves: loadSaves() }),
  addOrUpdate: (record) => {
    const saves = upsertSave(record)
    set({ saves })
  },
  remove: (id) => {
    const saves = deleteSave(id)
    set({ saves })
  },
}))