'use client'

import { useState } from 'react'
import { useStyleStore, PRESET_STYLE_OPTIONS, PresetStyle } from '@/stores/styleStore'

export default function StyleEditor() {
  const { styleConfig, setPreset, setCustomDescription, setAnalyzedStyle } = useStyleStore()
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadText, setUploadText] = useState('')

  const inputStyle = {
    background: 'var(--theme-surface)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
  }

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
      }
    } catch {
      alert('分析失败，请检查网络或 API Key')
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

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold" style={{ color: 'var(--theme-primary)' }}>
        文笔风格（选填）
      </h2>

      {/* 预设风格 */}
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--theme-text-muted)' }}>
          预设风格
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_STYLE_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() =>
                setPreset(styleConfig.preset === option.key ? null : option.key as PresetStyle)
              }
              className="text-left px-3 py-2.5 rounded-lg border text-xs transition-all hover:brightness-110"
              style={{
                background:
                  styleConfig.preset === option.key
                    ? 'var(--theme-primary)22'
                    : 'var(--theme-surface)',
                borderColor:
                  styleConfig.preset === option.key
                    ? 'var(--theme-primary)'
                    : 'var(--theme-border)',
                color:
                  styleConfig.preset === option.key
                    ? 'var(--theme-primary)'
                    : 'var(--theme-text)',
              }}
            >
              <div className="font-medium">{option.label}</div>
              <div
                className="text-xs mt-0.5 opacity-70"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义描述 */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
          自定义风格描述
        </label>
        <input
          type="text"
          placeholder="例：文字简洁有力，多用短句，情感内敛…"
          value={styleConfig.customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {/* 文件上传分析 */}
      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
          上传文章分析风格
        </label>
        <div
          className="rounded-xl border p-3 space-y-2"
          style={{ borderColor: 'var(--theme-border)', background: 'rgba(255,255,255,0.02)' }}
        >
          {/* 文件上传 */}
          <div className="flex items-center gap-2">
            <label
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all hover:brightness-110"
              style={{
                background: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
            >
              📄 选择文件（.txt）
              <input
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {uploadText && (
              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                已读取 {uploadText.length} 字
              </span>
            )}
          </div>

          {/* 粘贴文本 */}
          <textarea
            rows={3}
            placeholder="或者直接粘贴文章内容…"
            value={uploadText}
            onChange={(e) => setUploadText(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none"
            style={inputStyle}
          />

          <button
            onClick={handleAnalyze}
            disabled={!uploadText.trim() || analyzing}
            className="w-full py-2 rounded-lg text-xs font-medium transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--theme-primary)', color: '#fff' }}
          >
            {analyzing ? '分析中…' : '🔍 AI 分析文笔风格'}
          </button>

          {/* 分析结果 */}
          {styleConfig.analyzedStyle && (
            <div
              className="rounded-lg p-2.5 text-xs leading-relaxed animate-fade-in-up"
              style={{
                background: 'var(--theme-primary)11',
                border: '1px solid var(--theme-primary)33',
                color: 'var(--theme-text-muted)',
              }}
            >
              <span
                className="font-semibold block mb-1"
                style={{ color: 'var(--theme-primary)' }}
              >
                ✨ 分析结果
              </span>
              {styleConfig.analyzedStyle}
              <button
                onClick={() => setAnalyzedStyle('', '')}
                className="block mt-1.5 text-xs opacity-50 hover:opacity-100"
              >
                清除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}