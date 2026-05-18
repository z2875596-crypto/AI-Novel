'use client'

import { useEffect, useRef } from 'react'

export default function RomanceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // 樱花花瓣
    const petals: {
      x: number; y: number; size: number; speed: number
      angle: number; angleSpeed: number; opacity: number; swing: number; swingSpeed: number
    }[] = []

    // 爱心
    const hearts: {
      x: number; y: number; size: number; speed: number; opacity: number; life: number
    }[] = []

    for (let i = 0; i < 40; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        speed: Math.random() * 1.5 + 0.5,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.5 + 0.2,
        swing: Math.random() * 30,
        swingSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    let time = 0
    let animId: number

    function drawPetal(x: number, y: number, size: number, angle: number, opacity: number) {
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.rotate(angle)
      ctx!.globalAlpha = opacity
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.bezierCurveTo(size, -size, size * 2, size, 0, size * 2)
      ctx!.bezierCurveTo(-size * 2, size, -size, -size, 0, 0)
      ctx!.fillStyle = '#FFB7C5'
      ctx!.fill()
      ctx!.restore()
    }

    function drawHeart(x: number, y: number, size: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity
      ctx!.beginPath()
      ctx!.moveTo(x, y + size / 4)
      ctx!.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4)
      ctx!.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size)
      ctx!.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4)
      ctx!.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4)
      ctx!.fillStyle = '#E8607A'
      ctx!.fill()
      ctx!.restore()
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.01

      // 画花瓣
      petals.forEach((p) => {
        p.y += p.speed
        p.x += Math.sin(time * p.swingSpeed * 100 + p.swing) * 0.5
        p.angle += p.angleSpeed
        if (p.y > canvas!.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas!.width
        }
        drawPetal(p.x, p.y, p.size, p.angle, p.opacity)
      })

      // 随机生成爱心
      if (Math.random() < 0.02) {
        hearts.push({
          x: Math.random() * canvas!.width,
          y: canvas!.height + 20,
          size: Math.random() * 15 + 8,
          speed: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          life: 1,
        })
      }

      hearts.forEach((h, i) => {
        h.y -= h.speed
        h.life -= 0.003
        if (h.life <= 0 || h.y < -50) {
          hearts.splice(i, 1)
          return
        }
        drawHeart(h.x, h.y, h.size, h.opacity * h.life)
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
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  )
}