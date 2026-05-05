---
name: arch-insight
description: "当用户要系统性研究单个代码仓库，提炼设计理念、核心抽象、主流程、设计取舍和可借鉴模式时使用。"
---

# arch-insight

面向“单仓源码思想解读”的分析 skill。它把上下文打包能力、分阶段脑图探索、生态级扩展视角与叙事化架构报告风格收束成一条更适合团队工程师复用的研究路径。默认中文输出，除非用户明确要求其他语言。

## 什么时候使用

- 用户要研究一个仓库为什么这样设计，而不只是看代码怎么写。
- 用户要从开源项目或内部项目里提炼可借鉴的抽象、模式、主流程和取舍。
- 用户要做源码 onboarding、设计复盘、学习型架构解读或正式分析报告。

不适合：

- 单文件解释、普通报错排查、代码 review、简单函数讲解。
- 默认就做多仓生态咨询；那是高级扩展，不是主路径。

## 最短路径

先读 `RUNNER.md`，再按默认单仓路径推进：

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. `prompts/04_architecture_report.md`

如果 intake 判断这是 monorepo、多服务或平台生态，再补：

4. `prompts/03_ecosystem_atlas.md`

## 你最终要交付什么

默认产物不是“一个宽泛的架构分析包”，而是：

- 一份主报告：`templates/ARCHITECTURE_REPORT.md`
- 一组学习附件：
  - `templates/DESIGN_PHILOSOPHY.md`
  - `templates/CORE_ABSTRACTIONS.md`
  - `templates/MAIN_FLOW.md`
  - `templates/TRADEOFFS.md`
  - `templates/BORROWABLE_PATTERNS.md`

## 核心原则

1. 先理解作者在解决什么问题，再解释代码怎么组织。
2. 先找最能体现系统哲学的主流程，再看目录树。
3. 先识别核心抽象和边界，再讨论实现细节。
4. 每个重要判断尽量给代码路径依据。
5. 每个设计结论都尽量回答收益、代价、替代方案和边界。
6. 把上下文打包工具当成上下文准备手段，不是分析替代品。
7. 报告要教会读者一些东西，而不是把 README 改写得更长。

## Codex 使用建议

- 优先用 `rg`、`ls`、`sed`、精读关键文件来建立事实。
- 仓库很大时，先做 intake 和文件筛选，再决定是否需要上下文打包。
- 使用上下文打包工具时优先走“小步筛选”：
  1. 先查看 token 分布树：`node tools/context-pack/bin/context-pack.js --token-count-tree ...`
  2. 用 include / ignore 或 stdin 精选文件：`--include` / `--ignore` / `--stdin`
  3. 再决定是否压缩或拆分输出：`--compress` / `--split`
- 不要默认使用 subagent；只有用户明确要求时才委派。
- 输出时使用真实路径、真实抽象名、真实调用关系，避免空泛判断。
