import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { supplyResponse } from '../lib/supplyResponse'
import { quickStartWorld } from '../lib/quickStart'
import { DEEPSEEK_MODEL } from '../lib/deepseek'
import type { Message } from '../types/game'

// Uses the real production handler and configured model. Never records credentials.
const scenarios: Record<string, string[]> = {
  cooperation: ['调查居民储水', '诊断排水设施', '寻找维修工具', '向许岚争取维修人手', '接受当前合作条件', '修复排水设施', '确认执行当前方案', '装运一套完整设备', '确认执行当前方案', '执行最终安排，救援车出发', '确认执行当前方案'],
  evacuation: ['先检查这辆车，问周宁能不能只带净水核心，把空间留给居民。', '寻找维修工具', '把净水核心拆下来装车，接着让居民上车，最后出发去城外。', '确认执行当前方案'],
  recovery: ['我能不能再找一辆车，或者先把设备送走再回来接人？先别执行。', '修复排水设施', '确认执行当前方案', '在方案前加入寻找工具', '确认执行当前方案', '取消当前方案', '诊断排水设施', '向许岚争取维修人手', '我答应把净水设备送到城外，接受许岚刚才的条件。', '修复排水设施', '确认执行当前方案', '装运一套完整设备', '确认执行当前方案', '执行最终安排，救援车出发', '确认执行当前方案'],
  concealment: ['诊断排水设施', '寻找维修工具', '隐瞒设施风险以争取队员', '确认执行当前方案', '接受当前合作条件', '修复排水设施', '确认执行当前方案', '装运一套完整设备', '确认执行当前方案', '执行最终安排，救援车出发', '确认执行当前方案'],
  counteroffer: ['诊断排水设施', '寻找维修工具', '我想向许岚提出先装车再借维修人手的合作条件，现在只谈条件，不执行装车。', '接受当前合作条件', '装运一套完整设备', '确认执行当前方案', '接受当前合作条件', '修复排水设施', '确认执行当前方案', '执行最终安排，救援车出发', '确认执行当前方案'],
  partial: ['装运一套完整设备', '确认执行当前方案', '执行最终安排，救援车出发', '确认执行当前方案'],
}

async function main() {
  const selected = process.argv[2] ?? 'cooperation'
  if (!scenarios[selected]) throw new Error('Unknown scenario')
  const worldConfig = quickStartWorld('apocalypse')
  const history: Message[] = []
  const records: unknown[] = []
  const dir = resolve('artifacts', 'supply-playtest')
  await mkdir(dir, { recursive: true })
  const output = resolve(dir, `${selected}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  for (const [index, action] of ['开始故事', ...scenarios[selected]].entries()) {
    const started = Date.now()
    const response = await supplyResponse(new Request('http://localhost/api/story/stream'), {
      worldConfig, history, playerAction: action, opening: index === 0,
    })
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line))
    const data = events.find(event => event.type === 'complete')?.data
    const record = { turn: index, action, elapsedMs: Date.now() - started, quality: events.find(event => event.type === 'quality'), data, error: events.find(event => event.type === 'error') }
    records.push(record)
    await writeFile(output, JSON.stringify({ model: DEEPSEEK_MODEL, scenario: selected, records }, null, 2))
    console.log(JSON.stringify({ turn: index, action, elapsedMs: record.elapsedMs, time: data?.supply.time, ending: data?.ending?.title, error: record.error }))
    if (!data) throw new Error('Real model playtest failed; transcript saved')
    worldConfig.supply = data.supply
    if (index) history.push({ id: crypto.randomUUID(), role: 'player', content: action, turn: index, timestamp: Date.now() })
    history.push({ id: crypto.randomUUID(), role: 'narrator', content: data.narrative, turn: index, timestamp: Date.now() })
    if (data.ending) break
  }
  assert.equal(worldConfig.supply?.departed, true, 'Route must reach departure')
  assert.equal(worldConfig.supply?.cargo === 'device' || worldConfig.supply?.cargo === 'core', true)
  if (selected === 'evacuation') assert.equal(worldConfig.supply?.evacuated, true)
  else assert.equal(worldConfig.supply?.repaired, selected !== 'partial')
  if (selected === 'concealment') assert.equal(worldConfig.supply?.social?.exposed, true)
  if (selected === 'counteroffer') assert.ok(worldConfig.supply?.social?.promises.some(p => p.condition === 'load_first' && p.status === 'fulfilled'))
  console.log(`Transcript: ${output}`)
}
main().catch(() => { console.error('Playtest failed; check the saved transcript and model configuration.'); process.exitCode = 1 })
