import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PresetStyle =
  | 'concise'       // 简练克制
  | 'lyrical'       // 抒情细腻
  | 'suspenseful'   // 紧张悬疑
  | 'humorous'      // 幽默诙谐
  | 'classical'     // 古典雅致
  | 'cinematic'     // 电影感镜头
  | 'wuxia'         // 武侠文言
  | 'lightnovel'    // 现代轻小说
  | 'literary'      // 严肃纯文学
  | 'custom'        // 自定义

export interface StyleConfig {
  preset: PresetStyle | null
  customDescription: string
  analyzedStyle: string
  sourceText: string
}

export const PRESET_STYLE_OPTIONS: {
  key: PresetStyle
  label: string
  description: string
  example: string
  emoji: string
}[] = [
  {
    key: 'concise',
    label: '简练克制',
    description: '短句为主，克制内敛，留白丰富',
    example: '他走了。门关上。风还在。',
    emoji: '✂️',
  },
  {
    key: 'lyrical',
    label: '抒情细腻',
    description: '情感丰沛，善用比喻，心理描写深入',
    example: '心跳像被人握住，轻轻攥紧，又慢慢松开。',
    emoji: '🌸',
  },
  {
    key: 'suspenseful',
    label: '紧张悬疑',
    description: '节奏紧凑，信息克制，张力十足',
    example: '脚步声停了。就在门外。',
    emoji: '🔦',
  },
  {
    key: 'humorous',
    label: '幽默诙谐',
    description: '轻松调侃，反转频繁，对话活泼',
    example: '他一脸正经地说出了本世纪最荒唐的话。',
    emoji: '😄',
  },
  {
    key: 'classical',
    label: '古典雅致',
    description: '文言意境，典故引用，辞藻典雅',
    example: '月色如练，他立于廊下，衣袂微动。',
    emoji: '🏮',
  },
  {
    key: 'cinematic',
    label: '电影镜头',
    description: '场景感强，动作描写精准，视觉化叙事',
    example: '镜头拉远。人群散去。她还站在原地。',
    emoji: '🎬',
  },
  {
    key: 'wuxia',
    label: '武侠文言',
    description: '文白夹杂，江湖气韵，侠义豪情',
    example: '剑未出鞘，杀气已至。他负手而立，眸若寒星。',
    emoji: '⚔️',
  },
  {
    key: 'lightnovel',
    label: '轻小说',
    description: '口语化，节奏快，内心吐槽密集',
    example: '等等等等，这个发展不对劲吧！我的心脏受不了啊！',
    emoji: '📱',
  },
  {
    key: 'literary',
    label: '纯文学',
    description: '意象密集，叙事克制，象征性强',
    example: '光从窗棂落下来，像某种无法言说的告别。',
    emoji: '📖',
  },
]

interface StyleStore {
  styleConfig: StyleConfig
  setPreset: (preset: PresetStyle | null) => void
  setCustomDescription: (desc: string) => void
  setAnalyzedStyle: (style: string, sourceText: string) => void
  reset: () => void
}

const DEFAULT_CONFIG: StyleConfig = {
  preset: null,
  customDescription: '',
  analyzedStyle: '',
  sourceText: '',
}

export const useStyleStore = create<StyleStore>()(
  persist(
    (set) => ({
      styleConfig: DEFAULT_CONFIG,
      setPreset: (preset) =>
        set((s) => ({ styleConfig: { ...s.styleConfig, preset } })),
      setCustomDescription: (desc) =>
        set((s) => ({ styleConfig: { ...s.styleConfig, customDescription: desc } })),
      setAnalyzedStyle: (analyzedStyle, sourceText) =>
        set((s) => ({ styleConfig: { ...s.styleConfig, analyzedStyle, sourceText } })),
      reset: () => set({ styleConfig: DEFAULT_CONFIG }),
    }),
    { name: 'style-store' }
  )
)
