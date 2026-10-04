// Local-only OpenAI-compatible fixture for browser QA; never used by production.
const http = require('node:http')
http.createServer(async (req, res) => {
  let body = ''
  for await (const chunk of req) body += chunk
  try {
    const input = JSON.parse(body)
    const system = input.messages?.[0]?.content ?? ''
    if (input.stream) {
      const turn = Number(/当前是第\s*(\d+)\s*回合/.exec(system)?.[1] ?? 1)
      const content = JSON.stringify({
        narrative: `【本地模拟验收 · 第 ${turn} 回合】雨点落在包裹的封条上。你发现收件地址被人改过，门卫递来一张值班记录。${turn >= 3 ? '你核对了记录，把包裹交还失主，这场雨夜调查终于结束。' : '现在，你可以核对记录，或向门卫询问来访者。'}`,
        statusDelta: { network: 3 }, ending: turn >= 3 ? { type: 'good', title: '雨夜归还' } : null,
        clues: [], memoryHint: '核实包裹线索',
      })
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      for (let i = 0; i < content.length; i += 24) {
        res.write('data: ' + JSON.stringify({ id: 'qa', object: 'chat.completion.chunk', created: 1,
          model: 'local-fixture', choices: [{ index: 0, delta: { content: content.slice(i, i + 24) }, finish_reason: null }] }) + '\n\n')
      }
      res.write('data: ' + JSON.stringify({ id: 'qa', object: 'chat.completion.chunk', created: 1,
        model: 'local-fixture', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] }) + '\n\n')
      res.end('data: [DONE]\n\n')
    } else {
      const content = JSON.stringify(['核对门卫的值班记录', '询问包裹送达的时间', '检查封条留下的痕迹'])
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: 'qa', object: 'chat.completion', created: 1, model: 'local-fixture',
        choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }] }))
    }
  } catch { res.writeHead(400); res.end('invalid fixture input') }
}).listen(4011, '127.0.0.1', () => console.log('Local model fixture: http://127.0.0.1:4011/v1'))
