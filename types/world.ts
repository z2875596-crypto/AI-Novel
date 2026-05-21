export type NarrativePOV = 'first' | 'second' | 'third'

export const NARRATIVE_POV_OPTIONS: { key: NarrativePOV; label: string; description: string; example: string }[] = [
  {
    key: 'first',
    label: '第一人称',
    description: '以"我"叙述，沉浸感强',
    example: '我握住剑柄，深吸一口气……',
  },
  {
    key: 'second',
    label: '第二人称',
    description: '以"你"叙述，代入感强',
    example: '你握住剑柄，深吸一口气……',
  },
  {
    key: 'third',
    label: '第三人称',
    description: '以主角姓名叙述，旁观视角',
    example: '钎城握住剑柄，深吸一口气……',
  },
]

export interface NPC {
  id: string
  name: string
  role: string
  traits: string
}

export interface WorldConfig {
  worldName: string
  worldSetting: string
  protagonistName: string
  protagonistTraits: string
  openingScene: string
  npcs: NPC[]
  targetEnding?: string
  narrativePOV: NarrativePOV   // 叙述视角
}

export const EMPTY_WORLD_CONFIG: WorldConfig = {
  worldName: '',
  worldSetting: '',
  protagonistName: '',
  protagonistTraits: '',
  openingScene: '',
  npcs: [],
  targetEnding: '',
  narrativePOV: 'second',   // 默认第二人称（原有体验不变）
}
