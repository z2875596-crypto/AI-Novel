import { GenreKey, GenreConfig } from '@/types/genre'

export const GENRE_CONFIG: Record<GenreKey, GenreConfig> = {
  urban: {
    key: 'urban',
    label: '都市现代',
    emoji: '🏙️',
    description: '现代都市背景，职场商战与人际关系',
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
  ancient: {
    key: 'ancient',
    label: '古装历史',
    emoji: '🏯',
    description: '古代背景，权谋江湖与朝堂风云',
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
  xuanhuan: {
    key: 'xuanhuan',
    label: '玄幻修仙',
    emoji: '⚡',
    description: '东方奇幻，修炼体系与战斗突破',
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
  magic: {
    key: 'magic',
    label: '西幻魔法',
    emoji: '✨',
    description: '西方奇幻，魔法冒险与奇异世界',
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
  mystery: {
    key: 'mystery',
    label: '悬疑推理',
    emoji: '🔍',
    description: '任意背景，线索推理与真相追寻',
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
  horror: {
    key: 'horror',
    label: '恐怖惊悚',
    emoji: '🩸',
    description: '任意背景，恐惧氛围与生存挑战',
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
  scifi: {
    key: 'scifi',
    label: '科幻未来',
    emoji: '🚀',
    description: '星际文明，赛博朋克与AI觉醒',
    bars: [
      { key: 'tech', label: '科技值', max: 100, color: '#00BFFF' },
      { key: 'trust', label: '信任度', max: 100, color: '#7EC8E3' },
    ],
    theme: {
      primary: '#00BFFF',
      secondary: '#009FCF',
      background: '#050a10',
      surface: '#0c2e48',
      surfaceHover: '#143e58',
      text: '#E8FAFF',
      textMuted: '#90D0E0',
      border: '#1a5070',
      fontFamily: 'scifi',
    },
  },
  apocalypse: {
    key: 'apocalypse',
    label: '末世求生',
    emoji: '☢️',
    description: '文明崩塌，绝境中的人性考验',
    bars: [
      { key: 'survival', label: '生存值', max: 100, color: '#FF6B35' },
      { key: 'sanity', label: '理智', max: 100, color: '#FFAA55' },
    ],
    theme: {
      primary: '#FF6B35',
      secondary: '#CC5522',
      background: '#0c0505',
      surface: '#2c1408',
      surfaceHover: '#402010',
      text: '#FFE8D8',
      textMuted: '#D8A090',
      border: '#4a2820',
      fontFamily: 'apocalypse',
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
