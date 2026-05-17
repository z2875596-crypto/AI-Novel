import { GenreKey } from './genre'
import { WorldConfig } from './world'
import { Message } from './game'

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
  ending?: {
    type: 'good' | 'bad' | 'true' | 'secret'
    title: string
    unlockedAt: number
  }
}