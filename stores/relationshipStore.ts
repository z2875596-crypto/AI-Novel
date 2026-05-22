import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RelationType =
  | 'lover'       // 恋人
  | 'friend'      // 友人
  | 'rival'       // 对手/宿敌
  | 'ally'        // 盟友
  | 'enemy'       // 敌人
  | 'family'      // 家人
  | 'mentor'      // 师傅/前辈
  | 'stranger'    // 陌生人
  | 'unknown'     // 未知

export interface RelationshipEvent {
  turn: number
  description: string   // 简短描述，如"共同击退山贼"
  delta: number         // 好感变化，-10 ~ +10
}

export interface Relationship {
  npcId: string         // NPC 的唯一 id（对应 WorldConfig.npcs[].id）
  npcName: string
  affinity: number      // 好感度 -100 ~ 100，0 为中立
  type: RelationType
  events: RelationshipEvent[]
  lastUpdatedTurn: number
}

interface RelationshipStore {
  relationships: Relationship[]
  // 初始化所有 NPC 的关系（从 WorldConfig.npcs 里读取）
  initFromNPCs: (npcs: { id: string; name: string; role: string }[]) => void
  // AI 提取结果更新关系
  applyUpdate: (update: RelationshipUpdate) => void
  reset: () => void
}

export interface RelationshipUpdate {
  npcId: string
  npcName: string
  affinityDelta: number       // 本回合好感变化
  newType?: RelationType      // 如果关系类型发生变化
  eventDescription: string    // 本回合发生了什么
  turn: number
}

// 根据好感度自动推断关系类型（仅作兜底，AI 也会直接给出）
export function inferRelationType(affinity: number): RelationType {
  if (affinity >= 80) return 'lover'
  if (affinity >= 50) return 'friend'
  if (affinity >= 20) return 'ally'
  if (affinity >= -20) return 'stranger'
  if (affinity >= -50) return 'rival'
  return 'enemy'
}

export const RELATION_TYPE_LABELS: Record<RelationType, { label: string; color: string; emoji: string }> = {
  lover:   { label: '恋人',   color: '#E8607A', emoji: '💕' },
  friend:  { label: '友人',   color: '#5BAD5E', emoji: '🤝' },
  ally:    { label: '盟友',   color: '#5B8DEF', emoji: '🛡️' },
  rival:   { label: '对手',   color: '#E8903A', emoji: '⚔️' },
  enemy:   { label: '敌人',   color: '#CC3333', emoji: '💢' },
  family:  { label: '家人',   color: '#C8A020', emoji: '🏠' },
  mentor:  { label: '师长',   color: '#9B7FD4', emoji: '📚' },
  stranger:{ label: '陌路',   color: '#888888', emoji: '👤' },
  unknown: { label: '未知',   color: '#555555', emoji: '❓' },
}

export const useRelationshipStore = create<RelationshipStore>()(
  persist(
    (set) => ({
      relationships: [],

      initFromNPCs: (npcs) =>
        set((s) => {
          // 只初始化还不存在的 NPC，已有的保留
          const existing = new Set(s.relationships.map((r) => r.npcId))
          const newOnes: Relationship[] = npcs
            .filter((n) => !existing.has(n.id))
            .map((n) => ({
              npcId: n.id,
              npcName: n.name,
              affinity: 0,
              type: 'stranger',
              events: [],
              lastUpdatedTurn: 0,
            }))
          return { relationships: [...s.relationships, ...newOnes] }
        }),

      applyUpdate: (update) =>
        set((s) => {
          const idx = s.relationships.findIndex((r) => r.npcId === update.npcId)
          const event: RelationshipEvent = {
            turn: update.turn,
            description: update.eventDescription,
            delta: update.affinityDelta,
          }

          if (idx === -1) {
            // 新 NPC（AI 识别出的，不在初始列表里）
            const newRel: Relationship = {
              npcId: update.npcId,
              npcName: update.npcName,
              affinity: Math.max(-100, Math.min(100, update.affinityDelta)),
              type: update.newType ?? inferRelationType(update.affinityDelta),
              events: [event],
              lastUpdatedTurn: update.turn,
            }
            return { relationships: [...s.relationships, newRel] }
          }

          const rel = s.relationships[idx]
          const newAffinity = Math.max(-100, Math.min(100, rel.affinity + update.affinityDelta))
          const updated: Relationship = {
            ...rel,
            affinity: newAffinity,
            type: update.newType ?? inferRelationType(newAffinity),
            events: [...rel.events, event],
            lastUpdatedTurn: update.turn,
          }
          const arr = [...s.relationships]
          arr[idx] = updated
          return { relationships: arr }
        }),

      reset: () => set({ relationships: [] }),
    }),
    { name: 'relationship-store' }
  )
)
