'use client'

import { useEffect, useState } from 'react'
import { useMemoryStore } from '@/stores/memoryStore'
import dynamic from 'next/dynamic'
import { useGameStore } from '@/stores/gameStore'
import { useGenreStore } from '@/stores/genreStore'
import { useClueStore } from '@/stores/clueStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRelationshipStore } from '@/stores/relationshipStore'
import { useStyleStore } from '@/stores/styleStore'
import { useWorldStore } from '@/stores/worldStore'
import { useSummaryStore } from '@/stores/summaryStore'

const AuthProvider = dynamic(() => import('./AuthProvider'), {
  ssr: false,
})

export default function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    Promise.all([
      useGameStore.persist.rehydrate(),
      useGenreStore.persist.rehydrate(),
      useClueStore.persist.rehydrate(),
      useSettingsStore.persist.rehydrate(),
      useRelationshipStore.persist.rehydrate(),
      useStyleStore.persist.rehydrate(),
      useWorldStore.persist.rehydrate(),
      useSummaryStore.persist.rehydrate(),
      useMemoryStore.persist.rehydrate(),
    ]).then(() => setReady(true))
  }, [])

  if (!ready) return <p role="status" className="p-8 text-center">正在读取本机存档…</p>
  return <AuthProvider>{children}</AuthProvider>
}
