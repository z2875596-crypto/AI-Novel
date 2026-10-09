import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { NarrativeResponse } from '../types/narrative'

const memory = new Map<string, string>()
const storage = { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => { memory.set(k, v) }, removeItem: (k: string) => { memory.delete(k) } }
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
Object.defineProperty(globalThis, 'window', { value: {}, configurable: true })

// Dynamic imports ensure Zustand sees the isolated test storage.
async function main() {
const { useGameStore: game } = await import('../stores/gameStore')
const { useGenreStore: genre } = await import('../stores/genreStore')
const { useWorldStore: world } = await import('../stores/worldStore')
const { useClueStore: clues } = await import('../stores/clueStore')
const { useMemoryStore: memories } = await import('../stores/memoryStore')
const { useSummaryStore: summaries } = await import('../stores/summaryStore')
const { useRelationshipStore: relationships } = await import('../stores/relationshipStore')
const { useStyleStore: styles } = await import('../stores/styleStore')
const { buildSaveRecord, captureSnapshot, restoreSave, rewindTo, resetAuxiliaryState } = await import('../lib/session')
const { runStory, retryChoices } = await import('../lib/storyRunner')
const { upsertSave, loadSaves, getLatestSave } = await import('../lib/saveManager')
const { quickStartWorld } = await import('../lib/quickStart')
const { validateNarrative, narrativePreview } = await import('../lib/storyProtocol')
const { getInitialStatus } = await import('../lib/statusBar')

const feedback = { phase: () => {}, warning: () => {}, delta: () => {} }
const data: NarrativeResponse = { narrative: '你找到了一扇门。', statusDelta: { network: 3 }, ending: null, clues: [], memoryHint: '发现门' }
function stream(value = data) { return new Response(JSON.stringify({ type: 'preview', text: value.narrative }) + '\n' + JSON.stringify({ type: 'complete', data: value }) + '\n') }
function reset() {
  memory.clear(); resetAuxiliaryState(); genre.getState().setGenre('urban')
  world.getState().setWorldConfig(quickStartWorld('urban')); game.getState().resetGame(getInitialStatus('urban'))
  globalThis.fetch = (async url => String(url).includes('/stream') ? stream() : Response.json({ choices: ['敲门', '观察'] })) as typeof fetch
}
beforeEach(reset)

test('reading continuation skips choice requests, preserves directions and restores reading state', async () => {
  game.getState().setPlotHint('逐渐揭露人物的秘密')
  const requests: string[] = []
  globalThis.fetch = (async (url, init) => {
    requests.push(String(url))
    if (String(url).includes('/stream')) {
      assert.equal(JSON.parse(String(init?.body)).inputMode, 'continue')
      assert.equal(JSON.parse(String(init?.body)).delegateDecision, false)
      return stream({ ...data, interaction: 'reading' })
    }
    return Response.json({ updates: [] })
  }) as typeof fetch
  await runStory('继续阅读', false, new AbortController().signal, feedback, 'continue')
  assert.equal(game.getState().turn, 1)
  assert.equal(game.getState().messages.length, 1)
  assert.equal(game.getState().messages[0].role, 'narrator')
  assert.deepEqual(game.getState().currentChoices, [])
  assert.equal(requests.some(url => url.includes('/choices')), false)
  assert.equal(game.getState().plotHint, '逐渐揭露人物的秘密')
  const saved = buildSaveRecord()
  game.getState().setPlotHint('')
  restoreSave(saved)
  assert.equal(game.getState().messages.at(-1)?.interaction, 'reading')
  assert.equal(game.getState().plotHint, '逐渐揭露人物的秘密')
  game.getState().setPlotHint('下一章出现一位旧友')
  await runStory('继续阅读', false, new AbortController().signal, feedback, 'continue')
  rewindTo(1)
  assert.equal(game.getState().plotHint, '逐渐揭露人物的秘密')
  assert.equal(game.getState().messages.at(-1)?.interaction, 'reading')
})

test('choice scenes still prepare options and retain the role action', async () => {
  globalThis.fetch = (async url => String(url).includes('/stream')
    ? stream({ ...data, interaction: 'choice' }) : Response.json({ choices: ['追问', '离开'] })) as typeof fetch
  await runStory('我敲门', false, new AbortController().signal, feedback)
  assert.equal(game.getState().messages[0].content, '我敲门')
  assert.deepEqual(game.getState().currentChoices, ['追问', '离开'])
})

test('invalid reading classifications never commit a turn; old responses remain valid', async () => {
  assert.equal(validateNarrative(data).interaction, undefined)
  assert.throws(() => validateNarrative({ ...data, interaction: ['reading'] }))
  globalThis.fetch = (async () => stream({ ...data, interaction: 'invalid' } as unknown as NarrativeResponse)) as typeof fetch
  await assert.rejects(runStory('继续阅读', false, new AbortController().signal, feedback, 'continue'))
  assert.equal(game.getState().turn, 0)
  assert.equal(game.getState().messages.length, 0)
})


test('supply state commits with the turn, restores and rewinds with its own branch', async () => {
  genre.getState().setGenre('apocalypse')
  world.getState().setWorldConfig(quickStartWorld('apocalypse'))
  game.getState().resetGame(getInitialStatus('apocalypse'))
  const { resolveSupply } = await import('../lib/supplyGame')
  let supply = world.getState().worldConfig.supply!
  globalThis.fetch = (async url => {
    if (String(url).includes('/stream')) {
      supply = resolveSupply(supply, 'inspect_water').state
      return stream({ ...data, statusDelta: {}, supply })
    }
    return Response.json({ updates: [] })
  }) as typeof fetch
  await runStory('调查居民储水', false, new AbortController().signal, feedback)
  const first = buildSaveRecord()
  assert.equal(first.snapshot?.worldConfig.supply?.time, 5)
  supply = resolveSupply(supply, 'inspect_shelter').state
  await runStory('诊断排水设施', false, new AbortController().signal, feedback)
  assert.equal(world.getState().worldConfig.supply?.time, 4)
  rewindTo(1)
  assert.equal(world.getState().worldConfig.supply?.time, 5)
  assert.deepEqual(world.getState().worldConfig.supply?.known, ['water'])
  restoreSave(first)
  assert.equal(world.getState().worldConfig.supply?.time, 5)
})

test('social offers, promises and unfinished plans restore with their own snapshot', async () => {
  const { resolveSupply } = await import('../lib/supplyGame')
  genre.getState().setGenre('apocalypse')
  world.getState().setWorldConfig(quickStartWorld('apocalypse'))
  game.getState().resetGame(getInitialStatus('apocalypse'))
  let state = resolveSupply(world.getState().worldConfig.supply!, 'inspect_shelter').state
  state = resolveSupply(state, 'ask_team').state
  state.pending = { steps: ['repair', 'load_device'], explanation: '协商之后继续' }
  world.getState().updateField('supply', state)
  const original = buildSaveRecord()
  const accepted = resolveSupply(state, 'accept_offer').state
  world.getState().updateField('supply', accepted)
  assert.equal(world.getState().worldConfig.supply?.social?.promises.length, 1)
  restoreSave(original)
  assert.equal(world.getState().worldConfig.supply?.team, false)
  assert.equal(world.getState().worldConfig.supply?.social?.offer?.target, 'xu')
  assert.equal(world.getState().worldConfig.supply?.social?.promises.length, 0)
  assert.deepEqual(world.getState().worldConfig.supply?.pending?.steps, ['repair', 'load_device'])
})

test('invalid, empty, and nonfinite model output is rejected; preview decodes escapes', () => {
  for (const v of [null, {}, { ...data, narrative: '' }, { ...data, statusDelta: { hp: NaN } }, { ...data, ending: { type: 'invalid', title: '结束' } }]) assert.throws(() => validateNarrative(v))
  assert.equal(narrativePreview('{"narrative":"你说：\\"好\\"\\n然后'), '你说："好"\n然后')
})

test('HTTP failure, truncated stream, malformed JSON and model error never advance or save', async () => {
  for (const response of [new Response('error', { status: 500 }), new Response('{"type":"preview","text":"片段"}\n'), new Response('broken\n'), new Response('{"type":"error"}\n')]) {
    globalThis.fetch = async () => response
    const before = game.getState()
    await assert.rejects(runStory('开门', false, new AbortController().signal, feedback))
    assert.equal(game.getState().turn, before.turn); assert.deepEqual(game.getState().messages, before.messages)
    assert.deepEqual(game.getState().status, before.status); assert.equal(loadSaves().length, 0)
    assert.equal(game.getState().isStreaming, false)
  }
})

test('successful action saves player + narrator once, full history and updated choices', async () => {
  await runStory('观察房门', false, new AbortController().signal, feedback)
  const save = buildSaveRecord()
  assert.equal(save.turn, 1); assert.deepEqual(save.recentHistory.map(m => m.role), ['player', 'narrator'])
  assert.deepEqual(save.currentChoices, ['敲门', '观察']); assert.equal(save.checkpoints?.length, 1)
  assert.equal(loadSaves()[0].recentHistory[0].content, '观察房门')
  assert.equal(save.statusSnapshot.network, 53)
})

test('choice failure preserves successful narrative and permits choice-only retry', async () => {
  globalThis.fetch = (async url => String(url).includes('/stream') ? stream() : new Response('', { status: 500 })) as typeof fetch
  await runStory('观察', false, new AbortController().signal, feedback)
  assert.equal(game.getState().turn, 1); assert.equal(loadSaves()[0].turn, 1)
  globalThis.fetch = async () => Response.json({ choices: ['重试后的选项'] })
  await retryChoices(new AbortController().signal, feedback)
  assert.equal(game.getState().turn, 1); assert.equal(game.getState().messages.length, 2)
  assert.deepEqual(game.getState().currentChoices, ['重试后的选项'])
})

test('status feedback reflects actual clamped change, not an invalid model claim', async () => {
  game.setState({ status: { network: 98, money: 500 } })
  globalThis.fetch = (async url => String(url).includes('/stream') ? stream({ ...data, statusDelta: { network: 100, unknown: 999 } }) : Response.json({ choices: ['继续'] })) as typeof fetch
  let shown: Record<string, number> = {}
  await runStory('行动', false, new AbortController().signal, { ...feedback, delta: value => { shown = value } })
  assert.equal(game.getState().status.network, 100); assert.deepEqual(shown, { network: 2 })
  assert.deepEqual(game.getState().messages.at(-1)?.statusDelta, { network: 2 })
})

test('duplicate action and late responses after a story switch cannot write into new story', async () => {
  let release!: (r: Response) => void
  globalThis.fetch = () => new Promise(resolve => { release = resolve })
  const pending = runStory('调查', false, new AbortController().signal, feedback)
  await runStory('重复点击', false, new AbortController().signal, feedback)
  game.getState().resetGame({ trust: 7 })
  const id = game.getState().sessionId
  release(stream()); await pending
  assert.equal(game.getState().sessionId, id); assert.equal(game.getState().turn, 0)
  assert.equal(loadSaves().length, 0)
})

test('cancelled response never commits', async () => {
  const controller = new AbortController()
  globalThis.fetch = async () => { controller.abort(); return stream() }
  await runStory('观察', false, controller.signal, feedback)
  assert.equal(game.getState().turn, 0); assert.equal(loadSaves().length, 0)
})

test('late cleanup from a cancelled request cannot unlock a newer request in the same story', async () => {
  const releases: Array<(response: Response) => void> = []
  globalThis.fetch = ((url: string) => String(url).includes('/stream')
    ? new Promise<Response>(resolve => releases.push(resolve))
    : Promise.resolve(Response.json({ choices: ['继续'] }))) as typeof fetch
  const oldController = new AbortController()
  const old = runStory('旧请求', false, oldController.signal, feedback)
  oldController.abort(); game.setState({ isStreaming: false, activeRequestId: '' })
  const next = runStory('新请求', false, new AbortController().signal, feedback)
  releases[0](stream()); await old
  assert.equal(game.getState().isStreaming, true)
  releases[1](stream()); await next
  assert.equal(game.getState().turn, 1); assert.equal(game.getState().messages[0].content, '新请求')
})

test('same-name same-turn saves stay isolated; restoring resets all auxiliary stores', () => {
  game.setState({ turn: 2, messages: [{ id: 'a', role: 'narrator', content: '故事 A', timestamp: 1, turn: 2 }] })
  styles.getState().setPreset('concise')
  const a = buildSaveRecord(); upsertSave(a)
  game.getState().resetGame({}); game.setState({ turn: 2, messages: [{ id: 'b', role: 'narrator', content: '故事 B', timestamp: 2, turn: 2 }] })
  const b = buildSaveRecord(); upsertSave(b)
  assert.notEqual(a.id, b.id); assert.equal(loadSaves().length, 2)
  memories.getState().addEvent({ id: 'future', turn: 10, type: 'secret_revealed', subject: 'future', description: 'future', importance: 'high' })
  restoreSave(a)
  assert.equal(game.getState().messages[0].content, '故事 A'); assert.equal(memories.getState().events.length, 0)
  assert.equal(styles.getState().styleConfig.preset, 'concise')
  assert.deepEqual(clues.getState().clues, []); assert.deepEqual(relationships.getState().relationships, [])
})

test('rewind restores historical state and branch autosave never overwrites parent', async () => {
  await runStory('第一步', false, new AbortController().signal, feedback)
  const first = captureSnapshot(), parentId = game.getState().sessionId
  await runStory('第二步', false, new AbortController().signal, feedback)
  rewindTo(1)
  assert.notEqual(game.getState().sessionId, parentId); assert.equal(game.getState().parentId, parentId)
  assert.deepEqual(game.getState().status, first.status); assert.deepEqual(memories.getState().events, first.memoryEvents)
  await runStory('另一条路', false, new AbortController().signal, feedback)
  const parent = loadSaves().find(s => s.id === parentId)!
  assert.equal(parent.recentHistory[2].content, '第二步')
  assert.equal(loadSaves().find(s => s.id !== parentId)!.recentHistory[2].content, '另一条路')
})

test('ending persists through restore and refuses further actions', async () => {
  globalThis.fetch = async () => stream({ ...data, ending: { type: 'good', title: '平安归来' } } as typeof data)
  await runStory('返回', false, new AbortController().signal, feedback)
  const save = buildSaveRecord(); restoreSave(save)
  globalThis.fetch = async () => { throw new Error('must not request') }
  await runStory('继续', false, new AbortController().signal, feedback)
  assert.equal(game.getState().turn, 1); assert.equal(game.getState().ending?.title, '平安归来')
})

test('chapter boundary retains full messages and refresh never appears to be a new opening', async () => {
  game.setState({ turn: 7 })
  globalThis.fetch = (async url => String(url).includes('/stream') ? stream() : String(url).includes('/summary') ? Response.json({ summary: '第一章摘要', chapterTitle: '抵达' }) : Response.json({ choices: ['继续'] })) as typeof fetch
  await runStory('最后一步', false, new AbortController().signal, feedback)
  assert.equal(game.getState().messages.length, 2); assert.equal(summaries.getState().summaries.length, 1)
  const save = buildSaveRecord(); restoreSave(save)
  assert.equal(game.getState().turn, 8); assert.equal(game.getState().messages.length, 2)
})

test('old saves restore only their own available history and cannot fabricate rewind snapshots', () => {
  const save = buildSaveRecord(); delete save.schemaVersion; delete save.snapshot; delete save.checkpoints
  save.turn = 4; save.recentHistory = [{ id: 'legacy', role: 'narrator', content: '旧故事', timestamp: 1 }]
  restoreSave(save); assert.equal(game.getState().messages[0].content, '旧故事')
  assert.throws(() => rewindTo(2)); assert.deepEqual(game.getState().checkpoints, [])
})

test('storage cap and quota failures preserve existing records; recent save sorts by updatedAt', () => {
  const record = buildSaveRecord()
  for (let i = 0; i < 20; i++) upsertSave({ ...record, id: String(i), updatedAt: i })
  assert.throws(() => upsertSave({ ...record, id: 'overflow' })); assert.equal(loadSaves().length, 20)
  upsertSave({ ...record, id: '0', updatedAt: 100 }); assert.equal(getLatestSave()?.id, '0')
  const original = storage.setItem
  storage.setItem = () => { throw new Error('quota') }
  assert.throws(() => upsertSave({ ...record, id: '0' }), /存档未保存/)
  storage.setItem = original
  assert.equal(getLatestSave()?.updatedAt, 100)
})

test('quota exhaustion during generation preserves in-memory success and reports unsaved state', async () => {
  const original = storage.setItem, warnings: string[] = []
  storage.setItem = () => { throw new Error('quota') }
  try {
    await runStory('敲门', false, new AbortController().signal, { ...feedback, warning: text => warnings.push(text) })
    assert.equal(game.getState().turn, 1); assert.equal(game.getState().messages.length, 2)
    assert.equal(loadSaves().length, 0); assert.ok(warnings.some(text => text.includes('存档未保存')))
  } finally { storage.setItem = original }
})

test('damaged save JSON is not silently overwritten', () => {
  storage.setItem('ai-novel-saves', '{broken')
  assert.throws(() => upsertSave(buildSaveRecord()), /停止写入/)
  assert.equal(storage.getItem('ai-novel-saves'), '{broken')
})
}
void main()
