import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildChoicesMessages } from '@/lib/prompts/choicesPrompts'
import { GenreKey } from '@/types/genre'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { genre, lastNarratorText, status, turn }: {
    genre: GenreKey
    lastNarratorText: string
    status: Record<string, number>
    turn: number
  } = body

  const { system, messages } = buildChoicesMessages({ genre, lastNarratorText, status, turn })

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: false,
      max_tokens: 200,
      temperature: 0.85,
    })

    const raw = response.choices[0]?.message?.content ?? '[]'
    const match = raw.match(/\[[\s\S]*?\]/)
    const choices: string[] = match ? JSON.parse(match[0]) : []

    return NextResponse.json({ choices: choices.slice(0, 4) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ choices: [], error: msg }, { status: 500 })
  }
}