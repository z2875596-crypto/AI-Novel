import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/shared/AuthProvider'

export const metadata: Metadata = {
  title: '鸢叙',
  description: 'AI 互动小说 · 由 DeepSeek 实时生成剧情',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}