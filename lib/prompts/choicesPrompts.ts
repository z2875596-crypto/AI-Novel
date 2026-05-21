import { GenreKey } from '@/types/genre'
import { NarrativePOV } from '@/types/world'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface BuildChoicesPromptParams {
  genre: GenreKey
  lastNarratorText: string
  status: Record<string, number>
  turn: number
  protagonistName: string
  narrativePOV: NarrativePOV
}

// 根据视角生成选项主语说明
function buildChoicePOVRule(pov: NarrativePOV, protagonistName: string): string {
  switch (pov) {
    case 'first':
      return `选项必须以第一人称"我"开头，表达主角「${protagonistName}」的行动意图。
示例：["我轻声说……","我转身离开","我装作没听见"]`
    case 'second':
      return `选项必须以第二人称"你"开头，表达主角「${protagonistName}」的行动。
示例：["你轻声说……","你转身离开","你装作没听见"]`
    case 'third':
      return `选项必须以主角姓名「${protagonistName}」开头，表达其行动。
示例：["${protagonistName}轻声说……","${protagonistName}转身离开","${protagonistName}装作没听见"]`
  }
}

export function buildChoicesMessages(params: BuildChoicesPromptParams) {
  const { genre, lastNarratorText, status, turn, protagonistName, narrativePOV } = params
  const config = GENRE_CONFIG[genre]

  const statusText = config.bars
    .map((b) => `${b.label}：${status[b.key] ?? 0}/${b.max}`)
    .join('，')

  const povRule = buildChoicePOVRule(narrativePOV, protagonistName)

  const systemPrompt = `你是一个互动小说的选项设计师，专门为${config.label}题材的故事生成玩家行动选项。

【选项设计原则】
1. 根据当前剧情段落，生成 3 个风格各异的选项
2. 选项要有差异化：一个保守、一个大胆、一个出人意料
3. 每个选项控制在 20 字以内，简洁有力
4. 选项要符合${config.label}题材的风格和逻辑
5. 当前状态栏：${statusText}，第 ${turn} 回合

【视角与主语规则】
${povRule}

6. 你必须只输出一个 JSON 数组，不要有任何其他文字，格式如下：
["选项一内容","选项二内容","选项三内容"]`

  const userMessage = `当前剧情段落：
${lastNarratorText}

请生成 3 个玩家行动选项。`

  return {
    system: systemPrompt,
    messages: [{ role: 'user' as const, content: userMessage }],
  }
}
