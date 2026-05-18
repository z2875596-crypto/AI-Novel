'use client'

import { useEffect, useRef } from 'react'

export default function XuanhuanBackground() {
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

    // 飞剑
    const swords: {
      x: number; y: number; angle: number; speed: number
      length: number; life: number; trail: { x: number; y: number }[]
    }[] = []

    // 云层
    const clouds: {
      x: number; y: number; width: number; height: number
      speed: number; opacity: number; layer: number
    }[] = []

    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        width: Math.random() * 300 + 150,
        height: Math.random() * 60 + 30,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.15 + 0.05,
        layer: Math.floor(Math.random() * 3),
      })
    }

    function drawCloud(x: number, y: number, w: number, h: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity
      const grad = ctx!.createLinearGradient(x, y, x + w, y + h)
      grad.addColorStop(0, 'rgba(100,130,200,0.8)')
      grad.addColorStop(0.5, 'rgba(80,100,180,0.6)')
      grad.addColorStop(1, 'rgba(60,80,160,0.2)')
      ctx!.fillStyle = grad
      ctx!.beginPath()
      ctx!.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.restore()
    }

    function drawMountain(x: number, y: number, w: number, h: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity
      ctx!.beginPath()
      ctx!.moveTo(x, y + h)
      ctx!.lineTo(x + w / 2, y)
      ctx!.lineTo(x + w, y + h)
      ctx!.closePath()
      const grad = ctx!.createLinearGradient(x, y, x, y + h)
      grad.addColorStop(0, 'rgba(80,100,180,0.4)')
      grad.addColorStop(1, 'rgba(40,60,120,0.1)')
      ctx!.fillStyle = grad
      ctx!.fill()
      ctx!.restore()
    }

    function spawnSword() {
      const fromLeft = Math.random() > 0.5
      swords.push({
        x: fromLeft ? -50 : canvas!.width + 50,
        y: Math.random() * canvas!.height * 0.6 + 50,
        angle: fromLeft ? -0.3 : Math.PI + 0.3,
        speed: Math.random() * 8 + 5,
        length: Math.random() * 60 + 40,
        life: 1,
        trail: [],
      })
    }

    function drawSword(sword: typeof swords[0]) {
      ctx!.save()
      ctx!.globalAlpha = sword.life * 0.9

      // 光轨
      sword.trail.forEach((t, i) => {
        const a = (i / sword.trail.length) * sword.life * 0.4
        ctx!.beginPath()
        ctx!.arc(t.x, t.y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(150,200,255,${a})`
        ctx!.fill()
      })

      ctx!.translate(sword.x, sword.y)
      ctx!.rotate(sword.angle)

      // 剑身
      const grad = ctx!.createLinearGradient(-sword.length / 2, 0, sword.length / 2, 0)
      grad.addColorStop(0, 'rgba(150,200,255,0)')
      grad.addColorStop(0.5, 'rgba(200,230,255,1)')
      grad.addColorStop(1, 'rgba(150,200,255,0)')
      ctx!.strokeStyle = grad
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(-sword.length / 2, 0)
      ctx!.lineTo(sword.length / 2, 0)
      ctx!.stroke()

      // 发光
      ctx!.shadowBlur = 15
      ctx!.shadowColor = 'rgba(150,200,255,0.8)'
      ctx!.stroke()

      ctx!.restore()
    }

    // 山脉配置
    const mountains = [
      { x: -50, w: 300, h: 200, opacity: 0.08 },
      { x: 200, w: 400, h: 280, opacity: 0.06 },
      { x: 500, w: 350, h: 220, opacity: 0.07 },
      { x: 800, w: 500, h: 300, opacity: 0.05 },
      { x: 1100, w: 380, h: 250, opacity: 0.06 },
    ]

    let swordTimer = 0

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 远山
      mountains.forEach((m) => {
        drawMountain(m.x, canvas!.height - m.h, m.w, m.h, m.opacity)
      })

      // 云层
      clouds.forEach((c) => {
        c.x += c.speed
        if (c.x > canvas!.width + c.width) c.x = -c.width
        drawCloud(c.x, c.y + Math.sin(time + c.x * 0.01) * 5, c.width, c.height, c.opacity)
      })

      // 飞剑
      swordTimer++
      if (swordTimer > 180 + Math.random() * 120) {
        spawnSword()
        swordTimer = 0
      }

      swords.forEach((s, i) => {
        s.trail.push({ x: s.x, y: s.y })
        if (s.trail.length > 20) s.trail.shift()
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed * 0.3
        s.life -= 0.008
        if (s.life <= 0 || s.x < -100 || s.x > canvas!.width + 100) {
          swords.splice(i, 1)
          return
        }
        drawSword(s)
      })

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
      style={{ zIndex: 0, opacity: 0.8 }}
    />
  )
}