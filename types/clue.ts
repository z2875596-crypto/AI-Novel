export interface Clue {
    id: string
    name: string
    description: string
    foundAt: number        // 发现时的回合数
    timestamp: number
    relatedClues: string[] // 关联线索的 id 列表
    category: 'person' | 'object' | 'location' | 'event' | 'other'
    importance: 'low' | 'medium' | 'high'
    revealed: boolean      // 是否已经指向了具体内容
    revelation?: string    // 线索指向的具体内容
  }
  
  export const CLUE_CATEGORY_LABELS: Record<Clue['category'], string> = {
    person: '人物',
    object: '物品',
    location: '地点',
    event: '事件',
    other: '其他',
  }
  
  export const CLUE_CATEGORY_ICONS: Record<Clue['category'], string> = {
    person: '👤',
    object: '🔧',
    location: '📍',
    event: '📅',
    other: '❓',
  }
  
  export const CLUE_IMPORTANCE_COLORS: Record<Clue['importance'], string> = {
    low: '#8a8070',
    medium: '#B8960C',
    high: '#FF6B35',
  }