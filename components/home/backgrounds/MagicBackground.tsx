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

    const stars: {
      x: number; y: number; size: number
      opacity: number; twinkleSpeed: number; twinkleOffset: number
    }[] = []

    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.5 + 0.15,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      })
    }

    interface Book {
      x: number; y: number
      width: number; height: number
      angle: number
      floatOffset: number; floatSpeed: number
      opacity: number
      pageT: number
      pageDir: number
      pageSpeed: number
      color: string
    }

    const bookColors = ['#4a2060', '#1a3060', '#3a1020', '#1a2a40']
    const books: Book[] = []
    for (let i = 0; i < 4; i++) {
      books.push({
        x: (canvas.width / 5) * (i + 1),
        y: canvas.height * 0.3 + Math.random() * canvas.height * 0.4,
        width: 55 + Math.random() * 25,
        height: 42 + Math.random() * 18,
        angle: (Math.random() - 0.5) * 0.35,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.008 + 0.004,
        opacity: Math.random() * 0.18 + 0.1,
        pageT: 0,
        pageDir: 1,
        pageSpeed: Math.random() * 0.008 + 0.004,
        color: bookColors[i % bookColors.length],
      })
    }

    function drawBook(b: Book) {
      const floatY = Math.sin(time * b.floatSpeed * 100 + b.floatOffset) * 10
      ctx!.save()
      ctx!.translate(b.x, b.y + floatY)
      ctx!.rotate(b.angle)
      ctx!.globalAlpha = b.opacity

      const w = b.width
      const h = b.height
      const spine = w * 0.07

      ctx!.fillStyle = b.color
      ctx!.beginPath()
      ctx!.roundRect(-w / 2, -h / 2, w, h, 4)
      ctx!.fill()

      ctx!.fillStyle = 'rgba(0,0,0,0.35)'
      ctx!.fillRect(-w / 2, -h / 2, spine, h)

      ctx!.fillStyle = '#e8d5ff'
      ctx!.beginPath()
      ctx!.roundRect(-w / 2 + spine, -h / 2 + 2, w / 2 - spine - 2, h - 4, 2)
      ctx!.fill()

      ctx!.strokeStyle = 'rgba(100,50,150,0.25)'
      ctx!.lineWidth = 1
      const lineCount = 6
      for (let i = 0; i < lineCount; i++) {
        const ly = -h / 2 + (h / (lineCount + 1)) * (i + 1)
        const lxStart = -w / 2 + spine + 4
        const lxEnd = w / 2 - 4 - Math.random() * w * 0.2
        ctx!.beginPath()
        ctx!.moveTo(lxStart, ly)
        ctx!.lineTo(lxEnd, ly)
        ctx!.stroke()
      }

      b.pageT += b.pageDir * b.pageSpeed
      if (b.pageT >= 1) { b.pageT = 1; b.pageDir = -1 }
      if (b.pageT <= 0) { b.pageT = 0; b.pageDir = 1 }

      const pageW = w / 2 - spine - 2
      const startX = -w / 2 + spine
      const endX = startX - pageW * b.pageT * 2
      const cpX = startX - pageW * b.pageT
      const cpY = -h * 0.35 - b.pageT * h * 0.25

      ctx!.save()
      ctx!.beginPath()
      ctx!.moveTo(startX, -h / 2 + 2)
      ctx!.quadraticCurveTo(cpX, cpY, endX, -h / 2 + 2)
      ctx!.lineTo(endX, h / 2 - 2)
      ctx!.quadraticCurveTo(cpX, h / 2 - 2 + b.pageT * h * 0.1, startX, h / 2 - 2)
      ctx!.closePath()
      const pageAlpha = 0.9 - b.pageT * 0.3
      ctx!.fillStyle = `rgba(225,210,245,${pageAlpha})`
      ctx!.fill()
      ctx!.strokeStyle = 'rgba(100,60,160,0.2)'
      ctx!.lineWidth = 0.5
      ctx!.stroke()
      ctx!.restore()

      ctx!.fillStyle = 'rgba(180,130,255,0.5)'
      ctx!.font = `bold ${h * 0.18}px serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillText('✦', w / 4, 0)

      ctx!.strokeStyle = 'rgba(180,130,255,0.3)'
      ctx!.lineWidth = 0.8
      ctx!.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6)

      ctx!.restore()
    }

    function drawStar(x: number, y: number, size: number, opacity: number) {
      ctx!.save()
      ctx!.globalAlpha = opacity
      ctx!.fillStyle = '#e8d5ff'
      ctx!.shadowBlur = 5
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
      ctx!.lineWidth = 0.8
      ctx!.shadowBlur = 8
      ctx!.shadowColor = '#9B59B6'

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

      ;[r * 0.35, r * 0.65, r * 1.05].forEach((cr) => {
        ctx!.beginPath()
        ctx!.arc(0, 0, cr, 0, Math.PI * 2)
        ctx!.stroke()
      })

      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3
        ctx!.beginPath()
        ctx!.arc(r * 0.82 * Math.cos(a), r * 0.82 * Math.sin(a), 2, 0, Math.PI * 2)
        ctx!.fillStyle = '#9B59B6'
        ctx!.fill()
      }

      ctx!.restore()
    }

    const magicParticles: {
      x: number; y: number; vx: number; vy: number
      size: number; opacity: number; life: number; color: string
    }[] = []
    const particleColors = ['#c084fc', '#a855f7', '#e879f9', '#818cf8']

    // 左右两个法阵中心
    const cx1 = canvas.width * 0.22
    const cy1 = canvas.height * 0.5
    const cx2 = canvas.width * 0.78
    const cy2 = canvas.height * 0.5

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.005

      stars.forEach((s) => {
        const twinkle = Math.sin(time * s.twinkleSpeed * 100 + s.twinkleOffset) * 0.35 + 0.65
        drawStar(s.x, s.y, s.size, s.opacity * twinkle)
      })

      // 左侧法阵
      drawHexagram(cx1, cy1, 200, time * 0.25, 0.18)
      drawHexagram(cx1, cy1, 140, -time * 0.4, 0.14)
      drawHexagram(cx1, cy1, 85, time * 0.7, 0.12)

      // 右侧法阵
      drawHexagram(cx2, cy2, 200, -time * 0.25, 0.18)
      drawHexagram(cx2, cy2, 140, time * 0.4, 0.14)
      drawHexagram(cx2, cy2, 85, -time * 0.7, 0.12)

      // 左侧中心光点
      ctx!.save()
      ctx!.globalAlpha = 0.15 + Math.sin(time * 80) * 0.05
      const centerGrad1 = ctx!.createRadialGradient(cx1, cy1, 0, cx1, cy1, 30)
      centerGrad1.addColorStop(0, '#c084fc')
      centerGrad1.addColorStop(1, 'rgba(192,132,252,0)')
      ctx!.fillStyle = centerGrad1
      ctx!.beginPath()
      ctx!.arc(cx1, cy1, 30, 0, Math.PI * 2)
      ctx!.fill()

      // 右侧中心光点
      const centerGrad2 = ctx!.createRadialGradient(cx2, cy2, 0, cx2, cy2, 30)
      centerGrad2.addColorStop(0, '#c084fc')
      centerGrad2.addColorStop(1, 'rgba(192,132,252,0)')
      ctx!.fillStyle = centerGrad2
      ctx!.beginPath()
      ctx!.arc(cx2, cy2, 30, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.restore()

      // 粒子从两个法阵中心发射
      if (Math.random() < 0.12) {
        const fromLeft = Math.random() > 0.5
        const cx = fromLeft ? cx1 : cx2
        const cy = fromLeft ? cy1 : cy2
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * 160 + 40
        magicParticles.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(Math.random() * 0.8 + 0.3),
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.2,
          life: 1,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        })
      }

      magicParticles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.01
        if (p.life <= 0) { magicParticles.splice(i, 1); return }
        ctx!.save()
        ctx!.globalAlpha = p.opacity * p.life
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.shadowBlur = 6
        ctx!.shadowColor = p.color
        ctx!.fill()
        ctx!.restore()
      })

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