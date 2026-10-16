import { ACTION_LABELS, type SupplyState } from './supplyGame'

export const SUPPLY_FACTS = `补给站有两套可用的完整净水设备，排水泵是独立的避难设施，不是其中一套净水设备。车辆带走一套完整设备后，另一套始终留在站内继续供水。居民安全取决于排水维修或实际随车撤离，不取决于消耗一天储水后等待返程。
城外营地已有道路目的地，不需要另选路线；没有第二辆车，风暴前不能返程。装完整设备不需要调查接口、维修或居民许可。调查车辆只为发现拆运核心的替代路线；发现兼容性且找到工具后，周宁可拆装核心腾出座位，居民登车不需要先调查储水或维修排水。不得增加这些前置条件。
储水一天、核心兼容性、排水泵堵塞是调查后才揭露的事实。尚未调查时不能泄露答案；诊断只发现堵塞，不进行维修，不获得工具。找到工具不等于开始维修；借人不等于开始维修。人物获知私下调查结果需要对应知识记录或本回合明确传播。可观察到的装车、维修结果与出发可以据实际结果回应。`

export function supplyNarrativeConstraints(before: SupplyState, after: SupplyState, preview: boolean) {
  return {
    phase: preview ? '方案预览或编辑；仅讨论和等待确认，不得开始方案中的任何操作' : '依裁定描述本回合实际发生的事',
    before: { time: before.time, tools: before.tools, repaired: before.repaired, cargo: before.cargo, evacuated: before.evacuated, departed: before.departed },
    after: { time: after.time, tools: after.tools, repaired: after.repaired, cargo: after.cargo, evacuated: after.evacuated, departed: after.departed },
    limits: [
      !after.known.includes('shelter') ? '未诊断故障，叙述者也不能揭露堵塞点、淤泥等诊断答案。' : '',
      !after.known.includes('vehicle') ? '未检查车辆，不揭露核心兼容、腾出座位等检查答案，不声称接口不兼容。' : '',
      !after.known.includes('water') ? '未调查储水，不揭露储水只够一天。' : '',
      !after.repaired ? '排水尚未修复，禁止写清除堵塞、泵恢复转动、积水已经排走；诊断只能查看故障。' : '',
      !after.tools ? '未获得工具，禁止递扳手、动用疏通工具。' : '',
      after.cargo === 'none' ? '未装车，不能写设备或核心已经搬上车。' : '',
      !after.evacuated ? '居民未登车，不能写居民已进入车厢。' : '',
      !after.departed ? '车尚未出发，不写挂挡驶离、交付完成或居民已到城外。' : '',
      before.time === after.time ? '本回合未耗时，不写时间正在减少。' : '',
    ].filter(Boolean),
  }
}

export function validateSupplyNarrativeAudit(value: unknown): string[] {
  const result = value as { consistent?: boolean; violations?: unknown }
  if (!result || typeof result.consistent !== 'boolean' || !Array.isArray(result.violations) || result.violations.some(v => typeof v !== 'string')) throw new Error('叙述核对未完成')
  if (!result.consistent && !result.violations.length) throw new Error('叙述核对缺少原因')
  return result.consistent && !result.violations.length ? [] : result.violations as string[]
}

export function supplySceneBrief(before: SupplyState, after: SupplyState, preview: boolean, feedback: string): string {
  if (preview) return '只商量待确认方案；相关人物就已知条件回应一句。不得拿工具、拆机、搬运、登车、发车，不替主角许诺或选择别的行动。'
  if (after.departed && !before.departed) return '救援车现在才驶离。' + (after.evacuated ? '居民已上车，核心送往城外。回扣选择拆运核心腾出座位的代价与效果。' : after.repaired ? '陈默与居民留在修复的避难站，另一套设备继续供水；许岚带走车上的设备。回扣此前维修如何保障留下的人。' : '留守避难安全仍未保障。陈默的担忧没有被解决；不得新增伤亡。')
  if (after.repaired && !before.repaired) return '本回合才完成维修，积水开始退去。' + (before.team || before.residents ? '接受合作获得的人手缩短了维修，点出这项先前选择的作用。' : '主角和周宁独自完成维修，付出了更长时间。') + (after.social?.exposed && !before.social?.exposed ? '参与维修的队员报告此前隐瞒的故障，许岚得知真相并收回后续协助；已修好的泵不受影响。' : '')
  if (!before.known.includes('shelter') && after.known.includes('shelter')) return '主角和周宁仅检查泵体，发现堵塞。周宁说明需要工具；工具齐备可维修，额外人手能缩短工时。没有拆洗、疏通或试转。许岚和陈默不在场，不描写他们听到了诊断。'
  if (!before.known.includes('water') && after.known.includes('water')) return '主角独自核对储水记录，只够一天；合上记录，没有对其他人报告，也没有宣布新计划。另一套设备将留站内，但暴雨避难安全仍需查明。'
  if (!before.known.includes('vehicle') && after.known.includes('vehicle')) return '主角与周宁完成兼容性检查：核心可接城外现有接口，拆运能腾出居民座位，需要工具和两单位时间。只是获得替代方案，没有拆装、登车。'
  if (!before.tools && after.tools) return '找到疏通工具和拆装扳手。周宁检查工具状况后放好，未开始维修或拆核心。不另选下一步，不替主角许诺。若后续步骤受阻，只说明裁定中的原因。'
  if (after.cargo !== before.cargo) return after.cargo === 'core' ? '周宁与主角拆下核心并固定到车上，另一套完整设备留站内。腾出了座位，但居民还没登车，也没出发。' : '一套完整设备已装车，另一套留在站内。若排水已修复，陈默承认留下的人有避难保障，不再无理由质疑水源或要求新检查。尚未发车。'
  if (after.evacuated && !before.evacuated) return '居民现在登车，陈默清点人员。核心已装好，车还没开；实际出发才能完成撤离。'
  if (after.team && !before.team) return '主角接受许岚条件，她借出队员；只是人手到位，不开始维修。承诺由主角作出，许岚等待履行。'
  if (after.social?.offer) return `人物提出或保留合作条件：${after.social.offer.description}。只等待接受，不借出人手，不开始维修。`
  return `只表现裁定中的已发生内容，不增加新行动、承诺或前置条件：${feedback}`
}

export function supplyOpening(actor: string) {
  return `风把补给站的铁门撞得一响。${actor}刚接过临时协调的名单，许岚便将车钥匙压在桌上：“城外的人还等着净水设备。车只能装一套，风暴前得走。”\n\n陈默扶住门，身后是挤在站里的居民。“另一套留给我们。可避难间已经渗水——车走了，留下的人怎么办？”\n\n周宁从排水间退出来，裤脚湿了一截：“得查清设施哪里出了问题，也可以先核对储水或检查车辆。动手之前，咱们把代价说清楚。”\n\n两套设备并排立在墙边。留给${actor}协调的时间，只够六个时间单位的行动；询问和商量暂不耗时。`
}

// Edited passages keep a bounded story readable when a generated passage fails its audit.
// API/transport failures still fail the turn; this is only for rejected prose.
export class SupplyNarrativeMismatch extends Error {}

export function observedSupplyProseIssues(text: string, state: SupplyState): string[] {
  const issues: string[] = []
  if (/许岚的承诺|许岚兑现/.test(text)) issues.push('交付承诺由主角向许岚作出，不是许岚兑现主角的承诺')
  if (/(?:还[有剩]|剩下|剩余).{0,4}[一二三四五六七八九十\d]+天|六小时|两个钟头|一个钟头/.test(text)) issues.push('时间单位不是天或小时，不换算虚构的时长')
  if (/(?:装车|装运|出发).{0,14}(?:得先|必须先|无从谈起)|(?:泵没转|泵不转|泵修不好).{0,16}(?:装车|送不出去|出发)/.test(text)) issues.push('装车与出发不要求先维修排水，不增加行动条件')
  if (state.known.includes('shelter') && /故障.{0,4}(?:还没|未)(?:查|看|诊断)|泵还没查|得先诊断|先查故障|先看泵|下一步查泵|(?:先看清|看清).{0,5}泵.{0,5}(?:卡在哪|为什么)|再确认.{0,5}泵的型号/.test(text)) issues.push('故障已经诊断，不重置为未知或要求额外型号检查')
  if (/今天动不了|今天修不完/.test(text)) issues.push('不能从尚未找到工具推断当天无法行动')
  if (/设备不能拆开|另一套是备用泵|两套设备接口不同/.test(text)) issues.push('两套均是可用净水设备，拆运核心路线存在，不编造设备差异')
  return issues
}

export function supplyEditedScene(before: SupplyState, after: SupplyState, preview: boolean, feedback: string, actor: string): string {
  if (preview) {
    const steps = after.pending?.steps ?? []
    const description = steps.map(step => ACTION_LABELS[step]).join('，再')
    const first = steps[0]
    const response = first === 'repair' ? !after.tools || !after.known.includes('shelter') ? '维修还缺诊断或工具。先补齐条件，别让人白忙。' : '工具和诊断都在。有帮手就快一点，但你得先点头。'
      : first === 'depart' ? '车一旦出发，这次安排就定下了。再看一眼留下的人和车上的东西。'
      : first === 'load_device' ? '只搬一套，另一套原样留给站里。等你确认，我们再动。'
      : first === 'deceive_team' ? '有些话可以暂时不说，但说出口的保证，迟早要拿实际安排兑现。'
      : first === 'split_core' ? '先拆核心才有座位，居民上车之后才能撤离。每一步都得真正做到。'
      : '先核对步骤。缺了条件，我们就停在那里，不往下硬做。'
    // Concealment remains a private intention; never put it in an NPC's mouth.
    return `${actor}将“${description || '调整当前方案'}”的打算重新过了一遍。\n\n${first === 'deceive_team' ? `这仍是${actor}心里的盘算。` : '周宁没有动手，只提醒：'}${first === 'deceive_team' ? response : `“${response}”`}\n\n方案尚未执行。决定确认、取消，或改掉其中一步的余地，还握在${actor}手里。`
  }
  if (after.departed && !before.departed) {
    if (after.evacuated) return `陈默数完最后一遍人数，才把车门带上。原本会被整套设备占满的位置，如今坐着站里的居民；拆下的净水核心固定在车尾，周宁又拉了一遍绑带。\n\n许岚发动了车。${actor}选择先检查兼容性、再付出拆装的时间，换来的正是这些座位。车灯穿过雨幕，朝城外营地驶去。排水设施没有修好，但居民已经不必留在那里等风暴。`
    if (after.repaired) return `车轮压过站门前的积水，陈默没有再挡在出口。他回头望了一眼排水间——泵仍在运转，另一套净水设备也留在墙边。\n\n“我们守这里。”他说。\n\n许岚带着装好的设备驶向城外。此前为维修付出的时间，此刻成了让人能够安心留下的理由。${actor}终于可以把目光从站内移向远处：两边等水的人，都有了着落。`
    return `救援车驶出站门，陈默仍扶着那扇被风撞响的铁门。排水间没有传来恢复运转的声音，留下的人还不能确认避难是否安全。\n\n${after.cargo === 'none' ? '车上也没有设备，城外供水的安排尚未完成。' : '车上的设备将送往城外，但这项交付没有解决留守者的处境。'}${actor}作出的安排已经成为结果；未能完成的部分，也留在了这一场风暴里。`
  }
  if (after.repaired && !before.repaired) return `最后一团堵塞物被清出管口，积水终于沿沟槽退下去。周宁合上泵盖，等转动的声音稳住，才松开手。\n\n${before.team || before.residents ? '此前争取来的帮手扶住了最难拆的管段，维修因此少用了一个时间单位。' : `${actor}与周宁独自完成这项维修，花去了两个时间单位。`}留守居民的避难设施已经恢复。${after.social?.exposed && !before.social?.exposed ? '\n\n参与维修的队员把故障情况告诉了许岚。她听完，收回了后续人手：“刚才为什么不说实话？要再借人，先装车。”泵没有因此停转，但信任已经变了。' : ''}`
  if (!before.known.includes('shelter') && after.known.includes('shelter')) return `${actor}跟着周宁检查排水泵，手电光停在堵住的管口。周宁指了指里面，没有伸手清理：“${after.tools ? '工具已经有了。' : '得先找疏通工具。'}我们两个人修，要花两个时间单位；多一份人手，就能快一些。”\n\n泵仍旧没有转动。故障已经查明，维修还没有开始；这份诊断也还没有传到许岚与陈默那里。`
  if (!before.known.includes('water') && after.known.includes('water')) return `${actor}逐项核对储水记录，停在最后那个数字上：一天。桶盖合回去时，发出一声空响。\n\n留下的另一套净水设备仍能供水，但储水不能替代避难保障，更不能指望尚未发生的返程。${actor}把记录放回原处；许岚与陈默还没有收到这份调查结果。`
  if (!before.known.includes('vehicle') && after.known.includes('vehicle')) return `周宁将核心接口与营地的接入记录对照了一遍，朝${actor}点头：“能接。只带核心，就能给居民腾出座位；不过拆装要工具，也要两个时间单位。”\n\n完整设备仍在原处。眼前多了一条经过核实的路，至于是否付出拆装的时间，还没有决定。`
  if (!before.tools && after.tools) return `${actor}翻开工具柜，在底层找到了疏通工具和拆装扳手。周宁接过来检查，确认能用，又将它们放好。\n\n${feedback.includes('条件') || feedback.includes('缺少') ? '工具已经到手，后面的步骤却仍缺少条件；准备没有白费，也没有被算成已经修好。' : '工具已经到手。排水泵和净水核心都还没有被动过，下一步仍由主角决定。'}`
  if (after.cargo !== before.cargo) return after.cargo === 'core' ? `周宁与${actor}把拆下的净水核心固定在车上。原本留给整套设备的位置空了出来，陈默走近看了一眼，手掌在车厢边沿停住。\n\n核心已装好，另一套完整设备仍在站内。腾出的地方可以让居民上车，但此刻没有人已经撤离。` : `${actor}看着一套完整设备被固定到车上，另一套仍留在补给站。许岚试了试绑带，没有催车发动。\n\n${after.repaired ? '陈默听着排水泵平稳的声音，终于从门口让开：“站里有水，避难间也能用了。”' : '陈默回头望向避难间，排水的问题仍未解决。'}车已装好，是否出发还需要最后的决定。`
  if (after.evacuated && !before.evacuated) return `陈默扶着车门清点人数，居民依次坐进拆运核心后腾出的空间。${actor}看过车厢，才让开门边。\n\n核心已经固定，人也已经上车。许岚的手停在钥匙旁，等最后的出发安排；车还没有离开补给站。`
  if (after.team && !before.team) return `许岚听完${actor}的答复，招手叫来队员：“去搭把手。城外的交付，按说好的办。”\n\n队员走到周宁身边，等候下一步。人手已经借出，维修还没有开始；交付的承诺也只是记下，尚未兑现。`
  if (after.social?.offer) return `${after.social.offer.target === 'xu' ? '许岚按住交接单' : '陈默在站门前停住'}：“${after.social.offer.description}。”\n\n${actor}听清了这项条件。${after.social.offer.condition === 'load_first' && after.cargo === 'none' ? '车还是空的，眼下即使答应，也得先完成装车才能借到人手。' : after.social.offer.condition === 'repair_first' && !after.repaired ? '排水尚未修好，这个先决条件还没有完成。' : '对方还没有叫来帮手，等的是明确答复；承诺不能在沉默中替人作出。'}`
  return `${actor}把当前安排重新核对了一遍。\n\n${feedback}\n\n设备和人员仍按实际完成的步骤留在各自位置。未完成的事，没有被一句话算成已经做到。`
}
