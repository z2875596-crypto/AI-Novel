'use client'

import { useEffect } from 'react'
import { useGenreStore } from '@/stores/genreStore'
import { applyTheme, GENRE_CONFIG } from '@/lib/themeConfig'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const genre = useGenreStore((s) => s.genre)

  useEffect(() => {
    if (genre) {
      applyTheme(GENRE_CONFIG[genre].theme)
    }
  }, [genre])

  return <>{children}</>
}