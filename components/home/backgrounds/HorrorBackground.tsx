'use client'

import { useEffect, useRef } from 'react'

export default function HorrorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0
    let animId: number

    // 幽灵
    const ghosts: {
      x: number; y: number; size: number; speed: number
      opacity: number; wobble: number; wobbleSpeed: number
      direction: number
    }[] = []

    for (let i = 0; i < 5; i++) {
      ghosts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.8,
        size: Math.random() * 45 + 25,
        speed: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.15 + 0.06,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.008,
        direction: Math.random() > 0.5 ? 1 : -1,
      })
    }

    // 血手印（鲜艳红色）
    const handprints: {
      x: number; y: number; size: number; angle: number; opacity: number
    }[] = []

    for (let i = 0; i < 10; i++) {
      handprints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 35 + 22,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.2 + 0.1,
      })
    }

    function drawHandprint(
      x: number, y: number, size: number, angle: number, opacity: number
    ) {
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.rotate(angle)
      ctx!.globalAlpha = opacity

      // 鲜艳血红色
      ctx!.fillStyle = '#FF0000'
      ctx!.shadowBlur = 8
      ctx!.shadowColor = '#CC0000'

      // 手掌
      ctx!.beginPath()
      ctx!.ellipse(0, 0, size * 0.42, size * 0.52, 0, 0, Math.PI * 2)
      ctx!.fill()

      // 手指
      const fingers = [
        { x: -size * 0.33, y: -size * 0.52, angle: -0.28, len: 0.22 },
        { x: -size * 0.14, y: -size * 0.62, angle: -0.08, len: 0.24 },
        { x: size * 0.06, y: -size * 0.64, angle: 0.04, len: 0.24 },
        { x: size * 0.26, y: -size * 0.56, angle: 0.2, len: 0.22 },
        { x: -size * 0.48, y: -size * 0.1, angle: -0.85, len: 0.18 },
      ]

      fingers.forEach((f) => {
        ctx!.save()
        ctx!.translate(f.x, f.y)
        ctx!.rotate(f.angle)
        ctx!.beginPath()
        ctx!.ellipse(0, 0, size * 0.09, size * f.len, 0, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      })

      // 血迹滴落效果
      ctx!.shadowBlur = 4
      for (let d = 0; d < 3; d++) {
        const dx = (Math.random() - 0.5) * size * 0.6
        const dy = size * 0.3 + Math.random() * size * 0.4
        const dr = Math.random() * size * 0.06 + size * 0.02
        ctx!.beginPath()
        ctx!.ellipse(dx, dy, dr * 0.7, dr, 0, 0, Math.PI * 2)
        ctx!.fill()
      }

      ctx!.restore()
    }

    function drawGhost(ghost: typeof ghosts[0]) {
      ctx!.save()
      const wobbleX = Math.sin(time * ghost.wobbleSpeed * 100 + ghost.wobble) * 12
      ctx!.translate(ghost.x + wobbleX, ghost.y)
      ctx!.globalAlpha = ghost.opacity

      const s = ghost.size

      // 幽灵发光
      const glowGrad = ctx!.createRadialGradient(0, 0, 0, 0, 0, s * 1.2)
      glowGrad.addColorStop(0, 'rgba(180,200,255,0.3)')
      glowGrad.addColorStop(1, 'rgba(180,200,255,0)')
      ctx!.fillStyle = glowGrad
      ctx!.beginPath()
      ctx!.arc(0, 0, s * 1.2, 0, Math.PI * 2)
      ctx!.fill()

      // 幽灵身体
      const grad = ctx!.createRadialGradient(0, -s * 0.1, 0, 0, 0, s)
      grad.addColorStop(0, 'rgba(210,225,255,0.9)')
      grad.addColorStop(0.5, 'rgba(170,190,240,0.6)')
      grad.addColorStop(1, 'rgba(120,140,220,0)')
      ctx!.fillStyle = grad

      ctx!.beginPath()
      ctx!.arc(0, -s * 0.15, s * 0.52, Math.PI, 0)
      ctx!.lineTo(s * 0.52, s * 0.45)

      const waves = 4
      for (let i = 0; i < waves; i++) {
        const wx = s * 0.52 - (i + 0.5) * (s * 1.04 / waves)
        ctx!.quadraticCurveTo(wx + s / waves * 0.5, s * 0.65, wx, s * 0.45)
      }
      ctx!.lineTo(-s * 0.52, s * 0.45)
      ctx!.closePath()
      ctx!.fill()

      // 眼睛
      ctx!.fillStyle = 'rgba(0,0,40,0.7)'
      ctx!.beginPath()
      ctx!.ellipse(-s * 0.16, -s * 0.12, s * 0.09, s * 0.11, 0, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.beginPath()
      ctx!.ellipse(s * 0.16, -s * 0.12, s * 0.09, s * 0.11, 0, 0, Math.PI * 2)
      ctx!.fill()

      // 嘴巴
      ctx!.strokeStyle = 'rgba(0,0,40,0.5)'
      ctx!.lineWidth = 1.5
      ctx!.beginPath()
      ctx!.arc(0, s * 0.1, s * 0.12, 0.2, Math.PI - 0.2)
      ctx!.stroke()

      ctx!.restore()
    }

    // 血滴
    const bloodDrops: {
      x: number; y: number; speed: number; size: number; opacity: number; trail: number
    }[] = []

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.008

      // 血手印（静态背景）
      handprints.forEach((h) => {
        drawHandprint(h.x, h.y, h.size, h.angle, h.opacity)
      })

      // 血滴
      if (Math.random() < 0.04) {
        bloodDrops.push({
          x: Math.random() * canvas!.width,
          y: 0,
          speed: Math.random() * 2.5 + 1,
          size: Math.random() * 5 + 2,
          opacity: Math.random() * 0.25 + 0.1,
          trail: Math.random() * 20 + 10,
        })
      }

      bloodDrops.forEach((d, i) => {
        d.y += d.speed
        if (d.y > canvas!.height + 20) {
          bloodDrops.splice(i, 1)
          return
        }
        ctx!.save()
        ctx!.globalAlpha = d.opacity
        ctx!.fillStyle = '#FF0000'
        ctx!.shadowBlur = 6
        ctx!.shadowColor = '#CC0000'

        // 血滴主体
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx!.fill()

        // 血迹拖尾
        const trailGrad = ctx!.createLinearGradient(d.x, d.y - d.trail, d.x, d.y)
        trailGrad.addColorStop(0, 'rgba(255,0,0,0)')
        trailGrad.addColorStop(1, `rgba(255,0,0,${d.opacity})`)
        ctx!.fillStyle = trailGrad
        ctx!.fillRect(d.x - d.size * 0.35, d.y - d.trail, d.size * 0.7, d.trail)

        ctx!.restore()
      })

      // 幽灵
      ghosts.forEach((g) => {
        g.x += g.speed * g.direction
        g.y += Math.sin(time * g.wobbleSpeed * 60) * 0.4

        if (g.x > canvas!.width + 120) g.x = -120
        if (g.x < -120) g.x = canvas!.width + 120

        drawGhost(g)
      })

      // 整体暗红色氛围
      ctx!.save()
      ctx!.globalAlpha = 0.04
      ctx!.fillStyle = '#8B0000'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.restore()

      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.9 }}
    />
  )
}