# 鸢叙 · AI 互动小说

> 基于 DeepSeek 大语言模型的沉浸式互动小说平台。选择题材、构建世界、扮演主角——AI 实时生成剧情，你的每一个选择都将改写故事的走向。

---

## 项目简介

**鸢叙**是一款 AI 驱动的互动小说 Web 应用。用户可以从 8 大题材中自由选择，通过 AI 辅助或手动构建世界观、设定主角与配角，然后以实时流式的方式体验专属于自己的故事。每回合 AI 会自动生成 3 个差异化选项，也支持自由输入任意行动，还支持多结局、分支存档、章节摘要、线索收集、角色关系追踪等深度玩法。

---

## 题材系统

项目采用**两级题材架构**：8 个主线题材 + 6 个副线标签，每个题材拥有独立的状态栏、主题色系、写作参数、背景动效和 BGM。

### 主线题材

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

### 副线标签

| 标签 | 说明 |
|------|------|
| 💕 言情 | 感情升温、心动时刻 |
| 😄 轻松搞笑 | 幽默反转、轻松日常 |
| ⚔️ 争斗对抗 | 竞争对手、正面交锋 |
| 🔮 隐藏谜题 | 埋下伏笔、秘密待解 |
| 🌑 黑暗沉重 | 背叛牺牲、沉重代价 |
| 🎭 权谋算计 | 阴谋博弈、多方角力 |

副线标签可多选，AI 会在主线剧情中自然融入对应的叙事元素。

### 题材专属特性

每个题材拥有独立配置：
- **写作参数**：不同题材有不同的字数范围、叙述节奏、重点描写方向和句式风格
- **主题色系**：9 个 CSS 变量动态切换，包括主色、辅色、背景、表面、文字、边框等
- **状态栏阈值触发**：状态值达到高/低阈值时自动向 AI 注入特殊叙事指令
- **背景动效**：Canvas 动画背景，每个题材有专属视觉风格
- **BGM 生成**：Web Audio API 实时合成，8 种题材各有独立的音效配方

---

## 核心功能

### 🎮 剧情生成

- **流式输出**：Server-Sent Events 流式传输，打字机效果实时呈现 AI 叙述
- **智能选项**：每回合 AI 自动生成 3 个差异化选项（最多 4 个），基于当前剧情和状态栏
- **自由输入**：除了预设选项，支持输入任意自定义行动
- **状态反馈**：AI 在每段叙述末尾输出 `[STATUS_DELTA]` 标记，前端自动解析并动画展示数值变化
- **剧情暗示**：玩家可输入期望的剧情方向，AI 会在 2-3 回合内自然融入

### 🌍 世界构建

- **AI 随机生成**：一键生成世界名、背景设定、主角姓名特质、开场场景、3 个配角
- **手动精细编辑**：逐字段自由编辑世界观、主角、配角
- **AI 润色**：对世界背景、主角特质、开场场景、NPC 设定分别进行 AI 润色扩充（1.5-2x）
- **配角管理**：支持添加/删除多个 NPC，每个 NPC 有姓名、关系、特质
- **剧情节拍**：设定在特定回合触发的剧情节点，AI 会在附近回合自然融入
- **目标结局**：设定期望的故事结局方向，AI 暗中引导剧情发展
- **三种叙述视角**：第一人称（"我"）、第二人称（"你"）、第三人称（主角姓名）

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
- **AI 风格分析**：上传一段你喜欢的文字，AI 自动提取文笔特征并应用到故事生成中
- 风格配置会注入到故事生成的 System Prompt 中，影响 AI 的写作方式

### 📚 章节系统

- **自动分章**：每 20 回合自动触发章节摘要生成
- **并行生成**：章节摘要和章节标题同时请求 AI，减少等待
- **章节目录**：独立页面展示所有章节，支持展开查看完整对话记录
- **进度条**：游戏内显示当前章节进度（N/20 回合）
- 摘要存档持久化，跨页面不丢失

### 💞 角色关系系统

- **AI 自动追踪**：每回合分析主角与 NPC 的关系变化
- **好感度系统**：-100 到 +100 的好感度数值，自动推断关系类型
- **9 种关系类型**：恋人、友人、对手、盟友、敌人、家人、师长、陌路、未知
- **关系图谱**：SVG 可视化展示，不同关系类型使用不同颜色连线
- **关系历史**：记录每次关系变化的事件和回合，支持追溯

### 🔍 悬疑线索系统（悬疑题材专属）

- **AI 自动提取**：在悬疑题材中，AI 在生成叙述时会自动标记线索
- **结构化存储**：线索包含名称、描述、分类、重要程度、关联线索
- **5 种分类**：人物、物品、地点、事件、其他
- **3 级重要度**：低、中、高，不同颜色标识
- **线索关联**：支持手动建立线索之间的关联关系
- **线索库页面**：独立页面浏览和管理所有已发现线索

### ⏪ 回溯 & 分支

- **回溯功能**：点击任意历史叙述节点，从该位置开启新分支
- **分支存档**：新分支以独立存档保存，原主线不受影响
- **分支标识**：分支存档在列表中标注"分支·第N回合"
- **多线并行**：支持同时维护多条故事线

### 💾 存档系统

- **自动保存**：每次行动后自动更新存档
- **手动多槽存档**："另存为"支持创建独立存档副本
- **localStorage 持久化**：刷新页面数据不丢失
- **最大 20 个存档**：超出自动淘汰最旧存档
- **存档预览**：列表中显示题材、回合数、章节、状态快照
- **存档导出**：支持将存档导出为 TXT 格式的完整小说文本

### 🎯 多结局系统

- **4 种结局类型**：好结局（good）、坏结局（bad）、真结局（true）、隐藏结局（secret）
- **AI 触发**：当 AI 判断故事到达自然终点时自动输出结局标记
- **结局保存**：结局信息保存到存档中，导出时会展示

### 🔊 其他功能

- **TTS 文字转语音**：使用浏览器 Web Speech API 朗读 AI 叙述
  - 支持调节语速（0.5x-2.0x）、音调、音量
  - 可随时开启/关闭
- **BGM 背景音乐**：使用 Web Audio API 实时合成
  - 8 种题材各有独立音效配方（五声音阶、不协和音程、合成器音色等）
  - 支持音量调节和开关
- **用户认证**：基于 Supabase Auth 的登录/注册系统
  - 支持游客模式（数据仅存本地）
  - 注册用户（未来可支持云端存档同步）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 5 |
| UI 库 | React 19 |
| 状态管理 | Zustand 5 + persist 中间件 |
| 样式方案 | Tailwind CSS v4 |
| AI 引擎 | DeepSeek API（兼容 OpenAI SDK） |
| 认证服务 | Supabase Auth + `@supabase/ssr` |
| 运行时 | Node.js / Edge Runtime |
| 构建工具 | Turbopack（Next.js 默认） |

### 架构说明

- **前端**：纯客户端渲染（`'use client'`），使用 Next.js App Router 的页面路由
- **状态持久化**：Zustand persist 中间件将游戏状态自动同步到 localStorage，页面刷新不丢失
- **API 路由**：7 个 API 端点，全部在 Next.js Route Handler 中实现
- **流式响应**：剧情生成使用 ReadableStream 流式传输，配合 SSE 实现打字机效果
- **AI 调用策略**：
  - 剧情生成：流式调用，`max_tokens=1200`，`temperature=0.7`
  - 选项生成：非流式，使用 `deepseek-chat` 快速模型，`max_tokens=150`
  - 世界观生成：非流式，`temperature=1.0`，支持 JSON 截断修复
  - 章节摘要：并行双请求（摘要 + 标题），减少等待
  - 关系提取：非流式，低温度 `temperature=0.3` 保证输出稳定

---

## 项目结构

```
ai-novel/
├── app/
│   ├── api/
│   │   ├── story/stream/       # 剧情流式生成
│   │   ├── story/choices/      # 选项生成
│   │   ├── worldgen/           # 世界观随机生成
│   │   ├── summary/            # 章节摘要生成
│   │   ├── relationship/       # 角色关系提取
│   │   ├── analyze-style/      # 文笔风格分析
│   │   └── polish/             # 设定润色
│   ├── page.tsx                # 首页（题材选择）
│   ├── layout.tsx              # 根布局（元数据 + AuthProvider）
│   ├── login/                  # 登录/注册页
│   ├── setup/                  # 世界观配置页
│   ├── game/                   # 游戏主页面
│   ├── saves/                  # 存档管理页
│   ├── chapters/               # 章节目录页
│   ├── relationships/          # 角色关系图谱页
│   ├── clues/                  # 线索库页（悬疑题材）
│   └── globals.css             # 全局样式 + CSS 变量 + 动画
├── components/
│   ├── game/                   # 游戏内组件（15 个）
│   │   ├── StoryPanel.tsx      # 剧情展示面板
│   │   ├── ChoicesBar.tsx      # 选项按钮栏
│   │   ├── FreeInputBox.tsx    # 自由输入框
│   │   ├── StatusBar.tsx       # 状态栏
│   │   ├── StatusDeltaToast.tsx# 状态变化提示
│   │   ├── SummaryCard.tsx     # 章节摘要卡片
│   │   ├── SaveAsModal.tsx     # 另存为弹窗
│   │   ├── RewindModal.tsx     # 回溯确认弹窗
│   │   ├── MoreMenu.tsx        # 更多操作菜单
│   │   ├── WorldConfigModal.tsx# 世界观查看弹窗
│   │   ├── StyleSwitchPanel.tsx# 文笔风格切换
│   │   ├── PlotHintInput.tsx   # 剧情期望输入
│   │   ├── TTSToggle.tsx       # 朗读开关
│   │   └── BGMController.tsx   # 背景音乐控制
│   ├── setup/                  # 配置页组件（5 个）
│   │   ├── WorldEditor.tsx     # 世界观编辑
│   │   ├── CharacterEditor.tsx # 主角编辑
│   │   ├── RandomGenButton.tsx # AI 随机生成
│   │   ├── StyleEditor.tsx     # 文笔风格编辑
│   │   ├── TargetEndingEditor.tsx# 目标结局编辑
│   │   ├── PlotBeatsEditor.tsx # 剧情节拍编辑
│   │   └── PolishButton.tsx    # AI 润色按钮
│   ├── home/                   # 首页组件（7 个）
│   │   ├── GenreGrid.tsx       # 题材选择网格
│   │   ├── GenreBackground.tsx # 动态背景切换
│   │   ├── RecentSaveBanner.tsx# 最近存档横幅
│   │   ├── UserStatus.tsx      # 用户状态
│   │   ├── DecorativeBackground.tsx # 装饰背景
│   │   └── backgrounds/        # 8 个题材 Canvas 动画背景
│   ├── saves/                  # 存档组件（2 个）
│   │   ├── SaveCard.tsx        # 存档卡片
│   │   └── SaveCover.tsx       # 存档封面
│   ├── clues/                  # 线索组件（2 个）
│   │   ├── ClueCard.tsx        # 线索卡片
│   │   └── ClueGraph.tsx       # 线索关系图
│   └── shared/                 # 共享组件（3 个）
│       ├── Logo.tsx            # Logo 组件
│       ├── ThemeProvider.tsx   # 主题 Provider
│       └── AuthProvider.tsx    # 认证 Provider
├── stores/                     # Zustand 状态管理（10 个）
│   ├── gameStore.ts            # 游戏核心状态（回合、消息、选项、流式文本）
│   ├── genreStore.ts           # 题材选择
│   ├── worldStore.ts           # 世界观配置
│   ├── saveStore.ts            # 存档列表
│   ├── authStore.ts            # 用户认证
│   ├── settingsStore.ts        # 设置（TTS 参数）
│   ├── summaryStore.ts         # 章节摘要
│   ├── styleStore.ts           # 文笔风格
│   ├── clueStore.ts            # 线索数据
│   └── relationshipStore.ts    # 角色关系
├── lib/                        # 工具库（15 个模块）
│   ├── deepseek.ts             # DeepSeek 客户端（懒加载 + Proxy）
│   ├── supabase.ts             # Supabase 浏览器客户端
│   ├── themeConfig.ts          # 8 题材主题配置（色系、状态栏、写作参数）
│   ├── statusBar.ts            # 状态栏初始化 + 增量计算
│   ├── statusVibes.ts          # 状态值分级标签（5 级 × 8 题材）
│   ├── statusTriggers.ts       # 状态阈值触发器（约 32 个触发条件）
│   ├── saveManager.ts          # 存档读写（localStorage）
│   ├── exportNovel.ts          # TXT 小说导出
│   ├── tts.ts                  # Web Speech API 朗读
│   ├── bgm.ts                  # Web Audio API 背景音乐生成
│   └── prompts/                # AI Prompt 模板（5 个）
│       ├── storyPrompt.ts      # 剧情生成提示词（核心，含题材动态参数）
│       ├── choicesPrompts.ts   # 选项生成提示词
│       ├── worldgenPrompts.ts  # 世界观生成提示词
│       ├── summaryPrompt.ts    # 章节摘要提示词
│       ├── stylePrompt.ts      # 风格分析/指令生成提示词
│       └── cluePrompt.ts       # 线索提取提示词
├── types/                      # TypeScript 类型定义（6 个）
│   ├── game.ts                 # Message 类型
│   ├── genre.ts                # 题材配置类型
│   ├── world.ts                # 世界观配置类型
│   ├── save.ts                 # 存档记录类型
│   ├── clue.ts                 # 线索类型
│   └── subplot.ts              # 副线标签类型
├── public/                     # 静态资源
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── .env.local                  # 环境变量（gitignore）
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
```

> **模型建议**：
> - `deepseek-chat`（默认）：速度快，成本低，适合大多数场景
> - `deepseek-reasoner`：推理能力更强，故事逻辑更连贯，适合悬疑推理题材
> - 选项生成、关系提取等辅助功能已在代码中固定使用 `deepseek-chat` 以确保响应速度

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
┌─────────────────────────────────────────────────────┐
│  1. 进入首页 → 选择题材 + 副线标签                    │
│     ↓                                               │
│  2. 配置世界观（AI 随机生成 / 手动填写 / 润色扩充）     │
│     ├── 世界名称、背景设定                            │
│     ├── 主角姓名、特质                                │
│     ├── 配角列表（姓名、关系、特质）                    │
│     ├── 剧情节拍（可选，定时触发的事件）                │
│     ├── 目标结局（可选，AI 暗中引导故事走向）           │
│     ├── 叙述视角（第一/二/三人称）                    │
│     └── 文笔风格（预设/自定义/AI 分析）               │
│     ↓                                               │
│  3. 进入游戏 → AI 生成开场剧情（流式输出）             │
│     ↓                                               │
│  4. 每回合：选择预设行动 或 自由输入 或 输入剧情期望    │
│     ↓                                               │
│  5. AI 生成下一段叙述 → 状态变化 → 可能触发特殊事件    │
│     ↓                                               │
│  6. 循环推进 → 每 20 回合生成章节摘要                 │
│     ↓                                               │
│  7. 故事自然到达终点 → AI 触发结局                    │
└─────────────────────────────────────────────────────┘
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
| `/api/analyze-style` | POST | 文笔风格分析 | ❌ |
| `/api/polish` | POST | 设定润色扩充 | ❌ |

---

## 状态管理架构

项目使用 Zustand 的 `persist` 中间件实现状态持久化。10 个 Store 各自独立存储：

| Store | 存储 Key | 持久化内容 |
|-------|----------|-----------|
| `gameStore` | `game-store` | 回合数、状态栏、消息历史、当前选项 |
| `genreStore` | `genre-store` | 当前题材、副线标签 |
| `worldStore` | `world-store` | 世界观完整配置 |
| `saveStore` | （内存 + localStorage） | 存档列表（最多 20 个） |
| `authStore` | （内存，由 Supabase 管理） | 用户信息、游客标记 |
| `settingsStore` | `settings-store` | TTS 开关、语速、音调、音量 |
| `summaryStore` | `summary-store` | 章节摘要列表 |
| `styleStore` | `style-store` | 文笔风格配置 |
| `clueStore` | `clue-store` | 线索数据 |
| `relationshipStore` | `relationship-store` | NPC 关系数据 |

---

## 特色设计

### 题材动态 Prompt 系统

每个题材拥有独立的写作参数，在生成故事时动态注入到 System Prompt 中：

- **字数控制**：都市 100-160 字，悬疑 80-130 字，恐怖 60-110 字，古装/玄幻/西幻 130-200 字等
- **叙述节奏**：都市明快、古装从容、玄幻战斗紧凑、悬疑克制、恐怖极度简短
- **重点描写方向**：每个题材指定不同的描写焦点（对话、功法、魔法效果、细节观察等）
- **句式风格**：都市口语化、古装典雅、玄幻排比、悬疑短句留白等

### 状态栏阈值触发器

当玩家状态值触及特定阈值时，自动向 AI 注入特殊叙事指令。例如：

- 悬疑线索数 ≥ 15 → 触发关键推理场景
- 恐怖恐惧值 ≥ 85 → 主角做出非理性决定
- 玄幻灵力 ≤ 10 → 被迫逃跑或激发潜力
- 末世生存值 ≥ 80 → 扩张领地、招募幸存者

每个题材有约 4 个触发条件（高值/低值各 2 个），共约 32 个触发规则。

### JSON 截断修复

AI 生成世界观时有可能因 `max_tokens` 限制导致 JSON 被截断。项目实现了 `safeParseJSON` 函数，自动检测并修复被截断的 JSON，大幅提高生成成功率。

---

## 许可证

MIT License © 2025

---

## 贡献

欢迎提交 Issue 和 Pull Request。项目使用 Next.js 16 + React 19 + TypeScript 5，请确保代码风格与现有代码保持一致。

---

## 致谢

- [DeepSeek](https://www.deepseek.com/) —— 提供强大的大语言模型 API
- [Next.js](https://nextjs.org/) —— React 全栈框架
- [Supabase](https://supabase.com/) —— 开源 Firebase 替代方案
- [Zustand](https://github.com/pmndrs/zustand) —— 轻量级状态管理
- [Tailwind CSS](https://tailwindcss.com/) —— 实用优先的 CSS 框架
