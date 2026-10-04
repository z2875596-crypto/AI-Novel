import type { WorldConfig } from './world'
import type { Clue } from './clue'
import type { Summary } from '../stores/summaryStore'
import type { Relationship } from '../stores/relationshipStore'
import type { MemoryEvent } from '../stores/memoryStore'
import type { StyleConfig } from '../stores/styleStore'
import type { SubplotKey } from './subplot'
import type { SaveRecord } from './save'

export interface TurnSnapshot {
  turn: number
  messageCount: number
  status: Record<string, number>
  currentChoices: string[]
  worldConfig: WorldConfig
  clues: Clue[]
  relationships: Relationship[]
  memoryEvents: MemoryEvent[]
  summaries: Summary[]
  styleConfig: StyleConfig
  subplots: SubplotKey[]
  ending?: SaveRecord['ending']
}
