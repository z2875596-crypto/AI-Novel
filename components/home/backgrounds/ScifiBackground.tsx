'use client'

import { useEffect, useRef } from 'react'

export default function ScifiBackground() {
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

    // 星空
    const stars: { x: number; y: number; r: number; blink: number }[] = []
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        blink: Math.random() * Math.PI * 2,
      })
    }

    // 扫描线
    const scanLines: { y: number; speed: number }[] = []
    for (let i = 0; i < 5; i++) {
      scanLines.push({ y: Math.random() * canvas.height, speed: Math.random() * 0.5 + 0.3 })
    }

    // 六边形网格节点
    const hexNodes: { x: number; y: number }[] = []
    const hexSize = 60
    for (let row = -2; row < canvas.height / hexSize + 2; row++) {
      for (let col = -2; col < canvas.width / (hexSize * 1.5) + 2; col++) {
        const offsetX = row % 2 === 0 ? 0 : hexSize * 0.75
        hexNodes.push({ x: col * hexSize * 1.5 + offsetX, y: row * hexSize * 0.87 })
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 星空
      stars.forEach((s) => {
        const alpha = (Math.sin(time * 2 + s.blink) * 0.3 + 0.7) * 0.6
        ctx!.fillStyle = `rgba(0,191,255,${alpha})`
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx!.fill()
      })

      // 六边形网格
      ctx!.strokeStyle = 'rgba(0,191,255,0.06)'
      ctx!.lineWidth = 0.5
      hexNodes.forEach((n) => {
        ctx!.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const hx = n.x + Math.cos(angle) * hexSize * 0.45
          const hy = n.y + Math.sin(angle) * hexSize * 0.45
          if (i === 0) ctx!.moveTo(hx, hy)
          else ctx!.lineTo(hx, hy)
        }
        ctx!.closePath()
        ctx!.stroke()
      })

      // 扫描线
      scanLines.forEach((s) => {
        s.y += s.speed
        if (s.y > canvas!.height + 20) s.y = -20
        ctx!.strokeStyle = 'rgba(0,191,255,0.08)'
        ctx!.lineWidth = 1.5
        ctx!.beginPath()
        ctx!.moveTo(0, s.y)
        ctx!.lineTo(canvas!.width, s.y)
        ctx!.stroke()
        const glow = ctx!.createLinearGradient(0, s.y - 4, 0, s.y + 4)
        glow.addColorStop(0, 'rgba(0,191,255,0)')
        glow.addColorStop(0.5, 'rgba(0,191,255,0.04)')
        glow.addColorStop(1, 'rgba(0,191,255,0)')
        ctx!.fillStyle = glow
        ctx!.fillRect(0, s.y - 4, canvas!.width, 8)
      })

      // 中央光晕
      const centerGlow = ctx!.createRadialGradient(
        canvas!.width / 2, canvas!.height / 2, 0,
        canvas!.width / 2, canvas!.height / 2, canvas!.width * 0.6
      )
      centerGlow.addColorStop(0, 'rgba(0,191,255,0.03)')
      centerGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = centerGlow
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

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
