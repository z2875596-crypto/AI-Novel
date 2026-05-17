import { SaveRecord } from '@/types/save'

const STORAGE_KEY = 'ai-novel-saves'
const MAX_SAVES = 20

export function loadSaves(): SaveRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SaveRecord[]
  } catch {
    return []
  }
}

export function saveSaves(saves: SaveRecord[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves))
}

export function upsertSave(record: SaveRecord): SaveRecord[] {
  const saves = loadSaves()
  const idx = saves.findIndex((s) => s.id === record.id)
  if (idx >= 0) {
    saves[idx] = record
  } else {
    saves.unshift(record)
    if (saves.length > MAX_SAVES) saves.pop()
  }
  saveSaves(saves)
  return saves
}

export function deleteSave(id: string): SaveRecord[] {
  const saves = loadSaves().filter((s) => s.id !== id)
  saveSaves(saves)
  return saves
}

export function getLatestSave(): SaveRecord | null {
  const saves = loadSaves()
  return saves[0] ?? null
}

export function exportSavesJson(): string {
  return JSON.stringify(loadSaves(), null, 2)
}