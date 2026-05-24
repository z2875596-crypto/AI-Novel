'use client'

import { useState } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { PolishTarget } from '@/app/api/polish/route'

interface Props {
  content: string
  target: PolishTarget
  onPolished: (result: string) => void
  disabled?: boolean
}

export default function PolishButton({ content, target, onPolished, disabled }: Props) {
  const genre = useGenreStore((s) => s.genre)
  const [loading, setLoading] = useState(false)
  const [justDone, setJustDone] = useState(false)

  async function handlePolish() {
    if (!content.trim() || loading || !genre) return

    setLoading(true)
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, target, genre }),
      })
      const { polished, error } = await res.json()
      if (error) throw new Error(error)
      if (polished) {
        onPolished(polished)
        setJustDone(true)
        setTimeout(() => setJustDone(false), 2000)
      }
    } catch {
      alert('润色失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = !content.trim()

  return (
    <button
      onClick={handlePolish}
      disabled={disabled || loading || isEmpty}
      title={isEmpty ? '请先填写内容再润色' : 'AI 润色扩充'}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      style={{
        background: justDone
          ? 'rgba(91,173,94,0.2)'
          : 'var(--theme-primary)18',
        color: justDone
          ? '#5BAD5E'
          : 'var(--theme-primary)',
        border: `1px solid ${justDone ? 'rgba(91,173,94,0.4)' : 'var(--theme-primary)44'}`,
      }}
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block">⟳</span>
          <span>润色中</span>
        </>
      ) : justDone ? (
        <>
          <span>✓</span>
          <span>已润色</span>
        </>
      ) : (
        <>
          <span>✨</span>
          <span>AI润色</span>
        </>
      )}
    </button>
  )
}
