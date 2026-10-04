'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GenreKey } from '@/types/genre'
import { archiveCurrentStory, resetAuxiliaryState } from '@/lib/session'
import { quickStartWorld } from '@/lib/quickStart'
import { STORY_CATALOG, FEATURED_STORIES } from '@/lib/storyCatalog'
import { getInitialStatus } from '@/lib/statusBar'
import { GENRE_CONFIG, ALL_GENRE_KEYS, applyTheme } from '@/lib/themeConfig'
import { useGenreStore } from '@/stores/genreStore'
import { useGameStore } from '@/stores/gameStore'
import { useWorldStore } from '@/stores/worldStore'

export default function GenreGrid() {
  const router = useRouter()
  const [filter, setFilter] = useState<GenreKey | null>(null)
  const [customGenre, setCustomGenre] = useState<GenreKey>('urban')
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const stories = filter ? [filter] : FEATURED_STORIES

  function start(genre: GenreKey, custom = false) {
    if (starting) return
    try {
      archiveCurrentStory()
      const world = custom ? null : quickStartWorld(genre)
      resetAuxiliaryState()
      useGenreStore.getState().setGenre(genre)
      useGenreStore.getState().setSubplots([])
      useGameStore.getState().resetGame(getInitialStatus(genre))
      useWorldStore.getState().reset()
      if (world) useWorldStore.getState().setWorldConfig(world)
      applyTheme(GENRE_CONFIG[genre].theme)
      setStarting(true)
      setError('')
      router.push(custom ? '/setup' : '/game')
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <section aria-labelledby="story-selection" className="space-y-6">
      <div>
        <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--theme-primary)' }}>故事，从一个难题开始</p>
        <h2 id="story-selection" className="text-xl font-semibold">你想走进哪段故事？</h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>无需先写设定。选一个故事，直接面对你的第一个抉择。</p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="按题材筛选故事">
        <button aria-pressed={!filter} onClick={() => setFilter(null)} className="rounded-full border px-3 py-2 text-xs" style={{ borderColor: !filter ? 'var(--theme-primary)' : 'var(--theme-border)' }}>主推故事</button>
        {ALL_GENRE_KEYS.map(key => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)} className="rounded-full border px-3 py-2 text-xs transition-colors hover:bg-white/5" style={{ borderColor: filter === key ? 'var(--theme-primary)' : 'var(--theme-border)' }}>{GENRE_CONFIG[key].label}</button>)}
      </div>
      {error && <p role="alert" className="rounded-xl border p-3">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {stories.map(key => {
          const story = STORY_CATALOG[key], cfg = GENRE_CONFIG[key]
          return <article key={key} className="flex flex-col rounded-2xl border p-5 sm:p-6" style={{ background: cfg.theme.surface, borderColor: cfg.theme.border, color: cfg.theme.text }}>
            <div className="flex items-center justify-between gap-3 mb-6"><span className="text-3xl" aria-hidden="true">{cfg.emoji}</span><span className="text-xs" style={{ color: cfg.theme.textMuted }}>{cfg.label} · 短篇体验</span></div>
            <h3 className="text-xl font-semibold mb-3">{story.title}</h3>
            <p className="text-sm leading-7 mb-5">{story.hook}</p>
            <p className="text-xs leading-6 mb-6" style={{ color: cfg.theme.textMuted }}>你的目标：{story.goal}</p>
            <div className="mt-auto space-y-3"><p className="text-xs" style={{ color: cfg.theme.textMuted }}>约 8 回合 · 可自由输入 · 可回溯</p><button disabled={starting} onClick={() => start(key)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold transition hover:brightness-125 disabled:opacity-50" style={{ background: `${cfg.theme.primary}22`, borderColor: cfg.theme.primary, color: cfg.theme.text }} aria-label={`进入故事：${story.title}`}>进入故事 →</button></div>
          </article>
        })}
      </div>
      <p className="text-xs leading-6" style={{ color: 'var(--theme-text-muted)' }}>选择行动，或写下你想怎么做。剧情由 AI 生成；结束后，你可以回溯关键选择，探索另一种走向。</p>
      <details className="rounded-2xl border p-5" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
        <summary className="cursor-pointer text-sm font-medium">想讲自己的故事？创建世界与角色</summary>
        <div className="mt-4 space-y-4"><p className="text-sm leading-6" style={{ color: 'var(--theme-text-muted)' }}>为自己的主角搭建世界，再一起推进剧情。文风、剧情节点与目标结局都可以在高级设定中调整。</p><div className="flex flex-wrap items-center gap-3"><label htmlFor="custom-genre" className="text-sm">故事题材</label><select id="custom-genre" value={customGenre} onChange={e => setCustomGenre(e.target.value as GenreKey)} className="rounded-lg border p-2 text-sm" style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>{ALL_GENRE_KEYS.map(key => <option key={key} value={key}>{GENRE_CONFIG[key].label}</option>)}</select><button disabled={starting} onClick={() => start(customGenre, true)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50" style={{ borderColor: 'var(--theme-border)' }}>开始共创 →</button></div></div>
      </details>
    </section>
  )
}
