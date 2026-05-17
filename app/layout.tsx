import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 互动小说',
  description: '由 AI 实时生成剧情的互动小说',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}