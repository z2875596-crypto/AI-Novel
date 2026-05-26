import { GenreKey } from './genre'
import { WorldConfig } from './world'
import { Message } from './game'
import { Summary } from '@/stores/summaryStore'

export interface BranchNode {
  turn: number
  choices: string[]
  chosen: string
  isFreeInput: boolean
}

export interface SaveRecord {
  id: string
  createdAt: number
  updatedAt: number
  storyTitle: string
  genre: GenreKey
  chapter: number
  turn: number
  worldConfig: WorldConfig
  statusSnapshot: Record<string, number>
  recentHistory: Message[]
  branchHistory: BranchNode[]
  // 分支标记
  isBranch?: boolean           // 是否为分支存档
  branchFromTurn?: number      // 从哪个回合分叉
  branchLabel?: string         // 分支名称，如"分支·第8回合"
  parentId?: string            // 主线存档 id
  summaries?: Summary[]
  ending?: {
    type: 'good' | 'bad' | 'true' | 'secret'
    title: string
    unlockedAt: number
  }
}
