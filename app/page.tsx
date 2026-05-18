import Logo from '@/components/shared/Logo'
import GenreGrid from '@/components/home/GenreGrid'
import RecentSaveBanner from '@/components/home/RecentSaveBanner'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo + 品牌名 */}
        <div className="text-center mb-10 animate-fade-in-up">
          <Logo size={72} showText={true} />
          <p className="text-xs mt-3" style={{ color: 'var(--theme-text-muted)' }}>
            AI 互动小说 · 由 DeepSeek 实时生成剧情
          </p>
        </div>

        {/* 最近存档横幅 */}
        <RecentSaveBanner />

        {/* 题材选择网格 */}
        <GenreGrid />
      </div>
    </main>
  )
}