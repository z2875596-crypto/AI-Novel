export interface NarrativeResponse {
  supply?: import('../lib/supplyGame').SupplyState
  narrative: string
  statusDelta: Record<string, number>
  ending: {
    type: 'good' | 'bad' | 'true' | 'secret'
    title: string
  } | null
  clues: {
    id: string
    name: string
    description: string
    category: string
    importance: string
    relatedClues: string[]
    revelation: string
  }[]
  memoryHint: string
}
