import { GenreKey, GenreConfig } from '@/types/genre'

export const GENRE_CONFIG: Record<GenreKey, GenreConfig> = {
  romance: {
    key: 'romance',
    label: '言情',
    emoji: '🌹',
    description: '心跳加速的爱情故事',
    bars: [
      { key: 'affection', label: '好感度', max: 100, color: '#E8607A' },
      { key: 'heartbeat', label: '心动值', max: 100, color: '#FF8FAB' },
    ],
    theme: {
      primary: '#E8607A',
      secondary: '#FF8FAB',
      background: '#1a0a0d',
      surface: '#2d1018',
      surfaceHover: '#3d1822',
      text: '#fde8ec',
      textMuted: '#c4959f',
      border: '#6b2d3a',
      fontFamily: 'romance',
    },
  },
  xuanhuan: {
    key: 'xuanhuan',
    label: '玄幻',
    emoji: '⚡',
    description: '修仙问道，飞升成仙',
    bars: [
      { key: 'spirit', label: '灵力', max: 100, color: '#7B68EE' },
      { key: 'realm', label: '境界', max: 10, color: '#4169E1' },
    ],
    theme: {
      primary: '#5B8DEF',
      secondary: '#7B68EE',
      background: '#05080f',
      surface: '#0d1525',
      surfaceHover: '#152035',
      text: '#d0e4ff',
      textMuted: '#7090b0',
      border: '#1a3060',
      fontFamily: 'xuanhuan',
    },
  },
  mystery: {
    key: 'mystery',
    label: '悬疑',
    emoji: '🔍',
    description: '抽丝剥茧，真相只有一个',
    bars: [
      { key: 'clues', label: '线索数', max: 20, color: '#B8960C' },
      { key: 'sanity', label: '理智值', max: 100, color: '#4A9B8E' },
    ],
    theme: {
      primary: '#C8A020',
      secondary: '#8B7300',
      background: '#0a0a08',
      surface: '#141410',
      surfaceHover: '#1e1e18',
      text: '#e8e0c8',
      textMuted: '#8a8070',
      border: '#3a3520',
      fontFamily: 'mystery',
    },
  },
  ancient: {
    key: 'ancient',
    label: '古装',
    emoji: '🏯',
    description: '宫廷权谋，江湖恩怨',
    bars: [
      { key: 'prestige', label: '声望', max: 100, color: '#D4A030' },
      { key: 'faction', label: '势力', max: 100, color: '#8B5E3C' },
    ],
    theme: {
      primary: '#C8882A',
      secondary: '#8B5E3C',
      background: '#0f0a05',
      surface: '#1e1208',
      surfaceHover: '#2e1c0e',
      text: '#f0e0c0',
      textMuted: '#a08060',
      border: '#5a3a18',
      fontFamily: 'ancient',
    },
  },
  magic: {
    key: 'magic',
    label: '魔法',
    emoji: '✨',
    description: '魔法与奇迹交织的异世界',
    bars: [
      { key: 'spirit', label: '灵力', max: 100, color: '#9B59B6' },
      { key: 'realm', label: '境界', max: 10, color: '#8E44AD' },
    ],
    theme: {
      primary: '#9B59B6',
      secondary: '#7D3C98',
      background: '#0a0510',
      surface: '#150a20',
      surfaceHover: '#200f30',
      text: '#e8d5ff',
      textMuted: '#9070b0',
      border: '#4a2060',
      fontFamily: 'magic',
    },
  },
  urban: {
    key: 'urban',
    label: '都市',
    emoji: '🌃',
    description: '霓虹闪烁的现代都市',
    bars: [
      { key: 'network', label: '人脉', max: 100, color: '#00F5D4' },
      { key: 'money', label: '金钱', max: 9999, color: '#FFD700' },
    ],
    theme: {
      primary: '#00D4B8',
      secondary: '#00A896',
      background: '#040c10',
      surface: '#081820',
      surfaceHover: '#0c2430',
      text: '#ccf5f0',
      textMuted: '#508878',
      border: '#0a3830',
      fontFamily: 'urban',
    },
  },
  horror: {
    key: 'horror',
    label: '恐怖',
    emoji: '🩸',
    description: '黑暗中潜伏着未知的恐惧',
    bars: [
      { key: 'fear', label: '恐惧值', max: 100, color: '#CC2222' },
      { key: 'sanity', label: '理智值', max: 100, color: '#556B2F' },
    ],
    theme: {
      primary: '#CC2222',
      secondary: '#8B0000',
      background: '#080305',
      surface: '#140508',
      surfaceHover: '#200810',
      text: '#f0d8d8',
      textMuted: '#906868',
      border: '#4a1010',
      fontFamily: 'horror',
    },
  },
  comedy: {
    key: 'comedy',
    label: '搞笑',
    emoji: '😂',
    description: '欢乐无极限的爆笑冒险',
    bars: [
      { key: 'drama', label: '抓马程度', max: 100, color: '#5BAD5E' },
    ],
    theme: {
      primary: '#5BAD5E',
      secondary: '#4A9B4D',
      background: '#05100a',
      surface: '#0c1e10',
      surfaceHover: '#142818',
      text: '#d8f0da',
      textMuted: '#6a9870',
      border: '#204828',
      fontFamily: 'comedy',
    },
  },
}

export const ALL_GENRE_KEYS = Object.keys(GENRE_CONFIG) as GenreKey[]

export function getRandomGenre(): GenreKey {
  const keys = ALL_GENRE_KEYS
  return keys[Math.floor(Math.random() * keys.length)]
}

export function applyTheme(theme: GenreConfig['theme']) {
  const root = document.documentElement
  root.style.setProperty('--theme-primary', theme.primary)
  root.style.setProperty('--theme-secondary', theme.secondary)
  root.style.setProperty('--theme-bg', theme.background)
  root.style.setProperty('--theme-surface', theme.surface)
  root.style.setProperty('--theme-surface-hover', theme.surfaceHover)
  root.style.setProperty('--theme-text', theme.text)
  root.style.setProperty('--theme-text-muted', theme.textMuted)
  root.style.setProperty('--theme-border', theme.border)
}