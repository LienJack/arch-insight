# arch-insight

`arch-insight` 现在以 `.agents/` 作为唯一权威源，再从这套 `Claude` 兼容插件源生成 `Claude`、`Codex`、`Gemini` 三个平台 bundle，并提供两条正式安装入口：

- npm 分发包入口：`npx arch-insight install --platform <claude|codex|gemini>`
- shell 入口：`curl -fsSL .../scripts/install.sh | ARCH_INSIGHT_PLATFORM=<platform> bash`

维护主路径已经迁移到 [`.agents`](./.agents)；根目录旧入口已移除。

## 多平台安装

### npm / npx / pnpm dlx / bunx

```bash
npx arch-insight install --platform codex
pnpm dlx arch-insight install --platform claude
bunx arch-insight install --platform gemini
```

### curl | sh

```bash
curl -fsSL https://raw.githubusercontent.com/LienJack/arch-insight/main/scripts/install.sh | ARCH_INSIGHT_PLATFORM=codex bash
curl -fsSL https://raw.githubusercontent.com/LienJack/arch-insight/main/scripts/install.sh | ARCH_INSIGHT_PLATFORM=claude bash
curl -fsSL https://raw.githubusercontent.com/LienJack/arch-insight/main/scripts/install.sh | ARCH_INSIGHT_PLATFORM=gemini bash
```

### 兼容入口：给用户一键安装到 Codex

用户在终端执行下面这条命令即可安装到 `~/.codex/skills/arch-insight`：

```bash
curl -fsSL https://raw.githubusercontent.com/LienJack/arch-insight/main/scripts/install-codex-skill.sh | bash
```

安装完成后重启对应平台。

`arch-insight` 是一个面向团队工程师的源码研究 skill，用来把“看一个或多个参考仓库”收束成“学到它为什么这样设计、哪些抽象值得借鉴、哪些场景不该照搬、迁移时要警惕什么”。

它支持三种交付形态：分析包（主报告 + 学习附件）、深度解读文章（叙事化技术长文）、源码导览（中文仓库百科、事实密集可扫描）。默认服务“单仓解读 + 多仓对照式设计参考”，而不是默认做生态级尽调。仓库里保留了生态级扩展能力，但只有在 monorepo、多服务或平台工程场景下才进入那条路径。

## 交付形态

`arch-insight` 提供三种交付形态，由 `.agents/skills/arch-insight/SKILL.md` 入口统一路由：

| 模式 | 产物 | 适用场景 |
| --- | --- | --- |
| 分析包 | 主报告 + 5 附件 | 结构化沉淀、团队知识库归档 |
| 文章 - 深度解读 | 单篇叙事长文 | 技术博客/专栏风格、设计借鉴与迁移判断 |
| 文章 - 源码导览 | 中文仓库百科 | 快速建立仓库地图、事实密集、可扫描导航 |

## 参考来源输入

`arch-insight` 支持一个或多个参考仓库输入，来源可以是：

- 本地路径
- GitHub URL
- GitHub shorthand（`owner/repo`）
- 可选版本锚点：`branch`、`tag`、`commit`

多仓输入的默认目标是“对照式设计参考”：提炼共同模式、差异选择、适用背景和局部启发范围；不是自动升级为生态级尽调。

对于 GitHub URL / `owner/repo` 输入，默认采用 `Remote First`：先用 `repomix --remote` 小步采集证据；远端失败或证据不足时，再受控回退到最小化浅克隆（`--depth=1` + 关键路径优先）。仓库读权限不可用时，明确记录为阻塞边界，而不是承诺 clone 可恢复。

## 默认路径（分析包模式）

1. `.agents/skills/arch-insight/references/prompts/01_repo_intake.md`
2. `.agents/skills/arch-insight/references/prompts/02_design_philosophy_brain_dump.md`
3. 可选 `.agents/skills/arch-insight/references/prompts/03_ecosystem_atlas.md`
4. `.agents/skills/arch-insight/references/prompts/04_architecture_report.md`

深度解读文章模式和源码导览文章模式的路径见 `.agents/skills/arch-insight/SKILL.md` 和 `.agents/skills/arch-insight/references/RUNNER.md`。

这四步分别对应四种职责：

- `repomix` 负责上下文准备
- 分阶段脑图分析 prompt 负责第一轮系统脑图与设计理念提炼
- 生态级扩展分析 prompt 负责可选的生态级扩展视角
- 叙事化架构报告 prompt 负责最终报告的叙事质量、Mermaid 图和设计取舍分析

## 产物

分析包模式的默认交付物是”主报告 + 学习附件”，而不是一份泛化大报告：

- `.agents/skills/arch-insight/references/templates/ARCHITECTURE_REPORT.md`
- `.agents/skills/arch-insight/references/templates/DESIGN_PHILOSOPHY.md`
- `.agents/skills/arch-insight/references/templates/CORE_ABSTRACTIONS.md`
- `.agents/skills/arch-insight/references/templates/MAIN_FLOW.md`
- `.agents/skills/arch-insight/references/templates/TRADEOFFS.md`
- `.agents/skills/arch-insight/references/templates/BORROWABLE_PATTERNS.md`

文章模式（深度解读 / 源码导览）各有独立模板：

- `.agents/skills/arch-insight/references/templates/NARRATIVE_ARTICLE.md`
- `.agents/skills/arch-insight/references/templates/REPO_OVERVIEW_ARTICLE.md`

可以先看 `examples/sample-analysis.md`，那里展示了目标语气、结构和附件之间的关系。

## 适用场景

- 研究开源项目为什么这样设计
- 给团队做源码 onboarding 或内部知识沉淀
- 提炼一个或多个参考仓库里最值得学习的抽象、边界和模式
- 形成带判断力的正式源码解读报告
- 生成中文源码仓库导览，快速建立仓库地图与阅读路径
- 辅助“我自己的项目该借鉴什么、不该照搬什么”的设计判断

不适合：

- 单文件解释
- 普通 bug 排查
- 日常代码 review
- 默认就做生态级企业尽调

## 入口文件

- `.agents/plugin.json`：权威源 manifest
- `.agents/skills/arch-insight/SKILL.md`：权威 skill 入口
- `.agents/skills/arch-insight/references/RUNNER.md`：权威执行手册、路径选择和输出契约
- `.agents/skills/arch-insight/references/prompts/`：权威分阶段 prompt
- `.agents/skills/arch-insight/references/templates/`：权威主报告与学习附件模板
- 根目录旧入口已移除，请使用 `.agents/skills/arch-insight/SKILL.md`、`.agents/skills/arch-insight/references/RUNNER.md`、`.agents/skills/arch-insight/references/prompts/`、`.agents/skills/arch-insight/references/templates/`
- `examples/sample-analysis.md`：目标质量示例

## 默认上下文准备：`repomix`

仓库不再内置本地打包 CLI。默认直接使用官方 `repomix` 做上下文准备；如果本机已经安装了 `repomix`，下面示例里的 `npx repomix@latest` 可以直接换成 `repomix`。

快速开始：

```bash
npx repomix@latest --help
```

常用命令：

```bash
# 先看 token 分布（默认 o200k_base）
npx repomix@latest --token-count-tree --include ".agents/skills/arch-insight/references/prompts/**/*,.agents/skills/arch-insight/references/templates/**/*"

# 使用 stdin 精选文件（stdin 选择优先）
printf "README.md\n.agents/skills/arch-insight/references/RUNNER.md\n.agents/skills/arch-insight/references/prompts/01_repo_intake.md\n" | npx repomix@latest --stdin -o outputs/repo-context.xml

# 打包并按需分片 + 压缩
npx repomix@latest --include ".agents/skills/arch-insight/references/prompts/**/*,.agents/skills/arch-insight/references/templates/**/*" --split-output 1mb --compress -o outputs/repo-context.xml
```

如果你只是想要“下次继续问时能直接复用”的最省事方式，直接用仓库内脚本：

```bash
# 生成一个更轻量、适合重复复用的上下文包
./scripts/build-repomix-context.sh

# 需要更大范围时再用 full
./scripts/build-repomix-context.sh full
```

默认行为：

- 自动创建 `outputs/`
- 默认输出到 `outputs/repo-context.xml`
- 优先使用本机已安装的 `repomix`，否则自动回退到 `npx repomix@latest`

下次继续提问时，直接明确说明要复用这个文件即可，例如：

```text
请先读取 /Users/lienli/Documents/GitHub/arch-insight/outputs/repo-context.xml，再继续分析
```

注意：

- `outputs/repo-context.xml` 会保留在本地，除非你手动删除或覆盖它
- 它适合作为可复用的上下文缓存，但仍属于辅助性中间文件，不是正式报告产物
