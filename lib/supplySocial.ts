import type { SupplyState } from './supplyGame'
export type Person = 'xu' | 'chen' | 'zhou'
export type Term = 'deliver' | 'load_first' | 'repair_first' | 'keep_device'
export interface Negotiation { target: 'xu' | 'chen'; condition: Term }
export interface Offer extends Negotiation { description: string }
export interface PromiseRecord { id: string; target: 'xu' | 'chen'; condition: Term; status: 'active' | 'fulfilled' | 'broken'; description: string }
export interface SocialState {
  knowledge: Record<Person, string[]>
  trust: Record<Person, 'neutral' | 'cooperative' | 'wary'>
  promises: PromiseRecord[]
  offer?: Offer
  exposed: boolean
}
export const PERSON_NAMES = { xu: '许岚', chen: '陈默', zhou: '周宁' }
export const TERM_NAMES: Record<Term, string> = { deliver: '风暴前向城外交付设备或核心', load_first: '先装车，再借出维修人手，并完成交付', repair_first: '先修好避难设施，再组织居民协助', keep_device: '为站内保留一套完整设备，并保障居民安全' }
export function initialSocial(): SocialState {
  return { knowledge: { xu: [], chen: [], zhou: [] }, trust: { xu: 'neutral', chen: 'neutral', zhou: 'neutral' }, promises: [], exposed: false }
}
export function validateNegotiation(value: unknown): Negotiation {
  const n = value as Negotiation
  if (!n || !['xu', 'chen'].includes(n.target) || !Object.hasOwn(TERM_NAMES, n.condition) || (n.target === 'xu' ? !['deliver', 'load_first'].includes(n.condition) : !['repair_first', 'keep_device'].includes(n.condition))) throw new Error('人物不能提供这个合作条件')
  return { target: n.target, condition: n.condition }
}
export function normalizeSocial(value: unknown): SocialState {
  if (value === undefined) return initialSocial()
  const v = value as SocialState
  if (!v || typeof v.exposed !== 'boolean' || !v.knowledge || !v.trust || !Array.isArray(v.promises) || v.promises.length > 30) throw new Error('人物状态无效')
  for (const person of ['xu', 'chen', 'zhou'] as const) {
    if (!Array.isArray(v.knowledge[person]) || v.knowledge[person].some(k => !['water', 'vehicle', 'shelter', 'lie'].includes(k)) || !['neutral', 'cooperative', 'wary'].includes(v.trust[person])) throw new Error('人物信息无效')
  }
  for (const p of v.promises) {
    validateNegotiation(p)
    if (typeof p.id !== 'string' || typeof p.description !== 'string' || !['active', 'fulfilled', 'broken'].includes(p.status)) throw new Error('承诺无效')
  }
  if (v.offer) { validateNegotiation(v.offer); if (typeof v.offer.description !== 'string') throw new Error('合作提议无效') }
  return structuredClone(v)
}
export function negotiate(s: SupplyState, target: 'xu' | 'chen', proposed?: Term): string {
  const social = s.social!
  if (target === 'xu') {
    if (!social.knowledge.xu.includes('shelter') && !s.hiddenRisk) return '许岚尚未收到故障诊断。你可以先调查并向她说明，或提出隐瞒风险的做法。'
    const condition = social.trust.xu === 'wary' || s.time <= 2 ? 'load_first' : proposed ?? 'deliver'
    social.offer = { target, condition, description: TERM_NAMES[condition] }
    return `许岚提出条件：${TERM_NAMES[condition]}。${condition !== proposed && proposed ? '她提出了反条件。' : ''}这只是提议，尚未借出人手，需你明确接受。`
  }
  if (!social.knowledge.chen.includes('water') || !social.knowledge.chen.includes('shelter')) return '陈默尚未收到储水与故障的依据，请先核实并向他说明。'
  const condition = proposed ?? 'keep_device'
  social.offer = { target, condition, description: TERM_NAMES[condition] }
  return `陈默提出条件：${TERM_NAMES[condition]}。尚未组织协助，需你明确接受。`
}
export function acceptOffer(s: SupplyState): string {
  const social = s.social!, offer = social.offer
  if (!offer) return '尚未有可接受的合作提议。'
  if (offer.condition === 'load_first' && s.cargo === 'none') return '合作条件不足：先完成装车，再接受许岚的提议。'
  if (offer.condition === 'repair_first' && !s.repaired) return '合作条件不足：先完成维修，再接受陈默的提议。'
  const id = `${offer.target}-${offer.condition}`
  if (!social.promises.some(p => p.id === id)) social.promises.push({ ...offer, id, status: 'active' })
  if (offer.target === 'xu') s.team = true
  else s.residents = true
  social.trust[offer.target] = 'cooperative'
  social.offer = undefined
  return `你接受${PERSON_NAMES[offer.target]}的条件，协助现已生效。承诺记录：${TERM_NAMES[offer.condition]}。`
}
export function updatePromises(s: SupplyState): string[] {
  const terminal = s.departed || s.time === 0
  const notes: string[] = []
  for (const p of s.social!.promises) {
    if (p.status !== 'active') continue
    const done = p.target === 'xu' ? s.departed && s.cargo !== 'none' : s.repaired || (s.departed && s.evacuated)
    if (done || terminal) {
      p.status = done ? 'fulfilled' : 'broken'
      if (!done) s.social!.trust[p.target] = 'wary'
      notes.push(`${PERSON_NAMES[p.target]}的承诺${done ? '已兑现' : '未兑现'}：${p.description}`)
    }
  }
  return notes
}
export function exposeRisk(s: SupplyState, source: string): string {
  if (!s.hiddenRisk || s.social!.exposed) return ''
  s.social!.exposed = true
  s.social!.knowledge.xu = [...new Set([...s.social!.knowledge.xu, 'shelter', 'lie'])]
  s.social!.trust.xu = 'wary'
  s.team = false
  s.social!.offer = undefined
  return `许岚通过${source}发现此前的隐瞒，收回后续人手协助；若再次借人，需先装车作为保障。`
}
export function publicPeople(s: SupplyState) {
  return (['xu', 'chen', 'zhou'] as const).map(person => ({ name: PERSON_NAMES[person], known: s.social!.knowledge[person], trust: s.social!.trust[person] }))
}
export function supplyRecap(s: SupplyState): string[] {
  const social = normalizeSocial(s.social)
  return [
    `居民：${s.departed && s.evacuated ? '随车撤离' : s.repaired ? '留守设施已修复' : '避难安全未获保障'}。`,
    `城外：${s.departed && s.cargo !== 'none' ? s.cargo === 'core' ? '获得兼容净水核心' : '获得完整净水设备' : '未收到设备'}。`,
    ...social.promises.map(p => `${PERSON_NAMES[p.target]}：${p.description}（${p.status === 'fulfilled' ? '已兑现' : p.status === 'broken' ? '未兑现' : '待兑现'}）。`),
    social.exposed ? '隐瞒已因实际信息传播被揭露，许岚保持戒备。' : s.hiddenRisk ? '隐瞒尚未被许岚发现，不宣称她已知情。' : '未留下尚未揭露的设施风险隐瞒。',
  ]
}
