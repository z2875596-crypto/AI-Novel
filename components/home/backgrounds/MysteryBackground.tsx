'use client'

import { useEffect, useRef } from 'react'

export default function MysteryBackground() {
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

    // 雾气粒子
    const fogParticles: {
      x: number; y: number; radius: number
      speed: number; opacity: number; angle: number
    }[] = []

    for (let i = 0; i < 15; i++) {
      fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 200 + 100,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.08 + 0.02,
        angle: Math.random() * Math.PI * 2,
      })
    }

    // 档案文字
    const texts = [
      'CASE #4721', 'CLASSIFIED', 'TOP SECRET',
      'SUSPECT', 'EVIDENCE', 'WITNESS',
      '档案编号', '机密文件', '线索',
      'UNKNOWN', 'WARNING', '嫌疑人',
    ]
    const floatingTexts: {
      text: string; x: number; y: number
      opacity: number; life: number; speed: number
    }[] = []

    // 警告闪烁
    const warnings: { life: number; opacity: number }[] = []

    function spawnText() {
      floatingTexts.push({
        text: texts[Math.floor(Math.random() * texts.length)],
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        opacity: 0,
        life: 1,
        speed: Math.random() * 0.003 + 0.001,
      })
    }

    let textTimer = 0
    let warningTimer = 0

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 雾气
      fogParticles.forEach((f) => {
        f.x += Math.cos(f.angle + time) * f.speed
        f.y += Math.sin(f.angle + time * 0.7) * f.speed * 0.5
        if (f.x < -f.radius) f.x = canvas!.width + f.radius
        if (f.x > canvas!.width + f.radius) f.x = -f.radius
        if (f.y < -f.radius) f.y = canvas!.height + f.radius
        if (f.y > canvas!.height + f.radius) f.y = -f.radius

        const grad = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius)
        grad.addColorStop(0, `rgba(180,170,140,${f.opacity})`)
        grad.addColorStop(1, 'rgba(180,170,140,0)')
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
        ctx!.fill()
      })

      // 档案文字
      textTimer++
      if (textTimer > 80) {
        spawnText()
        textTimer = 0
      }

      floatingTexts.forEach((t, i) => {
        if (t.life > 0.7) t.opacity += t.speed * 3
        else t.opacity -= t.speed * 2
        t.life -= t.speed * 0.5

        if (t.life <= 0) {
          floatingTexts.splice(i, 1)
          return
        }

        ctx!.save()
        ctx!.globalAlpha = Math.max(0, Math.min(0.15, t.opacity))
        ctx!.font = `${Math.random() > 0.7 ? 'bold ' : ''}${Math.floor(Math.random() * 6 + 10)}px monospace`
        ctx!.fillStyle = '#B8960C'
        ctx!.fillText(t.text, t.x, t.y)

        // 扫描线效果
        ctx!.strokeStyle = `rgba(184,150,12,${t.opacity * 0.3})`
        ctx!.lineWidth = 0.5
        ctx!.beginPath()
        ctx!.moveTo(t.x - 5, t.y)
        ctx!.lineTo(t.x + ctx!.measureText(t.text).width + 5, t.y)
        ctx!.stroke()
        ctx!.restore()
      })

      // 红色警告闪烁
      warningTimer++
      if (warningTimer > 200 + Math.random() * 100) {
        warnings.push({ life: 1, opacity: 0.15 })
        warningTimer = 0
      }

      warnings.forEach((w, i) => {
        w.life -= 0.03
        w.opacity = Math.sin(w.life * Math.PI) * 0.12
        if (w.life <= 0) {
          warnings.splice(i, 1)
          return
        }
        ctx!.save()
        ctx!.globalAlpha = w.opacity
        ctx!.fillStyle = '#CC0000'
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

        // WARNING 文字
        ctx!.globalAlpha = w.opacity * 3
        ctx!.font = 'bold 48px monospace'
        ctx!.fillStyle = '#FF0000'
        ctx!.textAlign = 'center'
        ctx!.fillText('⚠ WARNING ⚠', canvas!.width / 2, canvas!.height / 2)
        ctx!.textAlign = 'left'
        ctx!.restore()
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
      style={{ zIndex: 0, opacity: 0.9 }}
    />
  )
}