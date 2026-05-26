'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { createClient } from '@/lib/supabase'

export default function UserStatus() {
  const router = useRouter()
  const { user, isGuest } = useAuthStore()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    useAuthStore.getState().signOut()
    router.push('/login')
  }

  const btnClass =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95'
  const btnStyle = {
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--theme-text-muted)',
    border: '1px solid var(--theme-border)',
  }

  if (user) {
    const emailPrefix = user.email?.split('@')[0] ?? '用户'
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
          {emailPrefix}
        </span>
        <button onClick={handleSignOut} className={btnClass} style={btnStyle}>
          退出
        </button>
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
          游客模式
        </span>
        <button
          onClick={() => router.push('/login')}
          className={btnClass}
          style={btnStyle}
        >
          注册账号
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => router.push('/login')}
      className={btnClass}
      style={btnStyle}
    >
      登录 / 注册
    </button>
  )
}
