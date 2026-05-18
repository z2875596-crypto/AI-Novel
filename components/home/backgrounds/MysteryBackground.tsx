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

    // 雾气
    const fogParticles: {
      x: number; y: number; radius: number
      speedX: number; opacity: number
    }[] = []

    for (let i = 0; i < 12; i++) {
      fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 250 + 150,
        speedX: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.06 + 0.02,
      })
    }

    // 档案文字
    const texts = [
      'CASE #4721', 'CLASSIFIED', 'TOP SECRET',
      'SUSPECT', 'EVIDENCE', '嫌疑人',
      '机密档案', '目击者', 'UNKNOWN',
      '案发时间：23:47', '不在场证明', 'DNA样本',
    ]

    const activeTexts: {
      text: string; x: number; y: number
      opacity: number; maxOpacity: number
      phase: 'in' | 'hold' | 'out'
      timer: number
    }[] = []

    // 扫描线
    let scanY = 0

    // 红色警告
    let warningTimer = 0
    let warningActive = false
    let warningOpacity = 0

    function spawnText() {
      if (activeTexts.length >= 6) return
      activeTexts.push({
        text: texts[Math.floor(Math.random() * texts.length)],
        x: Math.random() * (canvas!.width * 0.8) + canvas!.width * 0.1,
        y: Math.random() * (canvas!.height * 0.8) + canvas!.height * 0.1,
        opacity: 0,
        maxOpacity: Math.random() * 0.55 + 0.3,
        phase: 'in',
        timer: 0,
      })
    }

    let spawnTimer = 0

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.008

      // 雾气层
      fogParticles.forEach((f) => {
        f.x += f.speedX
        if (f.x > canvas!.width + f.radius) f.x = -f.radius

        const grad = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius)
        grad.addColorStop(0, `rgba(160,160,140,${f.opacity})`)
        grad.addColorStop(1, 'rgba(160,160,140,0)')
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
        ctx!.fill()
      })

      // 档案文字
      spawnTimer++
      if (spawnTimer > 60) {
        spawnText()
        spawnTimer = 0
      }

      activeTexts.forEach((t, i) => {
        t.timer++
        if (t.phase === 'in') {
          t.opacity += 0.015
          if (t.opacity >= t.maxOpacity) {
            t.opacity = t.maxOpacity
            t.phase = 'hold'
            t.timer = 0
          }
        } else if (t.phase === 'hold') {
          if (t.timer > 120) {
            t.phase = 'out'
          }
        } else {
          t.opacity -= 0.01
          if (t.opacity <= 0) {
            activeTexts.splice(i, 1)
            return
          }
        }

        ctx!.save()
        ctx!.globalAlpha = t.opacity

        // 文字背景框
        const fontSize = 14
        ctx!.font = `bold ${fontSize}px monospace`
        const tw = ctx!.measureText(t.text).width
        ctx!.fillStyle = 'rgba(0,0,0,0.5)'
        ctx!.fillRect(t.x - 6, t.y - fontSize - 2, tw + 12, fontSize + 8)

        // 边框
        ctx!.strokeStyle = `rgba(184,150,12,${t.opacity * 0.8})`
        ctx!.lineWidth = 1
        ctx!.strokeRect(t.x - 6, t.y - fontSize - 2, tw + 12, fontSize + 8)

        // 文字
        ctx!.fillStyle = '#D4A017'
        ctx!.fillText(t.text, t.x, t.y)

        // 红外扫描效果：绿色文字版本
        ctx!.fillStyle = `rgba(0,255,100,${t.opacity * 0.3})`
        ctx!.fillText(t.text, t.x + 1, t.y + 1)

        ctx!.restore()
      })

      // 扫描线
      scanY += 1.5
      if (scanY > canvas!.height) scanY = 0

      ctx!.save()
      ctx!.globalAlpha = 0.06
      const scanGrad = ctx!.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      scanGrad.addColorStop(0, 'rgba(0,255,100,0)')
      scanGrad.addColorStop(0.5, 'rgba(0,255,100,1)')
      scanGrad.addColorStop(1, 'rgba(0,255,100,0)')
      ctx!.fillStyle = scanGrad
      ctx!.fillRect(0, scanY - 20, canvas!.width, 40)
      ctx!.restore()

      // 水平扫描线纹理
      ctx!.save()
      ctx!.globalAlpha = 0.02
      for (let y = 0; y < canvas!.height; y += 4) {
        ctx!.fillStyle = 'rgba(0,0,0,0.5)'
        ctx!.fillRect(0, y, canvas!.width, 2)
      }
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
      style={{ zIndex: 0, opacity: 1 }}
    />
  )
}