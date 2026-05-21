import { GenreKey } from '@/types/genre'
import { WorldConfig, NarrativePOV } from '@/types/world'
import { Message } from '@/types/game'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { StyleConfig } from '@/stores/styleStore'
import { buildStyleInstruction } from './stylePrompt'
import { getStatusTriggerInstructions } from '@/lib/statusTriggers'
import { CLUE_EXTRACTION_INSTRUCTION } from './cluePrompt'

const GENRE_PERSONA: Record<GenreKey, string> = {
  romance: '你是一位擅长言情小说的作家，文风细腻温柔，善于描写人物心理和情感波动，笔下的爱情故事让人心跳加速。',
  xuanhuan: '你是一位玄幻小说大师，世界观宏大，修炼体系严谨，文风大气磅礴，善于描写激烈的战斗和修炼突破的震撼感。',
  mystery: '你是一位悬疑推理作家，逻辑缜密，善于布置线索和反转，文风简练克制，每一句话都可能是关键伏笔。',
  ancient: '你是一位古装宫廷小说作家，精通历史典故，善写权谋博弈与江湖恩怨，文风典雅，古意盎然。',
  magic: '你是一位奇幻魔法小说作家，想象力丰富，魔法体系独特而有趣，文风充满奇幻色彩，让人沉浸在神奇的魔法世界中。',
  urban: '你是一位都市小说作家，贴近现代生活，善写职场、商战与人际关系，文风干练，节奏明快。',
  horror: '你是一位恐怖小说作家，善于营造压抑恐惧的氛围，文字充满张力，细节描写让人毛骨悚然，但始终保持叙事逻辑。',
  comedy: '你是一位喜剧小说作家，脑洞清奇，对话幽默，善于制造意想不到的搞笑反转，让读者忍俊不禁。',
}

// 根据视角生成叙述规则说明
function buildPOVInstruction(pov: NarrativePOV, protagonistName: string): string {
  switch (pov) {
    case 'first':
      return `【叙述视角 — 第一人称】
全程以"我"指代主角「${protagonistName}」进行叙述，禁止在叙述中使用"你"或主角姓名指代主角。
示例：我握住剑柄，心跳加速……（✓）／你握住剑柄……（✗）／${protagonistName}握住剑柄……（✗）`

    case 'second':
      return `【叙述视角 — 第二人称】
全程以"你"指代主角「${protagonistName}」进行叙述，禁止在叙述中使用"我"或主角姓名指代主角。
示例：你握住剑柄，心跳加速……（✓）／我握住剑柄……（✗）／${protagonistName}握住剑柄……（✗）`

    case 'third':
      return `【叙述视角 — 第三人称】
全程以主角姓名「${protagonistName}」或"他/她"指代主角进行叙述，禁止使用"你"或"我"指代主角。
示例：${protagonistName}握住剑柄，心跳加速……（✓）／你握住剑柄……（✗）／我握住剑柄……（✗）`
  }
}

interface BuildStoryPromptParams {
  genre: GenreKey
  worldConfig: WorldConfig
  history: Message[]
  playerAction: string
  status: Record<string, number>
  turn: number
  styleConfig?: StyleConfig
}

export function buildStoryMessages(params: BuildStoryPromptParams) {
  const { genre, worldConfig, history, playerAction, status, turn, styleConfig } = params
  const config = GENRE_CONFIG[genre]

  const pov: NarrativePOV = worldConfig.narrativePOV ?? 'second'

  const statusText = config.bars
    .map((b) => `${b.label}：${status[b.key] ?? 0}/${b.max}`)
    .join('，')

  const npcText =
    worldConfig.npcs.length > 0
      ? worldConfig.npcs
          .map((n) => `【${n.name}】关系：${n.role}，特点：${n.traits}`)
          .join('\n')
      : '暂无配角'

  const styleInstruction = styleConfig ? buildStyleInstruction(styleConfig) : ''
  const triggerInstruction = getStatusTriggerInstructions(genre, status)
  const clueInstruction = genre === 'mystery' ? CLUE_EXTRACTION_INSTRUCTION : ''
  const povInstruction = buildPOVInstruction(pov, worldConfig.protagonistName)

  const targetEndingInstruction = worldConfig.targetEnding
    ? `【目标结局引导】玩家希望故事最终走向：「${worldConfig.targetEnding}」。请在剧情中自然地埋下伏笔、创造机会，暗中引导故事朝这个方向发展，但不要让玩家察觉到刻意安排，过程要自然流畅。当故事发展到合适时机时，可以在剧情末尾输出 [ENDING]{"type":"good","title":"${worldConfig.targetEnding}"} 来触发结局。`
    : ''

  const systemPrompt = `${GENRE_PERSONA[genre]}

【世界设定】
世界名称：${worldConfig.worldName}
世界背景：${worldConfig.worldSetting}

【主角信息】
姓名：${worldConfig.protagonistName}
特点：${worldConfig.protagonistTraits}

【配角信息】
${npcText}

【当前状态栏】
${statusText}
${triggerInstruction}
${styleInstruction ? '\n' + styleInstruction : ''}
${targetEndingInstruction ? '\n' + targetEndingInstruction : ''}
${clueInstruction}

${povInstruction}

【写作规则】
1. 你正在为玩家生成互动小说的下一段剧情，当前是第 ${turn} 回合
2. 续写剧情时紧密结合玩家的行动选择，让玩家的选择产生明显影响
3. 如果有【状态触发事件】，必须在本段剧情中体现对应的场景变化
4. 字数严格控制，剧情正文必须控制在 100-150 字之间，回答要求符合字数并且完整，文风符合 ${config.label} 题材
5. 【完整性要求】必须先写完整的剧情正文，再在正文结束后的新一行输出状态变化，两部分缺一不可
6. 【强制要求】正文结束后，必须在最后单独一行输出状态变化，绝对不能省略：
   [STATUS_DELTA]{"key1":数值,"key2":数值}
   ✓ 正确示例：[STATUS_DELTA]{"affection":5,"heartbeat":3}
   ✗ 错误示例：省略这一行、放在正文中间、格式不对、输出不完整
7. 可用的状态栏 key：${config.bars.map((b) => b.key).join('，')}
8. 数值变化范围：-15 到 +15，合理反映玩家行动的后果
9. 不要主动提示玩家"你要怎么做"，剧情自然结束即可
10. 总输出（正文+线索标记+状态行）必须完整，不能截断
11. 【结局触发】当故事发展到自然终点、高潮结束或玩家达成重要目标时，可以在 [STATUS_DELTA] 之后输出结局标记：
    [ENDING]{"type":"good","title":"结局标题"}
    type 可选：good（好结局）、bad（坏结局）、true（真结局）、secret（隐藏结局）
    title 用 4-10 个字概括结局，如「情定终生」「真相大白」「飞升成仙」
    不要随意触发，只在故事真正到达终点时输出`

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] =
    history.map((msg) => ({
      role: msg.role === 'player' ? 'user' : 'assistant',
      content: msg.content,
    }))

  const userMessage = `玩家行动：${playerAction}`

  return {
    system: systemPrompt,
    messages: [...historyMessages, { role: 'user' as const, content: userMessage }],
  }
}
