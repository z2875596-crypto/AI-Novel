import type { Metadata } from 'next'
import './globals.css'
import ClientAuthProvider from '@/components/shared/ClientAuthProvider'

export const metadata: Metadata = {
  title: '鸢叙',
  description: '走进小说，读到由自己影响的故事。选择角色行动，提出剧情构想，在阅读中参与塑造人物关系与故事走向。',
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
