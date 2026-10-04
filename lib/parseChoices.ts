export function parseChoices(raw: string, finishReason: string | null): string[] {
  if (finishReason === 'length') throw new Error('选项输出被截断')
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const value: unknown = JSON.parse(text)
  if (!Array.isArray(value) || value.length < 3 || value.length > 4 ||
    value.some(c => typeof c !== 'string' || !c.trim())) throw new Error('选项格式不完整')
  const choices = value.map(c => (c as string).trim())
  if (new Set(choices).size !== choices.length) throw new Error('选项重复')
  return choices
}
