export type GenreKey =
  | 'romance'
  | 'xuanhuan'
  | 'mystery'
  | 'ancient'
  | 'magic'
  | 'urban'
  | 'horror'
  | 'comedy'

export interface StatusBarItem {
  key: string
  label: string
  max: number
  color: string
}

export interface GenreTheme {
  primary: string
  secondary: string
  background: string
  surface: string
  surfaceHover: string
  text: string
  textMuted: string
  border: string
  fontFamily: string
}

export interface GenreConfig {
  key: GenreKey
  label: string
  emoji: string
  description: string
  bars: StatusBarItem[]
  theme: GenreTheme
}