'use client'

import { useEffect, useRef } from 'react'

export default function AncientBackground() {
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

    // 竹叶
    const leaves: {
      x: number; y: number; angle: number; speed: number
      size: number; opacity: number; swing: number; swingSpeed: number
    }[] = []

    for (let i = 0; i < 30; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI,
        speed: Math.random() * 1 + 0.3,
        size: Math.random() * 20 + 10,
        opacity: Math.random() * 0.4 + 0.1,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    function drawPalace(x: number, y: number, w: number, h: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity

      // 宫殿主体
      const grad = ctx!.createLinearGradient(x, y, x, y + h)
      grad.addColorStop(0, 'rgba(139,90,43,0.6)')
      grad.addColorStop(1, 'rgba(80,40,20,0.2)')
      ctx!.fillStyle = grad
      ctx!.fillRect(x, y + h * 0.3, w, h * 0.7)

      // 屋顶
      ctx!.beginPath()
      ctx!.moveTo(x - w * 0.2, y + h * 0.3)
      ctx!.lineTo(x + w / 2, y)
      ctx!.lineTo(x + w + w * 0.2, y + h * 0.3)
      ctx!.closePath()
      const roofGrad = ctx!.createLinearGradient(x, y, x, y + h * 0.3)
      roofGrad.addColorStop(0, 'rgba(180,50,30,0.5)')
      roofGrad.addColorStop(1, 'rgba(139,90,43,0.3)')
      ctx!.fillStyle = roofGrad
      ctx!.fill()

      // 金色屋脊
      ctx!.strokeStyle = 'rgba(212,160,48,0.4)'
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(x - w * 0.2, y + h * 0.3)
      ctx!.lineTo(x + w / 2, y)
      ctx!.lineTo(x + w + w * 0.2, y + h * 0.3)
      ctx!.stroke()

      // 柱子
      const colCount = 3
      const colW = w / (colCount + 1)
      for (let i = 1; i <= colCount; i++) {
        ctx!.fillStyle = 'rgba(139,90,43,0.3)'
        ctx!.fillRect(x + colW * i - 3, y + h * 0.3, 6, h * 0.7)
      }

      ctx!.restore()
    }

    function drawBambooLeaf(x: number, y: number, size: number, angle: number, opacity: number) {
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.rotate(angle)
      ctx!.globalAlpha = opacity
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.bezierCurveTo(size * 0.3, -size * 0.5, size * 0.8, -size * 0.3, size, 0)
      ctx!.bezierCurveTo(size * 0.8, size * 0.3, size * 0.3, size * 0.5, 0, 0)
      ctx!.fillStyle = '#4a7c4e'
      ctx!.fill()
      // 叶脉
      ctx!.strokeStyle = 'rgba(60,100,60,0.5)'
      ctx!.lineWidth = 0.5
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.lineTo(size, 0)
      ctx!.stroke()
      ctx!.restore()
    }

    // 宫殿配置
    const palaces = [
      { x: -80, w: 200, h: 180, opacity: 0.12 },
      { x: 150, w: 280, h: 240, opacity: 0.1 },
      { x: 450, w: 320, h: 260, opacity: 0.11 },
      { x: 780, w: 260, h: 220, opacity: 0.09 },
      { x: 1050, w: 300, h: 250, opacity: 0.1 },
      { x: 1300, w: 220, h: 190, opacity: 0.08 },
    ]

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 宫殿剪影
      palaces.forEach((p) => {
        drawPalace(p.x, canvas!.height - p.h, p.w, p.h, p.opacity)
      })

      // 竹叶飘落
      leaves.forEach((l) => {
        l.y += l.speed
        l.x += Math.sin(time * l.swingSpeed * 50 + l.swing) * 0.8
        l.angle += 0.01
        if (l.y > canvas!.height + 20) {
          l.y = -20
          l.x = Math.random() * canvas!.width
        }
        drawBambooLeaf(l.x, l.y, l.size, l.angle, l.opacity)
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