import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseChoices } from '../lib/parseChoices'

test('empty reasoning-only response and token truncation are failures', () => {
  assert.throws(() => parseChoices('', 'length'))
  assert.throws(() => parseChoices('', 'stop'))
  assert.throws(() => parseChoices('["调查","询问","离开"]', 'length'))
})
test('three complete choices, code fences and brackets inside choices parse correctly', () => {
  assert.deepEqual(parseChoices('```json\n["调查[封条]","询问门卫","前往写字楼"]\n```', 'stop'), ['调查[封条]', '询问门卫', '前往写字楼'])
})
test('incomplete, repeated and malformed choices are rejected', () => {
  for (const raw of ['[]', '["调查"]', '["调查","调查","离开"]', '["调查",{},"离开"]', '["调查"," ","离开"]']) {
    assert.throws(() => parseChoices(raw, 'stop'))
  }
})
