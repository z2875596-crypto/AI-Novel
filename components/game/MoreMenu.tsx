'use client'

import { useState, useRef, useEffect } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { useStyleStore } from '@/stores/styleStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface MenuItem {
  icon: string
  label: string
  onClick: () => void
  highlight?: boolean
  hidden?: boolean
}

interface Props {
  onWorldConfig: () => void
  onStylePanel: () => void
  onChapters: () => void
  onRelationships: () => void
  onClues: () => void
  onRewind: () => void
}

export default function MoreMenu({
  onWorldConfig,
  onStylePanel,
  onChapters,
  onRelationships,
  onClues,
  onRewind,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const genre = useGenreStore((s) => s.genre)
  const { styleConfig } = useStyleStore()
  const summaries = useSummaryStore((s) => s.summaries)
  const config = genre ? GENRE_CONFIG[genre] : null

  const primary = config?.theme.primary ?? '#888'
  const border = config?.theme.border ?? 'rgba(255,255,255,0.1)'
  const surface = config?.theme.surface ?? '#1a1a1a'
  const textMuted = config?.theme.textMuted ?? '#888'
  const text = config?.theme.text ?? '#fff'

  const hasStyle = !!(styleConfig.preset || styleConfig.analyzedStyle)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const items: MenuItem[] = [
    {
      icon: '📋',
      label: '世界设定',
      onClick: () => { onWorldConfig(); setOpen(false) },
    },
    {
      icon: '✍️',
      label: hasStyle ? '文笔风格（已设定）' : '文笔风格',
      onClick: () => { onStylePanel(); setOpen(false) },
      highlight: hasStyle,
    },
    {
      icon: '📚',
      label: '章节目录',
      onClick: () => { onChapters(); setOpen(false) },
      hidden: summaries.length === 0,
    },
    {
      icon: '🕸️',
      label: '角色关系',
      onClick: () => { onRelationships(); setOpen(false) },
    },
    {
      icon: '🔍',
      label: '线索库',
      onClick: () => { onClues(); setOpen(false) },
      hidden: genre !== 'mystery',
    },
    {
      icon: '↩️',
      label: '回溯改写',
      onClick: () => { onRewind(); setOpen(false) },
    },
  ].filter((item) => !item.hidden)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:brightness-110 active:scale-95"
        style={{
          background: open ? primary + '22' : 'rgba(255,255,255,0.06)',
          color: open ? primary : textMuted,
          border: `1px solid ${open ? primary + '66' : border}`,
        }}
        title="更多功能"
      >
        ⋯
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border overflow-hidden z-50 animate-fade-in-up shadow-2xl"
          style={{ background: surface, borderColor: border }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-all hover:brightness-125"
              style={{
                color: item.highlight ? primary : text,
                background: item.highlight ? primary + '11' : 'transparent',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
