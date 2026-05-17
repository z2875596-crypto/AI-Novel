import { create } from 'zustand'
import { Message } from '@/types/game'

interface GameStore {
  turn: number
  status: Record<string, number>
  isStreaming: boolean
  currentChoices: string[]
  messages: Message[]
  streamingText: string

  setStatus: (status: Record<string, number>) => void
  setIsStreaming: (v: boolean) => void
  setCurrentChoices: (choices: string[]) => void
  addMessage: (msg: Message) => void
  setStreamingText: (text: string) => void
  incrementTurn: () => void
  resetGame: (initialStatus: Record<string, number>) => void
  setMessages: (messages: Message[]) => void
}

export const useGameStore = create<GameStore>()((set) => ({
  turn: 0,
  status: {},
  isStreaming: false,
  currentChoices: [],
  messages: [],
  streamingText: '',

  setStatus: (status) => set({ status }),
  setIsStreaming: (v) => set({ isStreaming: v }),
  setCurrentChoices: (choices) => set({ currentChoices: choices }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreamingText: (text) => set({ streamingText: text }),
  incrementTurn: () => set((s) => ({ turn: s.turn + 1 })),
  resetGame: (initialStatus) =>
    set({
      turn: 0,
      status: initialStatus,
      isStreaming: false,
      currentChoices: [],
      messages: [],
      streamingText: '',
    }),
  setMessages: (messages) => set({ messages }),
}))