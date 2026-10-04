import type { GenreKey } from '@/types/genre'
import { EMPTY_WORLD_CONFIG, type WorldConfig } from '@/types/world'
import { STORY_CATALOG } from './storyCatalog'
import { initialSupply } from './supplyGame'

export function quickStartWorld(genre: GenreKey): WorldConfig {
  const story = STORY_CATALOG[genre]
  return { ...EMPTY_WORLD_CONFIG,
    supply: genre === 'apocalypse' ? initialSupply() : undefined,
    worldName: story.title,
    worldSetting: `${story.setting}\n本次目标：${story.goal}\n叙事要求：尊重已发生的事实。选择必须影响信息、人物态度或可行路线，后续体现因果。困境允许有创造性的解决方案，但需要调查、协助或代价，不能凭一句话自动消失。结局回顾玩家的关键选择与后果，不预设好结局。`,
    protagonistName: '林舟', protagonistTraits: '观察敏锐、愿意帮助他人，但必须权衡风险',
    openingScene: `${story.opening} 明确眼前目标：${story.goal} 给出可立刻行动的现场细节，不要提前解决问题。`,
    npcs: story.npcs.map(npc => ({ ...npc, id: crypto.randomUUID() })),
    plotBeats: [], targetEnding: '', storyLength: 'trial' }
}
