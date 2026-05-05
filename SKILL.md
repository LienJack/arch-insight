---
name: arch-insight
description: "当用户要系统性研究单个代码仓库，提炼设计理念、核心抽象、主流程、设计取舍和可借鉴模式时使用。"
---

# arch-insight

面向“单仓源码思想解读”的分析 skill。它把 `repomix` 上下文准备、分阶段脑图探索、生态级扩展视角与叙事化架构报告风格收束成一条更适合团队工程师复用的研究路径。默认中文输出，除非用户明确要求其他语言。

## 先做交付形态判定（强制）

在任何分析开始前，先判定用户要的是哪种交付，不得跳过：

1. `分析包模式`（主报告 + 5 附件）
2. `文章模式 - 深度解读`（单篇叙事长文、有观点、可直接发布）
3. `文章模式 - 源码导览`（中文仓库百科、事实密集、结构可扫描）

判定规则：

- 用户提到”像某篇文章那样””博客风格””可发布长文””观点文章””不要模板包”，默认走 `文章模式 - 深度解读`。
- 用户提到”overview””仓库导览””源码地图””仓库百科”，或提供了源码导览风格样例链接，走 `文章模式 - 源码导览`。
- 用户明确提到”主报告 + 附件””模板产物””拆分文档”，走 `分析包模式`。
- 未明确时，先按用户话术做最小推断，不要默认回落到分析包。

## 风格对齐闸门（强制）

若用户提供风格样例（链接、标题、截图、段落），在写正文前先形成 `风格契约`：

- 文章受众是谁（工程师/架构师/团队）
- 语气（克制、批判、教学、故事化 / 导览式、事实优先）
- 结构密度（章节粒度、图文比例、是否保留表格）
- 证据呈现方式（文内路径引用、脚注、附录 / 源码路径标注、Sources 小节）
- 禁止项（模板腔、流水账、目录复述 / 长评论弧线、无证据判断、英文输出）

如果风格契约与默认模板冲突，以风格契约优先。

针对源码导览模式，默认风格契约方向应偏向：事实密集、结构可扫描（表格/分层树）、源码路径证据、下一步阅读导航，而不是故事化长评论。

## 什么时候使用

- 用户要研究一个仓库为什么这样设计，而不只是看代码怎么写。
- 用户要从开源项目或内部项目里提炼可借鉴的抽象、模式、主流程和取舍。
- 用户要做源码 onboarding、设计复盘、学习型架构解读或正式分析报告。
- 用户要一份中文源码导览/仓库百科，快速建立仓库地图和阅读路径。

不适合：

- 单文件解释、普通报错排查、代码 review、简单函数讲解。
- 默认就做多仓生态咨询；那是高级扩展，不是主路径。

## 最短路径

先读 `RUNNER.md`，再按交付模式选择路径：

### A. 分析包模式（默认技术研究路径）

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. `prompts/04_architecture_report.md`

如果 intake 判断这是 monorepo、多服务或平台生态，再补：

4. `prompts/03_ecosystem_atlas.md`

### B. 文章模式 - 深度解读（叙事长文路径）

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. `prompts/05_narrative_article.md`

若是复杂生态，再在 2 和 3 之间补：

4. `prompts/03_ecosystem_atlas.md`

### C. 文章模式 - 源码导览（中文仓库百科路径）

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. `prompts/06_repo_overview_article.md`

若是复杂生态，再在 2 和 3 之间补：

4. `prompts/03_ecosystem_atlas.md`

## 你最终要交付什么

`分析包模式` 的默认产物是：

- 一份主报告：`templates/ARCHITECTURE_REPORT.md`
- 一组学习附件：
  - `templates/DESIGN_PHILOSOPHY.md`
  - `templates/CORE_ABSTRACTIONS.md`
  - `templates/MAIN_FLOW.md`
  - `templates/TRADEOFFS.md`
  - `templates/BORROWABLE_PATTERNS.md`

`文章模式 - 深度解读` 的默认产物是：

- 一篇单文：`templates/NARRATIVE_ARTICLE.md`
- 可选附录：证据路径清单（非必拆分）

`文章模式 - 源码导览` 的默认产物是：

- 一篇单文：`templates/REPO_OVERVIEW_ARTICLE.md`
- 可选附录：Sources 与证据路径索引（非必拆分）

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
- 先判定交付形态，再开始组织材料；不要先产模板包再“二次改写”成长文。
- 仓库很大时，先做 intake 和文件筛选，再决定是否需要上下文打包。
- 使用 `repomix` 时优先走“小步筛选”：
  1. 先查看 token 分布树：`npx repomix@latest --token-count-tree ...`
  2. 用 include / ignore 或 stdin 精选文件：`--include` / `--ignore` / `--stdin`
  3. 再决定是否压缩或拆分输出：`--compress` / `--split-output`
- 不要默认使用 subagent；只有用户明确要求时才委派。
- 输出时使用真实路径、真实抽象名、真实调用关系，避免空泛判断。
