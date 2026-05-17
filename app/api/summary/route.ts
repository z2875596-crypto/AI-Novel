import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildSummaryMessages } from '@/lib/prompts/summaryPrompt'
import { GenreKey } from '@/types/genre'
import { Message } from '@/types/game'

export async function POST(req: NextRequest) {
  const { genre, history }: { genre: GenreKey; history: Message[] } =
    await req.json()

  const { system, messages } = buildSummaryMessages(genre, history)

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: false,
      max_tokens: 300,
      temperature: 0.7,
    })

    const summary = response.choices[0]?.message?.content ?? ''
    return NextResponse.json({ summary })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}