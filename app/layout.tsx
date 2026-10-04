import type { Metadata } from 'next'
import './globals.css'
import ClientAuthProvider from '@/components/shared/ClientAuthProvider'

export const metadata: Metadata = {
  title: '鸢叙',
  description: '进入一段故事，自由行动，经历选择的后果。鸢叙，以角色关系和关键抉择为核心的 AI 互动故事。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  )
}
