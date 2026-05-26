'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import Logo from '@/components/shared/Logo'

export default function LoginPage() {
  const router = useRouter()
  const { user, isGuest, setIsGuest, setUser, isLoading } = useAuthStore()
  const [tab, setTab] = useState<'guest' | 'login'>('guest')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="animate-pulse" style={{ color: 'var(--theme-text-muted)' }}>加载中…</div>
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
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) {
          setError(signUpError.message)
        } else {
          setMessage('注册成功！请查收验证邮件，验证后即可登录。')
          setIsRegister(false)
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
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

  const inputClass =
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#C8960C]'
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#e0e0e0',
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#0a0a0a' }}
    >
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size={56} showText={true} />
          <p className="text-xs mt-3" style={{ color: '#888' }}>
            AI 互动小说 · 由 DeepSeek 实时生成剧情
          </p>
        </div>

        {/* 选项卡 */}
        <div className="flex rounded-xl overflow-hidden mb-6 border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setTab('guest')}
            className="flex-1 py-2.5 text-sm font-medium transition-all duration-300"
            style={{
              background: tab === 'guest' ? 'rgba(200,150,12,0.15)' : 'transparent',
              color: tab === 'guest' ? '#C8960C' : '#888',
            }}
          >
            游客体验
          </button>
          <button
            onClick={() => setTab('login')}
            className="flex-1 py-2.5 text-sm font-medium transition-all duration-300"
            style={{
              background: tab === 'login' ? 'rgba(200,150,12,0.15)' : 'transparent',
              color: tab === 'login' ? '#C8960C' : '#888',
            }}
          >
            账号登录
          </button>
        </div>

        {/* 游客体验 */}
        {tab === 'guest' && (
          <div className="animate-fade-in space-y-4">
            <button
              onClick={handleGuest}
              className="w-full py-3.5 rounded-xl text-base font-bold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #C8960C, #A07808)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(200,150,12,0.3)',
              }}
            >
              直接开始体验 →
            </button>
            <p className="text-xs text-center" style={{ color: '#666' }}>
              无需注册，但存档仅保存在本设备
            </p>
          </div>
        )}

        {/* 账号登录 / 注册 */}
        {tab === 'login' && (
          <div className="animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                style={inputStyle}
              />
              {isRegister && (
                <input
                  type="password"
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${inputClass} animate-fade-in`}
                  style={inputStyle}
                />
              )}

              {error && (
                <p className="text-xs text-red-400 px-1">{error}</p>
              )}
              {message && (
                <p className="text-xs px-1" style={{ color: '#5BAD5E' }}>{message}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #C8960C, #A07808)',
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(200,150,12,0.25)',
                }}
              >
                {submitting ? '处理中…' : isRegister ? '注册' : '登录'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                  setMessage('')
                }}
                className="w-full text-xs text-center transition-colors hover:underline"
                style={{ color: '#888' }}
              >
                {isRegister ? '已有账号？去登录' : '没有账号？注册'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
