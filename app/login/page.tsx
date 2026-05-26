'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import Logo from '@/components/shared/Logo'

/* ── 粒子背景 Canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = []
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    let animId: number
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = canvas!.width + 10
        if (p.x > canvas!.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas!.height + 10
        if (p.y > canvas!.height + 10) p.y = -10

        ctx!.fillStyle = `rgba(200,150,12,${p.alpha})`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

/* ── 输入框 ── */
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.9)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

/* ── 主页面 ── */
export default function LoginPage() {
  const router = useRouter()
  const { user, isGuest, setIsGuest, isLoading } = useAuthStore()
  const [tab, setTab] = useState<'guest' | 'login'>('guest')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && (user || isGuest)) {
      router.replace('/')
    }
  }, [user, isGuest, isLoading, router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0d0a0f' }}>
        <div className="animate-pulse" style={{ color: 'rgba(200,150,12,0.6)' }}>加载中…</div>
      </main>
    )
  }

  function handleGuest() {
    setIsGuest(true)
    router.push('/')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    const supabase = createClient()

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致')
          setSubmitting(false)
          return
        }
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) {
          setError(signUpError.message)
        } else {
          setMessage('注册成功！请查收验证邮件，验证后即可登录。')
          setIsRegister(false)
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          setError(signInError.message)
        } else {
          router.push('/')
        }
      }
    } catch {
      setError('网络错误，请稍后重试')
    }
    setSubmitting(false)
  }

  const focusStyle = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(200,150,12,0.6)'
    e.target.style.boxShadow = '0 0 8px rgba(200,150,12,0.12)'
  }, [])
  const blurStyle = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
    e.target.style.boxShadow = 'none'
  }, [])

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '13px 0',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #C8960C, #A07808)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'filter 0.2s, transform 0.2s',
  }

  return (
    <>
      <ParticleCanvas />
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
        style={{ background: '#0d0a0f' }}
      >
        <div className="w-full max-w-[380px] animate-fade-in-up">
          {/* ── 顶部品牌区 ── */}
          <div className="text-center mb-8">
            <Logo size={52} showText={false} />
            <h1
              className="text-3xl font-bold mt-3 tracking-[0.3em]"
              style={{ color: 'rgba(200,150,12,0.9)', fontFamily: 'serif' }}
            >
              鸢 叙
            </h1>
            <p className="text-xs mt-2 tracking-wide" style={{ color: 'rgba(200,150,12,0.5)' }}>
              开启你的故事
            </p>
          </div>

          {/* ── 登录卡片 ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(200,150,12,0.2)',
              boxShadow: '0 0 40px rgba(200,150,12,0.08)',
            }}
          >
            {/* 顶部金色渐变线 */}
            <div
              style={{
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(200,150,12,0.6), transparent)',
              }}
            />

            {/* Tab 切换 */}
            <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {(['guest', 'login'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setMessage('') }}
                  className="flex-1 py-3 text-sm font-medium relative transition-colors duration-200"
                  style={{ color: tab === t ? '#C8960C' : 'rgba(255,255,255,0.4)' }}
                >
                  {t === 'guest' ? '游客体验' : '账号登录'}
                  {tab === t && (
                    <span
                      className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                      style={{ background: '#C8960C' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* 内容区 */}
            <div className="p-6" style={{ minHeight: 280 }}>
              {/* 错误提示 */}
              {error && (
                <div
                  className="text-xs px-3 py-2 rounded-lg mb-4 animate-fade-in"
                  style={{ background: 'rgba(255,60,60,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,60,60,0.2)' }}
                >
                  {error}
                </div>
              )}

              {/* 成功提示 */}
              {message && (
                <div
                  className="text-xs px-3 py-2 rounded-lg mb-4 animate-fade-in"
                  style={{ background: 'rgba(91,173,94,0.1)', color: '#5BAD5E', border: '1px solid rgba(91,173,94,0.2)' }}
                >
                  {message}
                </div>
              )}

              {/* ── 游客体验 ── */}
              {tab === 'guest' && (
                <div className="animate-fade-in space-y-5" key="guest">
                  <p className="text-sm text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    无需注册，直接开始体验
                  </p>
                  <p className="text-xs text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    存档仅保存在本设备，换设备后无法恢复
                  </p>
                  <button
                    onClick={handleGuest}
                    style={btnPrimary}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                  >
                    直接开始 →
                  </button>
                  <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    注册账号可永久保存存档
                  </p>
                </div>
              )}

              {/* ── 账号登录 ── */}
              {tab === 'login' && (
                <div className="animate-fade-in" key="login">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputBase}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ ...inputBase, paddingRight: 40 }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                        tabIndex={-1}
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                    {isRegister && (
                      <input
                        type="password"
                        placeholder="确认密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="animate-fade-in"
                        style={inputBase}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    )}

                    {!isRegister && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs hover:underline"
                          style={{ color: 'rgba(200,150,12,0.6)' }}
                        >
                          忘记密码？
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ ...btnPrimary, opacity: submitting ? 0.5 : 1 }}
                      onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.filter = 'brightness(1.1)' }}
                      onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.filter = 'none' }}
                    >
                      {submitting ? '处理中…' : isRegister ? '创建账号' : '登录'}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>或者</span>
                      <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    <button
                      type="button"
                      onClick={() => { setIsRegister(!isRegister); setError(''); setMessage('') }}
                      className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(200,150,12,0.4)',
                        color: '#C8960C',
                      }}
                    >
                      {isRegister ? '← 返回登录' : '注册新账号'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* 底部 */}
          <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.18)' }}>
            继续即表示同意服务条款
          </p>
        </div>
      </main>
    </>
  )
}
