# arch-insight 目标契约

## 目标

`arch-insight` 是面向团队工程师的源码研究 skill，把“看一个或多个参考仓库”收束成“学到它为什么这样设计、哪些抽象值得借鉴、适用条件是什么、哪里不该照搬、迁移时要警惕什么”。

默认服务“单仓源码思想解读 + 多仓对照式设计参考”。保留生态级扩展能力，但仅在 monorepo、多服务或平台工程场景下激活。

---

## 范围

### 覆盖

- 为单仓源码提供分阶段分析流程：从上下文准备到叙事化架构报告
- 支持一个或多个参考仓库输入（本地、GitHub URL、`owner/repo` shorthand）
- 定义每个阶段的输入、输出和验收条件（DoD）
- 将四段能力映射到 `prompts/` 与 `templates/` 的输入输出契约
- 支持默认单仓路径的连续交付
- 支持多仓对照式设计参考（共同模式、差异取舍、适用背景、局部启发范围）
- 支持生态扩展路径的条件触发与增量产物

### 不覆盖（Non-Goals）

- 不做泛化架构咨询或任意代码分析任务；默认不做生态级企业尽调
- 不替代单文件解释、bug 排查、日常代码 review
- 不提供里程碑排期、执行计划拆分与任务分配
- 不定义 `prompts/` 与 `templates/` 的内部内容，只定义映射关系与责任
- 不引入并行治理文档或额外流程定义

---

## 四段能力契约

### 阶段 1：上下文准备与范围筛选

- **输入：** 一个或多个参考仓库来源（本地路径 / GitHub URL / `owner/repo`）、可选版本锚点（branch/tag/commit）、include/ignore 规则、可选 stdin 文件列表、token 预算
- **输出：** 分析范围界定、项目类型判断、参考来源与版本锚点记录、后续路径选择结论
- **验收条件：**
  - 能说清本轮分析范围和暂缓范围
  - 能说清项目类型及判断依据
  - 已记录每个参考来源及版本锚点（若缺失则标注未知）
  - 已确定后续分析路径（默认路径或生态扩展路径）
- **未完成判定：** 若仅描述了“做了 intake 步骤”但无法回答范围、类型、路径或来源锚点中的关键项，该阶段判定为未完成
- **对应 Prompt：** `prompts/01_repo_intake.md`

### 阶段 2：分阶段脑图分析

- **输入：** 阶段 1 产出的范围界定与路径选择
- **输出：** 系统脑图、核心抽象与骨架模块、设计原则假设、主流程识别
- **验收条件：**
  - 已形成可靠的系统脑图
  - 能分清系统主线和局部复杂度
  - 能解释"作者为什么要这样设计"，而不只是"代码怎么组织"
  - 已识别 2–5 条可验证的设计取舍或设计原则假设
- **未完成判定：** 若仅列出了模块清单但无法解释设计意图或区分主线与噪音，该阶段判定为未完成
- **对应 Prompt：** `prompts/02_design_philosophy_brain_dump.md`

### 阶段 3：生态级扩展视角

- **输入：** 阶段 2 产出的系统脑图与核心抽象
- **输出：** 依赖关系图、数据流与调用流、部署与安全边界、生态重力中心与演进风险
- **验收条件：**
  - 知道生态真正的关键单元是什么
  - 知道复杂度集中在哪里
  - 知道未来最可能先从哪里出问题
- **未完成判定：** 若仅列出了服务清单但无法识别关键单元、复杂度集中点或演进风险，该阶段判定为未完成
- **对应 Prompt：** `prompts/03_ecosystem_atlas.md`
- **激活条件：** 仅在 monorepo、多 package、多服务、平台工程、跨仓依赖、部署链路、安全边界或数据流分析场景下启用，不设为默认路径

### 阶段 4：叙事化架构报告

- **输入：** 已完成的前置阶段全部稳定结论
- **输出：** 主报告与学习附件（Why > What、Mermaid 图、设计取舍）
- **验收条件：**
  - 讲清系统解决的问题
  - 讲清至少一条主流程
  - 识别真正的核心抽象与核心模块
  - 展开至少 2 个具体设计取舍
  - 给出至少 1 组诚实风险判断
- **未完成判定：** 若报告只做了模块罗列但缺少设计取舍、风险判断或主流程叙事，该阶段判定为未完成
- **对应 Prompt：** `prompts/04_architecture_report.md`

---

## 执行路径映射

### 默认路径（单仓源码思想解读）

适用于一个普通仓库、库、SDK、CLI、Web 应用或框架。

执行顺序与产物映射：

| 步骤 | Prompt | 中间产物 | 最终产物（templates） |
| --- | --- | --- | --- |
| 1 | `prompts/01_repo_intake.md` | `drafts/01-intake.md` | — |
| 2 | `prompts/02_design_philosophy_brain_dump.md` | `drafts/02-design-philosophy-brain-dump.md` | — |
| 3 | `prompts/04_architecture_report.md` | — | `outputs/ARCHITECTURE_REPORT.md`、`outputs/DESIGN_PHILOSOPHY.md`、`outputs/CORE_ABSTRACTIONS.md`、`outputs/MAIN_FLOW.md`、`outputs/TRADEOFFS.md`、`outputs/BORROWABLE_PATTERNS.md` |

### 多仓对照式设计参考路径

适用于两个或以上参考仓库，目标是形成“可借鉴设计判断”，而不是默认做生态级尽调。

执行顺序与产物映射：

| 步骤 | Prompt | 中间产物 | 最终产物（templates） |
| --- | --- | --- | --- |
| 1 | `prompts/01_repo_intake.md` | `drafts/01-intake.md`（需记录每个仓库来源、版本锚点、启发范围） | — |
| 2 | `prompts/02_design_philosophy_brain_dump.md` | `drafts/02-design-philosophy-brain-dump.md`（按仓库分别建模） | — |
| 3 | `prompts/05_narrative_article.md` | — | `outputs/NARRATIVE_ARTICLE.md`（单篇对照式深度解读） |

### 生态扩展路径

**触发条件：** 当阶段 1 判定研究对象为 monorepo、多 package、多服务、平台工程、跨仓依赖、部署链路、安全边界或数据流分析场景时激活。

**增量步骤与产物：**

| 步骤 | Prompt | 增量中间产物 | 增量最终产物 |
| --- | --- | --- | --- |
| 2a | `prompts/03_ecosystem_atlas.md` | `drafts/03-ecosystem-atlas.md` | 可选生态附件（依赖图、跨边界主链说明、重力中心清单） |

执行顺序：`01 → 02 → 03 → 04`（在阶段 2 与阶段 4 之间插入阶段 3）。

---

## 产物职责

| 模板 | 回答的问题 |
| --- | --- |
| `templates/ARCHITECTURE_REPORT.md` | 系统整体与总体判断 |
| `templates/DESIGN_PHILOSOPHY.md` | 作者反复坚持什么原则 |
| `templates/CORE_ABSTRACTIONS.md` | 系统自己的"语言"是什么 |
| `templates/MAIN_FLOW.md` | 哪条链路最能暴露架构意图 |
| `templates/TRADEOFFS.md` | 收益、代价和替代方案 |
| `templates/BORROWABLE_PATTERNS.md` | 其他团队真正能借走什么 |

---

## 执行备注

- 目标不是把分析越写越多，而是把稳定结论沉淀成"主报告 + 学习附件"。
- 仍需验证的判断留在 `drafts/`，不要混进正式产物。
- 窄范围聊天分析可省略文件产物，但最终回答仍应包含范围说明、主流程摘要、核心抽象、设计取舍和风险判断。
- `repomix` 是默认的上下文准备工具，不是分析工具；正确顺序是先 intake 再决定是否打包。`repomix` 产出（如 `outputs/repo-context.xml`）是辅助性中间文件，不属于本契约定义的主报告与学习附件体系
- `RUNNER.md` 在本契约的默认路径与生态扩展路径基础上，细化了面向大仓库/上下文受限场景与知识沉淀/Onboarding 场景的操作变体；这些变体不引入新的能力阶段，仅调整执行策略。
