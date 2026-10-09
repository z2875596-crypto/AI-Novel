import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialSupply, resolveSupply, supplyEnding, validateSupply, validatePlan } from '../lib/supplyGame'
import { quickStartWorld } from '../lib/quickStart'

function run(actions: Parameters<typeof resolveSupply>[1][]) {
  let state = initialSupply()
  for (const action of actions) state = resolveSupply(state, action).state
  return state
}
test('cooperation makes the six-unit safe delivery route possible', () => {
  const state = run(['inspect_water', 'inspect_shelter', 'find_tools', 'ask_team', 'accept_offer', 'repair', 'load_device', 'depart'])
  assert.equal(state.time, 0)
  assert.equal(state.repaired, true)
  assert.equal(state.departed, true)
  assert.equal(supplyEnding(state)?.type, 'good')
})
test('missing tools and impossible time do not execute repairs', () => {
  let state = run(['inspect_shelter'])
  const failed = resolveSupply(state, 'repair')
  assert.equal(failed.state.time, state.time)
  assert.equal(failed.state.repaired, false)
  state = { ...state, tools: true, time: 1 }
  assert.equal(resolveSupply(state, 'repair').state.repaired, false)
  assert.equal(resolveSupply(state, 'repair').state.time, 1)
})
test('investigation reveals fixed facts once; talking never creates resources', () => {
  const state = run(['inspect_water', 'inspect_water', 'talk', 'talk'])
  assert.equal(state.time, 5)
  assert.deepEqual(state.known, ['water'])
  assert.equal(state.cargo, 'none')
})
test('core requires compatibility and tools; cannot stack cargo', () => {
  assert.equal(run(['split_core']).cargo, 'none')
  const state = run(['inspect_vehicle', 'find_tools', 'split_core', 'load_device', 'depart'])
  assert.equal(state.cargo, 'core')
  assert.equal(state.time, 1)
  assert.equal(supplyEnding(state)?.type, 'bad')
})
test('storm ends uncompleted arrangements; future promises do not deliver equipment', () => {
  const state = { ...initialSupply(), time: 0, team: true }
  assert.equal(supplyEnding(state)?.type, 'bad')
  assert.equal(resolveSupply(state, 'load_device').state.cargo, 'none')
})
test('pending plan and state round-trip independently without mutation', () => {
  const world = quickStartWorld('apocalypse')
  assert.ok(world.supply)
  world.supply.pending = { steps: ['find_tools', 'repair'], explanation: '找工具后维修' }
  const restored = validateSupply(JSON.parse(JSON.stringify(world.supply)))
  resolveSupply(restored, 'find_tools')
  assert.equal(world.supply.tools, false)
  assert.deepEqual(restored.pending?.steps, ['find_tools', 'repair'])
  assert.throws(() => validateSupply({ ...restored, time: -1 }))
  assert.throws(() => validatePlan({ steps: ['invent_vehicle'], explanation: '' }))
})

test('creative core route evacuates residents and supplies the camp within six units', () => {
  const state = run(['inspect_vehicle', 'find_tools', 'split_core', 'evacuate', 'depart'])
  assert.equal(state.time, 0)
  assert.equal(state.repaired, false)
  assert.equal(state.evacuated, true)
  assert.equal(supplyEnding(state)?.type, 'good')
})
test('hidden risk remains a recorded consequence, confession does not invent a diagnosis', () => {
  const state = run(['deceive_team', 'accept_offer'])
  assert.equal(state.team, true)
  assert.equal(state.hiddenRisk, true)
  const confessed = resolveSupply(state, 'confess').state
  assert.equal(confessed.hiddenRisk, false)
  assert.equal(confessed.team, false)
})
test('API proposes before spending and commits only the confirmed plan', async () => {
  process.env.DEEPSEEK_API_KEY = 'local-test-only'
  const { deepseek } = await import('../lib/deepseek')
  const { supplyResponse } = await import('../lib/supplyResponse')
  const original = deepseek.chat.completions.create
  const fake = async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ narrative: '【模拟测试】许岚等待你的安排。' }) } }] })
  deepseek.chat.completions.create = fake as unknown as typeof original
  try {
    const worldConfig = quickStartWorld('apocalypse')
    const call = async (action: string) => {
      const response = await supplyResponse(new Request('http://localhost/api/story/stream'), { worldConfig, history: [], playerAction: action, action })
      const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line))
      const complete = events.find(event => event.type === 'complete')
      assert.ok(complete)
      worldConfig.supply = complete.data.supply
      return complete.data
    }
    const proposal = await call('装运一套完整设备')
    assert.equal(proposal.supply.time, 6)
    assert.equal(proposal.supply.cargo, 'none')
    assert.deepEqual(proposal.supply.pending.steps, ['load_device'])
    await call('取消当前方案')
    assert.equal(worldConfig.supply?.time, 6)
    await call('装运一套完整设备')
    await call('确认执行当前方案')
    assert.equal(worldConfig.supply?.time, 5)
    assert.equal(worldConfig.supply?.cargo, 'device')
  } finally { deepseek.chat.completions.create = original }
})


test('requesting cooperation creates an offer, only acceptance provides people', () => {
  const requested = run(['inspect_shelter', 'ask_team'])
  assert.equal(requested.team, false)
  assert.equal(requested.social?.offer?.condition, 'deliver')
  assert.equal(requested.social?.promises.length, 0)
  const accepted = resolveSupply(requested, 'accept_offer').state
  assert.equal(accepted.team, true)
  assert.equal(accepted.social?.promises[0].status, 'active')
  assert.equal(accepted.time, requested.time)
})
test('wary leader counters with loading first and cannot grant free people', () => {
  let state = run(['inspect_shelter'])
  state.social!.trust.xu = 'wary'
  state = resolveSupply(state, 'ask_team', { target: 'xu', condition: 'deliver' }).state
  assert.equal(state.social?.offer?.condition, 'load_first')
  assert.equal(resolveSupply(state, 'accept_offer').state.team, false)
  state = resolveSupply(state, 'load_device').state
  assert.equal(resolveSupply(state, 'accept_offer').state.team, true)
})
test('concealed risk is not revealed automatically when the vehicle departs', () => {
  const state = run(['deceive_team', 'accept_offer', 'load_device', 'depart'])
  assert.equal(state.social?.exposed, false)
  assert.equal(state.social?.knowledge.xu.includes('lie'), false)
  assert.equal(state.social?.promises[0].status, 'fulfilled')
})
test('crew report provides evidence, retracts future help and changes negotiation', () => {
  let state = run(['inspect_shelter', 'find_tools', 'deceive_team', 'accept_offer', 'repair'])
  assert.equal(state.repaired, true)
  assert.equal(state.social?.exposed, true)
  assert.equal(state.social?.trust.xu, 'wary')
  assert.equal(state.team, false)
  state = resolveSupply(state, 'ask_team').state
  assert.equal(state.social?.offer?.condition, 'load_first')
})
test('private investigation is not automatically shared with all characters', () => {
  let state = run(['inspect_shelter', 'inspect_water'])
  assert.equal(state.social?.knowledge.xu.includes('shelter'), false)
  assert.equal(state.social?.knowledge.chen.includes('water'), false)
  state = resolveSupply(state, 'ask_residents').state
  assert.equal(state.social?.knowledge.chen.includes('water'), true)
  assert.equal(state.social?.knowledge.xu.includes('shelter'), false)
})
test('unfulfilled delivery becomes a broken promise at the ending', () => {
  const state = run(['inspect_shelter', 'ask_team', 'accept_offer', 'depart'])
  assert.equal(state.social?.promises[0].status, 'broken')
  assert.equal(state.social?.trust.xu, 'wary')
})
test('plan stops at a missing condition and retains remaining steps for editing', async () => {
  const { executeSupplyPlan, editSupplyPlan } = await import('../lib/supplyPlan')
  const plan = { steps: ['repair', 'load_device'] as const, explanation: '维修后运输' }
  const original = run(['inspect_shelter'])
  const stopped = executeSupplyPlan(original, { ...plan, steps: [...plan.steps] }).state
  assert.equal(stopped.time, original.time)
  assert.deepEqual(stopped.pending?.steps, ['repair', 'load_device'])
  const edited = editSupplyPlan(stopped, '在方案前加入寻找工具')
  assert.deepEqual(edited.pending?.steps, ['find_tools', 'repair', 'load_device'])
  assert.equal(edited.tools, false)
  assert.equal(edited.time, original.time)
})
test('negotiation pauses a plan and acceptance preserves the unfinished operations', async () => {
  const { executeSupplyPlan } = await import('../lib/supplyPlan')
  const state = run(['inspect_shelter', 'find_tools'])
  const proposed = executeSupplyPlan(state, { steps: ['ask_team', 'repair', 'load_device'], explanation: '争取人手后维修装车', negotiation: { target: 'xu', condition: 'deliver' } }).state
  assert.equal(proposed.team, false)
  assert.deepEqual(proposed.pending?.steps, ['repair', 'load_device'])
  const accepted = executeSupplyPlan(proposed, { steps: ['accept_offer'], explanation: '接受' }).state
  assert.equal(accepted.team, true)
  assert.deepEqual(accepted.pending?.steps, ['repair', 'load_device'])
  const executed = executeSupplyPlan(accepted, accepted.pending!).state
  assert.equal(executed.repaired, true)
  assert.equal(executed.cargo, 'device')
})
test('legacy saves migrate existing cooperation without exposing a secret', () => {
  const old = { ...initialSupply(), social: undefined, team: true, hiddenRisk: true }
  const restored = validateSupply(JSON.parse(JSON.stringify(old)))
  assert.equal(restored.team, true)
  assert.equal(restored.social?.promises[0].status, 'active')
  assert.equal(restored.social?.exposed, false)
  assert.equal(restored.social?.knowledge.xu.includes('shelter'), false)
})
test('invalid negotiation cannot assign another character resources or terms', () => {
  assert.throws(() => validatePlan({ steps: ['ask_team'], explanation: '', negotiation: { target: 'xu', condition: 'keep_device' } }))
  assert.throws(() => validatePlan({ steps: ['repair'], explanation: '', negotiation: { target: 'xu', condition: 'deliver' } }))
})
