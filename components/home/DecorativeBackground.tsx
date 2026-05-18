'use client'

import { useEffect, useRef } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

export default function DecorativeBackground() {
  const genre = useGenreStore((s) => s.genre)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const primary = genre ? GENRE_CONFIG[genre].theme.primary : '#E8607A'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 粒子
    const particles: {
      x: number; y: number; size: number
      speedX: number; speedY: number; opacity: number
    }[] = []

    // 只在两侧生成粒子
    for (let i = 0; i < 60; i++) {
      const side = Math.random() > 0.5
      particles.push({
        x: side
          ? Math.random() * (canvas.width * 0.18)
          : canvas.width - Math.random() * (canvas.width * 0.18),
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    // 解析颜色
    const hex = primary.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    let animId: number

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY

        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        if (p.x < 0) p.x = canvas.width * 0.18
        if (p.x > canvas.width) p.x = canvas.width - canvas.width * 0.18

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`
        ctx.fill()

        // 发光
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        grd.addColorStop(0, `rgba(${r},${g},${b},${p.opacity * 0.3})`)
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grd
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [primary])

  return (
    <>
      {/* Canvas 粒子层 - 只在宽屏显示 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none hidden lg:block"
        style={{ zIndex: 0, opacity: 0.6 }}
      />

      {/* 左侧渐变遮罩 */}
      <div
        className="fixed left-0 top-0 bottom-0 w-48 pointer-events-none hidden lg:block"
        style={{
          zIndex: 1,
          background: `linear-gradient(to right, ${primary}08, transparent)`,
        }}
      />

      {/* 右侧渐变遮罩 */}
      <div
        className="fixed right-0 top-0 bottom-0 w-48 pointer-events-none hidden lg:block"
        style={{
          zIndex: 1,
          background: `linear-gradient(to left, ${primary}08, transparent)`,
        }}
      />

      {/* 顶部光晕 */}
      <div
        className="fixed top-0 left-0 right-0 h-40 pointer-events-none hidden lg:block"
        style={{
          zIndex: 1,
          background: `radial-gradient(ellipse at 50% 0%, ${primary}15 0%, transparent 70%)`,
        }}
      />
    </>
  )
}