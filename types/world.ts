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

export interface PlotBeat {
  id: string
  triggerTurn: number
  description: string
  triggered: boolean
}

export interface WorldConfig {
  worldName: string
  worldSetting: string
  protagonistName: string
  protagonistTraits: string
  openingScene: string
  npcs: NPC[]
  plotBeats: PlotBeat[]
  targetEnding?: string
  narrativePOV: NarrativePOV
  storyLength: 'short' | 'medium' | 'long'
}

export const EMPTY_WORLD_CONFIG: WorldConfig = {
  worldName: '',
  worldSetting: '',
  protagonistName: '',
  protagonistTraits: '',
  openingScene: '',
  npcs: [],
  plotBeats: [],
  targetEnding: '',
  narrativePOV: 'second',
  storyLength: 'medium',
}

export const STORY_LENGTH_CONFIG = {
  short: {
    label: '短篇',
    description: '约30回合，3章，适合快节奏体验',
    turnsPerChapter: 10,
    totalChapters: 3,
    totalTurns: 30,
    ending: { hint: 20, push: 25, force: 30 },
  },
  medium: {
    label: '中篇',
    description: '约60回合，4章，完整起承转合',
    turnsPerChapter: 15,
    totalChapters: 4,
    totalTurns: 60,
    ending: { hint: 45, push: 55, force: 60 },
  },
  long: {
    label: '长篇',
    description: '约120回合，6章，史诗级故事',
    turnsPerChapter: 20,
    totalChapters: 6,
    totalTurns: 120,
    ending: { hint: 90, push: 110, force: 120 },
  },
}
