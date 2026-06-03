export function sanitizePlayerInput(input: string): {
  safe: string
  blocked: boolean
  reason?: string
} {
  if (input.length > 200) {
    return {
      safe: input.slice(0, 200),
      blocked: false,
    }
  }

  const injectionPatterns = [
    /忘记(之前|前面|所有|上面).*?(设定|指令|规则|prompt)/i,
    /无视(之前|前面|所有).*?(设定|指令|规则)/i,
    /你(现在|其实|本来)是/i,
    /扮演.*?(没有限制|无限制|自由)/i,
    /(直接|立刻|马上).*(通关|结局|ending|胜利)/i,
    /(给我|告诉我).*(结局|答案|攻略)/i,
    /system\s*:/i,
    /\[system\]/i,
    /assistant\s*:/i,
    /<\|.*?\|>/i,
    /(输出|显示|告诉我).*(system prompt|系统提示|设定内容)/i,
    /repeat.*?(above|before|system)/i,
  ]

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return {
        safe: '',
        blocked: true,
        reason: '该输入包含不被允许的内容',
      }
    }
  }

  const cleaned = input
    .replace(/\[STATUS_DELTA\].*$/gm, '')
    .replace(/\[ENDING\].*$/gm, '')
    .replace(/\[CLUE\].*$/gm, '')
    .replace(/\[PARSED_DATA\].*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim()

  return { safe: cleaned, blocked: false }
}
