'use client'

import { useEffect, useRef } from 'react'
import { Clue, CLUE_CATEGORY_ICONS, CLUE_IMPORTANCE_COLORS } from '@/types/clue'

interface Props {
  clues: Clue[]
  selectedId: string | null
  onSelect: (id: string) => void
}

interface NodePos {
  x: number
  y: number
  clue: Clue
}

export default function ClueGraph({ clues, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<NodePos[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    if (clues.length === 0) {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(138,128,112,0.4)'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('尚未发现任何线索', W / 2, H / 2)
      return
    }

    // 计算节点位置（环形布局）
    const nodes: NodePos[] = clues.map((clue, i) => {
      const angle = (i / clues.length) * Math.PI * 2 - Math.PI / 2
      const radius = Math.min(W, H) * 0.32
      return {
        x: W / 2 + Math.cos(angle) * radius,
        y: H / 2 + Math.sin(angle) * radius,
        clue,
      }
    })

    // 如果只有一个节点放中心
    if (nodes.length === 1) {
      nodes[0].x = W / 2
      nodes[0].y = H / 2
    }

    nodesRef.current = nodes

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)

      // 背景网格
      ctx.strokeStyle = 'rgba(58,53,32,0.3)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // 画连线
      nodes.forEach((node) => {
        node.clue.relatedClues.forEach((relId) => {
          const target = nodes.find((n) => n.clue.id === relId)
          if (!target) return

          const isHighlighted =
            selectedId === node.clue.id || selectedId === relId

          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = isHighlighted
            ? 'rgba(184,150,12,0.8)'
            : 'rgba(184,150,12,0.2)'
          ctx.lineWidth = isHighlighted ? 2 : 1
          ctx.setLineDash(isHighlighted ? [] : [4, 4])
          ctx.stroke()
          ctx.setLineDash([])

          // 连线中点标记
          if (isHighlighted) {
            const mx = (node.x + target.x) / 2
            const my = (node.y + target.y) / 2
            ctx.beginPath()
            ctx.arc(mx, my, 3, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(184,150,12,0.8)'
            ctx.fill()
          }
        })
      })

      // 画节点
      nodes.forEach((node) => {
        const isSelected = selectedId === node.clue.id
        const isRelated = selectedId
          ? nodes.find((n) => n.clue.id === selectedId)
              ?.clue.relatedClues.includes(node.clue.id) ?? false
          : false

        const color = CLUE_IMPORTANCE_COLORS[node.clue.importance]
        const radius = isSelected ? 28 : isRelated ? 24 : 20

        // 发光
        if (isSelected || isRelated) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2)
          const glow = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, radius + 8
          )
          glow.addColorStop(0, `${color}44`)
          glow.addColorStop(1, `${color}00`)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // 节点圆
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = isSelected
          ? `${color}33`
          : isRelated
          ? `${color}22`
          : 'rgba(20,20,16,0.9)'
        ctx.fill()
        ctx.strokeStyle = isSelected ? color : isRelated ? `${color}88` : 'rgba(58,53,32,0.8)'
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.stroke()

        // 图标
        ctx.font = `${isSelected ? 18 : 14}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(CLUE_CATEGORY_ICONS[node.clue.category], node.x, node.y - 4)

        // 名称
        ctx.font = `${isSelected ? 'bold ' : ''}11px monospace`
        ctx.fillStyle = isSelected ? color : '#8a8070'
        ctx.fillText(
          node.clue.name.length > 6 ? node.clue.name.slice(0, 6) + '…' : node.clue.name,
          node.x,
          node.y + radius + 12
        )
      })
    }

    draw()
  }, [clues, selectedId])

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    for (const node of nodesRef.current) {
      const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2)
      if (dist < 30) {
        onSelect(node.clue.id)
        return
      }
    }
    onSelect('')
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full rounded-xl cursor-pointer"
      style={{
        height: '280px',
        background: 'rgba(10,10,8,0.9)',
        border: '1px solid rgba(58,53,32,0.8)',
      }}
    />
  )
}