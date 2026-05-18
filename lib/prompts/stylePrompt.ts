import { StyleConfig, PRESET_STYLE_OPTIONS } from '@/stores/styleStore'

export function buildStyleInstruction(styleConfig: StyleConfig): string {
  const parts: string[] = []

  // 预设风格
  if (styleConfig.preset) {
    const preset = PRESET_STYLE_OPTIONS.find((p) => p.key === styleConfig.preset)
    if (preset) {
      parts.push(`【文笔风格】${preset.label}：${preset.description}`)
    }
  }

  // 自定义描述
  if (styleConfig.customDescription.trim()) {
    parts.push(`【风格补充】${styleConfig.customDescription}`)
  }

  // 从文件分析的风格
  if (styleConfig.analyzedStyle.trim()) {
    parts.push(`【参考文笔】请模仿以下风格特征进行写作：\n${styleConfig.analyzedStyle}`)
  }

  if (parts.length === 0) return ''

  return parts.join('\n')
}

export function buildAnalyzeStyleMessages(text: string) {
  const systemPrompt = `你是一位文学风格分析专家。请分析给定文章的写作风格，并总结出可供其他AI模仿的风格特征描述。

输出格式要求：
1. 句式特点（长句/短句/混合，常用句型）
2. 用词风格（文雅/口语/专业等）
3. 叙事节奏（快节奏/慢节奏/张弛有度）
4. 情感表达（直接/含蓄/克制/奔放）
5. 特色手法（比喻/白描/意识流等）

只输出分析结果，控制在150字以内，不要有前缀或解释。`

  return {
    system: systemPrompt,
    messages: [
      {
        role: 'user' as const,
        content: `请分析以下文章的写作风格：\n\n${text.slice(0, 2000)}`,
      },
    ],
  }
}