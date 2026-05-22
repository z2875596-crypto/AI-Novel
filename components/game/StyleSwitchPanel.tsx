'use client'

import { useState } from 'react'
import { useStyleStore, PRESET_STYLE_OPTIONS, PresetStyle } from '@/stores/styleStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Props {
  onClose: () => void
}

export default function StyleSwitchPanel({ onClose }: Props) {
  const genre = useGenreStore((s) => s.genre)
  const { styleConfig, setPreset, setCustomDescription, setAnalyzedStyle } = useStyleStore()
  const config = genre ? GENRE_CONFIG[genre] : null

  const [analyzing, setAnalyzing] = useState(false)
  const [uploadText, setUploadText] = useState('')
  const [tab, setTab] = useState<'preset' | 'custom' | 'analyze'>('preset')
  const [applied, setApplied] = useState(false)

  async function handleAnalyze() {
    const text = uploadText.trim()
    if (!text) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const { analyzedStyle } = await res.json()
      if (analyzedStyle) {
        setAnalyzedStyle(analyzedStyle, text)
        setUploadText('')
        setTab('preset')
      }
    } catch {
      alert('分析失败，请检查网络')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setUploadText(text.slice(0, 3000))
  }

  function handleApply() {
    setApplied(true)
    setTimeout(() => {
      setApplied(false)
      onClose()
    }, 800)
  }

  const primary = config?.theme.primary ?? '#888'
  const surface = config?.theme.surface ?? '#1a1a1a'
  const border = config?.theme.border ?? 'rgba(255,255,255,0.1)'
  const text = config?.theme.text ?? '#fff'
  const textMuted = config?.theme.textMuted ?? '#888'

  const activeStyle = styleConfig.preset
    ? PRESET_STYLE_OPTIONS.find((o) => o.key === styleConfig.preset)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div
        className="relative w-full max-w-md rounded-2xl border overflow-hidden animate-fade-in-up"
        style={{ background: surface, borderColor: border }}
      >
        {/* 头部 */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: border }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: text }}>
              ✍️ 文笔风格
            </h2>
            {activeStyle && (
              <p className="text-xs mt-0.5" style={{ color: primary }}>
                当前：{activeStyle.emoji} {activeStyle.label}
              </p>
            )}
            {styleConfig.analyzedStyle && !activeStyle && (
              <p className="text-xs mt-0.5" style={{ color: primary }}>
                当前：✨ 自定义分析风格
              </p>
            )}
            {!activeStyle && !styleConfig.analyzedStyle && (
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                未设置风格
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-lg opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: text }}
          >
            ✕
          </button>
        </div>

        {/* Tab 切换 */}
        <div
          className="flex border-b"
          style={{ borderColor: border }}
        >
          {([
            { key: 'preset', label: '预设风格' },
            { key: 'custom', label: '自定义' },
            { key: 'analyze', label: 'AI 分析' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 text-xs font-medium transition-all"
              style={{
                color: tab === t.key ? primary : textMuted,
                borderBottom: tab === t.key ? `2px solid ${primary}` : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="p-4 max-h-80 overflow-y-auto">

          {/* 预设风格 */}
          {tab === 'preset' && (
            <div className="grid grid-cols-1 gap-2">
              {/* 无风格选项 */}
              <button
                onClick={() => setPreset(null)}
                className="w-full text-left px-3 py-2.5 rounded-xl border transition-all hover:brightness-110"
                style={{
                  background: !styleConfig.preset ? primary + '22' : 'transparent',
                  borderColor: !styleConfig.preset ? primary : border,
                  color: !styleConfig.preset ? primary : textMuted,
                }}
              >
                <span className="text-sm">🎲 不限定风格</span>
                <span className="text-xs ml-2 opacity-60">由 AI 自由发挥</span>
              </button>

              {PRESET_STYLE_OPTIONS.map((opt) => {
                const selected = styleConfig.preset === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => setPreset(selected ? null : opt.key as PresetStyle)}
                    className="w-full text-left px-3 py-2.5 rounded-xl border transition-all hover:brightness-110"
                    style={{
                      background: selected ? primary + '22' : 'transparent',
                      borderColor: selected ? primary : border,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: selected ? primary : text }}
                        >
                          {opt.emoji} {opt.label}
                        </span>
                        <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                          {opt.description}
                        </p>
                      </div>
                      {selected && (
                        <span style={{ color: primary }} className="text-sm">✓</span>
                      )}
                    </div>
                    {/* 示例句 */}
                    <p
                      className="text-xs mt-1.5 italic px-2 py-1 rounded-lg"
                      style={{
                        color: selected ? primary + 'cc' : textMuted + '88',
                        background: selected ? primary + '11' : 'transparent',
                      }}
                    >
                      「{opt.example}」
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {/* 自定义描述 */}
          {tab === 'custom' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: textMuted }}>
                用文字描述你想要的风格，AI 会尽量模仿。
              </p>
              <textarea
                rows={4}
                placeholder="例：文字简洁有力，多用短句，情感内敛，偶尔有诗意的留白…"
                value={styleConfig.customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: border,
                  color: text,
                }}
              />
              {styleConfig.customDescription && (
                <button
                  onClick={() => setCustomDescription('')}
                  className="text-xs opacity-50 hover:opacity-100"
                  style={{ color: textMuted }}
                >
                  清除
                </button>
              )}
            </div>
          )}

          {/* AI 分析 */}
          {tab === 'analyze' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: textMuted }}>
                粘贴你喜欢的小说片段，AI 提取其文笔特征后应用到故事中。
              </p>
              <div className="flex items-center gap-2">
                <label
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all hover:brightness-110 border"
                  style={{ borderColor: border, color: textMuted, background: 'rgba(255,255,255,0.04)' }}
                >
                  📄 上传 .txt
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                {uploadText && (
                  <span className="text-xs" style={{ color: textMuted }}>
                    已读取 {uploadText.length} 字
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                placeholder="或直接粘贴文章内容…"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-xs outline-none resize-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: border,
                  color: text,
                }}
              />
              <button
                onClick={handleAnalyze}
                disabled={!uploadText.trim() || analyzing}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110 disabled:opacity-40"
                style={{ background: primary, color: '#fff' }}
              >
                {analyzing ? '分析中…' : '🔍 AI 分析文笔'}
              </button>
              {styleConfig.analyzedStyle && (
                <div
                  className="rounded-xl p-3 text-xs leading-relaxed"
                  style={{ background: primary + '11', border: `1px solid ${primary}33`, color: textMuted }}
                >
                  <span className="font-semibold block mb-1" style={{ color: primary }}>
                    ✨ 已分析的风格特征
                  </span>
                  {styleConfig.analyzedStyle}
                  <button
                    onClick={() => setAnalyzedStyle('', '')}
                    className="block mt-2 opacity-50 hover:opacity-100"
                  >
                    清除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div
          className="px-4 py-3 border-t flex gap-2"
          style={{ borderColor: border }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm border transition-all hover:brightness-110"
            style={{ borderColor: border, color: textMuted }}
          >
            取消
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
            style={{ background: primary, color: '#fff' }}
          >
            {applied ? '✓ 已应用' : '应用风格'}
          </button>
        </div>
      </div>
    </div>
  )
}
