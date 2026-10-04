export const SUPPLY_ACTIONS = ['inspect_water', 'inspect_vehicle', 'inspect_shelter', 'find_tools', 'ask_team', 'ask_residents', 'repair', 'load_device', 'split_core', 'evacuate', 'deceive_team', 'confess', 'depart', 'talk'] as const
export type SupplyAction = typeof SUPPLY_ACTIONS[number]
export interface SupplyPlan { steps: SupplyAction[]; explanation: string }
export interface SupplyState {
  version: 1
  time: number
  known: string[]
  tools: boolean
  team: boolean
  residents: boolean
  repaired: boolean
  cargo: 'none' | 'device' | 'core'
  evacuated: boolean
  hiddenRisk: boolean
  departed: boolean
  log: string[]
  pending?: SupplyPlan
}
export function initialSupply(): SupplyState {
  return { version: 1, time: 6, known: [], tools: false, team: false, residents: false, repaired: false, cargo: 'none', evacuated: false, hiddenRisk: false, departed: false, log: [] }
}
export const ACTION_LABELS: Record<SupplyAction, string> = {
  inspect_water: '调查居民储水', inspect_vehicle: '检查车辆与净水核心', inspect_shelter: '诊断排水设施', find_tools: '寻找维修工具', ask_team: '向许岚争取维修人手', ask_residents: '请陈默组织居民协助', repair: '修复排水设施', load_device: '装运一套完整设备', split_core: '拆卸并装运净水核心', evacuate: '组织居民登车撤离', deceive_team: '隐瞒设施风险以争取队员', confess: '向许岚坦白设施风险', depart: '执行最终安排，救援车出发', talk: '询问或讨论方案',
}
export function validateSupply(value: unknown): SupplyState {
  if (!value || typeof value !== 'object') throw new Error('补给站状态缺失')
  const s = value as SupplyState
  if (s.version !== 1 || !Number.isInteger(s.time) || s.time < 0 || s.time > 6 || !Array.isArray(s.known) || s.known.some(k => !['water', 'vehicle', 'shelter'].includes(k)) || !Array.isArray(s.log) || s.log.some(l => typeof l !== 'string') || s.log.length > 300 || !['none', 'device', 'core'].includes(s.cargo) || ['tools', 'team', 'residents', 'repaired', 'evacuated', 'hiddenRisk', 'departed'].some(k => typeof s[k as keyof SupplyState] !== 'boolean')) throw new Error('补给站状态无效')
  if (s.pending) validatePlan(s.pending)
  return structuredClone(s)
}
export function validatePlan(value: unknown): SupplyPlan {
  const p = value as SupplyPlan
  if (!p || !Array.isArray(p.steps) || p.steps.length < 1 || p.steps.length > 4 || p.steps.some(a => !SUPPLY_ACTIONS.includes(a)) || typeof p.explanation !== 'string') throw new Error('无法理解行动方案，请重新描述')
  return { steps: p.steps, explanation: p.explanation.slice(0, 200) }
}
export function supplyEnding(s: SupplyState) {
  if (!s.departed && s.time > 0) return null
  const delivered = s.departed && s.cargo !== 'none'
  const safe = s.repaired || (s.departed && s.evacuated)
  return { type: safe && delivered ? 'good' as const : 'bad' as const,
    title: safe && delivered ? '风暴中的两处灯火' : safe ? '守住了幸存者' : delivered ? '抵达之后的牵挂' : '未完成的安排' }
}
export function resolveSupply(input: SupplyState, action: SupplyAction): { state: SupplyState; feedback: string } {
  const s = validateSupply(input)
  s.pending = undefined
  if (supplyEnding(s)) return { state: s, feedback: '安排已结算，不能继续行动。' }
  let cost = 0, text = ''
  const discover = (key: string, description: string) => {
    if (s.known.includes(key)) { text = '这项事实已经确认，查看记录无需重复耗时。'; return }
    cost = 1; s.known.push(key); text = description
  }
  switch (action) {
    case 'inspect_water': discover('water', '居民储水可维持一天；不能把未来回送的承诺当成已有水源。'); break
    case 'inspect_vehicle': discover('vehicle', '车辆可运一套完整设备，或净水核心加部分物资。核心可接入城外营地现有接口；拆装需要工具与维修员，耗时 2。不能再次返程。'); break
    case 'inspect_shelter': discover('shelter', '排水泵堵塞。找到工具后，周宁可与玩家维修，耗时 2；有额外协助时耗时 1。'); break
    case 'find_tools': if (s.tools) text = '工具已经找到。'; else { cost = 1; s.tools = true; text = '找到疏通工具与拆装扳手。'; } break
    case 'ask_team': if (!s.known.includes('shelter')) text = '许岚要求先诊断故障，不能在未知风险下借出队员。'; else { s.team = true; text = '许岚同意借两名队员协助维修，条件是车辆带上设备或核心出发；系统记录交付承诺。'; } break
    case 'ask_residents': if (!s.known.includes('water') || !s.known.includes('shelter')) text = '陈默要求先查清储水与避难设施的情况。'; else { s.residents = true; text = '陈默同意组织居民协助维修，留在站内的一套设备必须保留。'; } break
    case 'deceive_team': s.team = true; s.hiddenRisk = true; text = '你隐瞒设施风险，许岚暂时借出队员；风险仍存在，隐瞒已记录。'; break
    case 'confess': s.hiddenRisk = false; s.team = s.known.includes('shelter'); text = s.team ? '许岚接受诊断与坦白，仍要求兑现设备交付。' : '缺少诊断，许岚收回队员，要求先核实风险。'; break
    case 'evacuate': if (s.evacuated) text = '居民已经登车。'; else if (s.cargo !== 'core') text = '需要先拆分运输核心，为居民腾出空间；尚未撤离。'; else { cost = 1; text = '居民登车，出发后将抵达城外营地。'; } break
    case 'repair': if (s.repaired) text = '排水设施已经修复。'; else if (!s.tools || !s.known.includes('shelter')) text = '维修缺少诊断或工具，尚未执行，也不扣时间。'; else { cost = s.team || s.residents ? 1 : 2; text = '排水设施修复，站内居民可安全避难。'; } break
    case 'load_device': if (s.cargo !== 'none') text = '车辆已有装载方案，不能重复增加设备。'; else { cost = 1; text = '装车一套完整净水设备，另一套仍留在补给站。'; } break
    case 'split_core': if (s.cargo !== 'none') text = '车辆已经装载，不能再叠加核心。'; else if (!s.tools || !s.known.includes('vehicle')) text = '需要先检查兼容性并找到工具，尚未拆卸。'; else { cost = 2; text = '周宁协助拆装核心，城外可接入使用；居民保留另一套完整设备和拆剩的储水箱。'; } break
    case 'depart': cost = 1; text = '救援车按当前装载方案出发，最终安排开始结算。'; break
    case 'talk': text = '本次仅讨论，不改变资源或时间；人物不能凭对话创造新设备，也不能把承诺写成已完成的事实。'; break
  }
  if (cost > s.time) return { state: s, feedback: `剩余时间不足以${ACTION_LABELS[action]}，未执行。请调整方案。` }
  s.time -= cost
  if (action === 'repair' && cost) s.repaired = true
  if (action === 'load_device' && cost) s.cargo = 'device'
  if (action === 'split_core' && cost) s.cargo = 'core'
  if (action === 'evacuate' && cost) s.evacuated = true
  if (action === 'depart') s.departed = true
  text += cost ? ` 耗时 ${cost}，剩余 ${s.time}。` : ' 未消耗时间。'
  if (s.team && s.departed && s.cargo === 'none') text += ' 未兑现向许岚交付设备的承诺。'
  if (s.hiddenRisk && (s.departed || s.time === 0)) text += ' 结算时隐瞒被揭露，许岚失去对你的信任。'
  s.log = [...s.log, text].slice(-300)
  return { state: s, feedback: text }
}
export function supplyChoices(s: SupplyState): string[] {
  if (supplyEnding(s)) return []
  if (s.pending) return ['确认执行当前方案', '取消当前方案']
  const actions: SupplyAction[] = []
  if (s.cargo !== 'none') actions.push('depart')
  if (s.cargo === 'core' && !s.evacuated) actions.unshift('evacuate')
  if (!s.known.includes('water')) actions.push('inspect_water')
  if (!s.known.includes('shelter')) actions.push('inspect_shelter')
  if (!s.tools) actions.push('find_tools')
  if (s.known.includes('shelter') && !s.team) actions.push('ask_team')
  if (!s.known.includes('vehicle')) actions.push('inspect_vehicle')
  if (!s.repaired && s.tools && s.known.includes('shelter')) actions.unshift('repair')
  if (s.cargo === 'none') actions.push('load_device')
  actions.push('depart')
  return actions.slice(0, 4).map(a => ACTION_LABELS[a])
}

