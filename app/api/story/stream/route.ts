import { NextRequest } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildStoryMessages } from '@/lib/prompts/storyPrompt'
import { GenreKey } from '@/types/genre'
import { WorldConfig } from '@/types/world'
import { Message } from '@/types/game'
import type { StyleConfig } from '@/stores/styleStore'
import { SubplotKey } from '@/types/subplot'
import type { MemoryEvent } from '@/stores/memoryStore'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    genre,
    worldConfig,
    history,
    playerAction,
    status,
    turn,
    styleConfig,
    plotHint,
    subplots,
    memoryEvents,
  }: {
    genre: GenreKey
    worldConfig: WorldConfig
    history: Message[]
    playerAction: string
    status: Record<string, number>
    turn: number
    styleConfig?: StyleConfig
    plotHint?: string
    subplots?: SubplotKey[]
    memoryEvents?: MemoryEvent[]
  } = body

  const { system, messages } = buildStoryMessages({
    genre,
    worldConfig,
    history,
    playerAction,
    status,
    turn,
    styleConfig,
    plotHint,
    subplots,
    memoryEvents,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await deepseek.chat.completions.create({
          model: DEEPSEEK_MODEL,
          messages: [{ role: 'system', content: system }, ...messages],
          stream: true,
          max_tokens: 1200,
          temperature: 0.7,
        })

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`\n[ERROR]${msg}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}