# 鸢叙 · AI 互动小说

> 基于 DeepSeek 大语言模型的沉浸式互动小说平台。选择题材、构建世界、扮演主角——AI 实时生成剧情，你的每一个选择都将改写故事的走向。

---

## 🔗 在线体验

**[👉 立即体验 —— ai-novel-seven.vercel.app](https://ai-novel-seven.vercel.app/)**

无需注册，点击"游客模式"即可开始。推荐使用 DeepSeek API Key 获得完整体验。

### 截图预览

<!-- TODO: 请将截图放入 docs/screenshots/ 目录，然后取消下方注释 -->
<!--
![游戏界面](./docs/screenshots/game.png)
![世界观配置](./docs/screenshots/setup.png)
![角色关系图谱](./docs/screenshots/relationships.png)
-->

---

## ⚡ 技术亮点

> 以下是从工程实践中提炼的 6 个核心技术挑战与应对方向，每一项都对应真实的生产级解决方案。

| # | 挑战 | 应对 |
|---|------|------|
| 🧠 | **长对话记忆衰减**：LLM 上下文窗口有限，20+ 回合后 AI 遗忘早期关键剧情，角色行为前后矛盾 | **长短期记忆分离架构**：短期只传最近对话，长期通过每 N 回合自动提取结构化记忆事件，按重要性分级注入后续 Prompt，用 ~200 tokens 锚定数万字的叙事上下文 |
| 🛡️ | **Prompt 注入攻击**：玩家输入恶意指令试图跳出故事框架，破坏游戏体验 | **双层防护体系**：前端输入层正则过滤 12 类注入特征词 + API 层在 System Prompt 末尾追加最高优先级安全规则，双重保障 AI 的行为边界 |
| ⚡ | **流式渲染抖动**：SSE 推流速度远超打字机逐字渲染，timer 被反复清除导致文字停滞或跳变 | **自适应变速打字机**：Ref 驱动的高频 tick 循环与流式 chunk 解耦，积压 > 100 字自动 4× 加速，追平后恢复逐字节奏，全程避免闭包陈旧 |
| 🧩 | **AI 输出不可靠**：正则匹配 `[^}]+` 遇嵌套 JSON 或中文标点直接截断，状态数值报废 | **多层容错 JSON 解析**：AI 强制输出完整 JSON → 贪婪正则提取最外层 `{}` → JSON.parse 校验 → 逐字段类型兜底，串联三重保险 |
| 💾 | **SSR 构建崩溃**：Next.js 服务端预渲染时 Zustand persist 访问 `localStorage`，Node.js 环境无 `window` 对象导致白屏 | **SSR 安全持久化**：`createJSONStorage` 懒加载 + 运行时检测，服务端返回空操作对象，客户端才接入真实 storage；运行时字段用 `partialize` 排除，杜绝序列化死锁 |
| 🎯 | **异步闭包陈旧**：`useCallback` 捕获渲染快照，AI 请求返回时状态已过时，导致回合数与消息列表错乱 | **HandleActionRef 模式**：用 `useRef` 包裹核心异步逻辑，函数体内全部通过 `getState()` 按需实时读取，彻底消除依赖数组陷阱 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 5 |
| UI 库 | React 19 |
| 状态管理 | Zustand 5 + persist + createJSONStorage（SSR 安全） |
| 样式方案 | Tailwind CSS v4 + CSS 自定义属性主题系统 |
| AI 引擎 | DeepSeek API（OpenAI SDK 兼容接口，流式 + 非流式） |
| 认证服务 | Supabase Auth + `@supabase/ssr` |
| 音频 | Web Speech API（TTS）+ Web Audio API（BGM 实时合成） |
| 部署 | Vercel（含 Cron Job 保活） |

---

## 核心功能

### 🎮 剧情生成与交互

AI 根据题材、世界观、角色设定实时生成叙述，流式 SSE 传输 + 自适应打字机渲染。每回合自动产出 3-4 个差异化选项（并行生成以减少等待），同时支持自由输入任意行动。内置剧情干预机制，玩家可随时输入期望的剧情方向，AI 在 2-3 回合内自然融入。键盘快捷键（A/B/C 选择选项，`/` 聚焦输入框）让操作零延迟。

### 🌍 世界构建与配置

支持 AI 一键随机生成世界名、背景设定、主角与配角——也可逐字段手动精细编辑，每个字段配备 AI 润色按钮（1.5-2× 扩充）。12 个自由增删的配角落位，支持预设剧情节拍（在指定回合附近自动触发）和目标结局方向（AI 暗中引导）。三种叙述视角（第一/二/三人称）+ 句式多样化规则，杜绝千篇一律的"你"字开头。

#### 题材系统（8 个主线 × 6 个副线）

每个题材拥有独立的状态栏、主题色系、写作参数、背景动效和 BGM 配方：

| 题材 | 状态栏 | 写作风格 |
|------|--------|---------|
| 🏙️ 都市现代 | 人脉、金钱 | 干练明快，口语化，重职场细节与城市氛围 |
| 🏯 古装历史 | 声望、势力 | 从容典雅，文白夹杂，重礼仪权谋与人物仪态 |
| ⚡ 玄幻修仙 | 灵力、境界 | 磅礴大气，短促排比，重战斗突破与气势渲染 |
| ✨ 西幻魔法 | 魔力、境界 | 轻快奇趣，想象力丰富，重魔法视觉与奇异生物 |
| 🔍 悬疑推理 | 线索数、理智值 | 克制紧绷，短句留白，信息密度高每句有意义 |
| 🩸 恐怖惊悚 | 恐惧值、理智值 | 极度克制，极简短句，留白制造恐惧 |
| 🚀 科幻未来 | 科技值、信任度 | 冷静精准，多专业术语，重科技与人性的碰撞 |
| ☢️ 末世求生 | 生存值、理智 | 紧张压迫，感官强烈，重资源博弈与信任抉择 |

副线标签（💕言情 · 😄轻松 · ⚔️争斗 · 🔮谜题 · 🌑黑暗 · 🎭权谋，最多选 2 个）注入到 System Prompt，AI 在主线中自然融入对应叙事元素。

### ✍️ 文笔风格系统

9 种预设风格（简练克制 / 抒情细腻 / 紧张悬疑 / 幽默诙谐 / 古典雅致 / 电影镜头 / 武侠文言 / 轻小说 / 纯文学），支持自定义风格描述，或上传一段文字由 AI 自动提取文笔特征并应用。风格指令注入到故事生成的 System Prompt 中，全程影响 AI 的用词、句式和叙事节奏。

### 🧠 AI 记忆与关系系统

**长短期记忆分离**：每 5 回合自动提取关键事件（NPC 关系变化、世界变动、秘密揭露等），按重要性排序存储，后续 Prompt 中注入高重要度事件防止 AI 遗忘。**NPC 近况追踪**：自动从最近叙述中搜取配角出场片段，维护角色行为一致性。**角色关系图谱**：AI 每回合分析主角与 NPC 的关系变化（-100 ~ +100 好感度），SVG 可视化展示 9 种关系类型（恋人/友人/对手/盟友/敌人/家人/师长/陌路/未知），支持溯源每次变化的历史。**悬疑线索系统**（悬疑题材专属）：AI 自动标记线索，含分类、重要度、关联关系，独立线索库页面管理。

### 💾 存档、分支与结局

自动存档 + 手动多槽存档，Canvas 自动生成主题色封面卡片。支持从历史任意节点回溯并创建独立分支存档，主线不受影响，多线并行。4 种结局类型（好/坏/真/隐藏），AI 在故事到达自然终点时根据状态值自动触发。三阶段结局压力（伏笔 → 收尾 → 强制），长短篇自适应。支持 TXT 格式导出完整小说文本。

---

## 快速开始

### 前置要求

- Node.js >= 18
- DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com)）
- Supabase 项目（可选，用于用户认证）

### 安装与运行

```bash
# 1. 克隆
git clone https://github.com/z2875596-crypto/AI-Novel.git
cd AI-Novel

# 2. 安装依赖
npm install

# 3. 创建 .env.local，填入配置
```

```env
# 必填
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 可选（用户认证）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 可选（Cron 保活鉴权）
CRON_SECRET=your-cron-secret
```

```bash
# 4. 启动
npm run dev
# 打开 http://localhost:3000
```

---

## 📋 完整功能清单

<details>
<summary>点击展开 —— 共 50+ 功能点</summary>

### 剧情生成
- SSE 流式输出 + 打字机效果
- AI 结构化 JSON 输出（narrative + statusDelta + ending + clues + memoryHint）
- 每回合自动生成 3-4 个差异化选项（含去重防护）
- 选项并行生成（多选项同时请求 AI）
- 自由输入任意行动
- Prompt 注入双层防护（前端输入清洗 + 后端安全规则）
- 状态栏变化动画（StatusDeltaToast）
- 剧情干预（随时输入剧情方向，2-3 回合内自然融入）
- 键盘快捷键（A/B/C/D 选择选项，`/` 或 F 聚焦输入框）

### 世界构建
- AI 一键随机生成（世界名、背景、主角、开场场景、3 个配角）
- 手动逐字段精细编辑
- AI 润色按钮（每个字段独立，1.5-2× 扩充）
- 配角自由增删
- 剧情节拍（预设特定回合触发的剧情节点）
- 目标结局（AI 暗中引导）
- 三种叙述视角（第一/二/三人称）+ 句式多样化
- 三种故事长度（短篇 30 回合 / 中篇 60 回合 / 长篇 120 回合）

### 文笔风格
- 9 种预设风格 + 自定义描述
- AI 风格分析（上传文字自动提取文笔特征）
- 风格指令注入 System Prompt

### 故事与存档
- 自动分章 + 章节摘要（AI 并行生成摘要与标题）
- 章节目录页（展开查看完整对话记录）
- 自动存档（每次行动后更新）
- 手动多槽存档（另存为独立副本，最多 20 个）
- Canvas 自动生成存档封面
- 存档 TXT 导出（完整小说文本）
- 回溯功能（从历史节点开启新分支）
- 分支存档（独立保存，不影响主线）
- 4 种结局类型（好/坏/真/隐藏）

### AI 系统
- 长短期记忆分离（memoryStore，每 5 回合自动提取）
- NPC 近况记忆注入（维护角色行为一致性）
- 角色关系自动追踪（好感度 -100 ~ +100）
- 9 种关系类型 + SVG 可视化关系图谱
- 关系变化历史追溯
- 悬疑线索自动提取 + 分类 + 关联 + 线索库页面
- 状态栏阈值触发器（~32 个触发条件，高/低值各自动态注入叙事指令）
- 题材动态写作参数（字数范围、节奏、重点、句式风格自适应）

### 体验与系统
- TTS 文字转语音（Web Speech API，可调节语速/音调/音量）
- BGM 背景音乐（Web Audio API 实时合成，8 题材独立音效配方）
- 动态主题色系（9 个 CSS 变量实时切换，全界面同步）
- Canvas 背景动效（每种题材独立视觉风格）
- 游客模式（无需注册，数据存本地）
- Supabase 邮箱登录/注册
- Vercel Cron Job 自动保活（每 5 天）
- 移动端适配（响应式布局）

</details>

---

## 📐 参考资料

### 项目结构

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
│   │   └── cron/keepalive/       # Supabase 保活
│   ├── page.tsx                  # 首页（9 宫格题材选择 + 随机）
│   ├── layout.tsx                # 根布局
│   ├── login/ setup/ game/ saves/ chapters/ relationships/ clues/
│   └── globals.css               # 全局样式 + CSS 主题变量
├── components/
│   ├── game/   (14 个)           # StoryPanel, ChoicesBar, StatusBar, BGMController …
│   ├── setup/  (7 个)            # WorldEditor, CharacterEditor, PolishButton …
│   ├── home/   (5 个)            # GenreGrid, GenreBackground, RecentSaveBanner …
│   ├── saves/  (2 个)            # SaveCard, SaveCover (Canvas)
│   ├── clues/  (2 个)            # ClueCard, ClueGraph
│   └── shared/ (4 个)            # ThemeProvider, AuthProvider, Logo …
├── stores/    (11 个)            # Zustand: gameStore, memoryStore, worldStore …
├── lib/       (16 个模块)         # deepseek, prompts/, sanitizeInput, statusTriggers …
├── types/     (7 个)             # game, genre, world, save, clue, subplot, narrative
├── public/
└── vercel.json                   # Cron Job 配置
```

### API 端点一览

| 端点 | 方法 | 用途 | 流式 |
|------|------|------|:----:|
| `/api/story/stream` | POST | 剧情生成 | ✅ |
| `/api/story/choices` | POST | 选项生成 | ❌ |
| `/api/worldgen` | POST | 世界观随机生成 | ❌ |
| `/api/summary` | POST | 章节摘要 + 标题 | ❌ |
| `/api/relationship` | POST | 角色关系提取 | ❌ |
| `/api/memory/extract` | POST | 长短期记忆提取 | ❌ |
| `/api/analyze-style` | POST | 文笔风格分析 | ❌ |
| `/api/polish` | POST | 设定润色 | ❌ |
| `/api/cron/keepalive` | GET | Supabase 保活 (Cron) | ❌ |

### 状态管理架构

| Store | 存储 | 职责 |
|-------|------|------|
| `gameStore` | persist (partialize) | 回合数、状态栏、消息历史、当前选项 |
| `memoryStore` | persist | 长期记忆事件（最多 100 条，按重要度排序） |
| `worldStore` | persist | 世界观完整配置 |
| `saveStore` | 手动 localStorage | 存档列表（最多 20 个） |
| `summaryStore` | persist | 章节摘要（含完整对话记录） |
| `genreStore` | persist | 当前题材 + 副线标签 |
| `styleStore` | persist | 文笔风格配置 |
| `relationshipStore` | persist | 角色关系 + 好感度 + 关系历史 |
| `clueStore` | persist | 悬疑线索库 |
| `settingsStore` | persist | TTS / BGM 参数 |
| `authStore` | 运行时 | 用户登录状态（不持久化） |

### 使用流程

```
选择题材 + 副线标签
      ↓
AI 生成 / 手动配置世界观（世界设定、主角、配角、视角、长度）
      ↓
进入游戏 → AI 流式生成开场剧情（打字机实时渲染）
      ↓
每回合：选择预设选项 或 自由输入 或 剧情干预
      ↓
AI 生成叙述 → 结构化数据解析 → 状态变化动画 → 线索/记忆/关系更新
      ↓
循环推进 → 到达分章回合时自动生成章节摘要
      ↓
结局触发（hint → push → force 三阶段）
```

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
