import { NextRequest, NextResponse } from 'next/server'
import { deepseek } from '@/lib/deepseek'
import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export type PolishTarget = 'worldSetting' | 'protagonistTraits' | 'openingScene' | 'npcTraits'

const FIELD_PROMPTS: Record<PolishTarget, string> = {
  worldSetting: `你是一位世界观设计师，请对以下世界背景描述进行润色扩充。
要求：
- 保留原有的核心概念和关键词，不改变用户的原始意图
- 增加细节、氛围感和独特性，让世界更有立体感
- 字数控制在原文的 1.5-2 倍，不超过 200 字
- 直接输出润色后的文字，不要加任何前缀或说明`,

  protagonistTraits: `你是一位角色设计师，请对以下主角描述进行润色扩充。
要求：
- 保留原有的性格特点和关键词，不改变用户的原始意图
- 补充细节：可以增加外貌细节、行为习惯、说话方式、内心特质等
- 字数控制在原文的 1.5-2 倍，不超过 150 字
- 直接输出润色后的文字，不要加任何前缀或说明`,

  openingScene: `你是一位小说开篇设计师，请对以下开场场景进行润色扩充。
要求：
- 保留原有的场景核心，不改变用户的原始设定
- 增加环境细节、氛围营造、感官描写，让开场更有画面感和代入感
- 字数控制在原文的 1.5-2 倍，不超过 200 字
- 直接输出润色后的文字，不要加任何前缀或说明`,

  npcTraits: `你是一位配角设计师，请对以下配角描述进行润色扩充。
要求：
- 保留原有的性格特点，不改变用户的原始意图
- 补充细节：外貌、习惯、与主角的互动方式等
- 字数控制在原文的 1.5-2 倍，不超过 100 字
- 直接输出润色后的文字，不要加任何前缀或说明`,
}

export async function POST(req: NextRequest) {
  const { content, target, genre }: {
    content: string
    target: PolishTarget
    genre: GenreKey
  } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
  }

  const config = GENRE_CONFIG[genre]
  const systemPrompt = FIELD_PROMPTS[target]
  const userMessage = `题材：${config.label}

原文：
${content}

请润色扩充：`

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      max_tokens: 400,
      temperature: 0.8,
    })

    const polished = response.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ polished })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
