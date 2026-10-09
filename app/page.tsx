import Logo from '@/components/shared/Logo'
import GenreGrid from '@/components/home/GenreGrid'
import RecentSaveBanner from '@/components/home/RecentSaveBanner'
import UserStatus from '@/components/home/UserStatus'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-12 relative z-10">
      <div className="w-full max-w-5xl">
        {/* 右上角：用户状态 + 存档按钮 */}
        <div className="flex justify-end items-center gap-2 mb-4 animate-fade-in">
          <UserStatus />
          <Link
            href="/saves"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--theme-text-muted)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <span>📂</span>
            <span>存档列表</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in-up">
          <Logo size={72} showText={true} />
          <h1 className="text-2xl sm:text-4xl font-semibold mt-6 leading-relaxed">读一段小说，参与其中，<br className="hidden sm:block" />写出你的故事。</h1>
          <p className="text-sm mt-4 leading-7" style={{ color: 'var(--theme-text-muted)' }}>进入准备好的故事，或设定自己的世界。<br />通过角色行动与剧情构想，参与人物关系和情节的发展。</p>
        </div>

        {/* 最近存档横幅 */}
        <RecentSaveBanner />

        {/* 题材选择网格 */}
        <GenreGrid />
      </div>
    </main>
  )
}
