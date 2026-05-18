'use client'

let currentUtterance: SpeechSynthesisUtterance | null = null

export interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

/** 朗读文本 */
export function speak(text: string, options: TTSOptions = {}) {
  if (typeof window === 'undefined') return
  if (!window.speechSynthesis) return

  // 停止当前朗读
  stop()

  // 清理文本（去掉特殊标记）
  const cleanText = text
    .replace(/\[STATUS_DELTA\][^\n]*/g, '')
    .replace(/\[ENDING\][^\n]*/g, '')
    .trim()

  if (!cleanText) return

  const utterance = new SpeechSynthesisUtterance(cleanText)
  utterance.lang = options.lang ?? 'zh-CN'
  utterance.rate = options.rate ?? 1.0
  utterance.pitch = options.pitch ?? 1.0
  utterance.volume = options.volume ?? 1.0

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

/** 停止朗读 */
export function stop() {
  if (typeof window === 'undefined') return
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  currentUtterance = null
}

/** 是否正在朗读 */
export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false
  return window.speechSynthesis?.speaking ?? false
}