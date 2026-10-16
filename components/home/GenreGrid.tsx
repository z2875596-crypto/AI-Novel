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
    <div className="space-y-8">
      <section aria-label="选择开始方式" className="grid gap-4 sm:grid-cols-2">
        <article className="flex flex-col rounded-2xl border p-5 sm:p-6" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
          <h2 className="text-xl font-semibold">进入一个故事</h2>
          <p className="text-sm leading-7 mt-3 mb-5" style={{ color: 'var(--theme-text-muted)' }}>从准备好的故事开始，做出你的选择。</p>
          <a href="#story-selection" className="mt-auto block rounded-xl border px-4 py-3 text-center text-sm font-semibold transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-4" style={{ borderColor: 'var(--theme-primary)', background: 'var(--theme-surface-hover)', color: 'var(--theme-text)' }}>挑选故事 →</a>
        </article>
        <article className="flex flex-col rounded-2xl border p-5 sm:p-6" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
          <h2 className="text-xl font-semibold">创作我的故事</h2>
          <p className="text-sm leading-7 mt-3 mb-5" style={{ color: 'var(--theme-text-muted)' }}>设定世界与角色，展开你自己的剧情。</p>
          <div className="flex items-center gap-3 mb-4">
            <label htmlFor="custom-genre" className="text-sm shrink-0">故事题材</label>
            <select id="custom-genre" disabled={starting} value={customGenre} onChange={e => setCustomGenre(e.target.value as GenreKey)} className="min-w-0 flex-1 rounded-lg border p-2 text-sm" style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              {ALL_GENRE_KEYS.map(key => <option key={key} value={key}>{GENRE_CONFIG[key].label}</option>)}
            </select>
          </div>
          <button disabled={starting} onClick={() => start(customGenre, true)} className="mt-auto w-full rounded-xl border px-4 py-3 text-sm font-semibold transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50" style={{ borderColor: 'var(--theme-primary)', background: 'var(--theme-surface-hover)', color: 'var(--theme-text)' }}>开始创作 →</button>
        </article>
      </section>
      {error && <p role="alert" className="rounded-xl border p-3">{error}</p>}
      <section aria-labelledby="story-selection" className="space-y-6">
      <div>
        <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--theme-primary)' }}>故事，从一个难题开始</p>
        <h2 id="story-selection" className="scroll-mt-6 text-xl font-semibold">你想走进哪段故事？</h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>无需先写设定。选一个故事，直接面对你的第一个抉择。</p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="按题材筛选故事">
        <button aria-pressed={!filter} onClick={() => setFilter(null)} className="rounded-full border px-3 py-2 text-xs" style={{ borderColor: !filter ? 'var(--theme-primary)' : 'var(--theme-border)' }}>主推故事</button>
        {ALL_GENRE_KEYS.map(key => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)} className="rounded-full border px-3 py-2 text-xs transition-colors hover:bg-white/5" style={{ borderColor: filter === key ? 'var(--theme-primary)' : 'var(--theme-border)' }}>{GENRE_CONFIG[key].label}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stories.map(key => {
          const story = STORY_CATALOG[key], cfg = GENRE_CONFIG[key]
          return <article key={key} className="flex flex-col rounded-2xl border p-5 sm:p-6" style={{ background: cfg.theme.surface, borderColor: cfg.theme.border, color: cfg.theme.text }}>
            <div className="flex items-center justify-between gap-3 mb-6"><span className="text-3xl" aria-hidden="true">{cfg.emoji}</span><span className="text-xs" style={{ color: cfg.theme.textMuted }}>{cfg.label} · 短篇体验</span></div>
            <h3 className="text-xl font-semibold mb-3">{story.title}</h3>
            <p className="text-sm leading-7 mb-5">{story.hook}</p>
            {story.participantRole && <p className="text-xs leading-6 mb-2" style={{ color: cfg.theme.textMuted }}>你的身份：{story.participantRole}</p>}
            {story.experience && <p className="text-xs leading-6 mb-3" style={{ color: cfg.theme.textMuted }}>你将体验：{story.experience}</p>}
            <p className="text-xs leading-6 mb-6" style={{ color: cfg.theme.textMuted }}>你的目标：{story.goal}</p>
            <div className="mt-auto space-y-3"><p className="text-xs" style={{ color: cfg.theme.textMuted }}>短篇体验 · 可自由输入 · 可回溯</p><button disabled={starting} onClick={() => start(key)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold transition hover:brightness-125 disabled:opacity-50" style={{ background: `${cfg.theme.primary}22`, borderColor: cfg.theme.primary, color: cfg.theme.text }} aria-label={`进入故事：${story.title}`}>进入故事 →</button></div>
          </article>
        })}
      </div>
      <p className="text-xs leading-6" style={{ color: 'var(--theme-text-muted)' }}>故事提供预设背景与冲突，后续正文由 AI 生成。选择行动，或写下你想怎么做；结束后可回溯探索其他走向。进度保存在本机浏览器，建议导出备份。</p>

      </section>
    </div>
  )
}
