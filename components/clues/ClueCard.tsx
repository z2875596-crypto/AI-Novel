'use client'

import { Clue, CLUE_CATEGORY_ICONS, CLUE_CATEGORY_LABELS, CLUE_IMPORTANCE_COLORS } from '@/types/clue'

interface Props {
  clue: Clue
  isSelected: boolean
  isRelated: boolean
  onClick: () => void
}

export default function ClueCard({ clue, isSelected, isRelated, onClick }: Props) {
  const importanceColor = CLUE_IMPORTANCE_COLORS[clue.importance]

  return (
    <div
      onClick={onClick}
      className="rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:brightness-125"
      style={{
        background: isSelected
          ? 'rgba(184,150,12,0.15)'
          : isRelated
          ? 'rgba(184,150,12,0.08)'
          : 'rgba(20,20,16,0.9)',
        borderColor: isSelected
          ? '#B8960C'
          : isRelated
          ? '#B8960C88'
          : 'rgba(58,53,32,0.8)',
        boxShadow: isSelected
          ? '0 0 16px rgba(184,150,12,0.3)'
          : 'none',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* 顶部：图标 + 名称 + 重要度 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{CLUE_CATEGORY_ICONS[clue.category]}</span>
          <span className="font-semibold text-sm" style={{ color: '#e8e0c8' }}>
            {clue.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: `${importanceColor}22`,
              color: importanceColor,
              border: `1px solid ${importanceColor}44`,
            }}
          >
            {clue.importance === 'high' ? '关键' : clue.importance === 'medium' ? '重要' : '一般'}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(58,53,32,0.8)',
              color: '#8a8070',
            }}
          >
            {CLUE_CATEGORY_LABELS[clue.category]}
          </span>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-xs leading-relaxed mb-2" style={{ color: '#8a8070' }}>
        {clue.description}
      </p>

      {/* 指向内容 */}
      {clue.revelation && (
        <div
          className="rounded-lg px-3 py-2 text-xs mt-2"
          style={{
            background: 'rgba(184,150,12,0.1)',
            border: '1px solid rgba(184,150,12,0.3)',
            color: '#B8960C',
          }}
        >
          🔓 {clue.revelation}
        </div>
      )}

      {/* 底部：发现回合 + 关联数 */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: '#8a8070' }}>
          第 {clue.foundAt} 回合发现
        </span>
        {clue.relatedClues.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(184,150,12,0.15)',
              color: '#B8960C',
            }}
          >
            关联 {clue.relatedClues.length} 条线索
          </span>
        )}
      </div>
    </div>
  )
}