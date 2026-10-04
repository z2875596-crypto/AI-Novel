import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateWithRetry } from '../lib/generationRetry'
import { buildStoryMessages } from '../lib/prompts/storyPrompt'
import { quickStartWorld } from '../lib/quickStart'

test('continued story supplies valid JSON assistant history and explicit output instructions', () => {
  const out = buildStoryMessages({ genre: 'urban', worldConfig: quickStartWorld('urban'),
    history: [{ id: '1', role: 'narrator', content: '门卫说："请进"。', timestamp: 1 }],
    playerAction: '进门', status: { network: 50, money: 500 }, turn: 2 })
  assert.equal(JSON.parse(out.messages[0].content).narrative, '门卫说："请进"。')
  assert.match(out.messages.at(-1)!.content, /JSON/)
  assert.doesNotMatch(out.system, /"状态key": 数值变化/)
})

test('invalid first generation retries once and returns only valid result', async () => {
  let calls = 0, retries = 0
  const result = await generateWithRetry(async () => {
    if (++calls === 1) throw new SyntaxError('truncated JSON')
    return 'complete'
  }, new AbortController().signal, () => retries++)
  assert.equal(result, 'complete'); assert.equal(calls, 2); assert.equal(retries, 1)
})
test('failure is bounded to two attempts', async () => {
  let calls = 0
  await assert.rejects(generateWithRetry(async () => { calls++; throw new Error('offline') }, new AbortController().signal, () => {}))
  assert.equal(calls, 2)
})
test('authentication and quota errors are not retried', async () => {
  for (const status of [400, 401, 402, 403]) {
    let calls = 0
    await assert.rejects(generateWithRetry(async () => { calls++; throw { status } }, new AbortController().signal, () => {}))
    assert.equal(calls, 1)
  }
})
test('cancellation prevents retry', async () => {
  const controller = new AbortController(); let calls = 0
  await assert.rejects(generateWithRetry(async () => { calls++; controller.abort(); throw new Error('cancelled') }, controller.signal, () => {}))
  assert.equal(calls, 1)
})
