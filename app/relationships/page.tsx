'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRelationshipStore, RELATION_TYPE_LABELS, Relationship, RelationshipEvent } from '@/stores/relationshipStore'
import { useWorldStore } from '@/stores/worldStore'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'
import ThemeProvider from '@/components/shared/ThemeProvider'

// 好感度条颜色
function affinityColor(affinity: number): string {
  if (affinity >= 60) return '#E8607A'
  if (affinity >= 20) return '#5BAD5E'
  if (affinity >= -20) return '#888888'
  if (affinity >= -60) return '#E8903A'
  return '#CC3333'
}

function AffinityBar({ value }: { value: number }) {
  const pct = ((value + 100) / 200) * 100
  const color = affinityColor(value)
  return (
    <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      {/* 中线 */}
      <div className="absolute left-1/2 top-0 w-px h-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
      <div
        className="absolute top-0 h-full rounded-full transition-all duration-500"
        style={{
          left: value >= 0 ? '50%' : `${pct}%`,
          width: `${Math.abs(value) / 2}%`,
          background: color,
          boxShadow: `0 0 6px ${color}88`,
        }}
      />
    </div>
  )
}

// SVG 关系图谱
function RelationshipGraph({
  relationships,
  protagonistName,
  primary,
  selected,
  onSelect,
}: {
  relationships: Relationship[]
  protagonistName: string
  primary: string
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const cx = 200
  const cy = 200
  const r = 130

  // 计算每个 NPC 的位置（环形排列）
  const positions = relationships.map((rel, i) => {
    const angle = (i / relationships.length) * 2 * Math.PI - Math.PI / 2
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      rel,
    }
  })

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto">
      {/* 连线 */}
      {positions.map(({ x, y, rel }) => {
        const typeInfo = RELATION_TYPE_LABELS[rel.type]
        const isSelected = selected === rel.npcId
        const opacity = selected ? (isSelected ? 1 : 0.2) : 0.6
        return (
          <line
            key={rel.npcId + '-line'}
            x1={cx} y1={cy} x2={x} y2={y}
            stroke={typeInfo.color}
            strokeWidth={isSelected ? 2.5 : 1.5}
            strokeOpacity={opacity}
            strokeDasharray={rel.affinity < 0 ? '5,4' : 'none'}
          />
        )
      })}

      {/* 主角节点 */}
      <circle cx={cx} cy={cy} r={28} fill={primary + '33'} stroke={primary} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={24} fill={primary + '22'} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontWeight="bold" fill={primary}>
        {protagonistName.slice(0, 3)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
        fontSize={8} fill={primary + 'aa'}>
        主角
      </text>

      {/* NPC 节点 */}
      {positions.map(({ x, y, rel }) => {
        const typeInfo = RELATION_TYPE_LABELS[rel.type]
        const isSelected = selected === rel.npcId
        const opacity = selected ? (isSelected ? 1 : 0.35) : 1
        return (
          <g
            key={rel.npcId}
            onClick={() => onSelect(isSelected ? null : rel.npcId)}
            style={{ cursor: 'pointer', opacity }}
          >
            <circle
              cx={x} cy={y} r={isSelected ? 26 : 22}
              fill={typeInfo.color + '33'}
              stroke={typeInfo.color}
              strokeWidth={isSelected ? 2.5 : 1.5}
              style={{ transition: 'all 0.2s' }}
            />
            <text x={x} y={y - 2} textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontWeight="bold" fill={typeInfo.color}>
              {rel.npcName.slice(0, 3)}
            </text>
            <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="middle"
              fontSize={8} fill={typeInfo.color + 'bb'}>
              {typeInfo.emoji}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// 角色详情卡片
function RelationshipDetail({ rel, primary }: { rel: Relationship; primary: string }) {
  const typeInfo = RELATION_TYPE_LABELS[rel.type]
  const recentEvents = [...rel.events].reverse().slice(0, 5)

  return (
    <div
      className="rounded-2xl border p-4 space-y-3 animate-fade-in-up"
      style={{
        background: typeInfo.color + '11',
        borderColor: typeInfo.color + '44',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: typeInfo.color + '22', border: `1px solid ${typeInfo.color}44` }}
        >
          {typeInfo.emoji}
        </div>
        <div>
          <p className="font-bold text-base" style={{ color: typeInfo.color }}>
            {rel.npcName}
          </p>
          <p className="text-xs" style={{ color: typeInfo.color + 'aa' }}>
            {typeInfo.label} · 第 {rel.lastUpdatedTurn} 回合更新
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-lg font-bold" style={{ color: affinityColor(rel.affinity) }}>
            {rel.affinity > 0 ? '+' : ''}{rel.affinity}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>好感度</p>
        </div>
      </div>

      <AffinityBar value={rel.affinity} />

      {recentEvents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold" style={{ color: typeInfo.color + 'aa' }}>
            近期事件
          </p>
          {recentEvents.map((ev: RelationshipEvent, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#666' }}>第{ev.turn}回合</span>
              <span className="flex-1 text-xs" style={{ color: '#aaa' }}>{ev.description}</span>
              <span
                className="text-xs font-medium"
                style={{ color: ev.delta >= 0 ? '#5BAD5E' : '#CC3333' }}
              >
                {ev.delta >= 0 ? '+' : ''}{ev.delta}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RelationshipsPage() {
  const router = useRouter()
  const relationships = useRelationshipStore((s) => s.relationships)
  const genre = useGenreStore((s) => s.genre)
  const worldConfig = useWorldStore((s) => s.worldConfig)
  const [selected, setSelected] = useState<string | null>(null)

  if (!genre) { router.replace('/'); return null }

  const config = GENRE_CONFIG[genre]
  const selectedRel = relationships.find((r) => r.npcId === selected) ?? null

  return (
    <ThemeProvider>
      <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110"
            style={{ background: 'rgba(255,255,255,0.06)', color: config.theme.textMuted, border: `1px solid ${config.theme.border}` }}
          >
            ← 返回
          </button>
          <h1 className="text-xl font-bold" style={{ color: config.theme.text }}>
            🕸️ 角色关系
          </h1>
          <div className="w-16" />
        </div>

        {relationships.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border"
            style={{ borderColor: config.theme.border, background: config.theme.surface, color: config.theme.textMuted }}
          >
            <p className="text-4xl mb-3">👤</p>
            <p className="text-sm">暂无角色关系数据</p>
            <p className="text-xs mt-1 opacity-60">继续游玩，关系会随剧情自动更新</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SVG 图谱 */}
            <div
              className="rounded-2xl border p-4"
              style={{ background: config.theme.surface, borderColor: config.theme.border }}
            >
              <p className="text-xs text-center mb-3" style={{ color: config.theme.textMuted }}>
                点击角色节点查看详情
              </p>
              <RelationshipGraph
                relationships={relationships}
                protagonistName={worldConfig.protagonistName}
                primary={config.theme.primary}
                selected={selected}
                onSelect={setSelected}
              />

              {/* 图例 */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {Object.entries(RELATION_TYPE_LABELS)
                  .filter(([key]) => relationships.some((r) => r.type === key))
                  .map(([, info]) => (
                    <div key={info.label} className="flex items-center gap-1 text-xs" style={{ color: info.color }}>
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* 角色列表 */}
            {!selected && (
              <div className="space-y-2">
                {[...relationships]
                  .sort((a, b) => Math.abs(b.affinity) - Math.abs(a.affinity))
                  .map((rel) => {
                    const typeInfo = RELATION_TYPE_LABELS[rel.type]
                    return (
                      <button
                        key={rel.npcId}
                        onClick={() => setSelected(rel.npcId)}
                        className="w-full rounded-xl border p-3 text-left transition-all hover:brightness-110"
                        style={{ background: config.theme.surface, borderColor: config.theme.border }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{typeInfo.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: config.theme.text }}>
                              {rel.npcName}
                            </p>
                            <p className="text-xs" style={{ color: typeInfo.color }}>
                              {typeInfo.label}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold" style={{ color: affinityColor(rel.affinity) }}>
                              {rel.affinity > 0 ? '+' : ''}{rel.affinity}
                            </p>
                            <div className="w-20 mt-1">
                              <AffinityBar value={rel.affinity} />
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}

            {/* 选中详情 */}
            {selectedRel && (
              <div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs mb-3 opacity-60 hover:opacity-100"
                  style={{ color: config.theme.textMuted }}
                >
                  ← 返回列表
                </button>
                <RelationshipDetail rel={selectedRel} primary={config.theme.primary} />
              </div>
            )}
          </div>
        )}
      </main>
    </ThemeProvider>
  )
}
