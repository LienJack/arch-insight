# arch-insight

## 给用户一键安装到 Codex

用户在终端执行下面这条命令即可安装到 `~/.codex/skills/arch-insight`：

```bash
curl -fsSL https://raw.githubusercontent.com/LienJack/arch-insight/main/scripts/install-codex-skill.sh | bash
```

安装完成后重启 Codex。

`arch-insight` 是一个面向团队工程师的源码研究 skill，用来把“看一个仓库”收束成“学到它为什么这样设计、哪些抽象值得借鉴、主流程如何体现作者意图、这些选择付出了什么代价”。

它默认服务单仓源码思想解读，而不是默认做泛化架构咨询。仓库里保留了生态级扩展能力，但只有在 monorepo、多服务或平台工程场景下才进入那条路径。

## 默认路径

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. 可选 `prompts/03_ecosystem_atlas.md`
4. `prompts/04_architecture_report.md`

这四步分别对应四种职责：

- 上下文打包能力负责上下文准备
- 分阶段脑图分析 prompt 负责第一轮系统脑图与设计理念提炼
- 生态级扩展分析 prompt 负责可选的生态级扩展视角
- 叙事化架构报告 prompt 负责最终报告的叙事质量、Mermaid 图和设计取舍分析

## 默认产物

这套 skill 的默认交付物是“主报告 + 学习附件”，而不是一份泛化大报告：

- `templates/ARCHITECTURE_REPORT.md`
- `templates/DESIGN_PHILOSOPHY.md`
- `templates/CORE_ABSTRACTIONS.md`
- `templates/MAIN_FLOW.md`
- `templates/TRADEOFFS.md`
- `templates/BORROWABLE_PATTERNS.md`

可以先看 `examples/sample-analysis.md`，那里展示了目标语气、结构和附件之间的关系。

## 适用场景

- 研究开源项目为什么这样设计
- 给团队做源码 onboarding 或内部知识沉淀
- 提炼一个仓库里最值得学习的抽象、边界和模式
- 形成带判断力的正式源码解读报告

不适合：

- 单文件解释
- 普通 bug 排查
- 日常代码 review
- 默认就做多仓企业生态尽调

## 入口文件

- `SKILL.md`：什么时候使用这个 skill，以及最短路径
- `RUNNER.md`：完整执行手册、路径选择和输出契约
- `prompts/`：分阶段 prompt
- `templates/`：主报告与学习附件模板
- `examples/sample-analysis.md`：目标质量示例

## `context-pack` CLI（上下文打包能力）

仓库内置一等命令入口 `context-pack`，用于本地仓库上下文打包与范围控制。

快速开始：

```bash
npm --prefix tools/context-pack install
node tools/context-pack/bin/context-pack.js --help
```

常用命令：

```bash
# 先看 token 分布（默认 cl100k_base）
node tools/context-pack/bin/context-pack.js --token-count-tree --include "prompts/**/*,templates/**/*"

# 使用 stdin 精选文件（stdin 选择优先）
printf "README.md\nRUNNER.md\nprompts/01_repo_intake.md\n" | node tools/context-pack/bin/context-pack.js --stdin --output outputs/context-pack.md

# 打包并分片 + 压缩
node tools/context-pack/bin/context-pack.js --include "prompts/**/*,templates/**/*" --split 120000 --compress --output outputs/context-pack.md
```
