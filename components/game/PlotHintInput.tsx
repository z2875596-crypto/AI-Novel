'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function PlotHintInput() {
  const genre = useGenreStore((s) => s.genre)
  const plotHint = useGameStore((s) => s.plotHint)
  const isStreaming = useGameStore(s => s.isStreaming)
  const setPlotHint = useGameStore((s) => s.setPlotHint)

  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(plotHint)

  if (!genre) return null
  const config = GENRE_CONFIG[genre]

  const hasHint = !!plotHint

  function handleConfirm() {
    if (isStreaming) return
    setPlotHint(draft.trim())
    setDraft('')
    setExpanded(false)
  }

  function handleClear() {
    if (isStreaming) return
    setPlotHint('')
    setDraft('')
    setExpanded(false)
  }

  const preview = plotHint.length > 10 ? plotHint.slice(0, 10) + '…' : plotHint

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        disabled={isStreaming}
        aria-expanded={expanded}
        aria-controls="plot-direction-editor"
        onClick={() => { setDraft(plotHint); setExpanded(!expanded) }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
        style={{
          background: hasHint ? config.theme.primary + '33' : 'rgba(255,255,255,0.06)',
          color: hasHint ? config.theme.primary : config.theme.textMuted,
          border: `1px solid ${hasHint ? config.theme.primary + '66' : config.theme.border}`,
        }}
        title={hasHint ? plotHint : '剧情构想'}
      >
        <span>✍</span>
        {hasHint ? (
          <span className="max-w-[6em] truncate">{preview}</span>
        ) : (
          <span>剧情构想</span>
        )}
      </button>

      {hasHint && <div className="w-full space-y-2 rounded-lg border p-3" style={{ borderColor: config.theme.border }}>
        <p role="status" className="text-xs leading-6">当前剧情方向：{plotHint}</p>
        <p className="text-xs leading-6" style={{ color: config.theme.textMuted }}>会持续用于后续生成，直到你修改或结束。已发生的剧情会保留。</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <button disabled={isStreaming} onClick={() => { setDraft(plotHint); setExpanded(true) }} className="underline disabled:opacity-40">修改方向</button>
          <button disabled={isStreaming} onClick={handleClear} className="underline disabled:opacity-40">已实现，结束此方向</button>
          <button disabled={isStreaming} onClick={handleClear} className="underline disabled:opacity-40">取消方向</button>
        </div>
      </div>}
      {expanded && (
        <div id="plot-direction-editor" className="w-full space-y-2 animate-fade-in">
          <label htmlFor="plot-direction" className="block text-xs leading-6">希望后续往什么方向发展？这不是主角的行动，也不会立即成为已发生的事实。</label>
          <div className="flex flex-wrap items-center gap-2">
          <input
            id="plot-direction"
            type="text"
            placeholder="例如：希望两人逐渐建立信任"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isStreaming}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && draft.trim()) handleConfirm() }}
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs outline-none transition-colors"
            style={{
              background: config.theme.surface,
              borderColor: config.theme.border,
              color: config.theme.text,
            }}
          />
          <button
            onClick={handleConfirm}
            disabled={!draft.trim() || isStreaming}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: config.theme.primary, color: '#fff' }}
          >
            保存方向
          </button>
          {hasHint && (
            <button
              disabled={isStreaming}
              onClick={handleClear}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity px-1"
              style={{ color: config.theme.textMuted }}
            >
              清除
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  )
}
