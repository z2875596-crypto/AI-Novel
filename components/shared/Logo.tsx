interface Props {
    size?: number
    showText?: boolean
  }
  
  export default function Logo({ size = 64, showText = true }: Props) {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 外圆光晕 */}
          <circle cx="32" cy="32" r="30" fill="url(#outerGlow)" opacity="0.15" />
  
          {/* 主圆背景 */}
          <circle cx="32" cy="32" r="26" fill="url(#bgGrad)" />
  
          {/* 纸鸢主体 - 菱形 */}
          <path
            d="M32 8 L50 28 L32 44 L14 28 Z"
            fill="url(#kiteGrad)"
            opacity="0.9"
          />
  
          {/* 纸鸢十字骨架 */}
          <line x1="32" y1="8" x2="32" y2="44" stroke="white" strokeWidth="0.8" opacity="0.4" />
          <line x1="14" y1="28" x2="50" y2="28" stroke="white" strokeWidth="0.8" opacity="0.4" />
  
          {/* 纸鸢尾巴 - 飘带 */}
          <path
            d="M32 44 C30 48 34 52 31 56 C29 59 33 61 32 63"
            stroke="url(#tailGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
  
          {/* 纸鸢尾巴装饰结 */}
          <circle cx="30" cy="50" r="1.5" fill="white" opacity="0.6" />
          <circle cx="32" cy="57" r="1.2" fill="white" opacity="0.4" />
  
          {/* 羽毛纹理线条 */}
          <path d="M32 8 L22 20" stroke="white" strokeWidth="0.5" opacity="0.25" />
          <path d="M32 8 L42 20" stroke="white" strokeWidth="0.5" opacity="0.25" />
          <path d="M14 28 L26 24" stroke="white" strokeWidth="0.5" opacity="0.25" />
          <path d="M50 28 L38 24" stroke="white" strokeWidth="0.5" opacity="0.25" />
  
          {/* 中心装饰点 */}
          <circle cx="32" cy="28" r="2.5" fill="white" opacity="0.9" />
          <circle cx="32" cy="28" r="1.2" fill="url(#centerGrad)" />
  
          {/* 渐变定义 */}
          <defs>
            <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--theme-primary)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
  
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-surface)" />
              <stop offset="100%" stopColor="var(--theme-bg)" />
            </linearGradient>
  
            <linearGradient id="kiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="var(--theme-secondary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0.6" />
            </linearGradient>
  
            <linearGradient id="tailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-secondary)" />
              <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0.2" />
            </linearGradient>
  
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--theme-primary)" />
              <stop offset="100%" stopColor="var(--theme-secondary)" />
            </radialGradient>
  
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
  
        {showText && (
          <div className="flex flex-col items-center">
            <span
              className="text-3xl font-bold tracking-[0.2em]"
              style={{
                color: 'var(--theme-text)',
                fontFamily: '"Noto Serif SC", "Source Han Serif", serif',
                textShadow: '0 0 20px var(--theme-primary)44',
              }}
            >
              鸢叙
            </span>
          </div>
        )}
      </div>
    )
  }