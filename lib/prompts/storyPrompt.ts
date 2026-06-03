import { GenreKey } from '@/types/genre'
import { WorldConfig, NarrativePOV, STORY_LENGTH_CONFIG } from '@/types/world'
import { Message } from '@/types/game'
import type { MemoryEvent } from '@/stores/memoryStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import type { StyleConfig } from '@/stores/styleStore'
import { SubplotKey } from '@/types/subplot'
import { SUBPLOT_OPTIONS } from '@/types/subplot'
import { buildStyleInstruction } from './stylePrompt'
import { getStatusTriggerInstructions } from '@/lib/statusTriggers'

const GENRE_PERSONA: Record<GenreKey, string> = {
  urban: '你是一位都市小说作家，贴近现代生活，善写职场商战、人际博弈与城市众生相，文风干练，节奏明快，细节真实。',
  ancient: '你是一位古装历史小说作家，精通朝堂权谋与江湖恩怨，善用典故，文风典雅古意，人物有血有肉，局势错综复杂。',
  xuanhuan: '你是一位玄幻修仙小说作家，世界观宏大，修炼体系严谨，文风大气磅礴，善写战斗突破的震撼与修炼路上的艰辛。',
  magic: '你是一位西幻魔法小说作家，想象力丰富，魔法体系独特，善写奇异生物与魔法世界的奇观，充满探险与奇遇的气息。',
  mystery: '你是一位悬疑推理作家，逻辑缜密，善于布置线索和反转，文风简练克制，每一个细节都可能是关键伏笔。',
  horror: '你是一位恐怖惊悚小说作家，善于营造压抑恐惧的氛围，文字充满张力，用克制的笔触让读者毛骨悚然。',
  scifi: '你是一位科幻小说作家，擅长构建宏大的星际文明和赛博朋克世界，善写科技与人性的碰撞、AI觉醒的哲学思考，文风冷峻而充满未来感。',
  apocalypse: '你是一位末世小说作家，善于描写文明崩塌后的绝境求生，展现极端环境下的人性光辉与黑暗，文风紧张压抑，每一个决定都生死攸关。',
}

interface GenreWritingParams {
  minWords: number
  maxWords: number
  pace: string
  focus: string
  sentenceStyle: string
}

const GENRE_WRITING_PARAMS: Record<GenreKey, GenreWritingParams> = {
  urban: {
    minWords: 100,
    maxWords: 160,
    pace: '节奏明快，贴近现代生活',
    focus: '对话、职场细节、人际博弈、城市氛围',
    sentenceStyle: '口语化，干练利落，对话占比可适当提高',
  },
  ancient: {
    minWords: 130,
    maxWords: 200,
    pace: '从容典雅，不急不躁',
    focus: '礼仪细节、权谋暗语、场景氛围、人物仪态',
    sentenceStyle: '文白夹杂，多四字短语，典雅而不晦涩',
  },
  xuanhuan: {
    minWords: 130,
    maxWords: 200,
    pace: '战斗场面节奏紧凑，平静段落可适当舒缓',
    focus: '功法描写、战斗动作、气势渲染、境界突破的震撼感',
    sentenceStyle: '短促有力，多排比，气势磅礴',
  },
  magic: {
    minWords: 130,
    maxWords: 200,
    pace: '轻快流畅，充满奇趣',
    focus: '魔法效果的视觉呈现、奇异生物、魔法世界的独特规则',
    sentenceStyle: '富有想象力，善用比喻，色彩感强',
  },
  mystery: {
    minWords: 80,
    maxWords: 130,
    pace: '克制紧绷，信息密度高，每句话都有意义',
    focus: '细节观察、异常之处、人物反应、环境氛围',
    sentenceStyle: '短句为主，精准克制，留白丰富，不过度解释',
  },
  horror: {
    minWords: 60,
    maxWords: 110,
    pace: '极度克制，越简短越恐怖',
    focus: '感官异常、环境细节、不合理之处、心理恐惧',
    sentenceStyle: '极简短句，不过度描述，留白制造恐惧，禁止过度血腥',
  },
  scifi: {
    minWords: 120,
    maxWords: 180,
    pace: '节奏冷静克制，科技感强',
    focus: '科技细节描写、人与机器的关系、宏大世界观的呈现、道德困境',
    sentenceStyle: '精准简练，多用专业术语但不晦涩，带有未来感的意象',
  },
  apocalypse: {
    minWords: 100,
    maxWords: 160,
    pace: '紧张压迫，时刻有危机感',
    focus: '生存资源、环境威胁、人性博弈、信任与背叛',
    sentenceStyle: '短促有力，感官描写强烈，带有绝望中的希望感',
  },
}

function buildNPCMemory(
  npcs: WorldConfig['npcs'],
  history: Message[]
): string {
  if (npcs.length === 0 || history.length === 0) return ''

  const recentNarrator = history
    .filter((m) => m.role === 'narrator')
    .slice(-6)

  const memories: string[] = []

  for (const npc of npcs) {
    if (!npc.name) continue

    const lastMention = recentNarrator
      .slice()
      .reverse()
      .find((m) => m.content.includes(npc.name))

    if (lastMention) {
      const sentences = lastMention.content
        .split(/[。！？…]/)
        .filter((s) => s.includes(npc.name))
        .slice(0, 2)
        .join('。')

      if (sentences) {
        memories.push(`${npc.name}：「${sentences}」`)
      }
    }
  }

  if (memories.length === 0) return ''

  return `【配角近况记忆】
以下是本故事中配角最近的出现记录，请保持其行为和性格的一致性：
${memories.join('\n')}`
}

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
  plotHint?: string
  subplots?: SubplotKey[]
  memoryEvents?: MemoryEvent[]
  storyLength?: 'short' | 'medium' | 'long'
}

export function buildStoryMessages(params: BuildStoryPromptParams) {
  const { genre, worldConfig, history, playerAction, status, turn, styleConfig, plotHint, subplots, memoryEvents, storyLength } = params
  const config = GENRE_CONFIG[genre]
  const writingParams = GENRE_WRITING_PARAMS[genre]
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

  const npcMemory = buildNPCMemory(worldConfig.npcs, history)

  const memoryInstruction = memoryEvents && memoryEvents.length > 0
    ? `\n【长期记忆（重要，请严格遵守）】\n以下是故事中已经发生的关键事件，生成剧情时必须与这些记忆保持一致，不能矛盾：\n${
      memoryEvents
        .map((e) => `- [${e.subject}] ${e.description}`)
        .join('\n')
    }\n`
    : ''

  const styleInstruction = styleConfig ? buildStyleInstruction(styleConfig) : ''
  const triggerInstruction = getStatusTriggerInstructions(genre, status)
  const clueInstruction = genre === 'mystery'
    ? '【悬疑线索】本故事为悬疑题材，请在剧情中自然地埋入线索，发现的线索记录在 JSON 的 clues 数组中。'
    : ''
  const povInstruction = buildPOVInstruction(pov, worldConfig.protagonistName)

  const targetEndingInstruction = worldConfig.targetEnding
    ? `【目标结局引导】玩家希望故事最终走向：「${worldConfig.targetEnding}」。请在剧情中自然地埋下伏笔、创造机会，暗中引导故事朝这个方向发展，但不要让玩家察觉到刻意安排，过程要自然流畅。当故事发展到合适时机时，在 JSON 的 ending 字段输出 {"type":"good","title":"${worldConfig.targetEnding}"} 来触发结局。`
    : ''

  const pendingBeats = (worldConfig.plotBeats ?? []).filter(
    (b) => !b.triggered && b.triggerTurn >= turn - 2 && b.triggerTurn <= turn + 2
  )
  const plotBeatsInstruction = pendingBeats.length > 0
    ? `【剧情节点提示】
玩家希望在本回合附近出现以下情节，请自然地融入剧情，不要生硬：
${pendingBeats.map((b) => `- ${b.description}`).join('\n')}`
    : ''

  const plotHintInstruction = plotHint
    ? `【玩家剧情期望】
玩家希望在接下来的故事里自然出现以下内容（不要立刻发生，在2-3回合内自然融入即可，不要让玩家察觉到刻意安排）：
${plotHint}`
    : ''

  const subplotInstruction = subplots && subplots.length > 0
    ? `【副线风格要求】
本故事包含以下副线，请在主线剧情推进的同时自然融入：
${subplots
  .map((key) => {
    const opt = SUBPLOT_OPTIONS.find((o) => o.key === key)
    return opt ? `- ${opt.emoji}${opt.label}：${opt.promptInstruction}` : ''
  })
  .filter(Boolean)
  .join('\n')}
注意：副线服务于主线，不能喧宾夺主。`
    : ''

  const storyLengthCfg = STORY_LENGTH_CONFIG[storyLength ?? 'medium']
  const endingInstruction = `
【结局触发规则】
本故事设定为${storyLengthCfg.label}，共${storyLengthCfg.totalChapters}章，约${storyLengthCfg.totalTurns}回合。

好结局触发条件（满足任意一条）：
- 玩家完成了目标结局的核心行动
- 关键状态值达到 80 以上
- 到达第${storyLengthCfg.ending.push}回合后故事自然收尾

坏结局触发条件（满足任意一条）：
- 关键状态值降至 20 以下
- 玩家连续做出严重错误的选择
- 故事陷入无法挽回的困境

第${storyLengthCfg.ending.hint}回合后：开始铺设结局伏笔
第${storyLengthCfg.ending.push}回合后：推进故事走向收尾
第${storyLengthCfg.ending.force}回合：无论如何必须触发结局

触发结局时在 JSON 的 ending 字段输出：
{"type":"good|bad|true|secret","title":"结局标题"}`

  const systemPrompt = `${GENRE_PERSONA[genre]}

【世界设定】
世界名称：${worldConfig.worldName}
世界背景：${worldConfig.worldSetting}

【主角信息】
姓名：${worldConfig.protagonistName}
特点：${worldConfig.protagonistTraits}

【配角信息】
${npcText}
${npcMemory ? '\n' + npcMemory : ''}
${memoryInstruction}
【当前状态栏】
${statusText}
${triggerInstruction}
${styleInstruction ? '\n' + styleInstruction : ''}
${targetEndingInstruction ? '\n' + targetEndingInstruction : ''}
${plotBeatsInstruction ? '\n' + plotBeatsInstruction : ''}
${plotHintInstruction ? '\n' + plotHintInstruction : ''}
${clueInstruction}

${povInstruction}
${subplotInstruction ? '\n' + subplotInstruction + '\n' : ''}
${endingInstruction}

【写作规则】
1. 你正在为玩家生成互动小说的下一段剧情，当前是第 ${turn} 回合
2. 续写剧情时紧密结合玩家的行动选择，让玩家的选择产生明显影响
3. 如果有【状态触发事件】，必须在本段剧情中体现对应的场景变化

【${config.label}题材专属写作参数】
- 字数要求：正文必须在 ${writingParams.minWords}-${writingParams.maxWords} 字之间，不得少于 ${writingParams.minWords} 字
- 叙述节奏：${writingParams.pace}
- 重点描写：${writingParams.focus}
- 句式风格：${writingParams.sentenceStyle}

4. 【输出格式 — 严格遵守】
你必须且只能输出一个合法的 JSON 对象，不能有任何 JSON 以外的文字。
格式如下：

{
  "narrative": "剧情正文（${writingParams.minWords}-${writingParams.maxWords}字）",
  "statusDelta": {"状态key": 数值变化},
  "ending": null,
  "clues": [],
  "memoryHint": "10字内总结本回合最重要的事"
}

规则：
- narrative 是纯剧情文字，不含任何标记或 JSON
- statusDelta 的 key 必须从以下选择：${config.bars.map((b) => b.key).join('、')}
- 数值变化范围 -15 到 +15
- 没有结局时 ending 必须是 null，不能省略
- 没有线索时 clues 必须是空数组 []
- 触发结局时 ending 格式：{"type":"good","title":"结局标题"}，type 可选：good、bad、true、secret，title 用 4-10 个字
- 悬疑题材发现线索时才填写 clues，其他题材保持 []
- memoryHint 用10字内总结本回合最重要的一件事，如"获得玉佩信物"
- 不要主动提示玩家"你要怎么做"，剧情自然结束即可
- 结局触发条件详见上方【结局触发规则】`

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
