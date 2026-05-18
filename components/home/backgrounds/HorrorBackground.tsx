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
        y: Math.random() * canvas.height,
        size: Math.random() * 40 + 20,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.12 + 0.04,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        direction: Math.random() > 0.5 ? 1 : -1,
      })
    }

    // 血手印
    const handprints: {
      x: number; y: number; size: number; angle: number; opacity: number
    }[] = []

    for (let i = 0; i < 8; i++) {
      handprints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 30 + 20,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.08 + 0.02,
      })
    }

    function drawHandprint(x: number, y: number, size: number, angle: number, opacity: number) {
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.rotate(angle)
      ctx!.globalAlpha = opacity
      ctx!.fillStyle = '#8B0000'

      // 手掌
      ctx!.beginPath()
      ctx!.ellipse(0, 0, size * 0.4, size * 0.5, 0, 0, Math.PI * 2)
      ctx!.fill()

      // 手指
      const fingers = [
        { x: -size * 0.35, y: -size * 0.5, angle: -0.3 },
        { x: -size * 0.15, y: -size * 0.6, angle: -0.1 },
        { x: size * 0.05, y: -size * 0.62, angle: 0.05 },
        { x: size * 0.25, y: -size * 0.55, angle: 0.2 },
        { x: -size * 0.5, y: -size * 0.1, angle: -0.8 },
      ]

      fingers.forEach((f) => {
        ctx!.save()
        ctx!.translate(f.x, f.y)
        ctx!.rotate(f.angle)
        ctx!.beginPath()
        ctx!.ellipse(0, 0, size * 0.08, size * 0.2, 0, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      })

      ctx!.restore()
    }

    function drawGhost(ghost: typeof ghosts[0]) {
      ctx!.save()
      const wobbleX = Math.sin(time * ghost.wobbleSpeed * 100 + ghost.wobble) * 10
      ctx!.translate(ghost.x + wobbleX, ghost.y)
      ctx!.globalAlpha = ghost.opacity

      const s = ghost.size

      // 幽灵身体
      const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, s)
      grad.addColorStop(0, 'rgba(200,220,255,0.8)')
      grad.addColorStop(0.6, 'rgba(150,180,230,0.4)')
      grad.addColorStop(1, 'rgba(100,120,200,0)')
      ctx!.fillStyle = grad

      ctx!.beginPath()
      ctx!.arc(0, -s * 0.2, s * 0.5, Math.PI, 0)
      ctx!.lineTo(s * 0.5, s * 0.4)

      // 波浪底部
      const waves = 3
      for (let i = 0; i < waves; i++) {
        const wx = s * 0.5 - (i + 0.5) * (s / waves)
        ctx!.quadraticCurveTo(
          wx + s / waves * 0.5, s * 0.6,
          wx, s * 0.4
        )
      }
      ctx!.lineTo(-s * 0.5, s * 0.4)
      ctx!.closePath()
      ctx!.fill()

      // 眼睛
      ctx!.fillStyle = 'rgba(0,0,50,0.6)'
      ctx!.beginPath()
      ctx!.ellipse(-s * 0.15, -s * 0.15, s * 0.08, s * 0.1, 0, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.beginPath()
      ctx!.ellipse(s * 0.15, -s * 0.15, s * 0.08, s * 0.1, 0, 0, Math.PI * 2)
      ctx!.fill()

      ctx!.restore()
    }

    // 血滴
    const bloodDrops: { x: number; y: number; speed: number; size: number; opacity: number }[] = []

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.008

      // 血手印（静态）
      handprints.forEach((h) => {
        drawHandprint(h.x, h.y, h.size, h.angle, h.opacity)
      })

      // 随机血滴
      if (Math.random() < 0.03) {
        bloodDrops.push({
          x: Math.random() * canvas!.width,
          y: 0,
          speed: Math.random() * 2 + 1,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.2 + 0.05,
        })
      }

      bloodDrops.forEach((d, i) => {
        d.y += d.speed
        if (d.y > canvas!.height) {
          bloodDrops.splice(i, 1)
          return
        }
        ctx!.save()
        ctx!.globalAlpha = d.opacity
        ctx!.fillStyle = '#8B0000'
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx!.fill()
        // 拖尾
        ctx!.fillRect(d.x - d.size * 0.3, d.y - d.speed * 3, d.size * 0.6, d.speed * 3)
        ctx!.restore()
      })

      // 幽灵
      ghosts.forEach((g) => {
        g.x += g.speed * g.direction
        g.y += Math.sin(time * g.wobbleSpeed * 50) * 0.5

        if (g.x > canvas!.width + 100) g.x = -100
        if (g.x < -100) g.x = canvas!.width + 100

        drawGhost(g)
      })

      // 整体暗红色氛围
      ctx!.save()
      ctx!.globalAlpha = 0.03
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