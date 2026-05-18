import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PresetStyle =
  | 'concise'      // 简练克制
  | 'lyrical'      // 抒情细腻
  | 'suspenseful'  // 紧张悬疑
  | 'humorous'     // 幽默诙谐
  | 'classical'    // 古典雅致
  | 'cinematic'    // 电影感镜头
  | 'custom'       // 自定义

export interface StyleConfig {
  preset: PresetStyle | null
  customDescription: string   // 自由填写的风格描述
  analyzedStyle: string       // 从上传文件中分析出的风格描述
  sourceText: string          // 上传的原文（截取前2000字）
}

export const PRESET_STYLE_OPTIONS: { key: PresetStyle; label: string; description: string }[] = [
  { key: 'concise',     label: '简练克制', description: '短句为主，克制内敛，留白丰富' },
  { key: 'lyrical',     label: '抒情细腻', description: '情感丰沛，善用比喻，心理描写深入' },
  { key: 'suspenseful', label: '紧张悬疑', description: '节奏紧凑，信息克制，张力十足' },
  { key: 'humorous',    label: '幽默诙谐', description: '轻松调侃，反转频繁，对话活泼' },
  { key: 'classical',   label: '古典雅致', description: '文言意境，典故引用，辞藻典雅' },
  { key: 'cinematic',   label: '电影镜头', description: '场景感强，动作描写精准，视觉化叙事' },
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