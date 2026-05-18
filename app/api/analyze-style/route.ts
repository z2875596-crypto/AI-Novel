import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildAnalyzeStyleMessages } from '@/lib/prompts/stylePrompt'

export async function POST(req: NextRequest) {
  const { text }: { text: string } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: '文本不能为空' }, { status: 400 })
  }

  const { system, messages } = buildAnalyzeStyleMessages(text)

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: false,
      max_tokens: 400,
      temperature: 0.7,
    })

    const analyzedStyle = response.choices[0]?.message?.content ?? ''
    return NextResponse.json({ analyzedStyle })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}