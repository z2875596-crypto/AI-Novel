import { NextRequest, NextResponse } from 'next/server'
import { deepseek } from '@/lib/deepseek'
import { Message } from '@/types/game'

export async function POST(req: NextRequest) {
  const { recentMessages, turn }: { recentMessages: Message[]; turn: number } =
    await req.json()

  const systemPrompt = `你是一个记忆提取引擎。从对话片段中提取关键事件，输出JSON数组。

只提取真正重要的信息，不要提取普通对话。
每条记忆必须是会影响后续剧情的信息。

输出格式（只输出JSON，不要其他文字）：
[
  {
    "type": "npc_relation|world_change|player_action|secret_revealed|item_obtained",
    "subject": "涉及的人物或物品名称",
    "description": "20字内的关键描述",
    "importance": "low|medium|high"
  }
]

high: 会直接影响结局的信息（如NPC知道了秘密、获得关键物品）
medium: 会影响NPC态度或剧情走向的信息
low: 背景信息`

  const userMessage = `第${turn}回合附近的对话：
${recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n')}`

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      max_tokens: 500,
      temperature: 0.3,
    })

    const raw = response.choices[0]?.message?.content ?? '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    const events = match ? JSON.parse(match[0]) : []

    return NextResponse.json({ events, turn })
  } catch {
    return NextResponse.json({ events: [] })
  }
}
