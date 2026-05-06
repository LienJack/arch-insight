# arch-insight

一个将源码仓库转化为**设计判断**的 Agent Skill — 不是重写文档，而是提炼设计理念。

用它研究别人的项目，你可以快速理解设计意图、提取可借鉴的模式、看清取舍。而且不需要每次都在新对话里把整个仓库重新扫一遍。

## 为什么需要这个 Skill

用 LLM 分析别人的代码仓库，通常会遇到这些问题：

- **Token 浪费** — 每次扫描整个仓库，上下文烧得飞快
- **重复劳动** — 每次新对话都从零开始，扫过的代码又扫一遍
- **分析太浅** — 只给你模块列表和流程图，没有设计推理，也没有代码佐证
- **风格不对** — AI 默认的写作风格和你写的东西差太多
- **不会引导** — 你不知道该让 AI 分析什么，AI 也不知道该看什么

`arch-insight` 通过分阶段 intake、聚焦上下文打包、风格对齐、以及推动判断而非复述的提示词，来解决这些问题。

## 什么时候用

- 研究一个开源项目，想理解它的**设计意图**，不只是看文件结构
- 判断哪些模式可以借鉴、哪些应该规避，用于自己的项目设计
- 生成结构化的架构报告，用于团队 onboarding 或知识归档
- 写一篇基于源码证据的技术深度分析文章
- 创建一份仓库导览，快速建立阅读地图
- 对比多个参考仓库的设计思路

## 什么时候不用

- 解释单个文件或排查 bug
- 常规代码审查
- 只画调用关系图，不关心设计哲学
- 全架构代码映射或穷举式函数分析

## 安装

### 推荐（交互式）

```bash
npx arch-insight install-release
```

### 指定平台（非交互 / CI）

```bash
npx arch-insight install-release --platform codex --platform claude
```

### 更新

```bash
npx arch-insight update --platform codex
```

| 平台        | 安装路径                                      |
| ----------- | --------------------------------------------- |
| Claude Code | 自动市场注册                                  |
| Codex       | `~/.codex/skills/arch-insight/`               |
| Gemini      | `~/.gemini/skills/arch-insight/`              |
| OpenCode    | `~/.config/opencode/skills/arch-insight/`     |
| Pi          | `~/.pi/agent/skills/arch-insight/`            |
| Kiro        | `~/.kiro/skills/arch-insight/`                |
| Cursor      | `~/.cursor/plugins/local/arch-insight/`       |

安装后重启对应平台。

## 使用方式

**显式调用：**

```txt
使用 arch-insight skill 分析这个仓库，生成架构文档。
```

**自然语言调用：**

```txt
研究一下这个项目的核心抽象和设计取舍，我想参考它做自己的架构设计
```

```txt
Generate a narrative article about the architecture of this codebase.
```

```txt
给我一份这个仓库的源码导览，我想快速建立阅读地图
```

Skill 会根据你的措辞自动判断输出格式：

- "博客风格" / "可发布长文" / "像那篇文章" → **叙事文章**
- "overview" / "仓库导览" / "源码地图" → **仓库概览**
- "主报告 + 附件" / "模板产物" → **分析包**
- 不明确 → 最小推断，不会默认走分析包

## 输出物

### 分析包

| 文件                       | 回答什么问题                                    |
| -------------------------- | ----------------------------------------------- |
| `ARCHITECTURE_REPORT.md`   | 系统概览和整体判断                              |
| `DESIGN_PHILOSOPHY.md`     | 作者一贯坚持什么设计原则                        |
| `CORE_ABSTRACTIONS.md`     | 这个系统的"语言"是什么                          |
| `MAIN_FLOW.md`             | 哪条路径最能揭示架构意图                        |
| `TRADEOFFS.md`             | 收益、成本、替代方案和边界                      |
| `BORROWABLE_PATTERNS.md`   | 其他团队真正能拿走什么                          |

### 文章模式

- **叙事文章** → 单篇 `NARRATIVE_ARTICLE.md` — 有观点、聚焦设计、考虑迁移成本
- **仓库概览** → 单篇 `REPO_OVERVIEW_ARTICLE.md` — 信息密集、可扫描、带源码路径和阅读导航

## 示例

示例输出在 [`../examples/`](../examples/)。中文内容请优先参考中文示例。

- 中文示例:
  - [五个 LLM 编码助理工作流的深度对比分析](../examples/llm-coding-workflow-comparison.zh.md)
  - [代理记忆系统的设计哲学：从五个范式中提取模式](../examples/agent-memory-design-philosophy.zh.md)

## 工作流程

Skill 遵循分阶段 pipeline：

### 分析包

1. **Repo Intake** — 确定范围、项目类型、源码与版本锚点
2. **Design Philosophy Brain Dump** — 系统心智模型、核心抽象、设计原则猜想
3. **Ecosystem Atlas** *(按需)* — 仅用于 monorepo / 多服务 / 平台类场景
4. **Architecture Report** — 主报告 + 5 份学习附件

### 叙事文章

1. **Repo Intake**
2. **Design Philosophy Brain Dump**
3. **Narrative Article** — 单篇长文，含观点、设计教训、迁移判断

### 仓库概览

1. **Repo Intake**
2. **Design Philosophy Brain Dump**
3. **Repo Overview Article** — 信息密集、结构清晰、可扫描、带源码路径和阅读导航

提供风格样稿时，Agent 会在写作前确立 **风格契约**（受众、语气、结构密度、证据格式、禁止事项），契约优先级高于模板默认值。

## 设计原则

- **先问 Why 再说 What** — 先理解问题，再解释结构
- **主流程优于目录树** — 定义性路径比文件夹布局更有价值
- **核心抽象先于实现细节** — 先识别语言，再读语法
- **证据优先** — 每个判断都引用代码路径
- **诚实地谈取舍** — 每个设计结论都覆盖收益、成本、替代方案和边界
- **输出让人变聪明，不是变长** — 读完后能学到东西，不只是看到更多字
- **聚焦而非穷举** — 设计哲学和可借鉴模式优于全架构代码映射

## 局限性

- 大型 monorepo 可能需要聚焦分析关键目录
- 运行时行为（并发模型、实际数据流）需要日志、测试或追踪 — 纯静态分析不够
- 动态导入、反射、代码生成和框架魔法会降低分析准确度
- 生成的报告应由项目维护者审阅
- 多仓库输入默认做对比设计参考，不是全生态审计

## 目录结构

```txt
.agents/
├── plugin.json
└── skills/arch-insight/
    ├── SKILL.md                   # Skill 入口（给 Agent 读的）
    ├── references/
    │   ├── RUNNER.md              # 执行手册和输出契约
    │   ├── prompts/               # 分阶段分析提示词
    │   └── templates/             # 报告和附件模板
    └── examples/
```

[![Star History](https://api.star-history.com/svg?repos=LienJack/arch-insight&type=Date)](https://star-history.com/#LienJack/arch-insight&Date)

## License

MIT
