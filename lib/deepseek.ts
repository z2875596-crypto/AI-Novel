import OpenAI from 'openai'

// 懒加载：延迟到真正调用时才初始化，避免构建时因环境变量缺失报错
let _client: OpenAI | null = null

export function getDeepseekClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY ?? '',
      baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
    })
  }
  return _client
}

// 保持向后兼容，现有代码里的 deepseek.xxx 调用不需要改
export const deepseek = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getDeepseekClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'
