import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export function buildWorldgenMessages(genre: GenreKey) {
  const config = GENRE_CONFIG[genre]

  const systemPrompt = `你是一个擅长${config.label}题材的创意写作助手，专门帮助玩家生成互动小说的世界观设定。

你必须只输出一个 JSON 对象，不要有任何其他文字、解释或 markdown 代码块，格式如下：
{
  "worldName": "世界名称（4-8个字）",
  "worldSetting": "世界背景介绍（80-120字，交代时代背景、世界规则、整体氛围）",
  "protagonistName": "主角姓名（2-4个字）",
  "protagonistTraits": "主角特点（60-80字，包含性格特征和外貌描述）",
  "openingScene": "开场场景（80-100字，描述故事开始的具体场景和主角当下处境）",
  "suggestedNPCs": [
    {"name": "配角姓名", "role": "与主角的关系", "traits": "性格外貌特点（30字内）"},
    {"name": "配角姓名", "role": "与主角的关系", "traits": "性格外貌特点（30字内）"}
  ]
}`

  const userMessage = `请为${config.label}题材的互动小说生成一套有创意、有代入感的世界观设定。注意要符合${config.label}题材的特色和氛围。`

  return {
    system: systemPrompt,
    messages: [{ role: 'user' as const, content: userMessage }],
  }
}