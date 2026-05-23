export const CLUE_EXTRACTION_INSTRUCTION = `
【线索提取规则（仅悬疑题材）】
在剧情正文结束后，如果本段剧情中出现了新线索或重要发现，必须在 [STATUS_DELTA] 之前输出线索标记。

格式要求（每条线索单独一行，JSON 必须紧凑不换行）：
[CLUE]{"id":"唯一短ID","name":"线索名称","description":"线索描述30字内","category":"person|object|location|event|other","importance":"low|medium|high","relatedClues":[],"revelation":""}

规则：
1. 只在有真正有意义的新线索时才输出，不要随意生成
2. id 用简短英文+数字，如 "clue_001"、"knife_01"
3. category 选最合适的一个
4. importance：关键线索用 high，一般线索用 medium，背景信息用 low
5. relatedClues 填写已知相关线索的 id，没有则留空数组 []
6. revelation 如果线索已经指向了具体内容则填写，否则留空字符串 ""
7. 可以一次输出多条，每条单独一行
8. JSON 必须紧凑写在同一行，绝对不能换行或加空格
9. 线索标记必须在 [STATUS_DELTA] 之前输出`

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
  const clues: ReturnType<typeof parseClues>['clues'] = []
  let cleanText = text

  // 逐行扫描，找到以 [CLUE] 开头的行
  const lines = text.split('\n')
  const clueLineIndices: number[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('[CLUE]')) continue

    clueLineIndices.push(i)
    const jsonStr = line.slice('[CLUE]'.length).trim()

    // 尝试直接解析
    let parsed = tryParseJSON(jsonStr)

    // 失败则尝试向后合并下一行（AI 偶尔会换行）
    if (!parsed && i + 1 < lines.length) {
      parsed = tryParseJSON(jsonStr + lines[i + 1].trim())
      if (parsed) clueLineIndices.push(i + 1)
    }

    if (parsed && parsed.id && parsed.name) {
      clues.push({
        id: String(parsed.id),
        name: String(parsed.name),
        description: parsed.description ? String(parsed.description) : '',
        category: (['person', 'object', 'location', 'event', 'other'].includes(String(parsed.category))
          ? parsed.category
          : 'other') as 'person' | 'object' | 'location' | 'event' | 'other',
        importance: (['low', 'medium', 'high'].includes(String(parsed.importance))
          ? parsed.importance
          : 'medium') as 'low' | 'medium' | 'high',
        relatedClues: Array.isArray(parsed.relatedClues)
          ? (parsed.relatedClues as unknown[]).map(String)
          : [],
        revelation: parsed.revelation ? String(parsed.revelation) : '',
      })
    }
  }

  // 移除所有 [CLUE] 行（从后往前删，避免 index 偏移）
  const cleanLines = lines.filter((_, i) => !clueLineIndices.includes(i))
  cleanText = cleanLines.join('\n').trim()

  return { cleanText, clues }
}

function tryParseJSON(str: string): Record<string, unknown> | null {
  // 找到第一个 { 到最后一个 } 之间的内容
  const start = str.indexOf('{')
  const end = str.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  try {
    return JSON.parse(str.slice(start, end + 1))
  } catch {
    // 尝试修复常见问题：中文引号、尾部多余内容
    try {
      const fixed = str
        .slice(start, end + 1)
        .replace(/[\u201c\u201d]/g, '"')  // 中文双引号
        .replace(/[\u2018\u2019]/g, "'")  // 中文单引号
      return JSON.parse(fixed)
    } catch {
      return null
    }
  }
}
