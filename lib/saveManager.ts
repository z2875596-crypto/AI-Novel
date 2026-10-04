import { SaveRecord } from '@/types/save'

const STORAGE_KEY = 'ai-novel-saves'
const MAX_SAVES = 20

export function loadSaves(strict = false): SaveRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('存档格式异常')
    return (parsed as SaveRecord[]).sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    if (strict) throw new Error('已有存档无法读取，已停止写入，避免覆盖原数据。请先导出备份。')
    return []
  }
}

export function saveSaves(saves: SaveRecord[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saves)) }
  catch { throw new Error('存档未保存：浏览器空间不足或存储被禁用，请先导出备份再清理旧存档。') }
}

export function upsertSave(record: SaveRecord): SaveRecord[] {
  const saves = loadSaves(true)
  const idx = saves.findIndex((s) => s.id === record.id)
  if (idx >= 0) {
    saves[idx] = record
  } else {
    if (saves.length >= MAX_SAVES) throw new Error('已达到 20 个存档，请先导出并删除不需要的存档。')
    saves.unshift(record)
  }
  saves.sort((a, b) => b.updatedAt - a.updatedAt)
  saveSaves(saves)
  return saves
}

export function deleteSave(id: string): SaveRecord[] {
  const saves = loadSaves(true).filter((s) => s.id !== id)
  saveSaves(saves)
  return saves
}

export function getLatestSave(): SaveRecord | null {
  const saves = loadSaves()
  return saves[0] ?? null
}

export function exportSavesJson(): string {
  // Preserve raw bytes even if the stored JSON is damaged.
  return typeof window === 'undefined' ? '[]' : localStorage.getItem(STORAGE_KEY) ?? '[]'
}
