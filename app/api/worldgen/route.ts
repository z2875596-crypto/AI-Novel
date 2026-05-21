import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { buildWorldgenMessages } from '@/lib/prompts/worldgenPrompts'
import { GenreKey } from '@/types/genre'

// 尝试从可能被截断的 JSON 字符串中抢救出已有的字段
function safeParseJSON(raw: string): Record<string, unknown> | null {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  // 先尝试直接解析
  try {
    return JSON.parse(cleaned)
  } catch {
    // 截断修复：补上缺失的引号/括号后再试
    try {
      let fixed = cleaned
      // 如果最后一个字符不是 }，说明被截断，尝试补全
      if (!fixed.endsWith('}')) {
        // 找到最后一个完整的 key:value 对的逗号位置，截断后补 }
        const lastComma = fixed.lastIndexOf(',')
        const lastBrace = fixed.lastIndexOf('}')
        if (lastComma > lastBrace) {
          fixed = fixed.slice(0, lastComma) + '\n}'
        } else {
          fixed = fixed + '"}'  // 尝试补上结尾
        }
        return JSON.parse(fixed)
      }
      return null
    } catch {
      return null
    }
  }
}

export async function POST(req: NextRequest) {
  const { genre }: { genre: GenreKey } = await req.json()

  const { system, messages } = buildWorldgenMessages(genre)

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: false,
      max_tokens: 2000,   // 从 800 提升到 2000，足够输出完整世界观
      temperature: 1.0,
    })

    const raw = response.choices[0]?.message?.content ?? '{}'
    const data = safeParseJSON(raw)

    if (!data) {
      return NextResponse.json({ error: '生成内容解析失败，请重试' }, { status: 500 })
    }

    // 校验必填字段，缺失时返回友好错误
    const required = ['worldName', 'worldSetting', 'protagonistName', 'protagonistTraits', 'openingScene']
    const missing = required.filter((k) => !data[k])
    if (missing.length > 0) {
      return NextResponse.json({ error: `生成内容不完整（缺少 ${missing.join('、')}），请重试` }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
