# arch-insight Runner

这份文档是 `arch-insight` 的执行手册。它把仓库统一收束成一个清晰产品契约：默认服务单仓源码思想解读，重点帮助工程师从源码里学设计理念、核心抽象、主流程、设计取舍和可迁移模式。

## 一句话用法

先用 `01_repo_intake.md` 定边界，再用 `02_design_philosophy_brain_dump.md` 建立系统脑图并提炼作者意图；如果是 monorepo、多服务或平台生态，再补 `03_ecosystem_atlas.md`；最后用 `04_architecture_report.md` 收束成主报告和学习附件。

需要上下文材料时，直接使用内置 CLI：

```bash
node bin/context-pack.js --help
```

## 能力来源映射

这个 skill 显式保留四类外部来源的职责映射。维护时不要把它们混成模糊“灵感来源”，而要把每个阶段为什么存在说清楚：

| 来源能力 | 原始价值 | 在本 skill 中的位置 | 使用边界 |
| --- | --- | --- | --- |
| 上下文打包能力 | 打包仓库、统计 token、生成 AI-friendly 上下文 | `01_repo_intake.md` 的上下文策略，必要时服务于 `02` | 只做上下文准备，不替代设计判断 |
| 分阶段脑图分析提示策略 | 分阶段浏览代码库，先整体再局部，形成系统脑图 | `02_design_philosophy_brain_dump.md` | 用来找主流程、核心抽象、设计原则和下一步深挖点 |
| 生态级扩展分析方法 | 多仓、多服务、企业级依赖流、数据流、安全和 CI/CD 视角 | `03_ecosystem_atlas.md` | 只在复杂生态里启用，不设为默认路径 |
| 叙事化架构报告方法 | `Why > What`、架构叙事、Mermaid 图、设计取舍和正式报告 | `04_architecture_report.md` 与模板体系 | 负责最终报告质量，不复制它更重的整套流程 |

拼装原则：

1. 上下文打包能力解决“怎么准备上下文”。
2. Design philosophy brain dump 解决“系统真正靠什么站起来，以及作者反复坚持什么设计原则”。
3. Ecosystem atlas 解决“什么时候需要从单仓视角升级到生态视角”。
4. Architecture report 与模板体系解决“怎么把事实写成能教会读者的正式解读”。

## 默认路径与扩展路径

### 路径 A：单仓源码思想解读

适用于一个普通仓库、库、SDK、CLI、Web 应用或框架。这是默认路径。

执行顺序：

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. `prompts/04_architecture_report.md`

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

### 路径 B：大仓库 / 上下文受限

适用于仓库很大、上下文窗口有限、需要先做文件筛选或打包。

执行顺序：

1. `prompts/01_repo_intake.md`
2. 根据 intake 结论决定是否做上下文打包或精选文件集
3. `prompts/02_design_philosophy_brain_dump.md`
4. `prompts/04_architecture_report.md`

额外要求：

- 先识别最值得学习的主流程与抽象，再决定打包哪些文件。
- 如果要把材料交给其他模型，优先交精选文件集，而不是整仓无差别压缩。

推荐命令顺序：

```bash
# 1) 先看 token 树，确认范围（默认 cl100k_base）
node bin/context-pack.js --token-count-tree --include "prompts/**/*,templates/**/*"

# 2) 再做范围打包（支持 stdin 精选，stdin 选择优先）
printf "README.md\nRUNNER.md\nprompts/01_repo_intake.md\n" | node bin/context-pack.js --stdin --output outputs/context-pack.md

# 3) 体量大时做分片/压缩
node bin/context-pack.js --include "prompts/**/*,templates/**/*" --split 120000 --compress --output outputs/context-pack.md
```

### 路径 C：Monorepo / 多服务 / 平台生态

适用于 monorepo、多 package、多服务、平台工程、跨仓依赖、部署链路、安全边界或数据流分析。

执行顺序：

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. `prompts/03_ecosystem_atlas.md`
4. `prompts/04_architecture_report.md`

建议最终产物：

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`
- 可选补充生态附件，例如依赖图、跨边界主链说明、重力中心清单

### 路径 D：知识沉淀 / Onboarding

适用于想给新同事、后续 AI session 或长期知识库复用的分析。

执行顺序：

1. `prompts/01_repo_intake.md`
2. `prompts/02_design_philosophy_brain_dump.md`
3. 按复杂度决定是否补 `prompts/03_ecosystem_atlas.md`
4. `prompts/04_architecture_report.md`
5. 用模板把稳定结论拆成主报告和学习附件

关键要求：

- 后续读者不需要重看聊天记录也能接着研究。
- 每个重要结论尽量带路径依据。
- 把“仍需验证”的判断留在 `drafts/`，不要混进正式产物。

## 分阶段执行

### Step 1：Intake

使用 `prompts/01_repo_intake.md`。

目标：

- 判定研究对象、项目类型和分析边界。
- 找到最值得先读的 3 到 5 个入口。
- 判断默认走 `01 -> 02 -> 04` 还是升级到 `01 -> 02 -> 03 -> 04`。
- 判断是否需要上下文打包、文件筛选、子系统切片。

停止条件：

- 能说清本轮范围和暂缓范围。
- 能说清项目类型及判断依据。
- 已知道后续分析路径。

### Step 2：Design Philosophy Brain Dump

使用 `prompts/02_design_philosophy_brain_dump.md`。

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

只有复杂生态才使用 `prompts/03_ecosystem_atlas.md`。

目标：

- 找关键实体、依赖关系、数据流、调用流和部署边界。
- 识别权限边界、安全边界、数据所有权和团队边界。
- 找生态重力中心、系统级耦合点和演进风险。

停止条件：

- 知道生态真正的关键单元是什么。
- 知道复杂度集中在哪里。
- 知道未来最可能先从哪里出问题。

### Step 4：Architecture Report

使用 `prompts/04_architecture_report.md`。

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

## 输出契约

目标不是把分析越写越多，而是把稳定结论沉淀成“主报告 + 学习附件”。

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

### outputs/

推荐文件：

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`

如果只是一次窄范围聊天分析，可以省略文件产物，但最终回答仍应包含范围说明、主流程摘要、核心抽象、设计取舍和风险判断。

## 模板速记

需要落文档时，优先使用 `templates/` 里的真实模板文件，而不是再临时发明第二套结构：

- `templates/ARCHITECTURE_REPORT.md`
- `templates/DESIGN_PHILOSOPHY.md`
- `templates/CORE_ABSTRACTIONS.md`
- `templates/MAIN_FLOW.md`
- `templates/TRADEOFFS.md`
- `templates/BORROWABLE_PATTERNS.md`

这些模板分别回答不同问题：

- 主报告解释系统整体与总体判断
- Design philosophy 解释作者反复坚持什么原则
- Core abstractions 解释系统自己的“语言”是什么
- Main flow 解释哪条链路最能暴露架构意图
- Tradeoffs 解释收益、代价和替代方案
- Borrowable patterns 解释其他团队真正能借走什么

不要把它们写成同一份长报告的不同抄写版本。

## 示例质量锚点

`examples/sample-analysis.md` 用一个紧凑示例展示目标语气、结构和判断力度。它不是唯一答案模板，但应帮助维护者快速判断：

- 这份分析有没有讲清 `Why > What`
- 主流程是否真的体现了系统哲学
- 设计取舍有没有写出代价
- 学习附件之间是否职责清晰

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

`context-pack` 参数要点（v1）：

- `--include` / `--ignore`：控制文件范围
- `--stdin`：从标准输入读取文件列表（优先于默认全量遍历）
- `--token-count-tree`：仅输出 token 分布，不产出打包文件
- `--split <max-chars>`：按字符预算切分为可消费分片
- `--compress`：输出 gzip 产物

## 维护规则

1. 不再新增或恢复第二套重叠的仓库研究 skill。
2. 任何路径、模板和产物调整，统一改这里和 `prompts/`、`templates/`。
3. 若需要兼容旧名称或旧产物名，必须显式标注为历史兼容，不要让它继续充当默认故事。
