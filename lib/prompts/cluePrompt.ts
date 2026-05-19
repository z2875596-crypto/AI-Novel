export const CLUE_EXTRACTION_INSTRUCTION = `
【线索提取规则（仅悬疑题材）】
在剧情正文结束后，如果本段剧情中出现了新线索或重要发现，必须在 [STATUS_DELTA] 之前输出线索标记，格式如下：

[CLUE]{"id":"唯一短ID","name":"线索名称","description":"线索描述（30字内）","category":"person|object|location|event|other","importance":"low|medium|high","relatedClues":[],"revelation":""}

规则：
1. 只在有真正有意义的新线索时才输出，不要随意生成
2. id 用简短英文+数字，如 "clue_001"、"knife_01"
3. category 选最合适的一个
4. importance：关键线索用 high，一般线索用 medium，背景信息用 low
5. relatedClues 填写已知相关线索的 id，没有则留空数组
6. revelation 如果线索已经指向了具体内容填写，否则留空
7. 可以一次输出多条线索标记
8. 线索标记必须在 [STATUS_DELTA] 之前输出`

export function parseClues(text: string): {
  cleanText: string
  clues: {
    id: string
    name: string
    description: string
    category: 'person' | 'object' | 'location' | 'event' | 'other'
    importance: 'low' | 'medium' | 'high'
    relatedClues: string[]
    revelation: string
  }[]
} {
  const cluePattern = /\[CLUE\](\{[^}]+\})/g
  const clues: ReturnType<typeof parseClues>['clues'] = []
  let cleanText = text

  let match
  while ((match = cluePattern.exec(text)) !== null) {
    try {
      const clue = JSON.parse(match[1])
      clues.push(clue)
    } catch {
      // 解析失败跳过
    }
  }

  // 清除所有 [CLUE] 标记
  cleanText = text.replace(/\[CLUE\]\{[^}]+\}/g, '').trim()

  return { cleanText, clues }
}