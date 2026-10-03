import { NextRequest, NextResponse } from 'next/server'
import { deepseek, DEEPSEEK_MODEL } from '@/lib/deepseek'
import { RelationshipUpdate, RelationType } from '@/stores/relationshipStore'
import { NPC } from '@/types/world'

export async function POST(req: NextRequest) {
  const { narratorText, npcs, protagonistName, turn }: {
    narratorText: string
    npcs: NPC[]
    protagonistName: string
    turn: number
  } = await req.json()

  if (!npcs || npcs.length === 0) {
    return NextResponse.json({ updates: [] })
  }

  const npcList = npcs.map((n) => `- ${n.name}（id: ${n.id}，关系：${n.role}）`).join('\n')

  const systemPrompt = `你是一个互动小说的关系分析引擎。根据叙述片段，分析主角与配角之间的关系变化。

只输出 JSON 数组，不要有任何其他文字。
如果某个配角在本段叙述中没有出现或关系没有变化，不要输出该配角。
如果没有任何变化，输出空数组 []。

输出格式：
[
  {
    "npcId": "配角的id（从列表中取）",
    "npcName": "配角姓名",
    "affinityDelta": 数字（-10到10，正数为好感增加，负数为好感降低，0为无变化），
    "newType": "关系类型（可选，仅在关系发生质变时填写）",
    "eventDescription": "10字内描述本回合发生的关键事件"
  }
]

关系类型可选值：lover（恋人）、friend（友人）、ally（盟友）、rival（对手）、enemy（敌人）、family（家人）、mentor（师长）、stranger（陌路）`

  const userMessage = `主角：${protagonistName}
配角列表：
${npcList}

第 ${turn} 回合叙述：
${narratorText}

请分析主角与哪些配角的关系发生了变化。`

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      max_tokens: 500,
      temperature: 0.3,   // 低温度，保证输出稳定
    })

    const raw = response.choices[0]?.message?.content ?? '[]'
    const match = raw.match(/\[[\s\S]*?\]/)
    if (!match) return NextResponse.json({ updates: [] })

    const parsed: RelationshipUpdate[] = JSON.parse(match[0])
    const updates = parsed
      .filter((u) => u.npcId && u.npcName && typeof u.affinityDelta === 'number')
      .map((u) => ({ ...u, turn, newType: u.newType as RelationType | undefined }))

    return NextResponse.json({ updates })
  } catch {
    return NextResponse.json({ updates: [] })
  }
}
