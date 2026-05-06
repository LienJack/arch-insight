# arch-insight Runner

这份文档是 `arch-insight` 的执行手册。它把仓库统一收束成一个清晰产品契约：默认服务“单仓源码思想解读 + 多仓对照式设计参考”，重点帮助工程师从源码里学设计理念、核心抽象、主流程、设计取舍和可迁移模式。

## 一句话用法

先做“交付形态判定”（分析包 / 深度解读文章 / 源码导览），再用 `01_repo_intake.md` 定边界并记录参考来源锚点、`02_design_philosophy_brain_dump.md` 建脑图；复杂生态补 `03_ecosystem_atlas.md`；最后根据模式走 `04_architecture_report.md`（分析包）、`05_narrative_article.md`（深度解读）或 `06_repo_overview_article.md`（源码导览）。

需要上下文材料时，默认直接使用官方 `repomix`：

```bash
npx repomix@latest --help
```

如果本机已经安装了 `repomix`，下文示例里的 `npx repomix@latest` 可以直接替换成 `repomix`。

## 能力来源映射

这个 skill 显式保留四类外部来源的职责映射。维护时不要把它们混成模糊“灵感来源”，而要把每个阶段为什么存在说清楚：

| 来源能力 | 原始价值 | 在本 skill 中的位置 | 使用边界 |
| --- | --- | --- | --- |
| `repomix` 上下文打包能力 | 打包仓库、统计 token、生成 AI-friendly 上下文 | `01_repo_intake.md` 的上下文策略，必要时服务于 `02` | 只做上下文准备，不替代设计判断 |
| 分阶段脑图分析提示策略 | 分阶段浏览代码库，先整体再局部，形成系统脑图 | `02_design_philosophy_brain_dump.md` | 用来找主流程、核心抽象、设计原则和下一步深挖点 |
| 生态级扩展分析方法 | 多仓、多服务、企业级依赖流、数据流、安全和 CI/CD 视角 | `03_ecosystem_atlas.md` | 只在复杂生态里启用，不设为默认路径 |
| 叙事化架构报告方法 | `Why > What`、架构叙事、Mermaid 图、设计取舍和正式报告 | `04_architecture_report.md` 与模板体系 | 负责最终报告质量，不复制它更重的整套流程 |

拼装原则：

1. 上下文打包能力解决“怎么准备上下文”。
2. Design philosophy brain dump 解决“系统真正靠什么站起来，以及作者反复坚持什么设计原则”。
3. Ecosystem atlas 解决“什么时候需要从单仓视角升级到生态视角”。
4. Architecture report 与模板体系解决“怎么把事实写成能教会读者的正式解读”。

## 默认路径与扩展路径

### 路径 A：分析包（主报告 + 学习附件）

适用于需要结构化沉淀、后续检索复用、团队知识库归档的场景。

执行顺序：

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/04_architecture_report.md`

建议中间产物：

- `drafts/01-intake.md`
- `drafts/02-design-philosophy-brain-dump.md`

建议最终产物：

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`

### 路径 B：文章模式 - 深度解读（叙事长文）

适用于用户明确要“像技术博客/专栏那样”的成文交付，或明确要“参考别人项目做自己设计判断”，而不是模板包。

执行顺序：

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. （复杂生态可选）`references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/05_narrative_article.md`

建议产物：

- `outputs/NARRATIVE_ARTICLE.md`
- 可选：文末附”证据路径索引”

质量闸门（写作前必须通过）：

1. 是否已给出风格契约（受众、语气、密度、证据方式、禁止项）？
2. 是否先有明确论点，再组织材料（而不是从目录讲起）？
3. 是否把”设计意图 -> 机制实现 -> 代价风险”串成主线？
4. 是否显式产出可借鉴设计点，并写明适用条件、不适用场景和迁移注意事项？
5. 多仓输入时，是否形成共同模式、差异选择、适用背景和局部启发范围？
6. 是否避免模板腔与流水账？

说明：深度解读可吸收 `references/templates/BORROWABLE_PATTERNS.md` 的问题意识，但不得退化成“主报告 + 五附件”或 checklist 填空。

### 路径 C：文章模式 - 源码导览（仓库百科）

适用于用户要一份中文源码仓库导览，快速建立仓库地图和阅读路径。

执行顺序：

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. （复杂生态可选）`references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/06_repo_overview_article.md`

建议产物：

- `outputs/REPO_OVERVIEW_ARTICLE.md`
- 可选：`outputs/REPO_OVERVIEW_SOURCES.md`

质量闸门（写作前必须通过）：

1. 开篇是否让读者快速知道”这个仓库是什么、值不值得看”？
2. 是否能用结构导航和模块表 30 秒定位到目标信息？
3. 主流程是否带关键文件路径，而不是纯文字描述？
4. 关键判断是否有 Sources 索引可追溯？
5. 是否避免了长篇评论和故事化推进？
6. 结尾是否给出了明确的下一步阅读路径？

### 路径 D：大仓库 / 上下文受限

适用于仓库很大、上下文窗口有限、需要先做文件筛选或打包。

执行顺序：

1. `references/prompts/01_repo_intake.md`
2. 根据 intake 结论决定是否做上下文打包或精选文件集
3. `references/prompts/02_design_philosophy_brain_dump.md`
4. `references/prompts/04_architecture_report.md`

额外要求：

- 先识别最值得学习的主流程与抽象，再决定打包哪些文件。
- 如果要把材料交给其他模型，优先交精选文件集，而不是整仓无差别压缩。

推荐命令顺序：

```bash
# 1) 先看 token 树，确认范围（默认 o200k_base）
npx repomix@latest --token-count-tree --include "prompts/**/*,templates/**/*"

# 2) 再做范围打包（支持 stdin 精选，stdin 选择优先）
printf "README.md\nRUNNER.md\nprompts/01_repo_intake.md\n" | npx repomix@latest --stdin -o outputs/repo-context.xml

# 3) 体量大时做分片/压缩
npx repomix@latest --include "prompts/**/*,templates/**/*" --split-output 1mb --compress -o outputs/repo-context.xml
```

### 路径 E：Monorepo / 多服务 / 平台生态

执行顺序：

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/04_architecture_report.md`

建议最终产物：

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`
- 可选补充生态附件，例如依赖图、跨边界主链说明、重力中心清单

### 路径 F：知识沉淀 / Onboarding

适用于想给新同事、后续 AI session 或长期知识库复用的分析。

执行顺序：

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. 按复杂度决定是否补 `references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/04_architecture_report.md`
5. 用模板把稳定结论拆成主报告和学习附件

关键要求：

- 后续读者不需要重看聊天记录也能接着研究。
- 每个重要结论尽量带路径依据。
- 把“仍需验证”的判断留在 `drafts/`，不要混进正式产物。

## 分阶段执行

### Stage 0：交付形态判定（新增强制阶段）

目标：

- 判定本轮产物是 `分析包`、`文章模式 - 深度解读` 还是 `文章模式 - 源码导览`。
- 若有样例，提炼风格契约（受众、语气、密度、证据呈现、禁止项）；overview/仓库导览风格样例默认导向源码导览模式。
- 源码导览模式关注事实密度、结构可扫描性、源码证据和阅读导航；深度解读模式关注观点推进、设计取舍和批判性判断。

停止条件：

- 已确定模式并写明理由。
- 已明确“本轮不做的交付形态”（例如：本轮不拆 6 份模板附件）。

### Step 1：Intake

使用 `references/prompts/01_repo_intake.md`。

目标：

- 判定研究对象、项目类型和分析边界。
- 记录每个参考来源（本地路径 / GitHub URL / `owner/repo`）及版本锚点（branch/tag/commit）。
- 远程来源默认按 `Remote First -> Auto Fallback -> Minimal Clone Fallback` 执行，并在 intake 记录远端采集状态：`remote attempted` / `remote succeeded` / `fallback triggered` / `blocked`。
- 版本锚点要写清来源：用户指定、仓库默认主分支、tag、commit 或未能确认。
- 找到最值得先读的 3 到 5 个入口。
- 判断默认走 `01 -> 02 -> 04` 还是升级到 `01 -> 02 -> 03 -> 04`。
- 判断是否需要上下文打包、文件筛选、子系统切片。
- 对大型远程仓库先产出范围策略，再决定 include / ignore / `--compress` / `--split-output`。

停止条件：

- 能说清本轮范围和暂缓范围。
- 能说清项目类型及判断依据。
- 能说清每个来源的版本锚点与访问限制（若缺失需显式写明）。
- 能说清远端链路是否成功、是否触发 fallback、触发原因、回退后范围与剩余边界。
- 已知道后续分析路径。

### Step 2：Design Philosophy Brain Dump

使用 `references/prompts/02_design_philosophy_brain_dump.md`。

目标：

- 找到最能体现系统哲学的主流程。
- 找到真正决定系统形状的核心抽象和骨架模块。
- 区分核心骨架、适配层、工具层和噪音层。
- 形成 2 到 5 条可验证的设计取舍或设计原则假设。

停止条件：

- 已形成可靠的系统脑图。
- 能分清系统主线和局部复杂度。
- 能解释“作者为什么要这样设计”，而不只是“代码怎么组织”。

### Step 3：Ecosystem Atlas

只有复杂生态才使用 `references/prompts/03_ecosystem_atlas.md`。

目标：

- 找关键实体、依赖关系、数据流、调用流和部署边界。
- 识别权限边界、安全边界、数据所有权和团队边界。
- 找生态重力中心、系统级耦合点和演进风险。

停止条件：

- 知道生态真正的关键单元是什么。
- 知道复杂度集中在哪里。
- 知道未来最可能先从哪里出问题。

### Step 4：Architecture Report

仅 `分析包模式` 使用 `references/prompts/04_architecture_report.md`。

目标：

- 把前面阶段的事实和判断收束成正式源码解读报告。
- 写清项目定位、整体架构、核心模块、关键流程、设计取舍、风险与总体评价。
- 让读者看完后能带走可复用的学习资产，而不是只带走一份总结。

停止条件：

- 讲清系统解决的问题。
- 讲清至少一条主流程。
- 识别真正的核心抽象与核心模块。
- 展开至少 2 个具体设计取舍。
- 给出至少 1 组诚实风险判断。

### Step 5：Narrative Article（深度解读）

仅 `文章模式 - 深度解读` 使用 `references/prompts/05_narrative_article.md`。

目标：

- 交付一篇可直接阅读/发布的叙事化技术长文。
- 保留代码证据与路径依据，但不采用模板拆分文档形态。
- 主线必须是：问题定义 -> 架构意图 -> 关键机制 -> 设计取舍 -> 风险判断 -> 总体评价。

停止条件：

- 开头 3 段内讲清“为什么值得读”。
- 至少 1 条主流程被讲透，且有证据路径支撑。
- 至少 2 处取舍有“收益 + 代价 + 边界”。
- 明确 1 条批判性判断，不只赞美。

### Step 6：Repo Overview Article（源码导览）

仅 `文章模式 - 源码导览` 使用 `references/prompts/06_repo_overview_article.md`。

目标：

- 交付一篇中文源码仓库导览，帮助读者快速建立仓库地图。
- 优先服务可扫描性：项目定位、结构导航、关键模块表、主流程、Sources 索引和下一步阅读路径。
- 降低主观评论密度，判断服务导览而非成为文章主线。

停止条件：

- 开篇讲清项目定位与核心价值。
- 能用结构导航和模块表快速定位关键信息。
- 主流程带关键文件路径，不只是文字描述。
- 关键判断有 Sources 索引可追溯。
- 结尾给出明确的下一步阅读路径。

## 输出契约

目标不是把分析越写越多，而是按所选模式输出正确形态。

### drafts/

适合放：

- 范围界定
- 系统脑图
- 模块候选
- 设计原则假设
- 疑点和待验证判断

推荐最小文件：

- `drafts/01-intake.md`
- `drafts/02-design-philosophy-brain-dump.md`
- 复杂生态补 `drafts/03-ecosystem-overview.md`

### outputs/（分析包模式）

推荐文件：

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`

### outputs/（文章模式 - 深度解读）

- `outputs/NARRATIVE_ARTICLE.md`
- 可选：`outputs/NARRATIVE_EVIDENCE_INDEX.md`

### outputs/（文章模式 - 源码导览）

- `outputs/REPO_OVERVIEW_ARTICLE.md`
- 可选：`outputs/REPO_OVERVIEW_SOURCES.md`

如果只是一次窄范围聊天分析，可以省略文件产物，但最终回答仍应包含范围说明、主流程摘要、核心抽象、设计取舍和风险判断。

## 模板速记

需要落文档时，优先使用 `references/templates/` 里的真实模板文件，而不是再临时发明第二套结构：

- `references/templates/ARCHITECTURE_REPORT.md`
- `references/templates/DESIGN_PHILOSOPHY.md`
- `references/templates/CORE_ABSTRACTIONS.md`
- `references/templates/MAIN_FLOW.md`
- `references/templates/TRADEOFFS.md`
- `references/templates/BORROWABLE_PATTERNS.md`

这些模板分别回答不同问题：

- 主报告解释系统整体与总体判断
- Design philosophy 解释作者反复坚持什么原则
- Core abstractions 解释系统自己的“语言”是什么
- Main flow 解释哪条链路最能暴露架构意图
- Tradeoffs 解释收益、代价和替代方案
- Borrowable patterns 解释其他团队真正能借走什么

不要把它们写成同一份长报告的不同抄写版本。

文章模式 - 深度解读 使用：

- `references/templates/NARRATIVE_ARTICLE.md`

不要把文章模式强行拆回 6 份模板附件。

文章模式 - 源码导览 使用：

- `references/templates/REPO_OVERVIEW_ARTICLE.md`

不要把源码导览写成叙事化深度评论长文。

## 示例质量锚点

`examples/sample-analysis.md` 用一个紧凑示例展示目标语气、结构和判断力度。它不是唯一答案模板，但应帮助维护者快速判断：

- 这份分析有没有讲清 `Why > What`
- 主流程是否真的体现了系统哲学
- 设计取舍有没有写出代价
- 学习附件之间是否职责清晰

## 文章模式回归检查清单

此清单用于手动验证两种文章模式不会互相漂移。每次修改文章相关 prompt / template / 路由规则后，对照检查：

### 深度解读 vs 源码导览 区分检查

| 维度 | 深度解读（通过条件） | 源码导览（通过条件） |
| --- | --- | --- |
| 开篇 | 3 段内讲清"为什么值得读"，给出观点 | 3 段内讲清项目定位与核心价值，不展开评论 |
| 结构可扫描性 | 章节推进自然，允许连续段落叙事 | 有明显的信息层级（表格/分层列表/短段落），30 秒可定位到目标信息 |
| 主观评论密度 | 高：有观点推进、设计取舍分析、批判性判断 | 低：判断仅服务导览理解，主线不走评论推进 |
| 证据呈现 | 关键判断附代码路径，分散在文中 | 关键判断附代码路径，且有集中的 Sources 索引 |
| 结尾 | 给出总体评价（有判断力的一句话） | 给出下一步阅读路径（具体文件/文档/测试） |

### 源码导览典型失败模式

以下症状表示源码导览退化成了深度解读：

- 开篇连续 5+ 段观点推进后才出现仓库结构信息
- 缺少模块表或分层结构导航，以连续散文段落为主
- 大量"令人惊叹""非常巧妙""设计精良"等评价性语言
- 没有集中的 Sources 索引或证据路径
- 结尾是总体评价而非下一步阅读路径

以下症状表示源码导览过于空洞：

- 只有目录复述，没有关键模块的设计意图说明
- 主流程缺少关键文件路径
- 所有判断都标注为"推断"而没有任何源码依据

### 对比参考

`docs/test/compound-engineering-工作流如何提升-llm-编码质量-深度解读.md` 是当前深度解读模式的输出样例，可作为源码导览不应长成什么样的对比参照。

文章模式的示例产出（深度解读、源码导览各一）属于后续跟进工作，当前 `examples/sample-analysis.md` 仅覆盖分析包模式。

## 参考来源与版本锚点检查

每次涉及远程仓库输入时，手动确认：

1. Intake 是否记录来源类型（本地 / URL / `owner/repo`）与版本锚点（branch/tag/commit）。
2. Intake 是否记录远端采集状态：`remote attempted` / `remote succeeded` / `fallback triggered` / `blocked`。
3. 是否明确了访问限制（公开可读、权限不足、网络受限），并区分“远端链路失败可回退”与“仓库读权限不可用需阻塞”。
4. 多仓输入是否逐仓记录启发范围（主参考 / 对照参考 / 边界案例）。
5. 深度解读正文是否把来源与锚点纳入分析对象说明，而不是省略为“某开源仓库”。

## 上下文打包使用原则

上下文打包工具是上下文准备工具，不是分析工具。

适合使用：

- 仓库很大，直接阅读成本高。
- 需要把精选材料交给上下文较弱的模型。
- 需要离线沉淀一份 AI-friendly 材料。

不建议一开始就用：

- 仓库不大，直接 `rg`、`ls`、`sed` 更快。
- 还没识别核心入口和主流程。
- 真正需要的是设计判断，而不是上下文搬运。

正确顺序：

1. 先 intake。
2. 判断最值得学习的入口和主流程。
3. 再决定是否做上下文打包、筛哪些文件、是否压缩。

远程仓库补充：

- URL 或 shorthand 输入默认先走 `--remote`（Remote First），不是先 clone。
- branch/tag/commit 默认用 `--remote-branch` 记录版本锚点；缺省时以仓库默认主分支或用户语境明确分支为锚点并注明来源。
- 远端失败（打包失败、远端鉴权失败、归档下载失败且无法恢复）且仓库仍可读时，自动回退到最小化 clone。
- 远端成功但证据不足（关键文件缺失、token/打包约束导致核心片段缺失、无法建立源码路径到结论证据链）时，自动回退到最小化 clone。
- 仓库读权限本身不可用时，必须标记 `blocked`，不得承诺 clone 可恢复。
- 回退默认采用浅克隆与关键路径优先，按证据缺口逐步扩范围，不进入完整历史审计。

`repomix` 参数要点（当前默认路径）：

- `--include` / `--ignore`：控制文件范围
- `--stdin`：从标准输入读取文件列表，直接处理这些文件
- `--token-count-tree`：仅输出 token 分布，不产出打包文件
- `--split-output <size>`：按体量切分为多个编号输出文件
- `--compress`：提取更适合分析的代码结构，而不是输出 gzip 文件
- `-o` / `--output`：指定输出路径；默认文件名是 `repomix-output.xml`
- `--token-count-encoding <encoding>`：默认是 `o200k_base`，只有需要兼容其他 tokenizer 时再显式覆盖

## 维护规则

1. 不再新增或恢复第二套重叠的仓库研究 skill，也不要重新引入本地打包 CLI 主路径。
2. 任何路径、模板和产物调整，统一改这里和 `references/prompts/`、`references/templates/`。
3. 若需要兼容旧名称或旧产物名，必须显式标注为历史兼容，不要让它继续充当默认故事。
