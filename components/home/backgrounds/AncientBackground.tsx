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

    for (let i = 0; i < 35; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI,
        speed: Math.random() * 1.2 + 0.4,
        size: Math.random() * 22 + 12,
        opacity: Math.random() * 0.5 + 0.2,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    function drawPalace(
      x: number, y: number, w: number, h: number, opacity: number
    ) {
      ctx!.save()
      ctx!.globalAlpha = opacity

      // 宫殿主体墙体
      const wallGrad = ctx!.createLinearGradient(x, y, x, y + h)
      wallGrad.addColorStop(0, 'rgba(180,80,40,0.85)')
      wallGrad.addColorStop(0.4, 'rgba(160,60,30,0.75)')
      wallGrad.addColorStop(1, 'rgba(100,35,15,0.5)')
      ctx!.fillStyle = wallGrad
      ctx!.fillRect(x, y + h * 0.28, w, h * 0.72)

      // 墙体边框
      ctx!.strokeStyle = 'rgba(210,150,50,0.6)'
      ctx!.lineWidth = 1.5
      ctx!.strokeRect(x, y + h * 0.28, w, h * 0.72)

      // 主屋顶
      ctx!.beginPath()
      ctx!.moveTo(x - w * 0.18, y + h * 0.28)
      ctx!.lineTo(x + w * 0.5, y)
      ctx!.lineTo(x + w + w * 0.18, y + h * 0.28)
      ctx!.closePath()
      const roofGrad = ctx!.createLinearGradient(x, y, x, y + h * 0.28)
      roofGrad.addColorStop(0, 'rgba(200,50,30,0.9)')
      roofGrad.addColorStop(0.6, 'rgba(180,60,30,0.8)')
      roofGrad.addColorStop(1, 'rgba(160,70,35,0.6)')
      ctx!.fillStyle = roofGrad
      ctx!.fill()

      // 屋脊金线
      ctx!.strokeStyle = 'rgba(255,200,50,0.8)'
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(x - w * 0.18, y + h * 0.28)
      ctx!.lineTo(x + w * 0.5, y)
      ctx!.lineTo(x + w + w * 0.18, y + h * 0.28)
      ctx!.stroke()

      // 飞檐翘角
      ctx!.strokeStyle = 'rgba(255,200,50,0.7)'
      ctx!.lineWidth = 1.5
      // 左翘角
      ctx!.beginPath()
      ctx!.moveTo(x - w * 0.18, y + h * 0.28)
      ctx!.quadraticCurveTo(x - w * 0.25, y + h * 0.22, x - w * 0.22, y + h * 0.18)
      ctx!.stroke()
      // 右翘角
      ctx!.beginPath()
      ctx!.moveTo(x + w + w * 0.18, y + h * 0.28)
      ctx!.quadraticCurveTo(x + w + w * 0.25, y + h * 0.22, x + w + w * 0.22, y + h * 0.18)
      ctx!.stroke()

      // 二层小屋顶
      ctx!.beginPath()
      ctx!.moveTo(x + w * 0.1, y + h * 0.45)
      ctx!.lineTo(x + w * 0.5, y + h * 0.3)
      ctx!.lineTo(x + w * 0.9, y + h * 0.45)
      ctx!.closePath()
      ctx!.fillStyle = 'rgba(190,55,28,0.7)'
      ctx!.fill()
      ctx!.strokeStyle = 'rgba(255,200,50,0.5)'
      ctx!.lineWidth = 1
      ctx!.stroke()

      // 柱子
      const colCount = 4
      const colSpacing = w / (colCount + 1)
      for (let i = 1; i <= colCount; i++) {
        const cx = x + colSpacing * i
        const colGrad = ctx!.createLinearGradient(cx - 4, 0, cx + 4, 0)
        colGrad.addColorStop(0, 'rgba(180,70,30,0.8)')
        colGrad.addColorStop(0.5, 'rgba(200,90,40,0.9)')
        colGrad.addColorStop(1, 'rgba(160,60,25,0.7)')
        ctx!.fillStyle = colGrad
        ctx!.fillRect(cx - 4, y + h * 0.28, 8, h * 0.72)

        // 柱础
        ctx!.fillStyle = 'rgba(210,170,80,0.6)'
        ctx!.fillRect(cx - 6, y + h * 0.28, 12, 6)
        ctx!.fillRect(cx - 6, y + h - 8, 12, 8)
      }

      // 窗格
      const winY = y + h * 0.42
      const winH = h * 0.25
      for (let i = 1; i <= colCount - 1; i++) {
        const wx = x + colSpacing * i + 4
        const ww = colSpacing - 16
        // 窗框
        ctx!.strokeStyle = 'rgba(210,170,80,0.6)'
        ctx!.lineWidth = 1
        ctx!.strokeRect(wx, winY, ww, winH)
        // 窗格十字
        ctx!.beginPath()
        ctx!.moveTo(wx + ww / 2, winY)
        ctx!.lineTo(wx + ww / 2, winY + winH)
        ctx!.moveTo(wx, winY + winH / 2)
        ctx!.lineTo(wx + ww, winY + winH / 2)
        ctx!.stroke()
      }

      // 台阶
      const stepsY = y + h
      const stepsW = w * 0.4
      const stepsX = x + w * 0.3
      for (let s = 0; s < 3; s++) {
        ctx!.fillStyle = `rgba(160,100,50,${0.5 - s * 0.1})`
        ctx!.fillRect(stepsX - s * 8, stepsY + s * 5, stepsW + s * 16, 6)
      }

      ctx!.restore()
    }

    function drawBambooLeaf(
      x: number, y: number, size: number, angle: number, opacity: number
    ) {
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.rotate(angle)
      ctx!.globalAlpha = opacity

      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.bezierCurveTo(size * 0.3, -size * 0.4, size * 0.85, -size * 0.2, size, 0)
      ctx!.bezierCurveTo(size * 0.85, size * 0.2, size * 0.3, size * 0.4, 0, 0)

      const leafGrad = ctx!.createLinearGradient(0, -size * 0.3, size, size * 0.3)
      leafGrad.addColorStop(0, 'rgba(60,110,55,0.9)')
      leafGrad.addColorStop(0.5, 'rgba(80,140,70,0.8)')
      leafGrad.addColorStop(1, 'rgba(50,90,45,0.7)')
      ctx!.fillStyle = leafGrad
      ctx!.fill()

      // 叶脉
      ctx!.strokeStyle = 'rgba(40,80,35,0.6)'
      ctx!.lineWidth = 0.8
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.lineTo(size, 0)
      ctx!.stroke()

      // 侧脉
      for (let i = 1; i <= 3; i++) {
        const lx = size * i * 0.22
        ctx!.beginPath()
        ctx!.moveTo(lx, 0)
        ctx!.lineTo(lx + size * 0.06, -size * 0.15)
        ctx!.moveTo(lx, 0)
        ctx!.lineTo(lx + size * 0.06, size * 0.15)
        ctx!.stroke()
      }

      ctx!.restore()
    }

    // 宫殿配置（更多、更清晰）
    const palaces = [
      { x: -60, w: 220, h: 200, opacity: 0.35 },
      { x: 180, w: 300, h: 260, opacity: 0.38 },
      { x: 490, w: 340, h: 280, opacity: 0.4 },
      { x: 840, w: 290, h: 250, opacity: 0.36 },
      { x: 1130, w: 320, h: 270, opacity: 0.37 },
      { x: 1410, w: 240, h: 210, opacity: 0.32 },
    ]

    // 红墙
    function drawWall(opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity

      const wallH = 80
      const wallY = canvas!.height - wallH

      // 红墙主体
      const wallGrad = ctx!.createLinearGradient(0, wallY, 0, wallY + wallH)
      wallGrad.addColorStop(0, 'rgba(190,60,30,0.7)')
      wallGrad.addColorStop(1, 'rgba(140,40,20,0.5)')
      ctx!.fillStyle = wallGrad
      ctx!.fillRect(0, wallY, canvas!.width, wallH)

      // 金色压顶
      ctx!.fillStyle = 'rgba(220,170,50,0.7)'
      ctx!.fillRect(0, wallY - 10, canvas!.width, 12)

      // 墙砖纹
      ctx!.strokeStyle = 'rgba(150,45,20,0.4)'
      ctx!.lineWidth = 0.5
      const brickW = 60
      const brickH = 20
      for (let row = 0; row < 4; row++) {
        const offset = (row % 2) * brickW * 0.5
        for (let col = -1; col < canvas!.width / brickW + 1; col++) {
          ctx!.strokeRect(
            col * brickW + offset,
            wallY + row * brickH,
            brickW,
            brickH
          )
        }
      }

      ctx!.restore()
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 红墙
      drawWall(0.6)

      // 宫殿剪影
      palaces.forEach((p) => {
        drawPalace(p.x, canvas!.height - p.h - 70, p.w, p.h, p.opacity)
      })

      // 竹叶飘落
      leaves.forEach((l) => {
        l.y += l.speed
        l.x += Math.sin(time * l.swingSpeed * 60 + l.swing) * 0.8
        l.angle += 0.008
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
      style={{ zIndex: 0, opacity: 0.9 }}
    />
  )
}