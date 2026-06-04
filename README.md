# 鸢叙 · AI 互动小说

> 基于 DeepSeek 大语言模型的沉浸式互动小说平台。选择题材、构建世界、扮演主角——AI 实时生成剧情，你的每一个选择都将改写故事的走向。

---

## 项目简介

**鸢叙**是一款 AI 驱动的互动小说 Web 应用。玩家从 8 大题材中自由选择，搭配 6 类副线标签丰富叙事层次，通过 AI 辅助构建世界观、设定主角与配角，然后以实时流式的方式体验专属故事。每回合 AI 自动生成差异化选项，也支持自由输入任意行动，还支持多结局、分支存档、章节摘要、线索收集、角色关系追踪、记忆管理、文笔风格切换等深度玩法。

---

## 题材系统

项目采用**两级题材架构**：8 个主线题材 + 6 个副线标签（最多选 2 个）。每个题材拥有独立的状态栏、主题色系、写作参数、背景动效和 BGM。

### 主线题材（8 个）

| 题材 | 图标 | 状态栏 | 介绍 |
|------|------|--------|------|
| 都市现代 | 🏙️ | 人脉、金钱 | 现代都市，职场商战与人际博弈 |
| 古装历史 | 🏯 | 声望、势力 | 朝堂权谋，江湖恩怨与天下大势 |
| 玄幻修仙 | ⚡ | 灵力、境界 | 东方奇幻，修炼突破与热血战斗 |
| 西幻魔法 | ✨ | 魔力、境界 | 西方奇幻，魔法冒险与奇异世界 |
| 悬疑推理 | 🔍 | 线索数、理智值 | 任意背景，线索收集与真相追寻 |
| 恐怖惊悚 | 🩸 | 恐惧值、理智值 | 压抑氛围，恐惧蔓延与生存挑战 |
| 科幻未来 | 🚀 | 科技值、信任度 | 星际文明，赛博朋克与 AI 觉醒 |
| 末世求生 | ☢️ | 生存值、理智 | 文明崩塌，资源争夺与人性考验 |

### 副线标签（最多选 2 个）

| 标签 | 说明 |
|------|------|
| 💕 言情 | 感情升温、心动时刻 |
| 😄 轻松搞笑 | 幽默反转、轻松日常 |
| ⚔️ 争斗对抗 | 竞争对手、正面交锋 |
| 🔮 隐藏谜题 | 埋下伏笔、秘密待解 |
| 🌑 黑暗沉重 | 背叛牺牲、沉重代价 |
| 🎭 权谋算计 | 阴谋博弈、多方角力 |

副线标签注入到 System Prompt 中，AI 在主线剧情中自然融入对应的叙事元素。

### 题材专属特性

每个题材拥有独立配置：
- **写作参数**：不同题材有不同的字数范围、叙述节奏、重点描写方向、句式风格
- **主题色系**：9 个 CSS 变量动态切换（`--theme-primary`、`--theme-secondary`、`--theme-bg`、`--theme-surface`、`--theme-text` 等）
- **状态栏阈值触发**：状态值达到高/低阈值时自动向 AI 注入特殊叙事指令
- **背景动效**：Canvas 动画背景，每个题材有专属视觉风格
- **BGM 生成**：Web Audio API 实时合成，8 种题材各有独立音效配方

---

## 核心功能

### 🎮 剧情生成

- **流式输出**：Server-Sent Events 流式传输，打字机效果实时呈现 AI 叙述
- **结构化 JSON 输出**：AI 在每段叙述后附加 `[PARSED_DATA]` 结构化数据（剧情 + 状态变化 + 线索 + 记忆提示一体化），前端自动解析
- **智能选项**：每回合 AI 自动生成 3-4 个差异化选项，带选项重复防护
- **选项并行生成**：多个选项同时生成，减少等待
- **自由输入**：除预设选项外，支持输入任意自定义行动
- **Prompt 注入防护**：对玩家输入进行安全过滤，防止恶意 Prompt 注入
- **状态反馈**：AI 输出的数值变化经状态栏动画展示（StatusDeltaToast）
- **剧情干预**：游戏中随时输入期望的剧情方向，AI 在 2-3 回合内自然融入

### 🌍 世界构建

- **AI 随机生成**：一键生成世界名、背景设定、主角姓名特质、开场场景、3 个配角
- **手动精细编辑**：逐字段自由编辑世界观、主角、配角
- **AI 润色**：setup 页各字段配备润色按钮（PolishButton），AI 扩充至 1.5-2x
- **配角管理**：支持添加/删除多个 NPC，每个 NPC 有姓名、关系、特质
- **剧情节拍**：设定在特定回合触发的剧情节点，AI 附近回合自然融入
- **剧情节奏配置**：setup 页可预设关键事件触发时机
- **目标结局**：设定期望的故事结局方向，AI 暗中引导剧情发展
- **三种叙述视角**：第一人称"我"、第二人称"你"、第三人称（主角姓名）
- **句式多样化**：防止每段都以"你"开头，保持叙述多样性

### ✍️ 文笔风格系统

**9 种预设风格**：

| 风格 | 说明 | 示例 |
|------|------|------|
| ✂️ 简练克制 | 短句为主，留白丰富 | "他走了。门关上。风还在。" |
| 🌸 抒情细腻 | 情感丰沛，心理描写深入 | "心跳像被人握住，轻轻攥紧，又慢慢松开。" |
| 🔦 紧张悬疑 | 节奏紧凑，信息克制 | "脚步声停了。就在门外。" |
| 😄 幽默诙谐 | 轻松调侃，反转频繁 | "他一脸正经地说出了本世纪最荒唐的话。" |
| 🏮 古典雅致 | 文言意境，辞藻典雅 | "月色如练，他立于廊下，衣袂微动。" |
| 🎬 电影镜头 | 场景感强，视觉化叙事 | "镜头拉远。人群散去。她还站在原地。" |
| ⚔️ 武侠文言 | 文白夹杂，江湖气韵 | "剑未出鞘，杀气已至。" |
| 📱 轻小说 | 口语化，节奏快，内心吐槽 | "等等等等，这个发展不对劲吧！" |
| 📖 纯文学 | 意象密集，叙事克制 | "光从窗棂落下来，像某种无法言说的告别。" |

- **自定义风格**：用文字描述你想要的文风
- **AI 风格分析**：上传一段你喜欢的文字，AI 自动提取文笔特征并应用
- 风格配置注入到故事生成的 System Prompt 中

### 📚 故事系统

- **故事长度选择**：
  - 短篇：30 回合 / 3 章（每章 10 回合），结局触发 hint=20, push=25, force=30
  - 中篇：60 回合 / 4 章（每章 15 回合），结局触发 hint=45, push=55, force=60
  - 长篇：120 回合 / 6 章（每章 20 回合），结局触发 hint=90, push=110, force=120
- **自动分章**：到达对应回合数时自动触发章节摘要生成
- **并行生成**：章节摘要和章节标题同时请求 AI，减少等待
- **章节目录**：独立页面展示所有章节，支持展开查看完整对话记录
- **结局触发优化**：根据故事长度动态调整触发条件（hint → push → force 三阶段）

### 🧠 AI 系统升级

- **长短期记忆分离**：memoryStore 每 5 回合自动提取关键事件（NPC 关系变化、世界变动、秘密揭露等），按重要性排序，注入到后续 Prompt 中防止 AI 遗忘
- **NPC 记忆注入**：保持角色行为一致性，每个 NPC 记住之前的关系变化
- **结构化 JSON 输出**：AI 输出为文本叙述 + `[PARSED_DATA]{json}` 结构化数据，前端自动解析剧情、状态变化、线索、记忆事件

### 🔍 悬疑线索系统（悬疑题材专属）

- **AI 自动提取**：悬疑题材中 AI 生成叙述时自动标记线索
- **结构化存储**：线索包含名称、描述、分类（人物/物品/地点/事件/其他）、重要度（低/中/高）、关联关系
- **线索关联**：支持手动建立线索之间的关联
- **线索库页面**：独立页面浏览和管理所有已发现线索

### 💞 角色关系系统

- **AI 自动追踪**：每回合分析主角与 NPC 的关系变化
- **好感度系统**：-100 到 +100 的好感度数值，自动推断关系类型
- **9 种关系类型**：恋人、友人、对手、盟友、敌人、家人、师长、陌路、未知
- **关系图谱**：SVG 可视化展示，不同关系类型使用不同颜色连线
- **关系历史**：记录每次关系变化的事件和回合，支持追溯

### ⏪ 回溯 & 分支

- **回溯功能**：点击任意历史叙述节点，从该位置开启新分支
- **分支存档**：新分支以独立存档保存，原主线不受影响
- **分支标识**：分支存档在列表中标注"分支·第N回合"
- **多线并行**：支持同时维护多条故事线

### 💾 存档系统

- **自动保存**：每次行动后自动更新存档
- **手动多槽存档**："另存为"支持创建独立存档副本
- **存档封面**：Canvas 自动生成主题色卡片封面
- **localStorage 持久化**：刷新页面数据不丢失
- **最大 20 个存档**：超出后自动淘汰最旧存档
- **存档导出**：支持导出为 TXT 格式完整小说文本

### 🎯 多结局系统

- **4 种结局类型**：好结局（good）、坏结局（bad）、真结局（true）、隐藏结局（secret）
- **AI 触发**：AI 判断故事到达自然终点时自动输出结局标记
- 结局信息保存到存档中，导出时会展示

### 👤 用户系统

- **Supabase 登录/注册**：邮箱注册登录
- **游客模式**：无需注册即可体验，数据存本地
- **自动保活**：Vercel Cron Job 每 5 天触发一次 keepalive，防止 Supabase 免费项目暂停

### ⌨️ 键盘快捷键

- **A / B / C 键**：快速选择对应选项
- **/ 键**：聚焦自由输入框

### 🔊 其他功能

- **TTS 文字转语音**：浏览器 Web Speech API 朗读 AI 叙述，支持调节语速/音调/音量
- **BGM 背景音乐**：Web Audio API 实时合成，8 题材各独立音效配方，支持音量调节和开关

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 5 |
| UI 库 | React 19 |
| 状态管理 | Zustand 5 + persist 中间件 + createJSONStorage |
| 样式方案 | Tailwind CSS v4 |
| AI 引擎 | DeepSeek API（通过 OpenAI SDK 兼容接口调用） |
| 认证服务 | Supabase Auth + `@supabase/ssr` |
| 构建工具 | Turbopack（Next.js 默认） |
| 部署 | Vercel |

### 架构说明

- **前端**：纯客户端渲染（`'use client'`），使用 Next.js App Router
- **状态持久化**：Zustand persist 中间件 + createJSONStorage 防 SSR localStorage 报错
- **AI 调用策略**：
  - 剧情生成：流式调用，`max_tokens=1200`，`temperature=0.7`
  - 选项生成：非流式，使用 `deepseek-chat`，`max_tokens=150`
  - 世界观生成：非流式，`temperature=1.0`，支持 JSON 截断修复
  - 章节摘要 + 标题：并行双请求
  - 关系提取：非流式，`temperature=0.3` 保证输出稳定
  - 记忆提取：每 5 回合自动触发

---

## 项目结构

```
ai-novel/
├── app/
│   ├── api/
│   │   ├── story/stream/         # 剧情流式生成（SSE）
│   │   ├── story/choices/        # 选项生成
│   │   ├── worldgen/             # 世界观随机生成
│   │   ├── summary/              # 章节摘要生成
│   │   ├── relationship/         # 角色关系提取
│   │   ├── memory/extract/       # 长短期记忆提取
│   │   ├── analyze-style/        # 文笔风格分析
│   │   ├── polish/               # 设定润色
│   │   └── cron/keepalive/       # Supabase 保活 Cron Job
│   ├── page.tsx                  # 首页（9 宫格题材选择 + 随机）
│   ├── layout.tsx                # 根布局（元数据 + AuthProvider）
│   ├── login/                    # 登录/注册页
│   ├── setup/                    # 世界观配置页
│   ├── game/                     # 游戏主页面
│   ├── saves/                    # 存档管理页
│   ├── chapters/                 # 章节目录页
│   ├── relationships/            # 角色关系图谱页
│   ├── clues/                    # 线索库页
│   └── globals.css               # 全局样式 + CSS 变量 + 主题动画
├── components/
│   ├── game/                     # 游戏内组件（15 个）
│   │   ├── StoryPanel.tsx        # 剧情展示面板（打字机效果）
│   │   ├── ChoicesBar.tsx        # 选项按钮栏（键盘快捷键）
│   │   ├── FreeInputBox.tsx      # 自由输入框（/ 键聚焦）
│   │   ├── StatusBar.tsx         # 状态栏
│   │   ├── StatusDeltaToast.tsx  # 状态变化提示动画
│   │   ├── SummaryCard.tsx       # 章节摘要卡片
│   │   ├── SaveAsModal.tsx       # 另存为弹窗
│   │   ├── RewindModal.tsx       # 回溯确认弹窗
│   │   ├── MoreMenu.tsx          # 更多操作菜单
│   │   ├── WorldConfigModal.tsx  # 世界观查看弹窗
│   │   ├── StyleSwitchPanel.tsx  # 文笔风格切换
│   │   ├── PlotHintInput.tsx     # 剧情干预输入
│   │   ├── TTSToggle.tsx         # 朗读开关
│   │   └── BGMController.tsx     # BGM 控制
│   ├── setup/                    # 配置页组件（7 个）
│   │   ├── WorldEditor.tsx       # 世界观编辑
│   │   ├── CharacterEditor.tsx   # 主角编辑
│   │   ├── RandomGenButton.tsx   # AI 随机生成
│   │   ├── StyleEditor.tsx       # 文笔风格编辑
│   │   ├── TargetEndingEditor.tsx# 目标结局编辑
│   │   ├── PlotBeatsEditor.tsx   # 剧情节拍/节奏编辑
│   │   └── PolishButton.tsx      # AI 润色按钮
│   ├── home/                     # 首页组件（5 个）
│   │   ├── GenreGrid.tsx         # 9 宫格题材选择
│   │   ├── GenreBackground.tsx   # 动态背景切换
│   │   ├── RecentSaveBanner.tsx  # 最近存档横幅
│   │   ├── UserStatus.tsx        # 用户状态
│   │   └── DecorativeBackground.tsx # 装饰背景
│   ├── saves/                    # 存档组件（2 个）
│   │   ├── SaveCard.tsx          # 存档卡片
│   │   └── SaveCover.tsx         # 存档封面（Canvas 生成）
│   ├── clues/                    # 线索组件（2 个）
│   │   ├── ClueCard.tsx          # 线索卡片
│   │   └── ClueGraph.tsx         # 线索关系图
│   └── shared/                   # 共享组件（5 个）
│       ├── Logo.tsx              # Logo 组件
│       ├── ThemeProvider.tsx     # 主题 Provider（CSS 变量注入）
│       ├── AuthProvider.tsx      # 认证 Provider
│       └── ClientAuthProvider.tsx# 客户端认证包装器
├── stores/                       # Zustand 状态管理（11 个）
│   ├── gameStore.ts              # 游戏核心状态（回合、消息、选项、流式文本）
│   ├── genreStore.ts             # 题材选择
│   ├── worldStore.ts             # 世界观配置
│   ├── saveStore.ts              # 存档列表
│   ├── authStore.ts              # 用户认证
│   ├── settingsStore.ts          # 设置（TTS 参数等）
│   ├── summaryStore.ts           # 章节摘要
│   ├── styleStore.ts             # 文笔风格
│   ├── clueStore.ts              # 线索数据
│   ├── relationshipStore.ts      # 角色关系
│   └── memoryStore.ts            # 长短期记忆事件
├── lib/                          # 工具库（16 个模块）
│   ├── deepseek.ts               # DeepSeek 客户端（懒加载 + Proxy，防 SSR 报错）
│   ├── supabase.ts               # Supabase 浏览器客户端
│   ├── themeConfig.ts            # 8 题材主题配置（色系、状态栏、写作参数）
│   ├── statusBar.ts              # 状态栏初始化 + 增量计算
│   ├── statusVibes.ts            # 状态值分级标签
│   ├── statusTriggers.ts         # 状态阈值触发器
│   ├── saveManager.ts            # 存档读写（localStorage）
│   ├── exportNovel.ts            # TXT 小说导出
│   ├── tts.ts                    # Web Speech API 朗读
│   ├── bgm.ts                    # Web Audio API BGM 生成
│   ├── sanitizeInput.ts          # 玩家输入清洗 + 防注入
│   ├── parseNarrative.ts         # 结构化输出解析
│   └── prompts/                  # AI Prompt 模板（6 个）
│       ├── storyPrompt.ts        # 剧情生成 Prompt（核心，含题材动态参数 + 记忆注入）
│       ├── choicesPrompts.ts     # 选项生成 Prompt
│       ├── worldgenPrompts.ts    # 世界观生成 Prompt
│       ├── summaryPrompt.ts      # 章节摘要 Prompt
│       ├── stylePrompt.ts        # 风格分析/指令生成 Prompt
│       └── cluePrompt.ts         # 线索提取 Prompt
├── types/                        # TypeScript 类型定义（7 个）
│   ├── game.ts                   # Message 类型
│   ├── genre.ts                  # GenreKey + GenreConfig 类型
│   ├── world.ts                  # WorldConfig + STORY_LENGTH_CONFIG + NPC 类型
│   ├── save.ts                   # 存档记录类型
│   ├── clue.ts                   # 线索类型
│   ├── subplot.ts                # SubplotKey + SubplotOption 类型
│   └── narrative.ts              # 结构化叙事输出类型
├── public/                       # 静态资源
├── vercel.json                   # Vercel 配置（Cron Job）
├── package.json
├── tsconfig.json
├── next.config.ts                # ignoreBuildErrors: true
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9
- DeepSeek API Key（注册获取：[platform.deepseek.com](https://platform.deepseek.com)）
- Supabase 项目（用于用户认证，可选）

### 1. 克隆项目

```bash
git clone https://github.com/z2875596-crypto/AI-Novel.git
cd AI-Novel
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env.local`：

```env
# DeepSeek API 配置（必填）
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# Supabase 配置（可选，用于用户认证）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cron Secret（可选，用于保活接口鉴权）
CRON_SECRET=your-cron-secret
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始体验。

### 5. 构建生产版本

```bash
npm run build
npm start
```

---

## 使用流程

```
┌───────────────────────────────────────────────────────┐
│  1. 进入首页 → 选择题材（8选1 或 随机）+ 副线标签（最多2个） │
│     ↓                                                 │
│  2. 配置世界观（AI 随机生成 / 手动填写 / 润色扩充）       │
│     ├── 世界名称、背景设定                              │
│     ├── 主角姓名、特质                                  │
│     ├── 配角列表（姓名、关系、特质）                      │
│     ├── 剧情节拍（可选，定时触发的事件）                  │
│     ├── 目标结局（可选，AI 暗中引导故事走向）             │
│     ├── 叙述视角（第一/二/三人称）                      │
│     ├── 故事长度（短篇/中篇/长篇）                       │
│     └── 文笔风格（预设/自定义/AI 分析）                  │
│     ↓                                                 │
│  3. 进入游戏 → AI 生成开场剧情（流式输出 + 打字机效果）    │
│     ↓                                                 │
│  4. 每回合：选择预设行动(A/B/C) 或 / 自由输入 或 剧情干预  │
│     ↓                                                 │
│  5. AI 生成下一段叙述 → [PARSED_DATA] 结构化数据解析     │
│     → 状态变化动画 → 线索提取 → 记忆更新                │
│     ↓                                                 │
│  6. 循环推进 → 到达分章回合时生成章节摘要                 │
│     ↓                                                 │
│  7. 故事到达终点（hint → push → force 三阶段触发）       │
└───────────────────────────────────────────────────────┘
```

---

## API 端点一览

| 端点 | 方法 | 说明 | 流式 |
|------|------|------|------|
| `/api/story/stream` | POST | 剧情流式生成 | ✅ |
| `/api/story/choices` | POST | 选项生成 | ❌ |
| `/api/worldgen` | POST | 世界观随机生成 | ❌ |
| `/api/summary` | POST | 章节摘要 + 标题生成 | ❌ |
| `/api/relationship` | POST | 角色关系提取 | ❌ |
| `/api/memory/extract` | POST | 长短期记忆提取 | ❌ |
| `/api/analyze-style` | POST | 文笔风格分析 | ❌ |
| `/api/polish` | POST | 设定润色扩充 | ❌ |
| `/api/cron/keepalive` | GET | Supabase 保活（Vercel Cron） | ❌ |

---

## 状态管理架构

项目使用 Zustand 的 `persist` 中间件 + `createJSONStorage` 实现 SSR 安全的持久化。11 个 Store 各自独立存储：

| Store | 存储 Key | 持久化内容 |
|-------|----------|-----------|
| `gameStore` | `game-store` | 回合数、状态栏、消息历史、当前选项 |
| `genreStore` | `genre-store` | 当前题材、副线标签 |
| `worldStore` | `world-store` | 世界观完整配置 |
| `saveStore` | 内存 + localStorage | 存档列表（最多 20 个） |
| `authStore` | 内存（由 Supabase 管理） | 用户信息、游客标记 |
| `settingsStore` | `settings-store` | TTS 开关、语速、音调、音量 |
| `summaryStore` | `summary-store` | 章节摘要列表 |
| `styleStore` | `style-store` | 文笔风格配置 |
| `clueStore` | `clue-store` | 线索数据 |
| `relationshipStore` | `relationship-store` | NPC 关系数据 |
| `memoryStore` | `memory-store` | 长短期记忆事件 |

---

## 特色设计

### 题材动态 Prompt 系统

每个题材拥有独立的写作参数，在生成故事时动态注入到 System Prompt 中：

- **字数控制**：都市 100-160 字，悬疑 80-130 字，恐怖 60-110 字，古装/玄幻/西幻 130-200 字等
- **叙述节奏**：都市明快、古装从容、玄幻战斗紧凑、悬疑克制、恐怖极度简短
- **重点描写方向**：不同题材指定不同的描写焦点
- **句式风格**：都市口语化、古装典雅、玄幻排比、悬疑短句留白等
- **句式多样化**：强制避免每段以"你"开头

### 状态栏阈值触发器

当玩家状态值触及特定阈值时，自动向 AI 注入特殊叙事指令。例如：

- 悬疑：线索数 ≥ 15 → 触发关键推理场景
- 恐怖：恐惧值 ≥ 85 → 主角做出非理性决定
- 玄幻：灵力 ≤ 10 → 被迫逃跑或激发潜力
- 末世：生存值 ≥ 80 → 扩张领地、招募幸存者

每个题材约 4 个触发条件（高值/低值各 2 个），共约 32 个触发规则。

### 结构化输出解析

AI 在纯文本叙述后附加 `[PARSED_DATA]{json}` 结构化数据块，包含剧情摘要、状态变化（status_delta）、线索信息、记忆事件（memory_events）等。前端 `parseNarrative.ts` 负责分离文本和数据，`StatusDeltaToast` 动画展示数值变化。

### JSON 截断修复

世界观生成时可能因 `max_tokens` 限制导致 JSON 被截断。`worldgenPrompts.ts` 实现了 `safeParseJSON`，自动检测并修复截断的 JSON，大幅提高生成成功率。

---

## 许可证

MIT License

---

## 致谢

- [DeepSeek](https://www.deepseek.com/) —— 大语言模型 API
- [Next.js](https://nextjs.org/) —— React 全栈框架
- [Supabase](https://supabase.com/) —— 开源 Firebase 替代方案
- [Zustand](https://github.com/pmndrs/zustand) —— 轻量级状态管理
- [Tailwind CSS](https://tailwindcss.com/) —— 实用优先的 CSS 框架
