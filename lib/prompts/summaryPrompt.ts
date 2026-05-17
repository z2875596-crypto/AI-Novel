import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { Message } from '@/types/game'

export function buildSummaryMessages(genre: GenreKey, history: Message[]) {
  const config = GENRE_CONFIG[genre]

  const historyText = history
    .map((msg) => {
      if (msg.role === 'player') return `【玩家】${msg.content}`
      if (msg.role === 'narrator') return `【剧情】${msg.content}`
      return ''
    })
    .filter(Boolean)
    .join('\n\n')

  const systemPrompt = `你是一个${config.label}题材互动小说的剧情摘要助手。
你的任务是把一段对话历史压缩成简洁的摘要，保留关键剧情、人物关系变化和重要事件。

【摘要要求】
1. 控制在 3-5 句话以内
2. 使用第三人称叙述
3. 保留关键人物名字和重要事件
4. 文风符合${config.label}题材
5. 只输出摘要文本，不要有任何前缀或解释`

  const userMessage = `请将以下对话历史压缩为摘要：

${historyText}`

  return {
    system: systemPrompt,
    messages: [{ role: 'user' as const, content: userMessage }],
  }
}