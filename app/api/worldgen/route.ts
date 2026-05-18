import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildWorldgenMessages } from '@/lib/prompts/worldgenPrompts'
import { GenreKey } from '@/types/genre'

export async function POST(req: NextRequest) {
  console.log('=== worldgen called ===')
  console.log('MODEL:', DEEPSEEK_MODEL)
  console.log('API KEY prefix:', process.env.DEEPSEEK_API_KEY?.slice(0, 15))

  const { genre }: { genre: GenreKey } = await req.json()
  console.log('genre:', genre)

  const { system, messages } = buildWorldgenMessages(genre)

  try {
    console.log('calling deepseek...')
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: false,
      max_tokens: 800,
      temperature: 1.0,
    })

    console.log('deepseek response ok')
    const raw = response.choices[0]?.message?.content ?? '{}'
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    console.log('raw response:', raw.slice(0, 200))
    const data = JSON.parse(cleaned)

    return NextResponse.json(data)
  } catch (err) {
    console.error('=== worldgen error ===', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}