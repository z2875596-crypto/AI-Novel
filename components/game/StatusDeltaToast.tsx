'use client'

import { useEffect, useState } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { GENRE_CONFIG } from '@/lib/themeConfig'

interface Toast {
  id: string
  key: string
  label: string
  delta: number
  color: string
}

interface Props {
  delta: Record<string, number>
}

let toastId = 0

export default function StatusDeltaToast({ delta }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const genre = useGenreStore((s) => s.genre)

  useEffect(() => {
    if (!genre || Object.keys(delta).length === 0) return
    const config = GENRE_CONFIG[genre]

    const newToasts: Toast[] = Object.entries(delta)
      .filter(([, v]) => v !== 0)
      .map(([key, value]) => {
        const bar = config.bars.find((b) => b.key === key)
        return {
          id: `toast-${toastId++}`,
          key,
          label: bar?.label ?? key,
          delta: value,
          color: bar?.color ?? config.theme.primary,
        }
      })

    if (newToasts.length === 0) return

    setToasts((prev) => [...prev, ...newToasts])

    // 自动移除
    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((t) => !newToasts.find((nt) => nt.id === t.id))
      )
    }, 2000)
  }, [delta, genre])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold animate-fade-in-up"
          style={{
            background: `${toast.color}22`,
            border: `1px solid ${toast.color}66`,
            color: toast.color,
            boxShadow: `0 0 12px ${toast.color}44`,
            animationDelay: `${i * 0.05}s`,
            animationFillMode: 'both',
          }}
        >
          <span>{toast.delta > 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(toast.delta)}</span>
          <span>{toast.label}</span>
        </div>
      ))}
    </div>
  )
}