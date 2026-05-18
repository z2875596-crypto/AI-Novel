'use client'

import { useEffect, useRef } from 'react'

export default function UrbanBackground() {
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

    // 霓虹灯
    const neons: {
      x: number; y: number; width: number; color: string
      flickerSpeed: number; flickerOffset: number
    }[] = []

    const neonColors = ['#00F5D4', '#FF00FF', '#00FFFF', '#FFD700', '#FF6B6B']

    for (let i = 0; i < 20; i++) {
      neons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        width: Math.random() * 80 + 20,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        flickerSpeed: Math.random() * 0.1 + 0.02,
        flickerOffset: Math.random() * Math.PI * 2,
      })
    }

    // 车灯光带
    const carLights: {
      x: number; y: number; speed: number
      length: number; color: string; lane: number; direction: number
    }[] = []

    for (let i = 0; i < 8; i++) {
      const direction = Math.random() > 0.5 ? 1 : -1
      carLights.push({
        x: direction === 1 ? -200 : canvas.width + 200,
        y: canvas.height * 0.75 + Math.floor(i / 2) * 25,
        speed: (Math.random() * 4 + 3) * direction,
        length: Math.random() * 100 + 60,
        color: direction === 1 ? '#FFFFFF' : '#FF4444',
        lane: i % 2,
        direction,
      })
    }

    // 摩天大楼
    const buildings: {
      x: number; width: number; height: number
      windows: { x: number; y: number; on: boolean; flickerRate: number }[]
    }[] = []

    function generateBuilding(x: number) {
      const w = Math.random() * 120 + 60
      const h = Math.random() * 300 + 150
      const windows: { x: number; y: number; on: boolean; flickerRate: number }[] = []
      const cols = Math.floor(w / 18)
      const rows = Math.floor(h / 22)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          windows.push({
            x: c * 18 + 6,
            y: r * 22 + 8,
            on: Math.random() > 0.4,
            flickerRate: Math.random() * 0.005,
          })
        }
      }
      buildings.push({ x, width: w, height: h, windows })
    }

    let bx = 0
    while (bx < canvas.width + 150) {
      generateBuilding(bx)
      bx += buildings[buildings.length - 1].width + Math.random() * 10
    }

    function drawBuilding(b: typeof buildings[0]) {
      const by = canvas!.height - b.height

      // 大楼主体
      const grad = ctx!.createLinearGradient(b.x, by, b.x + b.width, by)
      grad.addColorStop(0, 'rgba(8,24,32,0.9)')
      grad.addColorStop(0.5, 'rgba(12,36,48,0.85)')
      grad.addColorStop(1, 'rgba(8,24,32,0.9)')
      ctx!.fillStyle = grad
      ctx!.fillRect(b.x, by, b.width, b.height)

      // 边缘高光
      ctx!.strokeStyle = 'rgba(0,212,184,0.1)'
      ctx!.lineWidth = 1
      ctx!.strokeRect(b.x, by, b.width, b.height)

      // 窗户
      b.windows.forEach((w) => {
        if (Math.random() < w.flickerRate) w.on = !w.on
        if (w.on) {
          const wx = b.x + w.x
          const wy = by + w.y
          ctx!.fillStyle = `rgba(${Math.random() > 0.7 ? '0,212,184' : '255,215,0'},0.6)`
          ctx!.fillRect(wx, wy, 10, 14)
          ctx!.shadowBlur = 4
          ctx!.shadowColor = 'rgba(0,212,184,0.3)'
        }
      })
      ctx!.shadowBlur = 0
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.01

      // 大楼
      buildings.forEach((b) => drawBuilding(b))

      // 地面
      const roadGrad = ctx!.createLinearGradient(0, canvas!.height * 0.72, 0, canvas!.height)
      roadGrad.addColorStop(0, 'rgba(4,12,16,0.95)')
      roadGrad.addColorStop(1, 'rgba(8,24,32,0.98)')
      ctx!.fillStyle = roadGrad
      ctx!.fillRect(0, canvas!.height * 0.72, canvas!.width, canvas!.height * 0.28)

      // 地面反光
      ctx!.strokeStyle = 'rgba(0,212,184,0.08)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(0, canvas!.height * 0.73)
      ctx!.lineTo(canvas!.width, canvas!.height * 0.73)
      ctx!.stroke()

      // 车灯光带
      carLights.forEach((c) => {
        c.x += c.speed
        if (c.direction === 1 && c.x > canvas!.width + 200) c.x = -200
        if (c.direction === -1 && c.x < -200) c.x = canvas!.width + 200

        const grad = ctx!.createLinearGradient(
          c.x, 0,
          c.x + c.length * c.direction, 0
        )
        grad.addColorStop(0, `${c.color}00`)
        grad.addColorStop(0.5, `${c.color}CC`)
        grad.addColorStop(1, `${c.color}00`)
        ctx!.fillStyle = grad
        ctx!.fillRect(
          Math.min(c.x, c.x + c.length * c.direction),
          c.y - 1,
          c.length,
          3
        )

        // 地面倒影
        ctx!.fillStyle = grad
        ctx!.globalAlpha = 0.3
        ctx!.fillRect(
          Math.min(c.x, c.x + c.length * c.direction),
          c.y + 3,
          c.length,
          2
        )
        ctx!.globalAlpha = 1
      })

      // 霓虹灯
      neons.forEach((n) => {
        const flicker = Math.sin(time * n.flickerSpeed * 100 + n.flickerOffset)
        const opacity = (flicker * 0.3 + 0.7) * 0.12
        ctx!.save()
        ctx!.globalAlpha = opacity
        ctx!.strokeStyle = n.color
        ctx!.lineWidth = 2
        ctx!.shadowBlur = 10
        ctx!.shadowColor = n.color
        ctx!.beginPath()
        ctx!.moveTo(n.x, n.y)
        ctx!.lineTo(n.x + n.width, n.y)
        ctx!.stroke()
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