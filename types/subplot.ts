export type SubplotKey = 'romance' | 'comedy' | 'rivalry' | 'mystery_sub' | 'dark' | 'intrigue'

export interface SubplotOption {
  key: SubplotKey
  emoji: string
  label: string
  description: string
  promptInstruction: string
}

export const SUBPLOT_OPTIONS: SubplotOption[] = [
  {
    key: 'romance',
    emoji: '💕',
    label: '言情',
    description: '感情升温、心动时刻',
    promptInstruction:
      '在主线剧情中自然融入角色间的情感变化，描写心动细节、暧昧互动和感情升温，感情线服务于主线，不能喧宾夺主。',
  },
  {
    key: 'comedy',
    emoji: '😄',
    label: '轻松搞笑',
    description: '幽默反转、轻松日常',
    promptInstruction:
      '在剧情中穿插幽默时刻和意外反转，用轻松笔触调节紧张节奏，对话可以俏皮风趣，但不破坏整体氛围。',
  },
  {
    key: 'rivalry',
    emoji: '⚔️',
    label: '争斗对抗',
    description: '竞争对手、正面交锋',
    promptInstruction:
      '引入强劲的竞争对手，制造对抗张力和压迫感，冲突要有层次，让主角在对抗中展现成长。',
  },
  {
    key: 'mystery_sub',
    emoji: '🔮',
    label: '隐藏谜题',
    description: '埋下伏笔、秘密待解',
    promptInstruction:
      '在剧情中埋下隐藏的秘密和未解之谜，适时给出线索但不直接揭露，保持悬念，让玩家想要继续探索。',
  },
  {
    key: 'dark',
    emoji: '🌑',
    label: '黑暗沉重',
    description: '背叛牺牲、沉重代价',
    promptInstruction:
      '剧情中可以出现背叛、牺牲或沉重代价，展现人性复杂面，不回避悲剧元素，让故事更有深度。',
  },
  {
    key: 'intrigue',
    emoji: '🎭',
    label: '权谋算计',
    description: '阴谋博弈、多方角力',
    promptInstruction:
      '引入多方势力的博弈和算计，人物各有立场和目的，对话暗藏玄机，局势随时可能反转。',
  },
]
