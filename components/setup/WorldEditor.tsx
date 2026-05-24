'use client'

import { useWorldStore } from '@/stores/worldStore'
import PolishButton from './PolishButton'

export default function WorldEditor() {
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const updateField = useWorldStore((s) => s.updateField)

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-1'
  const inputStyle = {
    background: 'var(--theme-surface)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold" style={{ color: 'var(--theme-primary)' }}>
        世界设定
      </h2>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
          世界名称 <span style={{ color: 'var(--theme-primary)' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="例：苍穹大陆"
          value={worldConfig.worldName}
          onChange={(e) => updateField('worldName', e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            世界背景 <span style={{ color: 'var(--theme-primary)' }}>*</span>
          </label>
          <PolishButton
            content={worldConfig.worldSetting}
            target="worldSetting"
            onPolished={(result) => updateField('worldSetting', result)}
          />
        </div>
        <textarea
          rows={3}
          placeholder="描述这个世界的背景、规则、氛围…"
          value={worldConfig.worldSetting}
          onChange={(e) => updateField('worldSetting', e.target.value)}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </div>
    </div>
  )
}
