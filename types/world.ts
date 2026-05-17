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
  }
  
  export const EMPTY_WORLD_CONFIG: WorldConfig = {
    worldName: '',
    worldSetting: '',
    protagonistName: '',
    protagonistTraits: '',
    openingScene: '',
    npcs: [],
  }