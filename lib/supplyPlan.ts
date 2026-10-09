import { ACTION_LABELS, resolveSupply, supplyEnding, validatePlan, validateSupply, type SupplyPlan, type SupplyState } from './supplyGame'
export const PLAN_EDITS = ['移除方案第一步', '将方案最后一步移到最前', '在方案前加入寻找工具', '在方案前加入争取居民协助'] as const
export function editSupplyPlan(input: SupplyState, command: string): SupplyState {
  const state = validateSupply(input)
  if (!state.pending) throw new Error('没有待调整的方案')
  const steps = [...state.pending.steps]
  if (command === PLAN_EDITS[0]) steps.shift()
  else if (command === PLAN_EDITS[1]) steps.unshift(steps.pop()!)
  else if (command === PLAN_EDITS[2]) steps.unshift('find_tools')
  else if (command === PLAN_EDITS[3]) steps.unshift('ask_residents')
  else throw new Error('未知的方案调整')
  const negotiation = state.pending.negotiation
  state.pending = steps.length ? validatePlan({ ...state.pending, steps,
    negotiation: negotiation && steps.includes(negotiation.target === 'xu' ? 'ask_team' : 'ask_residents') ? negotiation : undefined }) : undefined
  return state
}
export function previewSupplyPlan(input: SupplyState, plan: SupplyPlan): string[] {
  let state = validateSupply(input)
  const result: string[] = []
  for (const step of plan.steps) {
    const next = resolveSupply(state, step, plan.negotiation)
    result.push(`${ACTION_LABELS[step]}：预计耗时 ${state.time - next.state.time}${next.blocked ? '，条件不足，需调整' : ''}`)
    state = next.state
    if (next.blocked || state.social?.offer || supplyEnding(state)) break
  }
  return result
}
export function executeSupplyPlan(input: SupplyState, plan: SupplyPlan): { state: SupplyState; feedback: string } {
  let state = validateSupply(input)
  const oldPending = state.pending
  state.pending = undefined
  const effects: string[] = []
  for (let index = 0; index < plan.steps.length; index++) {
    const result = resolveSupply(state, plan.steps[index], plan.negotiation)
    state = result.state
    effects.push(result.feedback)
    if (result.blocked || state.social?.offer) {
      const remaining = plan.steps.slice(index + (result.blocked ? 0 : 1))
      if (remaining.length) state.pending = validatePlan({ ...plan, steps: remaining,
        negotiation: plan.negotiation && remaining.includes(plan.negotiation.target === 'xu' ? 'ask_team' : 'ask_residents') ? plan.negotiation : undefined })
      break
    }
    if (supplyEnding(state)) break
  }
  if (oldPending && plan.steps.length === 1 && ['accept_offer', 'reject_offer'].includes(plan.steps[0])) state.pending = oldPending
  return { state, feedback: effects.join('；') }
}
