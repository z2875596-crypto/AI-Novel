'use client'

import { useWorldStore } from '@/stores/worldStore'

const ENDING_EXAMPLES = [
  '主角与心上人终成眷属',
  '主角修炼成仙，俯瞰苍生',
  '案件告破，真凶落网',
  '主角登上权力顶峰',
  '主角夺得世界冠军',
  '主角找回失散的家人',
]

export default function TargetEndingEditor() {
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const updateField = useWorldStore((s) => s.updateField)

  const inputStyle = {
    background: 'var(--theme-surface)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--theme-primary)' }}>
          目标结局（选填）
        </h2>
        {worldConfig.targetEnding && (
          <button
            onClick={() => updateField('targetEnding', '')}
            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            清除
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
        设定后 AI 会暗中引导故事走向该结局，但过程仍然自然。不填则完全随机发展。
      </p>

      {/* 快捷示例 */}
      <div className="flex flex-wrap gap-1.5">
        {ENDING_EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => updateField('targetEnding', example)}
            className="px-2.5 py-1 rounded-full text-xs transition-all hover:brightness-110"
            style={{
              background:
                worldConfig.targetEnding === example
                  ? 'var(--theme-primary)33'
                  : 'rgba(255,255,255,0.05)',
              border: `1px solid ${
                worldConfig.targetEnding === example
                  ? 'var(--theme-primary)'
                  : 'var(--theme-border)'
              }`,
              color:
                worldConfig.targetEnding === example
                  ? 'var(--theme-primary)'
                  : 'var(--theme-text-muted)',
            }}
          >
            {example}
          </button>
        ))}
      </div>

      {/* 自定义输入 */}
      <textarea
        rows={2}
        placeholder="或者自定义你想要的结局…"
        value={worldConfig.targetEnding ?? ''}
        onChange={(e) => updateField('targetEnding', e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none"
        style={inputStyle}
      />

      {worldConfig.targetEnding && (
        <div
          className="rounded-lg px-3 py-2 text-xs animate-fade-in"
          style={{
            background: 'var(--theme-primary)11',
            border: '1px solid var(--theme-primary)33',
            color: 'var(--theme-text-muted)',
          }}
        >
          🎯 AI 将引导故事走向：
          <span style={{ color: 'var(--theme-primary)' }} className="ml-1 font-medium">
            {worldConfig.targetEnding}
          </span>
        </div>
      )}
    </div>
  )
}