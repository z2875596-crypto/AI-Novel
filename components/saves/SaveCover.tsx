'use client'

import { useEffect, useRef } from 'react'
import { GenreKey } from '@/types/genre'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Props {
  genre: GenreKey
  worldName: string
  protagonistName: string
  chapter: number
}

export default function SaveCover({ genre, worldName, protagonistName, chapter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const config = GENRE_CONFIG[genre]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // 背景渐变
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, config.theme.surface)
    bg.addColorStop(1, config.theme.primary + '33')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // 装饰性光晕
    const glow = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.5)
    glow.addColorStop(0, config.theme.primary + '44')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // 装饰线条
    ctx.strokeStyle = config.theme.primary + '33'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, H * 0.65)
    ctx.lineTo(W, H * 0.65)
    ctx.stroke()

    // Emoji
    ctx.font = `${H * 0.28}px serif`
    ctx.textAlign = 'center'
    ctx.fillText(config.emoji, W * 0.5, H * 0.42)

    // 世界名
    ctx.font = `bold ${H * 0.13}px sans-serif`
    ctx.fillStyle = config.theme.text
    ctx.textAlign = 'center'
    // 截断过长的世界名
    const maxWidth = W - 12
    let displayName = worldName
    while (ctx.measureText(displayName).width > maxWidth && displayName.length > 2) {
      displayName = displayName.slice(0, -1)
    }
    if (displayName !== worldName) displayName += '…'
    ctx.fillText(displayName, W * 0.5, H * 0.68)

    // 主角名
    ctx.font = `${H * 0.1}px sans-serif`
    ctx.fillStyle = config.theme.primary
    ctx.textAlign = 'center'
    ctx.fillText(protagonistName, W * 0.5, H * 0.82)

    // 章节数
    ctx.font = `${H * 0.09}px sans-serif`
    ctx.fillStyle = config.theme.textMuted
    ctx.textAlign = 'right'
    ctx.fillText(`第${chapter}章`, W - 6, H - 6)

  }, [genre, worldName, protagonistName, chapter, config])

  return (
    <canvas
      ref={canvasRef}
      width={90}
      height={120}
      className="rounded-lg flex-shrink-0"
      style={{ border: `1px solid ${config.theme.border}` }}
    />
  )
}
