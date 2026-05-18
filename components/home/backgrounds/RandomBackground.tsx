'use client'

import { useEffect, useRef } from 'react'

export default function RandomBackground() {
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

    // 骰子
    const dice: {
      x: number; y: number; size: number
      rotX: number; rotY: number; rotZ: number
      rotSpeedX: number; rotSpeedY: number
      opacity: number; bobOffset: number
    }[] = []

    for (let i = 0; i < 6; i++) {
      dice.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 30 + 20,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.2 + 0.06,
        bobOffset: Math.random() * Math.PI * 2,
      })
    }

    // 问号
    const questions: {
      x: number; y: number; size: number
      opacity: number; bobOffset: number; rotation: number
    }[] = []

    for (let i = 0; i < 12; i++) {
      questions.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 28 + 14,
        opacity: Math.random() * 0.2 + 0.05,
        bobOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.5,
      })
    }

    function drawDice(d: typeof dice[0]) {
      const bobY = Math.sin(time * 50 + d.bobOffset) * 8
      ctx!.save()
      ctx!.translate(d.x, d.y + bobY)
      ctx!.rotate(d.rotZ)
      ctx!.globalAlpha = d.opacity

      const s = d.size

      // 骰子主体
      ctx!.fillStyle = 'rgba(255,255,255,0.15)'
      ctx!.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx!.lineWidth = 1.5

      // 正面
      ctx!.beginPath()
      ctx!.roundRect(-s / 2, -s / 2, s, s, s * 0.15)
      ctx!.fill()
      ctx!.stroke()

      // 侧面（3D效果）
      ctx!.fillStyle = 'rgba(200,200,200,0.08)'
      ctx!.beginPath()
      ctx!.moveTo(s / 2, -s / 2)
      ctx!.lineTo(s / 2 + s * 0.2, -s / 2 - s * 0.2)
      ctx!.lineTo(s / 2 + s * 0.2, s / 2 - s * 0.2)
      ctx!.lineTo(s / 2, s / 2)
      ctx!.closePath()
      ctx!.fill()
      ctx!.stroke()

      // 顶面
      ctx!.beginPath()
      ctx!.moveTo(-s / 2, -s / 2)
      ctx!.lineTo(-s / 2 + s * 0.2, -s / 2 - s * 0.2)
      ctx!.lineTo(s / 2 + s * 0.2, -s / 2 - s * 0.2)
      ctx!.lineTo(s / 2, -s / 2)
      ctx!.closePath()
      ctx!.fill()
      ctx!.stroke()

      // 点数
      ctx!.fillStyle = 'rgba(255,255,255,0.6)'
      const dots = [
        [0, 0],
        [-s * 0.2, -s * 0.2], [s * 0.2, s * 0.2],
      ]
      dots.forEach(([dx, dy]) => {
        ctx!.beginPath()
        ctx!.arc(dx, dy, s * 0.07, 0, Math.PI * 2)
        ctx!.fill()
      })

      ctx!.restore()
    }

    function drawQuestion(q: typeof questions[0]) {
      const bobY = Math.sin(time * 40 + q.bobOffset) * 6
      ctx!.save()
      ctx!.translate(q.x, q.y + bobY)
      ctx!.rotate(q.rotation + Math.sin(time * 30 + q.bobOffset) * 0.05)
      ctx!.globalAlpha = q.opacity
      ctx!.font = `bold ${q.size}px serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillStyle = 'rgba(255,255,255,0.8)'
      ctx!.shadowBlur = 8
      ctx!.shadowColor = 'rgba(255,255,255,0.4)'
      ctx!.fillText('？', 0, 0)
      ctx!.restore()
    }

    // 彩色粒子
    const particles: {
      x: number; y: number; color: string
      size: number; speed: number; opacity: number
    }[] = []

    const colors = ['#FF6B6B', '#FFD700', '#7BC67E', '#87CEEB', '#DDA0DD', '#FF8C00']

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.2 + 0.05,
      })
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.008

      // 粒子
      particles.forEach((p) => {
        p.y -= p.speed
        if (p.y < -10) {
          p.y = canvas!.height + 10
          p.x = Math.random() * canvas!.width
        }
        ctx!.save()
        ctx!.globalAlpha = p.opacity
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.fill()
        ctx!.restore()
      })

      // 骰子
      dice.forEach((d) => {
        d.rotZ += d.rotSpeedX
        drawDice(d)
      })

      // 问号
      questions.forEach((q) => drawQuestion(q))

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