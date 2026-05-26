'use client'

import { useEffect, useRef, useMemo } from 'react'

function generateWarnings(count: number, w: number, h: number) {
  const items: { x: number; y: number; size: number; delay: number; duration: number }[] = []
  const used: { x: number; y: number; r: number }[] = []
  for (let i = 0; i < count; i++) {
    let attempts = 0
    let x: number, y: number, size: number
    do {
      size = 16 + Math.random() * 12
      x = size + Math.random() * (w - size * 2)
      y = size + Math.random() * (h * 0.75 - size)
      attempts++
    } while (attempts < 20 && used.some((u) => Math.hypot(u.x - x, u.y - y) < u.r + size + 20))
    used.push({ x, y, r: size })
    items.push({
      x, y, size,
      delay: Math.random() * 1.5,
      duration: 0.5 + Math.random() * 1.0,
    })
  }
  return items
}

export default function ApocalypseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成一次，hover 期间不变
  const warnings = useMemo(
    () => generateWarnings(4, typeof window !== 'undefined' ? window.innerWidth : 1200, typeof window !== 'undefined' ? window.innerHeight : 800),
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0
    let animId: number

    // 灰烬粒子
    const ashes: { x: number; y: number; r: number; speedX: number; speedY: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      ashes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: -(Math.random() * 0.8 + 0.2),
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    // 破损建筑剪影
    const ruins: { x: number; w: number; h: number }[] = []
    let rx = 0
    while (rx < canvas.width) {
      const w = Math.random() * 100 + 40
      const h = Math.random() * 200 + 80
      ruins.push({ x: rx, w, h })
      rx += w + Math.random() * 20
    }

    // 远处火光
    const fires: { x: number; y: number; r: number; flickerSpeed: number }[] = []
    for (let i = 0; i < 8; i++) {
      fires.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.6 + Math.random() * canvas.height * 0.35,
        r: Math.random() * 40 + 20,
        flickerSpeed: Math.random() * 0.08 + 0.03,
      })
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      time += 0.01

      const skyGrad = ctx!.createLinearGradient(0, 0, 0, canvas!.height * 0.6)
      skyGrad.addColorStop(0, 'rgba(20,8,5,0.15)')
      skyGrad.addColorStop(0.5, 'rgba(35,15,8,0.2)')
      skyGrad.addColorStop(1, 'rgba(50,20,10,0.25)')
      ctx!.fillStyle = skyGrad
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height * 0.6)

      const groundGrad = ctx!.createLinearGradient(0, canvas!.height * 0.55, 0, canvas!.height)
      groundGrad.addColorStop(0, 'rgba(30,12,5,0.2)')
      groundGrad.addColorStop(1, 'rgba(15,6,2,0.25)')
      ctx!.fillStyle = groundGrad
      ctx!.fillRect(0, canvas!.height * 0.55, canvas!.width, canvas!.height * 0.45)

      ruins.forEach((r) => {
        const by = canvas!.height * 0.55 - r.h * 0.3
        ctx!.fillStyle = 'rgba(12,5,2,0.3)'
        ctx!.fillRect(r.x, by, r.w, r.h)
        ctx!.strokeStyle = 'rgba(60,20,5,0.15)'
        ctx!.lineWidth = 1
        ctx!.strokeRect(r.x, by, r.w, r.h)
      })

      fires.forEach((f) => {
        const flicker = Math.sin(time * f.flickerSpeed * 100) * 0.4 + 0.6
        const glow = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r)
        glow.addColorStop(0, `rgba(255,107,53,${0.08 * flicker})`)
        glow.addColorStop(0.5, `rgba(255,80,20,${0.03 * flicker})`)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = glow
        ctx!.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2)
      })

      ashes.forEach((a) => {
        a.x += a.speedX
        a.y += a.speedY
        if (a.y < -10) { a.y = canvas!.height + 10; a.x = Math.random() * canvas!.width }
        if (a.x < -10) a.x = canvas!.width + 10
        if (a.x > canvas!.width + 10) a.x = -10
        ctx!.fillStyle = `rgba(200,150,100,${a.alpha})`
        ctx!.beginPath()
        ctx!.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx!.fill()
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
    <>
      {/* 氛围层 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: 0.7 }}
      />

      {/* 警告叠加层 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>

        {/* 扫描线 */}
        <div
          className="absolute left-0 w-full"
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.25), transparent)',
            animation: 'scanDown 2.5s linear infinite',
          }}
        />

        {/* 警告符号 */}
        {warnings.map((w, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: w.x,
              top: w.y,
              fontSize: w.size,
              animation: `warnBlink ${w.duration}s ease-in-out ${w.delay}s infinite alternate`,
              opacity: 0,
            }}
          >
            ⚠️
          </span>
        ))}

        {/* 四角警告 */}
        <div
          className="absolute top-4 left-4"
          style={{
            width: 0, height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '24px solid rgba(255,107,53,0.25)',
            animation: 'cornerPulse 2s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-4 right-4"
          style={{
            width: 0, height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '24px solid rgba(255,107,53,0.25)',
            animation: 'cornerPulse 2s ease-in-out 0.5s infinite',
          }}
        />
        <div
          className="absolute bottom-4 left-4"
          style={{
            width: 0, height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderBottom: '24px solid rgba(255,107,53,0.25)',
            animation: 'cornerPulse 2s ease-in-out 1s infinite',
          }}
        />
        <div
          className="absolute bottom-4 right-4"
          style={{
            width: 0, height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderBottom: '24px solid rgba(255,107,53,0.25)',
            animation: 'cornerPulse 2s ease-in-out 1.5s infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scanDown {
          0% { top: -4px; }
          100% { top: 100%; }
        }
        @keyframes warnBlink {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes cornerPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
      `}</style>
    </>
  )
}
