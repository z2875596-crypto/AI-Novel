import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { GenreKey } from '@/types/genre'
import { SubplotKey } from '@/types/subplot'
import { applyTheme, GENRE_CONFIG } from '@/lib/themeConfig'

interface GenreStore {
  genre: GenreKey | null
  subplots: SubplotKey[]
  setGenre: (genre: GenreKey) => void
  setSubplots: (subplots: SubplotKey[]) => void
}

export const useGenreStore = create<GenreStore>()(
  persist(
    (set) => ({
      genre: null,
      subplots: [],
      setGenre: (genre) => {
        set({ genre })
        if (typeof window !== 'undefined') {
          applyTheme(GENRE_CONFIG[genre].theme)
        }
      },
      setSubplots: (subplots) => set({ subplots }),
    }),
    {
      name: 'genre-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      skipHydration: true,
    }
  )
)
