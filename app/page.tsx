import GenreGrid from '@/components/home/GenreGrid'
import RecentSaveBanner from '@/components/home/RecentSaveBanner'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--theme-text)' }}>
            AI 互动小说
          </h1>
          <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            选择题材，开启你的专属故事
          </p>
        </div>

        <RecentSaveBanner />

        <GenreGrid />

        <p className="text-center text-xs mt-8" style={{ color: 'var(--theme-text-muted)' }}>
          由 DeepSeek AI 实时生成剧情
        </p>
      </div>
    </main>
  )
}