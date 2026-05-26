import { GenreKey } from '@/types/genre'

export interface VibeLevel {
  min: number
  max: number
  icon: string
  label: string
  color: string
}

export const STATUS_VIBES: Record<GenreKey, Record<string, VibeLevel[]>> = {
  mystery: {
    clues: [
      { min: 0,  max: 3,   icon: '🌫️', label: '毫无头绪', color: '#888888' },
      { min: 4,  max: 8,   icon: '🔍', label: '初见端倪', color: '#B8960C' },
      { min: 9,  max: 13,  icon: '🧩', label: '拼图渐成', color: '#D4A020' },
      { min: 14, max: 17,  icon: '⚡', label: '接近真相', color: '#F0C030' },
      { min: 18, max: 20,  icon: '🎯', label: '真相在握', color: '#FFD700' },
    ],
    sanity: [
      { min: 0,  max: 20,  icon: '🌀', label: '精神崩溃', color: '#CC0000' },
      { min: 21, max: 40,  icon: '😰', label: '岌岌可危', color: '#FF6B6B' },
      { min: 41, max: 60,  icon: '😐', label: '尚能维持', color: '#888888' },
      { min: 61, max: 80,  icon: '🧠', label: '思维清晰', color: '#4A9B8E' },
      { min: 81, max: 100, icon: '🔬', label: '洞察入微', color: '#00BFA5' },
    ],
  },
  xuanhuan: {
    spirit: [
      { min: 0,  max: 10,  icon: '💀', label: '灵力枯竭', color: '#666666' },
      { min: 11, max: 30,  icon: '🌱', label: '灵力微弱', color: '#7B68EE' },
      { min: 31, max: 60,  icon: '⚡', label: '灵力充盈', color: '#5B8DEF' },
      { min: 61, max: 85,  icon: '🌟', label: '灵力旺盛', color: '#4169E1' },
      { min: 86, max: 100, icon: '🔥', label: '灵力爆发', color: '#00BFFF' },
    ],
    realm: [
      { min: 1,  max: 2,   icon: '🌱', label: '练气期',  color: '#7B68EE' },
      { min: 3,  max: 4,   icon: '💧', label: '筑基期',  color: '#6A5ACD' },
      { min: 5,  max: 6,   icon: '⚡', label: '金丹期',  color: '#5B8DEF' },
      { min: 7,  max: 8,   icon: '🌟', label: '元婴期',  color: '#4169E1' },
      { min: 9,  max: 10,  icon: '🔥', label: '化神期',  color: '#00BFFF' },
    ],
  },
  ancient: {
    prestige: [
      { min: 0,  max: 20,  icon: '👤', label: '默默无闻', color: '#666666' },
      { min: 21, max: 40,  icon: '📜', label: '小有名气', color: '#8B5E3C' },
      { min: 41, max: 60,  icon: '⚜️', label: '声名鹊起', color: '#C8882A' },
      { min: 61, max: 80,  icon: '👑', label: '朝野皆知', color: '#D4A030' },
      { min: 81, max: 100, icon: '🏆', label: '一呼百应', color: '#FFD700' },
    ],
    faction: [
      { min: 0,  max: 20,  icon: '🍂', label: '势力瓦解', color: '#666666' },
      { min: 21, max: 40,  icon: '🌿', label: '根基初立', color: '#8B5E3C' },
      { min: 41, max: 60,  icon: '🏯', label: '势力稳固', color: '#C8882A' },
      { min: 61, max: 80,  icon: '⚔️', label: '兵强马壮', color: '#D4A030' },
      { min: 81, max: 100, icon: '🐉', label: '天下归心', color: '#FFD700' },
    ],
  },
  magic: {
    spirit: [
      { min: 0,  max: 10,  icon: '💀', label: '魔力枯竭', color: '#666666' },
      { min: 11, max: 30,  icon: '✨', label: '魔力微弱', color: '#9B59B6' },
      { min: 31, max: 60,  icon: '🔮', label: '魔力充盈', color: '#8E44AD' },
      { min: 61, max: 85,  icon: '🌟', label: '魔力旺盛', color: '#7D3C98' },
      { min: 86, max: 100, icon: '💫', label: '魔力爆发', color: '#C39BD3' },
    ],
    realm: [
      { min: 1,  max: 2,   icon: '📚', label: '见习魔法师', color: '#9B59B6' },
      { min: 3,  max: 4,   icon: '🪄', label: '初级魔法师', color: '#8E44AD' },
      { min: 5,  max: 6,   icon: '⭐', label: '中级魔法师', color: '#7D3C98' },
      { min: 7,  max: 8,   icon: '🌟', label: '高级魔法师', color: '#6C3483' },
      { min: 9,  max: 10,  icon: '👁️', label: '魔法大师',   color: '#C39BD3' },
    ],
  },
  urban: {
    network: [
      { min: 0,  max: 20,  icon: '🏝️', label: '孤立无援', color: '#666666' },
      { min: 21, max: 40,  icon: '🤝', label: '初识贵人', color: '#00A896' },
      { min: 41, max: 60,  icon: '🌐', label: '人脉渐广', color: '#00C4A7' },
      { min: 61, max: 80,  icon: '💼', label: '商界通吃', color: '#00D4B8' },
      { min: 81, max: 100, icon: '👔', label: '呼风唤雨', color: '#00F5D4' },
    ],
    money: [
      { min: 0,    max: 100,  icon: '💸', label: '一贫如洗', color: '#666666' },
      { min: 101,  max: 500,  icon: '💰', label: '勉强度日', color: '#A0A000' },
      { min: 501,  max: 2000, icon: '💵', label: '小康水平', color: '#C8A800' },
      { min: 2001, max: 6000, icon: '🏦', label: '财力雄厚', color: '#FFD700' },
      { min: 6001, max: 9999, icon: '💎', label: '富可敌国', color: '#00F5D4' },
    ],
  },
  horror: {
    fear: [
      { min: 0,  max: 20,  icon: '😌', label: '处变不惊', color: '#556B2F' },
      { min: 21, max: 40,  icon: '😟', label: '隐隐不安', color: '#8B6914' },
      { min: 41, max: 60,  icon: '😨', label: '心跳加速', color: '#CC4400' },
      { min: 61, max: 80,  icon: '😱', label: '极度恐惧', color: '#CC2222' },
      { min: 81, max: 100, icon: '🫀', label: '濒临崩溃', color: '#FF0000' },
    ],
    sanity: [
      { min: 0,  max: 20,  icon: '🌀', label: '精神崩溃', color: '#CC0000' },
      { min: 21, max: 40,  icon: '😵', label: '幻觉频发', color: '#8B0000' },
      { min: 41, max: 60,  icon: '😶', label: '尚能坚持', color: '#556B2F' },
      { min: 61, max: 80,  icon: '🧠', label: '头脑清醒', color: '#4A7C4E' },
      { min: 81, max: 100, icon: '🔦', label: '洞若观火', color: '#00AA00' },
    ],
  },
  scifi: {
    tech: [
      { min: 0,  max: 20,  icon: '🔧', label: '原始工具', color: '#666666' },
      { min: 21, max: 40,  icon: '💻', label: '基础科技', color: '#5BA0CF' },
      { min: 41, max: 60,  icon: '🤖', label: 'AI辅助', color: '#00A0DF' },
      { min: 61, max: 80,  icon: '🛸', label: '星际航行', color: '#00BFFF' },
      { min: 81, max: 100, icon: '🌌', label: '文明巅峰', color: '#7EC8E3' },
    ],
    trust: [
      { min: 0,  max: 20,  icon: '🚫', label: '被孤立', color: '#CC2222' },
      { min: 21, max: 40,  icon: '🤨', label: '存疑', color: '#888888' },
      { min: 41, max: 60,  icon: '🤝', label: '合作中', color: '#5BA0CF' },
      { min: 61, max: 80,  icon: '✅', label: '信任', color: '#00BFFF' },
      { min: 81, max: 100, icon: '🌟', label: '无条件信赖', color: '#7EC8E3' },
    ],
  },
  apocalypse: {
    survival: [
      { min: 0,  max: 20,  icon: '💀', label: '濒死边缘', color: '#CC0000' },
      { min: 21, max: 40,  icon: '🩹', label: '勉强支撑', color: '#FF4444' },
      { min: 41, max: 60,  icon: '🏕️', label: '基本生存', color: '#FF6B35' },
      { min: 61, max: 80,  icon: '🏰', label: '据点稳固', color: '#FF8C55' },
      { min: 81, max: 100, icon: '🌟', label: '领袖崛起', color: '#FFAA55' },
    ],
    sanity: [
      { min: 0,  max: 20,  icon: '🌀', label: '精神崩溃', color: '#CC0000' },
      { min: 21, max: 40,  icon: '😰', label: '崩溃边缘', color: '#FF4444' },
      { min: 41, max: 60,  icon: '😐', label: '咬牙坚持', color: '#FF6B35' },
      { min: 61, max: 80,  icon: '💪', label: '意志坚定', color: '#FF8C55' },
      { min: 81, max: 100, icon: '🔥', label: '不屈意志', color: '#FFAA55' },
    ],
  },
}

export function getVibe(
  genre: GenreKey,
  key: string,
  value: number
): VibeLevel | null {
  const vibes = STATUS_VIBES[genre]?.[key]
  if (!vibes) return null
  return vibes.find((v) => value >= v.min && value <= v.max) ?? null
}