# Narrative Design Reference Regression Checklist

> 用途：手动回归“文章模式 - 深度解读”在设计参考增强后，是否仍与“文章模式 - 源码导览”保持边界清晰。
> 适用版本：2026-05-05 之后的 `arch-insight` 主线文档。

## 使用方式

1. 每次修改以下任一文件后执行本清单：`.agents/skills/arch-insight/SKILL.md`、`README.md`、`.agents/skills/arch-insight/references/RUNNER.md`、`.agents/skills/arch-insight/references/prompts/01_repo_intake.md`、`.agents/skills/arch-insight/references/prompts/05_narrative_article.md`、`.agents/skills/arch-insight/references/templates/NARRATIVE_ARTICLE.md`。
2. 对每个场景逐项核对，标记 `PASS / FAIL / BLOCKED`。
3. 若出现 `FAIL`，先修正文档契约，再继续功能扩展。

## 场景 1：设计学习请求路由（AE1）

输入示例：

- “我想学习这个项目怎么做架构设计，尤其想知道哪些模式值得借鉴。”

检查项：

- `.agents/skills/arch-insight/SKILL.md` 是否把该请求路由到“文章模式 - 深度解读”。
- `.agents/skills/arch-insight/references/RUNNER.md` 路径 B 是否强调“设计参考与迁移判断”，而非仓库导览。
- `.agents/skills/arch-insight/references/prompts/05_narrative_article.md` 是否要求可借鉴点 + 适用边界 + 不建议照搬场景。

预期：三项全部 `PASS`。

## 场景 2：主流程与证据支撑设计判断（AE2）

输入示例：

- “解释它为什么这样设计，不要只讲目录结构。”

检查项：

- `.agents/skills/arch-insight/references/prompts/05_narrative_article.md` 质量闸门是否要求至少讲透一条主流程。
- `.agents/skills/arch-insight/references/templates/NARRATIVE_ARTICLE.md` 是否要求关键机制与设计点附源码路径证据。
- 深度解读模板是否仍是单篇文章结构，不是附件拆分。

预期：三项全部 `PASS`。

## 场景 3：收益、代价与不建议照搬边界（AE3）

输入示例：

- “告诉我哪些能学，但也要说清楚哪些场景别照搬。”

检查项：

- `.agents/skills/arch-insight/references/prompts/05_narrative_article.md` 是否要求至少 1 个批判性判断。
- `.agents/skills/arch-insight/references/templates/NARRATIVE_ARTICLE.md` 的“设计参考与迁移判断”是否包含“不建议照搬”与“迁移验证”字段。
- `.agents/skills/arch-insight/references/RUNNER.md` 路径 B 闸门是否覆盖迁移边界要求。

预期：三项全部 `PASS`。

## 场景 4：多仓对照不是摘要拼接（AE4）

输入示例：

- “比较 repoA 和 repoB 的设计差异，告诉我对我们项目的启发。”

检查项：

- `.agents/skills/arch-insight/SKILL.md` / `README.md` 是否把多仓默认目标定义为“对照式设计参考”。
- `.agents/skills/arch-insight/references/prompts/01_repo_intake.md` 是否要求逐仓记录来源、版本锚点和启发范围。
- `.agents/skills/arch-insight/references/prompts/05_narrative_article.md` 是否要求输出共同模式、差异选择、适用背景、局部启发范围。

预期：三项全部 `PASS`。

## 场景 5：GitHub URL 来源与版本锚点记录（AE5）

输入示例：

- “参考 https://github.com/org/repo 的 v1.2.0 标签分析设计。”

检查项：

- `.agents/skills/arch-insight/references/prompts/01_repo_intake.md` 是否支持 URL / `owner/repo` / branch/tag/commit 记录。
- `.agents/skills/arch-insight/references/RUNNER.md` 是否写明 `--remote` 与 `--remote-branch` 的语义。
- 模板头部是否留有来源与版本锚点位置。

预期：三项全部 `PASS`。

## 场景 6：大仓先做范围判断（AE6）

输入示例：

- “分析这个很大的线上仓库，先别全量跑。”

检查项：

- `.agents/skills/arch-insight/references/prompts/01_repo_intake.md` 是否要求必看区 / 略读区 / 暂缓区。
- `.agents/skills/arch-insight/references/prompts/01_repo_intake.md` 是否要求先范围策略再 include/ignore/压缩/分片。
- `.agents/skills/arch-insight/references/RUNNER.md` 路径 D 是否保留“先识别主流程再打包”。

预期：三项全部 `PASS`。

## 场景 7：深度解读保持单篇文章形态（AE7）

检查项：

- `.agents/skills/arch-insight/references/prompts/05_narrative_article.md` 明确禁止“主报告 + 五附件”。
- `.agents/skills/arch-insight/references/templates/NARRATIVE_ARTICLE.md` 没有拆分为附件式章节。
- `.agents/skills/arch-insight/references/RUNNER.md` 明确“可借鉴模式意识可吸收，但不拆回附件”。

预期：三项全部 `PASS`。

## 场景 8：源码导览边界保留（AE8）

输入示例：

- “给我一个源码导览 overview，先让我快速知道目录和关键文件。”

检查项：

- `.agents/skills/arch-insight/SKILL.md` 是否仍保留“文章模式 - 源码导览”独立入口。
- `.agents/skills/arch-insight/references/prompts/06_repo_overview_article.md` 是否继续要求结构导航、关键模块表、Sources 索引、下一步阅读路径。
- `.agents/skills/arch-insight/references/RUNNER.md` 文章模式回归检查清单是否仍保留深度解读 vs 源码导览差异维度。

预期：三项全部 `PASS`。

## 失败处理规则

- 若路由文件、prompt、template 三者描述不一致：按“路由优先 + prompt 约束 + template 承接”顺序修复到一致。
- 若新增条目模糊了深度解读与源码导览边界：优先保留源码导览的“轻评论、强导航”职责。
- 若远程来源条款超出当前能力：退回到“公开仓库 + 来源锚点记录 + 访问限制显式标注”的基线。
