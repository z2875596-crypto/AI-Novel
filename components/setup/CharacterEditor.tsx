'use client'

import { useWorldStore } from '@/stores/worldStore'
import { NPC, NARRATIVE_POV_OPTIONS, NarrativePOV } from '@/types/world'

function uid() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export default function CharacterEditor() {
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const updateField = useWorldStore((s) => s.updateField)

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors'
  const inputStyle = {
    background: 'var(--theme-surface)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
  }

  function addNPC() {
    const npc: NPC = { id: uid(), name: '', role: '', traits: '' }
    updateField('npcs', [...worldConfig.npcs, npc])
  }

  function updateNPC(id: string, field: keyof NPC, value: string) {
    updateField(
      'npcs',
      worldConfig.npcs.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    )
  }

  function removeNPC(id: string) {
    updateField('npcs', worldConfig.npcs.filter((n) => n.id !== id))
  }

  const currentPOV = worldConfig.narrativePOV ?? 'second'
  const currentPOVOption = NARRATIVE_POV_OPTIONS.find((o) => o.key === currentPOV)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--theme-primary)' }}>
          主角设定
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
              姓名 <span style={{ color: 'var(--theme-primary)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="例：叶云"
              value={worldConfig.protagonistName}
              onChange={(e) => updateField('protagonistName', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
              性格与外貌 <span style={{ color: 'var(--theme-primary)' }}>*</span>
            </label>
            <textarea
              rows={2}
              placeholder="描述主角的性格特征、外貌特点…"
              value={worldConfig.protagonistTraits}
              onChange={(e) => updateField('protagonistTraits', e.target.value)}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>

          {/* 叙述视角选择 */}
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--theme-text-muted)' }}>
              叙述视角 <span style={{ color: 'var(--theme-primary)' }}>*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NARRATIVE_POV_OPTIONS.map((opt) => {
                const selected = currentPOV === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => updateField('narrativePOV', opt.key as NarrativePOV)}
                    className="rounded-lg border px-3 py-2.5 text-left transition-all hover:brightness-110"
                    style={{
                      background: selected
                        ? 'var(--theme-primary)22'
                        : 'var(--theme-surface)',
                      borderColor: selected
                        ? 'var(--theme-primary)'
                        : 'var(--theme-border)',
                      color: selected
                        ? 'var(--theme-primary)'
                        : 'var(--theme-text)',
                    }}
                  >
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p
                      className="text-xs mt-0.5 leading-tight"
                      style={{ color: selected ? 'var(--theme-primary)aa' : 'var(--theme-text-muted)' }}
                    >
                      {opt.description}
                    </p>
                  </button>
                )
              })}
            </div>
            {/* 示例预览 */}
            <p
              className="text-xs mt-2 px-3 py-2 rounded-lg italic"
              style={{
                background: 'var(--theme-surface)',
                color: 'var(--theme-text-muted)',
                borderLeft: '2px solid var(--theme-primary)44',
              }}
            >
              示例：{currentPOVOption?.example.replace('钎城', worldConfig.protagonistName || '主角')}
            </p>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
              开场场景 <span style={{ color: 'var(--theme-primary)' }}>*</span>
            </label>
            <textarea
              rows={2}
              placeholder="故事从哪里开始？主角当下的处境是什么？"
              value={worldConfig.openingScene}
              onChange={(e) => updateField('openingScene', e.target.value)}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--theme-primary)' }}>
            配角（选填）
          </h2>
          <button
            onClick={addNPC}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:brightness-110"
            style={{
              borderColor: 'var(--theme-primary)',
              color: 'var(--theme-primary)',
            }}
          >
            + 添加配角
          </button>
        </div>

        {worldConfig.npcs.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--theme-text-muted)' }}>
            暂无配角，点击右上角添加
          </p>
        )}

        <div className="space-y-3">
          {worldConfig.npcs.map((npc, i) => (
            <div
              key={npc.id}
              className="rounded-xl border p-3 space-y-2"
              style={{
                borderColor: 'var(--theme-border)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  配角 {i + 1}
                </span>
                <button
                  onClick={() => removeNPC(npc.id)}
                  className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  删除
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="姓名"
                  value={npc.name}
                  onChange={(e) => updateNPC(npc.id, 'name', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="与主角的关系"
                  value={npc.role}
                  onChange={(e) => updateNPC(npc.id, 'role', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <input
                type="text"
                placeholder="性格外貌特点"
                value={npc.traits}
                onChange={(e) => updateNPC(npc.id, 'traits', e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
