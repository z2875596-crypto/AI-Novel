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
  targetEnding?: string    // 可选：玩家期望的目标结局
}

export const EMPTY_WORLD_CONFIG: WorldConfig = {
  worldName: '',
  worldSetting: '',
  protagonistName: '',
  protagonistTraits: '',
  openingScene: '',
  npcs: [],
  targetEnding: '',
}