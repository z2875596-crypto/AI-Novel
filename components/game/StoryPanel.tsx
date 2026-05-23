'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import SummaryCard from './SummaryCard'

// 标点符号停顿时间（ms）
const PUNCTUATION_DELAY = 55
const CHAR_DELAY = 22

const PUNCTUATION_SET = new Set(['。', '！', '？', '…', '，', ',', '.', '!', '?'])

export default function StoryPanel() {
  const messages = useGameStore((s) => s.messages)
  const streamingText = useGameStore((s) => s.streamingText)
  const isStreaming = useGameStore((s) => s.isStreaming)
  const genre = useGenreStore((s) => s.genre)
  const summaries = useSummaryStore((s) => s.summaries)

  const bottomRef = useRef<HTMLDivElement>(null)

  // 打字机状态全部收进 ref，避免 setState 在高频 timer 里触发多余重渲染
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // 已渲染到的字符位置（不放 state，避免闭包陈旧）
  const printedRef = useRef(0)
  // 当前正在追打的目标文本（ref 保证 timer 回调里始终读到最新值）
  const targetRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const config = genre ? GENRE_CONFIG[genre] : null

  // ─── 核心修复：只追加新增字符，不重置整段 ──────────────────────────────────
  //
  // 旧逻辑问题：
  //   streamingText 每次更新 → useEffect 触发 → clearTimeout + 重新 setTimeout
  //   当 DeepSeek 推流速度 > 打字速度时，timer 被反复清除，文字停滞甚至倒退。
  //
  // 新逻辑：
  //   1. targetRef 始终指向最新完整文本
  //   2. tick() 每次只向前走一个字符，读 targetRef.current 获取最新目标长度
  //   3. streamingText 更新时只负责"唤醒"一次 tick，如果 tick 已在跑则什么都不做
  //   4. 流式结束（isStreaming=false & streamingText=''）时强制补全并清理
  //
  const tickingRef = useRef(false)

  const tick = () => {
    const target = targetRef.current
    if (printedRef.current >= target.length) {
      // 追上了目标，等待下一批字符到来
      tickingRef.current = false
      setIsTyping(false)
      return
    }

    printedRef.current += 1
    const nextSlice = target.slice(0, printedRef.current)
    setDisplayText(nextSlice)

    const char = target[printedRef.current - 1]
    const delay = PUNCTUATION_SET.has(char) ? PUNCTUATION_DELAY : CHAR_DELAY
    timerRef.current = setTimeout(tick, delay)
  }

  useEffect(() => {
    if (!streamingText) return

    // 更新目标文本
    targetRef.current = streamingText

    // 如果打字机已经在跑，tick 会自动追上新内容，无需重启
    if (tickingRef.current) return

    // 首次或重启：开始打字
    tickingRef.current = true
    setIsTyping(true)
    timerRef.current = setTimeout(tick, CHAR_DELAY)

    // 注意：不在这里 return cleanup，cleanup 统一在下面的 unmount effect 处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingText])

  // 流式结束 → 立即补全剩余文字，重置所有状态
  useEffect(() => {
    if (!isStreaming && streamingText === '') {
      if (timerRef.current) clearTimeout(timerRef.current)
      tickingRef.current = false
      targetRef.current = ''
      printedRef.current = 0
      setDisplayText('')
      setIsTyping(false)
    }
  }, [isStreaming, streamingText])

  // 组件卸载时清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const currentChoices = useGameStore((s) => s.currentChoices)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, displayText, currentChoices])

  return (
    <div
      className="flex-1 rounded-2xl border p-5 overflow-y-auto min-h-0"
      style={{
        background: config?.theme.surface ?? 'rgba(255,255,255,0.04)',
        borderColor: config?.theme.border ?? 'rgba(255,255,255,0.1)',
        boxShadow: `inset 0 1px 0 ${config?.theme.primary ?? '#fff'}11`,
      }}
    >
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full gap-3 animate-fade-in">
          <span className="text-4xl animate-float">{config?.emoji ?? '📖'}</span>
          <p className="text-sm text-center" style={{ color: config?.theme.textMuted ?? '#888' }}>
            故事即将开始…
          </p>
        </div>
      )}

      {summaries.length > 0 && (
        <div className="space-y-2 mb-4">
          {summaries.map((summary) => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
          >
            {msg.role === 'narrator' && (
              <div
                className="rounded-xl p-4 text-sm leading-relaxed"
                style={{
                  background: `linear-gradient(135deg, ${config?.theme.surface ?? '#1a1a1a'}ee, ${config?.theme.surface ?? '#1a1a1a'})`,
                  color: config?.theme.text ?? '#fff',
                  borderLeft: `2px solid ${config?.theme.primary ?? '#888'}44`,
                }}
              >
                {msg.content}
              </div>
            )}

            {msg.role === 'player' && (
              <div className="flex justify-end animate-slide-in-right">
                <div
                  className="max-w-[80%] text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${config?.theme.primary ?? '#888'}22, ${config?.theme.primary ?? '#888'}33)`,
                    color: config?.theme.primary ?? '#aaa',
                    border: `1px solid ${config?.theme.primary ?? '#888'}44`,
                    boxShadow: `0 2px 12px ${config?.theme.primary ?? '#888'}22`,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            )}

            {msg.role === 'summary' && (
              <div
                className="rounded-xl p-4 text-xs leading-relaxed italic"
                style={{
                  borderLeft: `3px solid ${config?.theme.primary ?? '#888'}`,
                  color: config?.theme.textMuted ?? '#888',
                  background: `linear-gradient(135deg, ${config?.theme.primary ?? '#888'}0a, transparent)`,
                }}
              >
                <span
                  className="font-semibold not-italic block mb-1.5 text-xs tracking-wider uppercase"
                  style={{ color: config?.theme.primary }}
                >
                  📖 故事回顾
                </span>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* 打字机流式输出 */}
        {isStreaming && (
          <div className="animate-fade-in">
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: `linear-gradient(135deg, ${config?.theme.surface ?? '#1a1a1a'}ee, ${config?.theme.surface ?? '#1a1a1a'})`,
                color: config?.theme.text ?? '#fff',
                borderLeft: `2px solid ${config?.theme.primary ?? '#888'}66`,
                boxShadow: `0 0 20px ${config?.theme.primary ?? '#888'}11`,
              }}
            >
              {displayText}
              {/* 打字光标：打字中常亮，等待时闪烁 */}
              <span
                className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-full"
                style={{
                  background: config?.theme.primary ?? '#fff',
                  boxShadow: `0 0 6px ${config?.theme.primary ?? '#fff'}`,
                  animation: isTyping ? 'none' : 'blink 1s step-end infinite',
                  opacity: isTyping ? 1 : undefined,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  )
}
