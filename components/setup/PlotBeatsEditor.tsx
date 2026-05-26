'use client'

import { useWorldStore } from '@/stores/worldStore'
import { PlotBeat } from '@/types/world'

function uid() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export default function PlotBeatsEditor() {
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const updateField = useWorldStore((s) => s.updateField)

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors'
  const inputStyle = {
    background: 'var(--theme-surface)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
  }

  function addBeat() {
    const beat: PlotBeat = { id: uid(), triggerTurn: 1, description: '', triggered: false }
    updateField('plotBeats', [...(worldConfig.plotBeats ?? []), beat])
  }

  function updateBeat(id: string, field: keyof PlotBeat, value: string | number | boolean) {
    updateField(
      'plotBeats',
      (worldConfig.plotBeats ?? []).map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  function removeBeat(id: string) {
    updateField('plotBeats', (worldConfig.plotBeats ?? []).filter((b) => b.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold" style={{ color: 'var(--theme-primary)' }}>
          剧情节奏（选填）
        </h2>
        <button
          onClick={addBeat}
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:brightness-110"
          style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
        >
          + 添加节点
        </button>
      </div>

      <p className="text-xs mb-3" style={{ color: 'var(--theme-text-muted)' }}>
        设置关键剧情节点，AI 将在对应回合附近自然地融入这些情节
      </p>

      {worldConfig.plotBeats.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: 'var(--theme-text-muted)' }}>
          暂无节点，点击右上角添加
        </p>
      )}

      <div className="space-y-3">
        {worldConfig.plotBeats.map((beat, i) => (
          <div
            key={beat.id}
            className="rounded-xl border p-3 space-y-2"
            style={{ borderColor: 'var(--theme-border)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                节点 {i + 1}
              </span>
              <button
                onClick={() => removeBeat(beat.id)}
                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                删除
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--theme-text-muted)' }}>
                第
              </span>
              <input
                type="number"
                min={1}
                value={beat.triggerTurn}
                onChange={(e) => updateBeat(beat.id, 'triggerTurn', Number(e.target.value))}
                className="w-20 rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle}
              />
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--theme-text-muted)' }}>
                回合
              </span>
            </div>
            <input
              type="text"
              placeholder="希望发生什么？例如：两人在雨中争吵"
              value={beat.description}
              onChange={(e) => updateBeat(beat.id, 'description', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
