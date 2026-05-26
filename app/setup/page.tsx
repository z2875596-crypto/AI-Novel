'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenreStore } from '@/stores/genreStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { useStyleStore } from '@/stores/styleStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { getInitialStatus } from '@/lib/statusBar'
import ThemeProvider from '@/components/shared/ThemeProvider'
import WorldEditor from '@/components/setup/WorldEditor'
import CharacterEditor from '@/components/setup/CharacterEditor'
import RandomGenButton from '@/components/setup/RandomGenButton'
import StyleEditor from '@/components/setup/StyleEditor'
import TargetEndingEditor from '@/components/setup/TargetEndingEditor'
import PlotBeatsEditor from '@/components/setup/PlotBeatsEditor'
import { NPC } from '@/types/world'
import RomanceBackground from '@/components/home/backgrounds/RomanceBackground'
import XuanhuanBackground from '@/components/home/backgrounds/XuanhuanBackground'
import MysteryBackground from '@/components/home/backgrounds/MysteryBackground'
import AncientBackground from '@/components/home/backgrounds/AncientBackground'
import MagicBackground from '@/components/home/backgrounds/MagicBackground'
import UrbanBackground from '@/components/home/backgrounds/UrbanBackground'
import HorrorBackground from '@/components/home/backgrounds/HorrorBackground'
import ComedyBackground from '@/components/home/backgrounds/ComedyBackground'
import RandomBackground from '@/components/home/backgrounds/RandomBackground'

function uid() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

function GenreBackgroundForSetup({ genre }: { genre: string }) {
  switch (genre) {
    case 'romance': return <RomanceBackground />
    case 'xuanhuan': return <XuanhuanBackground />
    case 'mystery': return <MysteryBackground />
    case 'ancient': return <AncientBackground />
    case 'magic': return <MagicBackground />
    case 'urban': return <UrbanBackground />
    case 'horror': return <HorrorBackground />
    case 'comedy': return <ComedyBackground />
    default: return <RandomBackground />
  }
}

export default function SetupPage() {
  const router = useRouter()
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const setWorldConfig = useWorldStore((s) => s.setWorldConfig)
  const resetGame = useGameStore((s) => s.resetGame)
  const resetStyle = useStyleStore((s) => s.reset)

  useEffect(() => {
    if (!genre) router.replace('/')
  }, [genre, router])

  if (!genre) return null

  const config = GENRE_CONFIG[genre]

  function handleRandom(data: {
    worldName?: string
    worldSetting?: string
    protagonistName?: string
    protagonistTraits?: string
    openingScene?: string
    suggestedNPCs?: { name: string; role: string; traits: string }[]
  }) {
    const npcs: NPC[] = (data.suggestedNPCs ?? []).map((n) => ({
      id: uid(),
      name: n.name,
      role: n.role,
      traits: n.traits,
    }))
    setWorldConfig({
      worldName: data.worldName ?? '',
      worldSetting: data.worldSetting ?? '',
      protagonistName: data.protagonistName ?? '',
      protagonistTraits: data.protagonistTraits ?? '',
      openingScene: data.openingScene ?? '',
      npcs,
      plotBeats: worldConfig.plotBeats,
      targetEnding: worldConfig.targetEnding,
      narrativePOV: worldConfig.narrativePOV ?? 'second',
    })
  }

  function validate() {
    const { worldName, worldSetting, protagonistName, protagonistTraits, openingScene } = worldConfig
    return worldName && worldSetting && protagonistName && protagonistTraits && openingScene
  }

  function handleStart() {
    if (!validate()) {
      alert('请填写所有必填项（标 * 的字段）')
      return
    }
    const initialStatus = getInitialStatus(genre!)
    resetGame(initialStatus)
    router.push('/game')
  }

  return (
    <ThemeProvider>
      <GenreBackgroundForSetup genre={genre} />

      <main className="min-h-screen flex flex-col items-center px-4 py-10 relative z-10">
        <div className="w-full max-w-lg">
          {/* 顶部导航 */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              ← 返回
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.emoji}</span>
              <span
                className="font-semibold"
                style={{
                  color: 'var(--theme-primary)',
                  textShadow: '0 0 20px var(--theme-primary)',
                }}
              >
                {config.label}
              </span>
              <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                · 世界设定
              </span>
            </div>
          </div>

          {/* 随机生成 */}
          <div className="mb-6">
            <RandomGenButton genre={genre} onGenerated={handleRandom} />
            <p className="text-xs mt-2" style={{ color: 'var(--theme-text-muted)' }}>
              没有灵感？让 AI 帮你随机生成一套设定，生成后可以继续修改
            </p>
          </div>

          <div className="border-t mb-6" style={{ borderColor: `${config.theme.border}88` }} />

          <div className="mb-6"><WorldEditor /></div>

          <div className="border-t mb-6" style={{ borderColor: `${config.theme.border}88` }} />

          <div className="mb-6"><CharacterEditor /></div>

          <div className="border-t mb-6" style={{ borderColor: `${config.theme.border}88` }} />

          <div className="mb-6"><PlotBeatsEditor /></div>

          <div className="border-t mb-6" style={{ borderColor: `${config.theme.border}88` }} />

          <div className="mb-6"><TargetEndingEditor /></div>

          <div className="border-t mb-6" style={{ borderColor: `${config.theme.border}88` }} />

          <div className="mb-8"><StyleEditor /></div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-xl text-base font-bold transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: config.theme.primary,
              color: '#fff',
              boxShadow: `0 0 20px ${config.theme.primary}66`,
            }}
          >
            开始故事 →
          </button>
        </div>
      </main>
    </ThemeProvider>
  )
}