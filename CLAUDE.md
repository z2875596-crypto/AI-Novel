# CLAUDE.md——鸢叙 · AI 互动小说

## 项目简介

鸢叙是一款 AI 互动小说 Web 应用。玩家选择题材和副线标签，配置世界观和主角，通过选择或自由输入驱动剧情发展。AI（DeepSeek）实时生成叙述，每回合产生差异化选项，支持多结局、分支存档、章节摘要、角色关系图谱、线索追踪、记忆管理等深度玩法。

## 技术栈

- **Next.js 16** (App Router) + **TypeScript 5** + **React 19**
- **Zustand 5** — 状态管理，所有 store 在 `stores/` 目录，使用 `createJSONStorage` 防 SSR
- **Tailwind CSS v4**
- **DeepSeek API** — 通过 OpenAI SDK 兼容接口调用（`openai` npm 包）
- **Supabase** — 用户认证（`@supabase/ssr` + `@supabase/supabase-js`）
- **部署**：Vercel（含 Cron Job 保活）

## 项目结构说明

```
ai-novel/
├── app/
│   ├── api/
│   │   ├── story/stream/       # 剧情流式生成（SSE）
│   │   ├── story/choices/      # 选项生成
│   │   ├── worldgen/           # 世界观随机生成
│   │   ├── summary/            # 章节摘要生成
│   │   ├── relationship/       # 角色关系提取
│   │   ├── memory/extract/     # 长短期记忆提取（每5回合触发）
│   │   ├── analyze-style/      # 文笔风格分析
│   │   ├── polish/             # 设定润色
│   │   └── cron/keepalive/     # Supabase 保活（Vercel Cron 每5天触发）
│   ├── page.tsx                # 首页（9宫格布局：8题材+随机）
│   ├── layout.tsx              # 根布局（元数据 + ClientAuthProvider）
│   ├── login/                  # 登录/注册页
│   ├── setup/                  # 世界观配置页
│   ├── game/                   # 游戏主页面
│   ├── saves/                  # 存档管理页
│   ├── chapters/               # 章节目录页
│   ├── relationships/          # 角色关系图谱页（SVG可视化）
│   ├── clues/                  # 线索库页
│   └── globals.css             # 全局样式 + CSS主题变量 + 动画
├── components/
│   ├── game/                   # 游戏内组件（15个）
│   ├── setup/                  # 配置页组件（7个）
│   ├── home/                   # 首页组件（5个）
│   ├── saves/                  # 存档组件（2个，含 SaveCover Canvas封面）
│   ├── clues/                  # 线索组件（2个）
│   └── shared/                 # 共享组件（4个）
├── stores/                     # Zustand store（11个）
│   ├── gameStore.ts            # 游戏核心（回合、消息、选项、流式文本）
│   ├── genreStore.ts           # 题材选择
│   ├── worldStore.ts           # 世界观配置
│   ├── saveStore.ts            # 存档列表
│   ├── authStore.ts            # 用户认证
│   ├── settingsStore.ts        # 设置
│   ├── summaryStore.ts         # 章节摘要
│   ├── styleStore.ts           # 文笔风格
│   ├── clueStore.ts            # 线索数据
│   ├── relationshipStore.ts    # 角色关系
│   └── memoryStore.ts          # 长短期记忆事件
├── lib/                        # 工具库（16个模块）
│   ├── deepseek.ts             # DeepSeek 客户端（懒加载 + Proxy）
│   ├── supabase.ts             # Supabase 浏览器客户端
│   ├── themeConfig.ts          # 8题材主题配置
│   ├── statusBar.ts            # 状态栏初始化 + 增量计算
│   ├── statusVibes.ts          # 状态值分级标签
│   ├── statusTriggers.ts       # 状态阈值触发器（~32个触发条件）
│   ├── saveManager.ts          # 存档读写
│   ├── exportNovel.ts          # TXT小说导出
│   ├── tts.ts                  # Web Speech API 朗读
│   ├── bgm.ts                  # Web Audio API BGM生成
│   ├── sanitizeInput.ts        # 玩家输入清洗 + Prompt注入防护
│   ├── parseNarrative.ts       # 结构化输出解析
│   └── prompts/                # AI Prompt模板（6个）
│       ├── storyPrompt.ts      # 剧情生成（核心，含题材动态参数+记忆注入+句式多样化）
│       ├── choicesPrompts.ts   # 选项生成（含去重防护+并行生成）
│       ├── worldgenPrompts.ts  # 世界观生成（含JSON截断修复）
│       ├── summaryPrompt.ts    # 章节摘要
│       ├── stylePrompt.ts      # 风格分析/指令生成
│       └── cluePrompt.ts       # 线索提取
├── types/                      # TS类型定义（7个）
│   ├── game.ts                 # Message类型
│   ├── genre.ts                # GenreKey + GenreConfig
│   ├── world.ts                # WorldConfig + STORY_LENGTH_CONFIG
│   ├── save.ts                 # 存档记录
│   ├── clue.ts                 # 线索
│   ├── subplot.ts              # SubplotKey + SubplotOption
│   └── narrative.ts            # 结构化叙事输出类型
├── public/                     # 静态资源
├── vercel.json                 # Vercel配置（Cron Job）
├── next.config.ts              # ignoreBuildErrors: true
└── package.json
```

## 核心架构要点

### DeepSeek 客户端 (`lib/deepseek.ts`)

- 使用 **懒加载**（`getDeepseekClient()`）防止 SSR 构建时报错
- 同时导出 `deepseek` Proxy 对象保持向后兼容，旧代码的 `deepseek.xxx` 调用无需改

### Zustand Store 规范

- 所有 store **必须**使用 `createJSONStorage` 防 SSR `localStorage` 报错，模板如下：

```ts
import { persist, createJSONStorage } from 'zustand/middleware'

export const useXxxStore = create<XxxStore>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'xxx-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
)
```

### 核心类型

- **`GenreKey`** (`types/genre.ts`)：`'urban' | 'ancient' | 'xuanhuan' | 'magic' | 'mystery' | 'horror' | 'scifi' | 'apocalypse'`
- **`SubplotKey`** (`types/subplot.ts`)：`'romance' | 'comedy' | 'rivalry' | 'mystery_sub' | 'dark' | 'intrigue'`
- **`STORY_LENGTH_CONFIG`** (`types/world.ts`)：短篇(30回合/3章)、中篇(60回合/4章)、长篇(120回合/6章)，含结局触发三阶段阈值

### AI 输出解析

- 剧情生成使用 SSE 流式输出文本
- 流结束后 AI 附加 `[PARSED_DATA]{json}` 结构化数据块
- `lib/parseNarrative.ts` 负责分离文本叙述和结构化数据
- 结构化数据包含：剧情摘要、status_delta、线索信息、memory_events

### 记忆系统 (`stores/memoryStore.ts`)

- 每 5 回合自动调用 `/api/memory/extract` 提取关键事件
- 事件类型：npc_relation、world_change、player_action、secret_revealed、item_obtained
- 重要性分级：low、medium、high
- 高重要性事件注入到后续 Prompt 中，防止 AI 遗忘

### 构建配置

- `next.config.ts` 设 `typescript.ignoreBuildErrors: true`，构建不会因类型错误中断
- 这意味着一部分类型错误可能在运行时才暴露，开发时需注意

## 开发规范

### 新增题材 checklist

新增题材（如 `'wuxia'`）必须同时更新以下文件：
1. `types/genre.ts` — 在 `GenreKey` 联合类型中添加
2. `lib/themeConfig.ts` — 添加主题色系、状态栏定义、写作参数
3. `lib/prompts/storyPrompt.ts` — 添加题材 Prompt 分支
4. `lib/statusBar.ts` — 如果需要自定义状态栏初始化
5. `lib/statusTriggers.ts` — 添加阈值触发规则
6. `lib/statusVibes.ts` — 添加状态分级标签
7. `lib/bgm.ts` — 添加 BGM 音效配方
8. 可能需要添加背景动效组件到 `components/home/backgrounds/`

### 新增 Store checklist

- 使用 `create` + `persist` + `createJSONStorage` 包裹
- 提供 `reset()` 方法用于新游戏初始化
- `persist` 的 `name` 使用 kebab-case 命名存储 key

### API Route 规范

- 所有 API route 文件**不能在模块顶层使用浏览器 API**（如 `localStorage`、`window` 等）
- 运行时检测：`typeof window !== 'undefined'`
- 使用懒加载模式避免 SSR 构建时报错

### 组件样式规范

- 使用 Tailwind CSS v4 优先
- 主题色使用 CSS 变量：`var(--theme-primary)`、`var(--theme-secondary)`、`var(--theme-bg)`、`var(--theme-surface)`、`var(--theme-text)`、`var(--theme-text-muted)`、`var(--theme-border)`
- CSS 变量由 `ThemeProvider` 根据当前题材动态注入到 `:root`

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |
| `DEEPSEEK_BASE_URL` | DeepSeek API 地址，默认 `https://api.deepseek.com` | 可选 |
| `DEEPSEEK_MODEL` | 模型名，默认 `deepseek-chat` | 可选 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 可选 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 可选 |
| `CRON_SECRET` | keepalive 接口鉴权密钥 | 可选 |

## 常用命令

```bash
npm run dev        # 本地开发（Turbopack）
npm run build      # 构建生产版本（ignoreBuildErrors）
npm start          # 启动生产服务器
npm run lint       # ESLint 检查

# 部署到 Vercel
git add . && git commit -m "描述改动" && git push
```
