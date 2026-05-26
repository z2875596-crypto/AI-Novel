import { GenreKey } from '@/types/genre'

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null
let currentNodes: AudioNode[] = []
let isPlaying = false

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = audioCtx.createGain()
    masterGain.connect(audioCtx.destination)
    masterGain.gain.value = 0.18
  }
  return audioCtx
}

function stopAll() {
  currentNodes.forEach((node) => {
    try { (node as OscillatorNode).stop?.() } catch {}
    try { node.disconnect() } catch {}
  })
  currentNodes = []
  isPlaying = false
}

/** 创建一个持续的正弦波音调 */
function createTone(
  ctx: AudioContext,
  freq: number,
  gain: number,
  type: OscillatorType = 'sine'
): OscillatorNode {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(masterGain!)
  osc.start()
  currentNodes.push(osc, g)
  return osc
}

/** 创建颤音效果（LFO调制） */
function createVibrato(
  ctx: AudioContext,
  osc: OscillatorNode,
  rate: number,
  depth: number
) {
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = rate
  lfoGain.gain.value = depth
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  lfo.start()
  currentNodes.push(lfo, lfoGain)
}

/** 创建噪声（用于恐怖/悬疑氛围） */
function createNoise(ctx: AudioContext, gain: number): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 400

  const g = ctx.createGain()
  g.gain.value = gain

  source.connect(filter)
  filter.connect(g)
  g.connect(masterGain!)
  source.start()
  currentNodes.push(source, filter, g)
  return source
}

/** 各题材 BGM 生成函数 */
const BGM_GENERATORS: Record<GenreKey, (ctx: AudioContext) => void> = {
  xuanhuan: (ctx) => {
    // 空灵的五声音阶：宫商角徵羽
    const freqs = [220, 246.94, 293.66, 349.23, 392.0]
    freqs.forEach((f, i) => {
      const osc = createTone(ctx, f * 0.5, 0.04, 'sine')
      createVibrato(ctx, osc, 0.2 + i * 0.05, 2)
    })
    // 低沉的持续音
    createTone(ctx, 55, 0.08, 'sine')
    createTone(ctx, 110, 0.04, 'triangle')
  },

  mystery: (ctx) => {
    // 不协和音程营造紧张感
    createTone(ctx, 110, 0.05, 'sine')
    createTone(ctx, 116.54, 0.03, 'sine') // 小二度
    createNoise(ctx, 0.02)
    // 低频脉冲
    const pulse = createTone(ctx, 40, 0.06, 'square')
    createVibrato(ctx, pulse, 0.8, 5)
  },

  ancient: (ctx) => {
    // 古风五声音阶，模拟古琴
    const freqs = [196, 220, 261.63, 293.66, 349.23]
    freqs.forEach((f) => {
      const osc = createTone(ctx, f, 0.04, 'triangle')
      createVibrato(ctx, osc, 0.15, 1)
    })
    createTone(ctx, 98, 0.06, 'sine')
  },

  magic: (ctx) => {
    // 魔幻：高频泛音 + 颤音
    const freqs = [523.25, 659.25, 783.99, 1046.5]
    freqs.forEach((f, i) => {
      const osc = createTone(ctx, f, 0.025, 'sine')
      createVibrato(ctx, osc, 0.4 + i * 0.2, 4)
    })
    createTone(ctx, 65.41, 0.05, 'sine')
    createNoise(ctx, 0.008)
  },

  urban: (ctx) => {
    // 现代：低频律动
    createTone(ctx, 55, 0.08, 'sine')
    createTone(ctx, 110, 0.04, 'triangle')
    createTone(ctx, 220, 0.02, 'sine')
    // 节拍感
    const beat = createTone(ctx, 440, 0.02, 'square')
    createVibrato(ctx, beat, 2, 20)
  },

  horror: (ctx) => {
    // 恐怖：不协和低音 + 噪声
    createTone(ctx, 36.71, 0.08, 'sine')
    createTone(ctx, 38.89, 0.05, 'sine') // 小二度不协和
    createNoise(ctx, 0.04)
    const drone = createTone(ctx, 29.14, 0.06, 'triangle')
    createVibrato(ctx, drone, 0.1, 2)
  },
}

/** 启动题材 BGM */
export function playBGM(genre: GenreKey) {
  if (typeof window === 'undefined') return
  stopAll()
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    BGM_GENERATORS[genre]?.(ctx)
    isPlaying = true
  } catch (e) {
    console.warn('BGM error:', e)
  }
}

/** 停止 BGM */
export function stopBGM() {
  stopAll()
}

/** 设置主音量 0-1 */
export function setBGMVolume(v: number) {
  if (masterGain) {
    masterGain.gain.value = v * 0.18
  }
}

export function getBGMPlaying() {
  return isPlaying
}