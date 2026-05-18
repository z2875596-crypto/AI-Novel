'use client'

import { useEffect, useRef } from 'react'

export default function ComedyBackground() {
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

    const emojis = ['😂', '🤣', '😆', '🤪', '😜', '🤡', '💥', '✨', '🎉', '🎊', '😅', '🙈']

    const floatingEmojis: {
      x: number; y: number; emoji: string; size: number
      speedX: number; speedY: number; rotation: number
      rotationSpeed: number; opacity: number; bobOffset: number
    }[] = []

    for (let i = 0; i < 20; i++) {
      floatingEmojis.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.random() * 24 + 16,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.25 + 0.08,
        bobOffset: Math.random() * Math.PI * 2,
      })
    }

    // 彩色气泡
    const bubbles: {
      x: number; y: number; radius: number; color: string
      speed: number; opacity: number
    }[] = []

    const bubbleColors = ['#7BC67E', '#FFD700', '#FF6B6B', '#87CEEB', '#DDA0DD']

    for (let i = 0; i < 15; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 20 + 8,
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        speed: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.12 + 0.04,
      })
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.01

      // 气泡
      bubbles.forEach((b) => {
        b.y -= b.speed
        if (b.y < -b.radius * 2) {
          b.y = canvas!.height + b.radius
          b.x = Math.random() * canvas!.width
        }

        ctx!.save()
        ctx!.globalAlpha = b.opacity
        ctx!.beginPath()
        ctx!.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx!.strokeStyle = b.color
        ctx!.lineWidth = 1.5
        ctx!.stroke()

        // 气泡高光
        ctx!.beginPath()
        ctx!.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(255,255,255,0.5)'
        ctx!.fill()
        ctx!.restore()
      })

      // 表情包
      floatingEmojis.forEach((e) => {
        e.x += e.speedX
        e.y += e.speedY + Math.sin(time * 50 + e.bobOffset) * 0.3
        e.rotation += e.rotationSpeed

        if (e.x < -50) e.x = canvas!.width + 50
        if (e.x > canvas!.width + 50) e.x = -50
        if (e.y < -50) e.y = canvas!.height + 50
        if (e.y > canvas!.height + 50) e.y = -50

        ctx!.save()
        ctx!.translate(e.x, e.y)
        ctx!.rotate(e.rotation)
        ctx!.globalAlpha = e.opacity
        ctx!.font = `${e.size}px serif`
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(e.emoji, 0, 0)
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