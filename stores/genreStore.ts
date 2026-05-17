import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GenreKey } from '@/types/genre'
import { applyTheme, GENRE_CONFIG } from '@/lib/themeConfig'

interface GenreStore {
  genre: GenreKey | null
  setGenre: (genre: GenreKey) => void
}

export const useGenreStore = create<GenreStore>()(
  persist(
    (set) => ({
      genre: null,
      setGenre: (genre) => {
        set({ genre })
        if (typeof window !== 'undefined') {
          applyTheme(GENRE_CONFIG[genre].theme)
        }
      },
    }),
    { name: 'genre-store' }
  )
)