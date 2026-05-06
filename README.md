# arch-insight

`arch-insight` 现在以 `.agents/` 作为唯一权威源，再从这套 `Claude` 兼容插件源生成 `Claude`、`Codex`、`Gemini`、`OpenCode`、`Pi`、`Kiro`、`Cursor` 七个平台 bundle，并提供统一的跨平台安装入口。

- 推荐入口（交互选择平台）：`npx arch-insight install-release`
- 推荐入口（非交互多平台）：`npx arch-insight install-release --platform codex --platform claude`
- 更新入口：`npx arch-insight update --platform <claude|codex|gemini|opencode|pi|kiro|cursor>`
- 本地源码入口：`npx arch-insight install --platform <claude|codex|gemini|opencode|pi|kiro|cursor>`
- 本仓库脚本入口：`node scripts/install.mjs`

维护主路径已经迁移到 [`.agents`](./.agents)；根目录旧入口已移除。

## 多平台安装

### 命令矩阵（Windows / macOS / Linux）

| 场景 | Windows (PowerShell/cmd) | macOS/Linux |
| --- | --- | --- |
| Release 安装（交互选择平台，推荐） | `npx arch-insight install-release` | `npx arch-insight install-release` |
| Release 安装（非交互多平台） | `npx arch-insight install-release --platform codex --platform claude` | `npx arch-insight install-release --platform codex --platform claude` |
| Release 安装（OpenCode + Pi + Kiro + Cursor） | `npx arch-insight install-release --platform opencode --platform pi --platform kiro --platform cursor` | `npx arch-insight install-release --platform opencode --platform pi --platform kiro --platform cursor` |
| Release 安装（推荐） | `npx arch-insight install-release --platform codex` | `npx arch-insight install-release --platform codex` |
| 已安装用户更新（推荐） | `npx arch-insight update --platform codex` | `npx arch-insight update --platform codex` |
| 本地源码安装 | `npx arch-insight install --platform codex` | `npx arch-insight install --platform codex` |
| 仓库脚本安装（交互选择平台） | `node scripts/install.mjs` | `node scripts/install.mjs` |
| 本地测试安装（先本地构建 release 再安装） | `npm run install:test-local -- --platform codex` | `npm run install:test-local -- --platform codex` |

推荐优先使用 `npx arch-insight ...` 或 `node scripts/install.mjs ...` 这条 Node 链路，不依赖 `bash`、`tar`、`python3`。

如果要在本机验证 release 安装链路但不依赖远端发布地址，可以使用：

```bash
npm run install:test-local -- --platform codex
```

该脚本会先构建 `dist/local-release`，再用 `file://.../dist/local-release` 执行 `install-release`。

当包里没有预构建 `dist` 时，CLI 会自动从 `.agents/` 构建所需 bundle，再安装到本机目标目录。

如果命令里不传 `--platform`，CLI 会进入交互模式并支持一次多选平台安装。
如果需要无交互（CI / 脚本化），可重复传入 `--platform`。

安装完成后重启对应平台。

### 安装后自动可见（当前实现）

- Claude：`install-release --platform claude` 会自动执行本地 marketplace 注册 + `claude plugin install`，安装后可在 `claude plugin list --json` 看到 `arch-insight@arch-insight-local`。
- Codex：安装到 `~/.codex/skills/arch-insight/`，入口 `SKILL.md` 写入完成后即可在新会话中被发现。
- Gemini：安装到 `~/.gemini/skills/arch-insight/`，入口 `SKILL.md` 与 `RUNNER.md` 会同时写入，重启会话后可见。

安装结果 JSON 中新增 `visibilityCheck` 字段：

- `command`：可直接复制执行的可见性校验命令
- `ok`：安装后检查是否通过
- `failureHint`：失败时下一步建议
- Gemini 额外提供 `conflictDetected`（同名覆盖冲突）和 `resolvedLocation`（当前实际生效路径）
- OpenCode：安装到 `~/.config/opencode/skills/arch-insight/`，入口 `SKILL.md` 写入完成后即可在新会话中被发现。
- Pi：安装到 `~/.pi/agent/skills/arch-insight/`，入口 `SKILL.md` 写入完成后即可在新会话中被发现。
- Kiro：安装到 `~/.kiro/skills/arch-insight/`，入口 `SKILL.md` 写入完成后即可在新会话中被发现。
- Cursor：安装到 `~/.cursor/plugins/local/arch-insight/`，同时写入 `.cursor-plugin/plugin.json` 与 skills 目录。

## 更新 skill

如果你已经安装过 `arch-insight`，推荐用 `update` 命令做增量更新（语义上更清晰）：

```bash
npx arch-insight update --platform codex
```

等价别名：

```bash
npx arch-insight upgrade --platform codex
```

说明：

- `update`/`upgrade` 与 `install-release` 使用同一条发布安装链路
- 会从 release manifest 拉取对应平台最新 bundle，然后覆盖安装到本地 skill 目录
- 可选参数与 `install-release` 一致：`--release-base-url`、`--target-dir`、`--temp-dir`
- 更新完成后建议重启对应平台，确保新版本生效

## 发布

发布产物统一输出到 `dist/release/`，可通过下面命令生成：

```bash
npm run build:release
npm run release:prepare
```

其中：

- `npm run build:release` 会生成 release bundles 和 `install-manifest.json`
- `npm run release:prepare` 是对外发布前的统一脚本入口，默认也写入 `dist/release/`

如需给安装器写入公开地址，可在执行前设置：

```bash
ARCH_INSIGHT_RELEASE_BASE_URL="https://raw.githubusercontent.com/LienJack/arch-insight/main/dist/release" npm run release:prepare
```

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

| 场景 | Windows (PowerShell/cmd) | macOS/Linux |
| --- | --- | --- |
| 轻量上下文包 | `node scripts/build-repomix-context.mjs` | `node scripts/build-repomix-context.mjs` |
| full 上下文包 | `node scripts/build-repomix-context.mjs full` | `node scripts/build-repomix-context.mjs full` |

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
