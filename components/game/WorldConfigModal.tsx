'use client'

import { useState } from 'react'
import { useWorldStore } from '@/stores/worldStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import { NPC } from '@/types/world'

function uid() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

interface Props {
  onClose: () => void
}

export default function WorldConfigModal({ onClose }: Props) {
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const setWorldConfig = useWorldStore((s) => s.setWorldConfig)
  const config = genre ? GENRE_CONFIG[genre] : null

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ ...worldConfig })
  const [saved, setSaved] = useState(false)

  function handleEdit() {
    setDraft({ ...worldConfig })
    setEditing(true)
  }

  function handleSave() {
    setWorldConfig(draft)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateDraft<K extends keyof typeof draft>(key: K, value: typeof draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function addNPC() {
    const npc: NPC = { id: uid(), name: '', role: '', traits: '' }
    setDraft((d) => ({ ...d, npcs: [...d.npcs, npc] }))
  }

  function updateNPC(id: string, field: keyof NPC, value: string) {
    setDraft((d) => ({
      ...d,
      npcs: d.npcs.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
    }))
  }

  function removeNPC(id: string) {
    setDraft((d) => ({ ...d, npcs: d.npcs.filter((n) => n.id !== id) }))
  }

  const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm outline-none'
  const inputStyle = {
    background: 'rgba(0,0,0,0.3)',
    borderColor: config?.theme.border ?? '#333',
    color: config?.theme.text ?? '#fff',
  }

  const data = editing ? draft : worldConfig

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] rounded-2xl border flex flex-col animate-fade-in-up"
        style={{
          background: config?.theme.surface ?? '#1a1a1a',
          borderColor: config?.theme.border ?? '#333',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: config?.theme.border ?? '#333' }}
        >
          <div className="flex items-center gap-2">
            <span>{config?.emoji}</span>
            <span className="font-bold text-sm" style={{ color: config?.theme.text ?? '#fff' }}>
              世界设定
            </span>
            {saved && (
              <span className="text-xs px-2 py-0.5 rounded-full animate-fade-in"
                style={{ background: '#5BAD5E22', color: '#5BAD5E' }}>
                ✓ 已保存
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
                style={{
                  background: `${config?.theme.primary ?? '#888'}22`,
                  color: config?.theme.primary ?? '#888',
                  border: `1px solid ${config?.theme.primary ?? '#888'}44`,
                }}
              >
                ✏️ 编辑
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: config?.theme.textMuted ?? '#888',
                    border: `1px solid ${config?.theme.border ?? '#333'}`,
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110"
                  style={{
                    background: config?.theme.primary ?? '#888',
                    color: '#fff',
                  }}
                >
                  保存修改
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-2 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
              style={{ color: config?.theme.textMuted ?? '#888' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

          {/* 世界设定 */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase"
              style={{ color: config?.theme.primary ?? '#888' }}>
              世界设定
            </h3>
            <div>
              <label className="text-xs mb-1 block" style={{ color: config?.theme.textMuted }}>世界名称</label>
              {editing ? (
                <input type="text" value={draft.worldName}
                  onChange={(e) => updateDraft('worldName', e.target.value)}
                  className={inputClass} style={inputStyle} />
              ) : (
                <p className="text-sm font-semibold" style={{ color: config?.theme.text }}>{data.worldName}</p>
              )}
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: config?.theme.textMuted }}>世界背景</label>
              {editing ? (
                <textarea rows={3} value={draft.worldSetting}
                  onChange={(e) => updateDraft('worldSetting', e.target.value)}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: config?.theme.textMuted }}>{data.worldSetting}</p>
              )}
            </div>
          </div>

          <div className="h-px" style={{ background: config?.theme.border }} />

          {/* 主角 */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase"
              style={{ color: config?.theme.primary ?? '#888' }}>
              主角
            </h3>
            <div>
              <label className="text-xs mb-1 block" style={{ color: config?.theme.textMuted }}>姓名</label>
              {editing ? (
                <input type="text" value={draft.protagonistName}
                  onChange={(e) => updateDraft('protagonistName', e.target.value)}
                  className={inputClass} style={inputStyle} />
              ) : (
                <p className="text-sm font-semibold" style={{ color: config?.theme.text }}>{data.protagonistName}</p>
              )}
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: config?.theme.textMuted }}>性格与外貌</label>
              {editing ? (
                <textarea rows={2} value={draft.protagonistTraits}
                  onChange={(e) => updateDraft('protagonistTraits', e.target.value)}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: config?.theme.textMuted }}>{data.protagonistTraits}</p>
              )}
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: config?.theme.textMuted }}>开场场景</label>
              {editing ? (
                <textarea rows={2} value={draft.openingScene}
                  onChange={(e) => updateDraft('openingScene', e.target.value)}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: config?.theme.textMuted }}>{data.openingScene}</p>
              )}
            </div>
          </div>

          {/* 目标结局 */}
          {(data.targetEnding || editing) && (
            <>
              <div className="h-px" style={{ background: config?.theme.border }} />
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase mb-2"
                  style={{ color: config?.theme.primary ?? '#888' }}>
                  目标结局
                </h3>
                {editing ? (
                  <input type="text" value={draft.targetEnding ?? ''}
                    onChange={(e) => updateDraft('targetEnding', e.target.value)}
                    placeholder="留空则随机发展"
                    className={inputClass} style={inputStyle} />
                ) : (
                  <p className="text-sm" style={{ color: config?.theme.textMuted }}>
                    🎯 {data.targetEnding || '随机发展'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* 配角 */}
          {(data.npcs.length > 0 || editing) && (
            <>
              <div className="h-px" style={{ background: config?.theme.border }} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: config?.theme.primary ?? '#888' }}>
                    配角
                  </h3>
                  {editing && (
                    <button onClick={addNPC}
                      className="text-xs px-2 py-1 rounded-lg border transition-all hover:brightness-110"
                      style={{ borderColor: config?.theme.primary, color: config?.theme.primary }}>
                      + 添加
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {(editing ? draft.npcs : data.npcs).map((npc, i) => (
                    <div key={npc.id}
                      className="rounded-xl border p-3 space-y-2"
                      style={{ borderColor: config?.theme.border, background: 'rgba(255,255,255,0.02)' }}
                    >
                      {editing ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs" style={{ color: config?.theme.textMuted }}>配角 {i + 1}</span>
                            <button onClick={() => removeNPC(npc.id)}
                              className="text-xs opacity-50 hover:opacity-100"
                              style={{ color: config?.theme.textMuted }}>删除</button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="姓名" value={npc.name}
                              onChange={(e) => updateNPC(npc.id, 'name', e.target.value)}
                              className={inputClass} style={inputStyle} />
                            <input type="text" placeholder="关系" value={npc.role}
                              onChange={(e) => updateNPC(npc.id, 'role', e.target.value)}
                              className={inputClass} style={inputStyle} />
                          </div>
                          <input type="text" placeholder="特点" value={npc.traits}
                            onChange={(e) => updateNPC(npc.id, 'traits', e.target.value)}
                            className={inputClass} style={inputStyle} />
                        </>
                      ) : (
                        <div>
                          <p className="text-sm font-medium" style={{ color: config?.theme.text }}>
                            {npc.name}
                            <span className="text-xs ml-2 font-normal" style={{ color: config?.theme.textMuted }}>
                              {npc.role}
                            </span>
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: config?.theme.textMuted }}>{npc.traits}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 底部提示 */}
        {editing && (
          <div
            className="px-6 py-3 border-t text-xs flex-shrink-0"
            style={{
              borderColor: config?.theme.border,
              color: config?.theme.textMuted,
              background: `${config?.theme.primary}08`,
            }}
          >
            💡 修改后下一回合即时生效，AI 会根据新设定继续故事
          </div>
        )}
      </div>
    </div>
  )
}