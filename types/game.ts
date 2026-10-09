export type MessageRole = 'narrator' | 'player' | 'summary'

export interface Message {
  id: string
  role: MessageRole
  content: string
  turn?: number
  interaction?: 'reading' | 'choice'
  choices?: string[]
  statusDelta?: Record<string, number>
  timestamp: number
}