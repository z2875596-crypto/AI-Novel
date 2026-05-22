import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildSummaryMessages } from '@/lib/prompts/summaryPrompt'
import { GenreKey } from '@/types/genre'
import { Message } from '@/types/game'

export async function POST(req: NextRequest) {
  const {
    genre,
    history,
    chapterNumber,
  }: {
    genre: GenreKey
    history: Message[]
    chapterNumber: number
  } = await req.json()

  const { system, messages } = buildSummaryMessages(genre, history)

  try {
    // 同时生成摘要和章节标题
    const [summaryRes, titleRes] = await Promise.all([
      deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: system }, ...messages],
        stream: false,
        max_tokens: 300,
        temperature: 0.7,
      }),
      deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一位小说编辑，擅长为章节起标题。请根据给定的剧情内容，为第${chapterNumber}章起一个简洁有力的章节标题。
要求：
1. 标题控制在 4-10 个字
2. 要有文学感，符合故事氛围
3. 只输出标题本身，不要有任何其他文字`,
          },
          {
            role: 'user',
            content: `请为以下剧情内容起一个章节标题：\n\n${history.map((m) => m.content).join('\n')}`,
          },
        ],
        stream: false,
        max_tokens: 30,
        temperature: 0.9,
      }),
    ])

    const summary = summaryRes.choices[0]?.message?.content ?? ''
    const chapterTitle = titleRes.choices[0]?.message?.content?.trim() ?? `第${chapterNumber}章`

    return NextResponse.json({ summary, chapterTitle })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}