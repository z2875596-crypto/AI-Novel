import { NextRequest } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildStoryMessages } from '@/lib/prompts/storyPrompt'
import { parseNarrativeResponse } from '@/lib/parseNarrative'
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
          stream: false,
          max_tokens: 1200,
          temperature: 0.7,
        })

        const raw = response.choices[0]?.message?.content ?? ''
        const parsed = parseNarrativeResponse(raw)

        for (const char of parsed.narrative) {
          controller.enqueue(encoder.encode(char))
        }

        controller.enqueue(
          encoder.encode(`[PARSED_DATA]${JSON.stringify({
            statusDelta: parsed.statusDelta,
            ending: parsed.ending,
            clues: parsed.clues,
            memoryHint: parsed.memoryHint,
          })}`)
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`[ERROR]${msg}`))
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
    },
  })
}
