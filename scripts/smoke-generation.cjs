// Exercises the running local server without modifying any browser save.
async function main() {
  const history = []
  let status = { network: 50, money: 500 }
  let action = '你在便利店收到一个送错的包裹，寻找失主。'
  for (let turn = 1; turn <= 3; turn++) {
    const start = Date.now()
    const body = { genre: 'urban', turn, status, playerAction: action, history,
      worldConfig: { worldName: '接口稳定性测试', worldSetting: '现代都市，雨夜寻找包裹失主。', protagonistName: '林舟', protagonistTraits: '谨慎', openingScene: action, npcs: [], plotBeats: [], narrativePOV: 'second', storyLength: 'trial' }, storyLength: 'trial' }
    const res = await fetch('http://127.0.0.1:3000/api/story/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(95000) })
    const events = (await res.text()).trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
    const complete = events.find(e => e.type === 'complete')
    if (!complete) throw new Error('No completed narrative: ' + JSON.stringify(events.filter(e => e.type !== 'preview')))
    history.push({ id: `p${turn}`, role: 'player', content: action, turn, timestamp: Date.now() }, { id: `n${turn}`, role: 'narrator', content: complete.data.narrative, turn, timestamp: Date.now() })
    for (const key of Object.keys(status)) status[key] += complete.data.statusDelta[key] ?? 0
    const choicesRes = await fetch('http://127.0.0.1:3000/api/story/choices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ genre: 'urban', lastNarratorText: complete.data.narrative, status, turn, protagonistName: '林舟', narrativePOV: 'second', recentChoices: [] }), signal: AbortSignal.timeout(20000) })
    const out = await choicesRes.json()
    if (!choicesRes.ok || out.choices?.length !== 3) throw new Error('Invalid choices')
    action = out.choices[0]
    console.log(JSON.stringify({ turn, narrativeCharacters: complete.data.narrative.length, choices: out.choices.length, retries: events.filter(e => e.type === 'retry').length, elapsedMs: Date.now() - start }))
  }
}
main().catch(e => { console.error(e.message); process.exitCode = 1 })
