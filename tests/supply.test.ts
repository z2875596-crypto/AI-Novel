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
  const state = run(['inspect_water', 'inspect_shelter', 'find_tools', 'ask_team', 'repair', 'load_device', 'depart'])
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
  const state = run(['deceive_team'])
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
