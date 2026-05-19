'use client'

import { useState } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Props {
  onSave: (name: string) => void
  onClose: () => void
  defaultName: string
}

export default function SaveAsModal({ onSave, onClose, defaultName }: Props) {
  const [name, setName] = useState(defaultName)
  const genre = useGenreStore((s) => s.genre)
  const config = genre ? GENRE_CONFIG[genre] : null

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim())
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl border p-6 animate-fade-in-up"
        style={{
          background: config?.theme.surface ?? '#1a1a1a',
          borderColor: config?.theme.border ?? '#333',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold mb-4" style={{ color: config?.theme.text ?? '#fff' }}>
          💾 另存为
        </h2>

        <p className="text-xs mb-3" style={{ color: config?.theme.textMuted ?? '#888' }}>
          为这条存档起一个名字，方便日后区分不同的故事分支
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="输入存档名称…"
          autoFocus
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none mb-4"
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderColor: config?.theme.border ?? '#333',
            color: config?.theme.text ?? '#fff',
          }}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:brightness-110"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: config?.theme.textMuted ?? '#888',
              border: `1px solid ${config?.theme.border ?? '#333'}`,
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-40"
            style={{
              background: config?.theme.primary ?? '#888',
              color: '#fff',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}