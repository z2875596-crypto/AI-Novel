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
      width: number
    }[] = []

    // 云层
    const clouds: {
      x: number; y: number; width: number; height: number
      speed: number; opacity: number
    }[] = []

    for (let i = 0; i < 12; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.75,
        width: Math.random() * 400 + 200,
        height: Math.random() * 80 + 40,
        speed: Math.random() * 0.25 + 0.08,
        opacity: Math.random() * 0.12 + 0.04,
      })
    }

    function drawCloud(x: number, y: number, w: number, h: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity

      // 多层椭圆组成云
      const layers = [
        { dx: 0, dy: 0, rx: w * 0.5, ry: h * 0.5 },
        { dx: -w * 0.2, dy: h * 0.1, rx: w * 0.35, ry: h * 0.4 },
        { dx: w * 0.2, dy: h * 0.1, rx: w * 0.35, ry: h * 0.4 },
        { dx: -w * 0.35, dy: h * 0.2, rx: w * 0.2, ry: h * 0.3 },
        { dx: w * 0.35, dy: h * 0.2, rx: w * 0.2, ry: h * 0.3 },
      ]

      layers.forEach((l) => {
        const grad = ctx!.createRadialGradient(
          x + w / 2 + l.dx, y + h / 2 + l.dy, 0,
          x + w / 2 + l.dx, y + h / 2 + l.dy, Math.max(l.rx, l.ry)
        )
        grad.addColorStop(0, 'rgba(140,160,220,0.9)')
        grad.addColorStop(0.4, 'rgba(100,120,200,0.6)')
        grad.addColorStop(1, 'rgba(60,80,160,0)')
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.ellipse(x + w / 2 + l.dx, y + h / 2 + l.dy, l.rx, l.ry, 0, 0, Math.PI * 2)
        ctx!.fill()
      })

      ctx!.restore()
    }

    // 山脉（多层，营造远近感）
    const mountainLayers = [
      // 远山（最淡）
      {
        peaks: [
          { x: -100, w: 400, h: 280 },
          { x: 250, w: 500, h: 350 },
          { x: 650, w: 450, h: 310 },
          { x: 1000, w: 550, h: 380 },
          { x: 1400, w: 400, h: 290 },
        ],
        opacity: 0.09,
        color: ['rgba(60,80,160,0.6)', 'rgba(40,60,120,0.1)'],
      },
      // 中山
      {
        peaks: [
          { x: -50, w: 300, h: 220 },
          { x: 200, w: 380, h: 280 },
          { x: 520, w: 420, h: 260 },
          { x: 880, w: 360, h: 240 },
          { x: 1180, w: 400, h: 270 },
        ],
        opacity: 0.12,
        color: ['rgba(80,100,180,0.7)', 'rgba(50,70,140,0.15)'],
      },
      // 近山（最深）
      {
        peaks: [
          { x: -80, w: 280, h: 180 },
          { x: 170, w: 320, h: 210 },
          { x: 450, w: 360, h: 230 },
          { x: 770, w: 300, h: 200 },
          { x: 1050, w: 340, h: 220 },
          { x: 1340, w: 280, h: 190 },
        ],
        opacity: 0.15,
        color: ['rgba(100,120,200,0.8)', 'rgba(60,80,160,0.2)'],
      },
    ]

    function drawMountainLayer(
      peaks: { x: number; w: number; h: number }[],
      opacity: number,
      colors: string[]
    ) {
      ctx!.save()
      ctx!.globalAlpha = opacity

      peaks.forEach((p) => {
        const by = canvas!.height - p.h + 20

        // 山峰主体
        ctx!.beginPath()
        ctx!.moveTo(p.x, canvas!.height)
        ctx!.lineTo(p.x + p.w * 0.5, by)
        ctx!.lineTo(p.x + p.w, canvas!.height)
        ctx!.closePath()

        const grad = ctx!.createLinearGradient(p.x, by, p.x, canvas!.height)
        grad.addColorStop(0, colors[0])
        grad.addColorStop(1, colors[1])
        ctx!.fillStyle = grad
        ctx!.fill()

        // 山顶雪线
        ctx!.beginPath()
        ctx!.moveTo(p.x + p.w * 0.35, by + p.h * 0.15)
        ctx!.lineTo(p.x + p.w * 0.5, by)
        ctx!.lineTo(p.x + p.w * 0.65, by + p.h * 0.15)
        ctx!.closePath()
        ctx!.fillStyle = 'rgba(220,230,255,0.15)'
        ctx!.fill()
      })

      ctx!.restore()
    }

    function spawnSword() {
      const fromLeft = Math.random() > 0.5
      const isFast = Math.random() > 0.6
      swords.push({
        x: fromLeft ? -100 : canvas!.width + 100,
        y: Math.random() * canvas!.height * 0.65 + 30,
        angle: fromLeft
          ? -(Math.random() * 0.2 + 0.1)
          : Math.PI + (Math.random() * 0.2 + 0.1),
        speed: isFast ? Math.random() * 12 + 8 : Math.random() * 5 + 3,
        length: Math.random() * 80 + 50,
        life: 1,
        trail: [],
        width: isFast ? 1.5 : 2.5,
      })
    }

    function drawSword(sword: typeof swords[0]) {
      ctx!.save()
      ctx!.globalAlpha = sword.life

      // 光轨
      if (sword.trail.length > 1) {
        for (let i = 1; i < sword.trail.length; i++) {
          const t = sword.trail[i]
          const prev = sword.trail[i - 1]
          const a = (i / sword.trail.length) * sword.life * 0.5
          ctx!.beginPath()
          ctx!.moveTo(prev.x, prev.y)
          ctx!.lineTo(t.x, t.y)
          ctx!.strokeStyle = `rgba(180,220,255,${a})`
          ctx!.lineWidth = sword.width * (i / sword.trail.length)
          ctx!.stroke()
        }
      }

      ctx!.translate(sword.x, sword.y)
      ctx!.rotate(sword.angle)

      // 剑身光效
      const grad = ctx!.createLinearGradient(-sword.length * 0.6, 0, sword.length * 0.6, 0)
      grad.addColorStop(0, 'rgba(150,200,255,0)')
      grad.addColorStop(0.3, 'rgba(200,230,255,0.8)')
      grad.addColorStop(0.5, 'rgba(255,255,255,1)')
      grad.addColorStop(0.7, 'rgba(200,230,255,0.8)')
      grad.addColorStop(1, 'rgba(150,200,255,0)')

      ctx!.shadowBlur = 20
      ctx!.shadowColor = 'rgba(150,200,255,0.9)'
      ctx!.strokeStyle = grad
      ctx!.lineWidth = sword.width
      ctx!.beginPath()
      ctx!.moveTo(-sword.length * 0.6, 0)
      ctx!.lineTo(sword.length * 0.6, 0)
      ctx!.stroke()

      // 剑芒（额外发光）
      ctx!.shadowBlur = 40
      ctx!.lineWidth = sword.width * 0.5
      ctx!.globalAlpha = sword.life * 0.4
      ctx!.stroke()

      ctx!.restore()
    }

    // 灵气粒子
    const spiritParticles: {
      x: number; y: number; size: number
      vx: number; vy: number; opacity: number; life: number
    }[] = []

    let swordTimer = 0

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 远山 → 近山（由淡到深）
      mountainLayers.forEach((layer) => {
        drawMountainLayer(layer.peaks, layer.opacity, layer.color)
      })

      // 云层
      clouds.forEach((c) => {
        c.x += c.speed
        if (c.x > canvas!.width + c.width) c.x = -c.width
        const floatY = Math.sin(time * 0.3 + c.x * 0.005) * 8
        drawCloud(c.x, c.y + floatY, c.width, c.height, c.opacity)
      })

      // 灵气粒子
      if (Math.random() < 0.15) {
        spiritParticles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(Math.random() * 0.8 + 0.2),
          opacity: Math.random() * 0.4 + 0.2,
          life: 1,
        })
      }

      spiritParticles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.008
        if (p.life <= 0) { spiritParticles.splice(i, 1); return }
        ctx!.save()
        ctx!.globalAlpha = p.opacity * p.life
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = '#aaddff'
        ctx!.shadowBlur = 6
        ctx!.shadowColor = '#88bbff'
        ctx!.fill()
        ctx!.restore()
      })

      // 飞剑（更高频率）
      swordTimer++
      if (swordTimer > 60 + Math.random() * 80) {
        spawnSword()
        // 有几率同时生成多把剑
        if (Math.random() > 0.6) spawnSword()
        swordTimer = 0
      }

      swords.forEach((s, i) => {
        s.trail.push({ x: s.x, y: s.y })
        if (s.trail.length > 30) s.trail.shift()
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed * 0.2
        s.life -= 0.006
        if (s.life <= 0 || s.x < -200 || s.x > canvas!.width + 200) {
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
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  )
}