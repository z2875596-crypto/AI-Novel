import { GenreKey } from '@/types/genre'

export interface StatusTrigger {
  key: string           // 状态栏 key
  condition: 'gte' | 'lte'  // 大于等于 / 小于等于
  threshold: number     // 触发阈值
  level: 'high' | 'low' // 高值触发 / 低值触发
  instruction: string   // 注入给 AI 的额外指令
}

export const STATUS_TRIGGERS: Record<GenreKey, StatusTrigger[]> = {
  romance: [
    {
      key: 'affection',
      condition: 'gte',
      threshold: 80,
      level: 'high',
      instruction: '【好感度极高】主角与对方的感情已经非常深厚，此时可以自然推进感情，触发表白、牵手或更亲密的场景，情感描写要细腻动人。',
    },
    {
      key: 'affection',
      condition: 'lte',
      threshold: 20,
      level: 'low',
      instruction: '【好感度极低】对方对主角已经产生明显的冷淡或误解，此时应制造矛盾冲突，可能出现争吵、误会加深或短暂分离的场景。',
    },
    {
      key: 'heartbeat',
      condition: 'gte',
      threshold: 85,
      level: 'high',
      instruction: '【心动值极高】主角内心已经无法自控地喜欢对方，心跳加速、脸红耳热，可以触发主角主动靠近或内心独白爆发的场景。',
    },
    {
      key: 'heartbeat',
      condition: 'lte',
      threshold: 15,
      level: 'low',
      instruction: '【心动值极低】主角对感情感到迷茫或麻木，可以触发主角质疑自己感情的内心独白，或者与对方产生疏离感。',
    },
  ],

  mystery: [
    {
      key: 'clues',
      condition: 'gte',
      threshold: 15,
      level: 'high',
      instruction: '【线索充足】主角已经收集了足够多的线索，此时可以触发关键推理场景，让主角将线索串联起来，逐渐逼近真相，甚至可以安排对峙凶手的场景。',
    },
    {
      key: 'clues',
      condition: 'lte',
      threshold: 3,
      level: 'low',
      instruction: '【线索匮乏】主角掌握的线索极少，陷入调查僵局，可以安排新的神秘事件发生，或者有人主动透露信息，推动剧情发展。',
    },
    {
      key: 'sanity',
      condition: 'lte',
      threshold: 25,
      level: 'low',
      instruction: '【理智值极低】主角长期处于高压和恐惧中，开始出现幻觉或判断失误，此时叙事可以变得模糊和不可靠，加入主角分不清真实与幻想的描写。',
    },
    {
      key: 'sanity',
      condition: 'gte',
      threshold: 90,
      level: 'high',
      instruction: '【理智值极高】主角思维极度清晰，观察力和推理力达到顶峰，可以触发主角一次精准的推理或发现重要线索的场景。',
    },
  ],

  xuanhuan: [
    {
      key: 'spirit',
      condition: 'gte',
      threshold: 90,
      level: 'high',
      instruction: '【灵力充盈】主角灵力达到巅峰，此时可以触发修炼突破、施展强力法术或击败强敌的震撼场景，描写要磅礴大气。',
    },
    {
      key: 'spirit',
      condition: 'lte',
      threshold: 10,
      level: 'low',
      instruction: '【灵力枯竭】主角灵力几近耗尽，处于极度虚弱状态，面临危险，可以触发被迫逃跑、受人救助或激发潜力的逆境场景。',
    },
    {
      key: 'realm',
      condition: 'gte',
      threshold: 8,
      level: 'high',
      instruction: '【境界极高】主角修为已达极高层次，可以俯瞰苍生，触发与同等境界强者对决或即将踏入更高境界的关键场景。',
    },
    {
      key: 'realm',
      condition: 'lte',
      threshold: 2,
      level: 'low',
      instruction: '【境界低微】主角修为尚浅，面对强者处于绝对劣势，可以触发被欺压、寻找机缘或得到高人指点的场景。',
    },
  ],

  ancient: [
    {
      key: 'prestige',
      condition: 'gte',
      threshold: 85,
      level: 'high',
      instruction: '【声望极高】主角在朝野间声名显赫，此时可以触发皇帝召见、各方势力示好或被封赏的重要场景。',
    },
    {
      key: 'prestige',
      condition: 'lte',
      threshold: 15,
      level: 'low',
      instruction: '【声望跌落】主角声誉受损，处于被排挤和打压的危险境地，可以触发遭人陷害、被贬黜或需要重新证明自己的场景。',
    },
    {
      key: 'faction',
      condition: 'gte',
      threshold: 85,
      level: 'high',
      instruction: '【势力强盛】主角背后的势力已经足够强大，可以触发主动出击、与对立势力正面交锋或掌握关键权力的场景。',
    },
    {
      key: 'faction',
      condition: 'lte',
      threshold: 15,
      level: 'low',
      instruction: '【势力式微】主角势力岌岌可危，需要寻求新的盟友或采取隐忍策略，可以触发秘密结盟或韬光养晦的场景。',
    },
  ],

  magic: [
    {
      key: 'spirit',
      condition: 'gte',
      threshold: 90,
      level: 'high',
      instruction: '【魔力充盈】主角魔力达到极限，可以施展最强大的魔法或解除强力封印，触发壮观的魔法战斗或奇迹场景。',
    },
    {
      key: 'spirit',
      condition: 'lte',
      threshold: 10,
      level: 'low',
      instruction: '【魔力枯竭】主角魔力几乎耗尽，无法施法，处于极度危险中，可以触发被迫使用禁忌魔法或寻求他人帮助的场景。',
    },
    {
      key: 'realm',
      condition: 'gte',
      threshold: 8,
      level: 'high',
      instruction: '【法术境界极高】主角魔法造诣达到大师级别，可以触发被魔法学院认可、与魔王对决或开创新魔法体系的场景。',
    },
    {
      key: 'realm',
      condition: 'lte',
      threshold: 2,
      level: 'low',
      instruction: '【法术境界低微】主角魔法还很稚嫩，在强大的魔法生物面前毫无还手之力，可以触发寻找导师或发现隐藏天赋的场景。',
    },
  ],

  urban: [
    {
      key: 'network',
      condition: 'gte',
      threshold: 85,
      level: 'high',
      instruction: '【人脉极广】主角在各界都有重要人脉，可以触发关键人物出手相助、获得重要内幕信息或化解危机的场景。',
    },
    {
      key: 'network',
      condition: 'lte',
      threshold: 15,
      level: 'low',
      instruction: '【人脉匮乏】主角在都市中几乎孤立无援，可以触发被人孤立、独自面对强大对手或意外结识贵人的场景。',
    },
    {
      key: 'money',
      condition: 'gte',
      threshold: 8000,
      level: 'high',
      instruction: '【财富充裕】主角资金雄厚，可以触发大额投资、收购公司或用财富解决棘手问题的场景。',
    },
    {
      key: 'money',
      condition: 'lte',
      threshold: 100,
      level: 'low',
      instruction: '【资金匮乏】主角陷入经济危机，面临破产或被迫做出艰难选择，可以触发铤而走险、寻求融资或意外发现商机的场景。',
    },
  ],

  horror: [
    {
      key: 'fear',
      condition: 'gte',
      threshold: 85,
      level: 'high',
      instruction: '【恐惧值极高】主角已经被恐惧淹没，接近崩溃边缘，此时叙事要极度压抑，可以触发主角做出非理性决定、求生本能爆发或陷入极度恐慌的场景。',
    },
    {
      key: 'fear',
      condition: 'lte',
      threshold: 15,
      level: 'low',
      instruction: '【恐惧值极低】主角异常冷静，甚至对恐怖事物产生了某种适应，可以触发主角主动探索危险区域或与恐怖存在正面交锋的场景。',
    },
    {
      key: 'sanity',
      condition: 'lte',
      threshold: 20,
      level: 'low',
      instruction: '【理智值极低】主角精神已接近崩溃，分不清现实与幻觉，叙述变得混乱和不可靠，可以触发主角伤害自己或他人、或突然清醒看穿真相的极端场景。',
    },
    {
      key: 'sanity',
      condition: 'gte',
      threshold: 90,
      level: 'high',
      instruction: '【理智值极高】主角保持着难得的清醒，可以触发发现其他人没有注意到的关键细节，或者冷静制定逃脱计划的场景。',
    },
  ],

  comedy: [
    {
      key: 'drama',
      condition: 'gte',
      threshold: 90,
      level: 'high',
      instruction: '【抓马程度爆表】局面已经抓马到极致，各种意想不到的事情同时发生，此时应触发一个让所有人目瞪口呆的终极搞笑反转，越离谱越好！',
    },
    {
      key: 'drama',
      condition: 'lte',
      threshold: 20,
      level: 'low',
      instruction: '【抓马程度极低】剧情太平淡了，需要立刻制造一个突如其来的搞笑意外，打破平静，让局面迅速变得混乱有趣。',
    },
  ],
}

/** 根据当前状态检查触发条件，返回需要注入的额外指令 */
export function getStatusTriggerInstructions(
  genre: GenreKey,
  status: Record<string, number>
): string {
  const triggers = STATUS_TRIGGERS[genre] ?? []
  const activeInstructions: string[] = []

  for (const trigger of triggers) {
    const val = status[trigger.key] ?? 0
    const triggered =
      trigger.condition === 'gte'
        ? val >= trigger.threshold
        : val <= trigger.threshold

    if (triggered) {
      activeInstructions.push(trigger.instruction)
    }
  }

  if (activeInstructions.length === 0) return ''

  return `\n【状态触发事件】\n${activeInstructions.join('\n')}`
}