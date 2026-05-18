'use client'

import { useEffect, useRef } from 'react'

export default function MagicBackground() {
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

    // 星星
    const stars: {
      x: number; y: number; size: number; opacity: number; twinkleSpeed: number
    }[] = []

    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      })
    }

    // 魔法书
    const books: {
      x: number; y: number; width: number; height: number
      angle: number; pageAngle: number; pageDir: number
      floatOffset: number; floatSpeed: number; opacity: number
    }[] = []

    for (let i = 0; i < 3; i++) {
      books.push({
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: Math.random() * canvas.height * 0.6 + canvas.height * 0.2,
        width: 60 + Math.random() * 30,
        height: 45 + Math.random() * 20,
        angle: (Math.random() - 0.5) * 0.4,
        pageAngle: 0,
        pageDir: 1,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.01 + 0.005,
        opacity: Math.random() * 0.2 + 0.08,
      })
    }

    function drawStar(x: number, y: number, size: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity
      ctx!.fillStyle = '#e8d5ff'
      ctx!.shadowBlur = 4
      ctx!.shadowColor = '#9B59B6'
      ctx!.beginPath()
      ctx!.arc(x, y, size, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.restore()
    }

    function drawHexagram(cx: number, cy: number, r: number, angle: number, opacity: number) {
      ctx!.save()
      ctx!.translate(cx, cy)
      ctx!.rotate(angle)
      ctx!.globalAlpha = opacity
      ctx!.strokeStyle = '#9B59B6'
      ctx!.lineWidth = 1

      // 六芒星两个三角形
      for (let t = 0; t < 2; t++) {
        ctx!.beginPath()
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 + (t * Math.PI) / 3
          const x = r * Math.cos(a)
          const y = r * Math.sin(a)
          if (i === 0) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        }
        ctx!.closePath()
        ctx!.stroke()
      }

      // 同心圆
      [r * 0.4, r * 0.7, r * 1.1].forEach((cr) => {
        ctx!.beginPath()
        ctx!.arc(0, 0, cr, 0, Math.PI * 2)
        ctx!.stroke()
      })

      // 符文点
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3
        const px = r * 0.85 * Math.cos(a)
        const py = r * 0.85 * Math.sin(a)
        ctx!.beginPath()
        ctx!.arc(px, py, 2, 0, Math.PI * 2)
        ctx!.fillStyle = '#9B59B6'
        ctx!.fill()
      }

      ctx!.restore()
    }

    function drawBook(book: typeof books[0]) {
      ctx!.save()
      const floatY = Math.sin(time * book.floatSpeed * 100 + book.floatOffset) * 8
      ctx!.translate(book.x, book.y + floatY)
      ctx!.rotate(book.angle)
      ctx!.globalAlpha = book.opacity

      const w = book.width
      const h = book.height

      // 书背景
      ctx!.fillStyle = '#4a2060'
      ctx!.fillRect(-w / 2, -h / 2, w, h)

      // 书脊
      ctx!.fillStyle = '#3a1550'
      ctx!.fillRect(-w / 2, -h / 2, w * 0.08, h)

      // 翻页效果
      book.pageAngle += book.pageDir * 0.02
      if (book.pageAngle > 0.5) book.pageDir = -1
      if (book.pageAngle < -0.5) book.pageDir = 1

      // 书页
      ctx!.fillStyle = '#e8d5ff'
      ctx!.beginPath()
      ctx!.moveTo(-w * 0.42, -h / 2 + 2)
      ctx!.quadraticCurveTo(0, -h / 2 - book.pageAngle * 20, w * 0.42, -h / 2 + 2)
      ctx!.lineTo(w * 0.42, h / 2 - 2)
      ctx!.lineTo(-w * 0.42, h / 2 - 2)
      ctx!.closePath()
      ctx!.fill()

      // 文字线条
      ctx!.strokeStyle = 'rgba(100,50,150,0.3)'
      ctx!.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        const ly = -h / 2 + h * 0.2 + i * h * 0.12
        ctx!.beginPath()
        ctx!.moveTo(-w * 0.35, ly)
        ctx!.lineTo(w * 0.35 * (0.5 + Math.random() * 0.5), ly)
        ctx!.stroke()
      }

      ctx!.restore()
    }

    // 法阵中心
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      // 星星
      stars.forEach((s) => {
        const twinkle = Math.sin(time * s.twinkleSpeed * 100) * 0.3 + 0.7
        drawStar(s.x, s.y, s.size, s.opacity * twinkle)
      })

      // 法阵（多层旋转）
      drawHexagram(cx, cy, 180, time * 0.3, 0.06)
      drawHexagram(cx, cy, 130, -time * 0.5, 0.05)
      drawHexagram(cx, cy, 80, time * 0.8, 0.04)

      // 魔法书
      books.forEach((b) => drawBook(b))

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