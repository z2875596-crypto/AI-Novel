import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL, DEEPSEEK_GENERATION_OPTIONS } from '@/lib/deepseek'
import { buildChoicesMessages } from '@/lib/prompts/choicesPrompts'
import { GenreKey } from '@/types/genre'
import { NarrativePOV } from '@/types/world'
import { parseChoices } from '@/lib/parseChoices'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { genre, lastNarratorText, status, turn, protagonistName, narrativePOV, recentChoices }: {
    genre: GenreKey
    lastNarratorText: string
    status: Record<string, number>
    turn: number
    protagonistName: string
    narrativePOV: NarrativePOV
    recentChoices: string[]
  } = body

  const { system, messages } = buildChoicesMessages({
    genre,
    lastNarratorText,
    status,
    turn,
    protagonistName: protagonistName ?? '',
    narrativePOV: narrativePOV ?? 'second',
    recentChoices: recentChoices ?? [],
  })

  try {
    const response = await deepseek.chat.completions.create({
      ...DEEPSEEK_GENERATION_OPTIONS,
      model: DEEPSEEK_MODEL,   // 选项用快速模型，叙述质量不受影响
      messages: [{ role: 'system', content: system }, ...messages],
      stream: false,
      max_tokens: 600,
      // DeepSeek-specific extension; short action choices do not need reasoning.
      temperature: 0.85,
    }, { signal: req.signal, timeout: 18000, maxRetries: 0 })

    const output = response.choices[0]
    const choices = parseChoices(output?.message?.content ?? '', output?.finish_reason ?? null)

    return NextResponse.json({ choices: choices.slice(0, 4) })
  } catch {
    return NextResponse.json({ choices: [], error: '选项暂未生成完整，请重试。' }, { status: 502 })
  }
}
