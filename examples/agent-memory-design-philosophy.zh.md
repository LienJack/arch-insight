# 代理记忆系统的设计哲学：从五个范式中提取模式

> 为工程师/建筑师提供的“设计参考解读”，而不是产品比较。
> 分析框架采用Claude Code ContextManage的七维模型（可见性/权限/温度/形状/检索/压缩/边界）。
> 截至 2026 年 5 月 6 日，所有五个参考存储库均已固定到其主要分支。

---

## 1. 为什么它很重要：智能体记忆不再是一个“是否”的问题，而是一个“如何正确”的问题

如果你正在设计一个代理系统，你最终会面临这个问题：

> 每个代理调用都是无状态的。用户所说的内容、上次读取的文件、测试失败的原因——如果这些信息没有保留下来，代理必须在下一轮中重新猜测。

过去两年，开源解决方案迅速兴起。 mem0（54.9K 星）、Graphiti（25.7K 星）、Letta（22.5K 星）、LangMem（1.4K 星）、Basic Memory（3K 星）——五个项目，五个完全不同的“内存”定义。

如果没有比较，很容易在两个极端之间摇摆：

- “Vector DB + RAG 就足够了”，却发现关系查询不可能，时序推理不可能，冲突解决不可能。
- “用知识图谱去”，却发现维护图数据库的成本远远超过了内存系统本身的价值。

本文的目的是找到构建您自己的代理内存系统的最可靠的工程路径 - 不是通过复制任何人，而是通过了解每个项目的权衡并做出自己的选择。

**五个参考存储库：**

|项目|定位|内存模型|检索方式 |许可证|
|---------|-------------|--------------|------------------|---------|
| [mem0](https://github.com/mem0ai/mem0) |通用AI代理内存层|矢量化事实片段 |语义+BM25+实体链接|阿帕奇2.0 |
| [Graphiti](https://github.com/getzep/graphiti) |时态知识图谱记忆引擎 |节点/边缘+时间窗口|语义+BM25+图遍历|阿帕奇2.0 |
| [Letta](https://github.com/letta-ai/letta) |有状态代理平台 |结构化内存块|上下文编译注入 |阿帕奇2.0 |
| [LangMem](https://github.com/langchain-ai/langmem) |代理长期记忆工具|商店条目+工具|矢量搜索（LangGraph 商店）|麻省理工学院 |
| [Basic Memory](https://github.com/basicmachines-co/basic-memory) |本地优先知识库内存 | Markdown 文件 + SQLite | FTS5 + FastEmbed 向量 | AGPLv3 |

---

## 2. 首先调整您的需求：不同的内存系统解决不同的问题

在深入研究技术细节之前，做出最重要的判断：

> **你需要的不是“最好的记忆系统”，而是“与你的特工形态相匹配的记忆系统”。**

五种范式的核心区别不在于模型选择或API设计，而在于一个更基本的问题：

**“记忆”应该采取什么物理形式，什么时候应该进入模型的视野？**

### 2.1 基于检索与基于编译：模型内存注入的分水岭

这是五个体系之间最顶层的分歧。

**基于检索**：内存存储在外部。当需要时，代理调用检索接口来获取结果并决定将多少内容注入到提示中。
- mem0: `memory.search(query)` → 返回`{"results": [...]}`
- Graphiti：`graphiti.search(query)` → 返回`list[EntityEdge]`
- LangMem: `search_memory(query)` → 返回内存条目
- 基本内存：`read_note(identifier)` → 返回 Markdown 内容

**基于编译**：在每次模型调用之前，内存都会自动编译到上下文中。代理不需要做出检索决定。
- Letta: `Memory.compile()` → 将核心内存块直接呈现为注入系统提示符的 XML

这个分水岭决定了四个关键后果：

|尺寸|基于检索（mem0/Graphiti/LangMem/基本内存）|基于编译的 (Letta) |
|-----------|------------------------------------------------------|------------------------|
|代理自主权|高 — 代理决定何时检索、注入什么以及注入多少 |低——系统保证核心内存每次都能看到|
|内存规模上限|高——可达到数百万，通过检索压缩 |低 - 受上下文窗口标记限制 |
|检索失败风险|是的 - 代理可能会忘记检索，或者结果可能很差 |无——核心内存永远不会被错过 |
|背景污染风险|低——代理人有选择|中 — 如果不更新，过时的内存将保留在上下文中 |

一个明确的工程结论： **对于任务较长且工具结果密集的 CLI 代理的编程，基于检索更适合；对于需要“知道你是谁”的聊天同伴和客户服务，基于编译的更合适。**如果你正在构建一个通用代理平台，则两者都需要 - Letta 证明了这一点（核心内存编译+基于存档内存检索）。

### 2.2 五种存储模型的决定性影响

每种存储模型直接决定了其检索能力的边界。

```
Storage Model → What queries it can do → What queries it's not suited for
```

**mem0：矢量 + BM25 + 实体链接**
- ✓ 语义相似性查询（“用户喜欢什么编辑器？”→ 返回“更喜欢 vim”）
- ✓ 精确的关键字匹配（“vim”→ BM25 命中）
- ✓ 实体关联（“爱丽丝”→找到所有提到爱丽丝的记忆）
- ✗ 关系查询（“谁与 Alice 一起工作？”——向量无法做到这一点）
- ✗ 时间推理（“Alice 在切换到 VSCode 之前使用了什么编辑器？”——mem0 没有事实时间戳）

**Graphiti：时态知识图**
- ✓ 关系查询（`(Alice)-[WORKS_WITH]->(Bob)`图遍历）
- ✓ 时间推理（“2025 年的事实是什么？”有效性窗口查询）
- ✓ 出处（“这个结论来自哪次对话？”剧集 → 边缘出处）
- ✗ 维护成本（需要图数据库 Neo4j/FalkorDB/Kuzu）
- ✗ 模糊语义查询不如纯向量解决方案直接（需要多路径融合）

**Letta：结构化块+档案向量检索**
- ✓ 精确的上下文控制（无论 `human` 块说什么，代理都会看到）
- ✓ 清晰的分层（核心内存、档案内存、对话内存）
- ✗ 检索能力弱（档案检索依赖于简单的文本匹配）
- ✗ 有限的块数（每个块有一个字符上限`CORE_MEMORY_BLOCK_CHAR_LIMIT`）

**LangMem：LangGraph BaseStore（键值+向量索引）**
- ✓ 生态系统集成（零配置访问 LangGraph）
- ✓ 热路径/后台分离（代理主动管理+后台自动提取）
- ✗ 生态系统锁定（在 LangChain/LangGraph 项目之外不可用）
- ✗ 自定义检索较弱（取决于Store内置索引）

**基本内存：Markdown 文件 + SQLite (FTS5 + FastEmbed)**
- ✓ 人类可读（直接在 Obsidian 中打开和编辑）
- ✓ 本地控制（您自己的文件系统上的数据）
- ✓ 零基础设施（无需图形数据库，无需矢量数据库）
- ✗ 弱结构化查询（无法做复杂的关系查询）
- ✗ 规模上限（文件系统 + SQLite 不适合数百万个实体）

**核心推理**：如果你的代理主要做事实问答（“用户喜欢什么？”），向量数据库就足够了。如果您需要因果查询（“为什么要更改此代码？之前谁更改过它？”），时间图会更好。如果您的代理需要读写本地知识库，Markdown + MCP 是最简单且足够的解决方案。

---

## 3.主流程分解：五个系统如何完成“记住→检索”循环

### 3.1 mem0：仅添加三相批处理管道

mem0 V3（2026 年 4 月发布）进行了根本性的设计转变——从 CRUD 到仅 ADD。

**写入流程**（`mem0/memory/main.py:573-660`）：

```
add(messages, user_id, agent_id, run_id)
  ├─ Phase 0: Context Collection
  │   └─ Pull last 10 messages from SQLite + parse input messages
  │
  ├─ Phase 1: Retrieve Existing Memories (for association)
  │   └─ embedding(query=messages) → vector_store.search(top_k=10)
  │
  ├─ Phase 2: LLM Extract New Facts
  │   └─ ADDITIVE_EXTRACTION_PROMPT → LLM → new memory list
  │   └─ Key: returns only ADD, no UPDATE/DELETE
  │
  ├─ Phase 3: Entity Extraction + Linking
  │   └─ extract_entities() → entity list per memory → vectorize → cross-memory entity linking
  │
  ├─ Phase 4: Vectorize + Write
  │   └─ embedding(memory_text) → vector_store.insert()
  │
  └─ Phase 5: Write to SQLite History
      └─ db.insert_history(messages, memories)
```

**搜索流程** (`mem0/memory/main.py:1126-1237`)：

```
search(query, filters={user_id/agent_id/run_id}, top_k=20)
  ├─ 1. Filter validation (at least one entity ID)
  ├─ 2. Semantic retrieval: embedding(query) → vector_store.search()
  ├─ 3. BM25 keyword retrieval: lemmatize(query) → BM25 scorer
  ├─ 4. Entity retrieval: entity_store.search() → linked memories
  ├─ 5. Three-way fusion: score_and_rank(semantic, BM25, entity)
  └─ 6. Optional rerank
```

**Design insight**:

ADD-only 是 mem0 V3 最大的哲学转变。旧版本必须确定“这个新对话应该创建记忆、更新现有记忆还是删除旧记忆？” — 需要调用 LLM 且容易出错的判断。 V3的解决方案：放弃判断，追加一切，依靠多信号检索和记分器重新加权来确​​保智能体获得最新、最相关的信息。

这可以理解为：**将写入时的冲突解决成本转移到检索时的管理成本。**写入变得简单且高吞吐量；检索变得更加重要。

> **推理**：仅 ADD 最适合“事实自然积累且旧事实通常不会成为错误信息”的场景（例如，用户偏好、项目约定）。不适合“事实必须准确且可能相互矛盾”的场景（例如系统配置、权限规则）。

### 3.2 Graphiti：集→节点→边图构建管道

Graphiti 的写入操作不保存文本 - 它将对话（情节）转换为图形结构。

**写入流程**（`graphiti_core/graphiti.py:933-1180`）：

```
add_episode(name, episode_body, source_description, reference_time)
  ├─ 1. Retrieve preceding episodes (provide context)
  │   └─ retrieve_episodes(ref_time, last_n=RELEVANT_SCHEMA_LIMIT)
  │
  ├─ 2. Extract Nodes from episode body (entities)
  │   └─ extract_nodes(episode, previous_episodes) → LLM → list[EntityNode]
  │
  ├─ 3. Node deduplication + resolution
  │   └─ resolve_extracted_nodes(nodes) → merge into existing node or create new node
  │
  ├─ 4. Extract Edges from episode body (relationships)
  │   └─ extract_edges(episode, resolved_nodes) → LLM → list[EntityEdge]
  │
  ├─ 5. Edge resolution + fact expiration management
  │   └─ resolve_extracted_edge(edge) → if new fact conflicts with existing fact, old fact is invalidated
  │
  ├─ 6. Build EpisodicEdges (Episode ← → Entity associations)
  │   └─ build_episodic_edges(episode, nodes, edges)
  │
  └─ 7. Optional: Update Community Summarization
      └─ update_community(nodes, edges)
```

**搜索流程** (`graphiti_core/graphiti.py:1550-1567`)：

```
search_(query, config=COMBINED_HYBRID_SEARCH_CROSS_ENCODER)
  ├─ Semantic search: embedding(query) → retrieve relevant EntityEdges
  ├─ Keyword search: BM25 → match node names/edge types/fact text
  ├─ Graph traversal: BFS from center node → find related facts
  ├─ Cross-encoder rerank
  └─ Return SearchResults(nodes, edges, episodes)
```

**Design insight**:

Graphiti 最独特的抽象是**事实有效性窗口**。每个 EntityEdge 都有 `valid_at` 和 `invalid_at` 字段。当新事实与旧事实冲突时（例如，“Alice 不再喜欢黄色，现在喜欢蓝色”），系统不会删除旧事实 - 它将 `("Alice", "LIKES", "yellow")` 的 `invalid_at` 设置为当前时间。查询默认返回当前有效的事实，但也支持时间旅行查询（“爱丽丝在 2025 年喜欢什么？”）。

> 这是迁移到知识图谱的时序数据库设计模式。成本：每个事实写入都需要冲突检测（同一实体对之间是否已存在相同类型的边缘），这在 LLM 提取阶段引入了额外的复杂性。

### 3.3 Letta：通过内存块编译注入

Letta 的内存模型是最简单、最直接的：**内存是一个按结构编译到系统提示符中的块。**

**核心抽象**（`letta/schemas/block.py:13-66`，`letta/schemas/memory.py:68-103`）：

```python
class BaseBlock(LettaBase):
    value: str           # memory content
    limit: int           # character limit (CORE_MEMORY_BLOCK_CHAR_LIMIT)
    label: str           # 'human', 'persona', or custom
    description: str     # block description
    read_only: bool      # whether the agent can only read

class Memory(BaseModel):
    blocks: List[Block]  # Core Memory blocks (visible every turn)
    file_blocks: List[FileBlock]  # special blocks for attached files

# Default two blocks
DEFAULT_BLOCKS = [Human(value=""), Persona(value="")]
```

**写入并注入**（`letta/schemas/memory.py:688-732`、`letta/schemas/memory.py:804-837`）：

代理通过工具功能修改块：
```python
# core_memory_replace: replace specified content in a block
# core_memory_append: append content to a block
```

在每次模型调用之前，`Memory.compile()` 将块呈现为 XML，如下所示：
```xml
<memory_blocks>
<human>
<description>Facts about the user</description>
<value>User prefers dark mode, uses vim</value>
</human>
<persona>
<description>Agent's self-perception</description>
<value>I am a programming assistant</value>
</persona>
</memory_blocks>
```

**Design insight**:

Letta 的`human`/`persona` 分离是一个经典的设计——**将“用户是谁”和“我是谁”分离到不同的上下文区域。**在七维模型的可见性维度中，这可以让代理清楚地区分外部事实（用户偏好）和内部约束（它应该如何表现）。

更重要的是，Letta 对块施加了`limit`（字符上限）——这是一个很容易被忽视但实际上很重要的约束。没有上限的块最终将增长以填充上下文窗口，而有上限的块，代理必须有选择地保留真正关键的长期记忆。

> **待验证**：Letta 的档案内存检索能力 (`letta/schemas/memory.py:868-884`) 似乎弱于专用检索系统。如果实践中档案检索召回率较低，代理将过度依赖核心内存块，从而增加核心内存`limit`的压力。

### 3.4 LangMem：将内存管理变成代理工具

LangMem的设计是最有特色的——它本身不存储内存；它为代理提供了内存管理的“工具”。

**核心抽象** (`src/langmem/knowledge/tools.py:25-305`)：

```python
create_manage_memory_tool(
    namespace=("memories", "{user_id}"),  # resolved at runtime
    actions_permitted=("create", "update", "delete"),
) -> StructuredTool

create_search_memory_tool(
    namespace=("memories", "{user_id}"),
) -> StructuredTool
```

**从代理角度使用**：

```
Agent receives: "Remember I prefer dark mode"
  → Agent decides: this information needs to be stored
  → Agent calls manage_memory(action="create", content="User prefers dark mode")
  → Memory written to LangGraph Store

Agent receives: "What are my interface preferences?"
  → Agent decides: needs to retrieve memory
  → Agent calls search_memory(query="interface preferences")
  → Gets result: "User prefers dark mode"
```

**后台模式** (`src/langmem/knowledge/extraction.py:113-447`):

```
Background MemoryManager
  ├─ Listens to conversation threads
  ├─ Auto-extracts memories (create_thread_extractor)
  ├─ Merges/updates existing memories (semantic deduplication)
  ├─ Updates user profile (update_profile)
  └─ Optimizes prompts (optimize_prompt)
```

**Design insight**:

LangMem 将内存操作决策完全交给代理（热路径）或后台管理器（后台）。这解决了 mem0 中的设计挑战：**“谁决定何时写入内存？”** mem0 每次调用 `add()` 时都会写入 — 这意味着调用者（代理框架）必须判断何时调用 `add()`。 LangMem 使用工具模式：代理本身知道何时调用`manage_memory`，就像它知道何时调用`read_file` 一样。

但这带来了一个风险：**如果代理忘记调用`manage_memory`，重要信息就会丢失。**Background MemoryManager 是一个补丁——自动从对话中提取和合并内存，而不依赖于代理的主动调用。

> **推论**：LangMem的热路径+后台双路径设计最接近“人类记忆”模型——有些记忆是主动记录的（热路径），有些是事后自动蒸馏的（后台）。但实现的复杂性并不小：后台管理器需要处理自动提取的内存和代理记录的内存之间的冲突。

### 3.5 基本内存：文件作为内存

基本记忆的哲学是最违反直觉的，但也是最实用的：**记忆存在于人类和人工智能都可以读写的 Markdown 文件中。**

**核心抽象** (`src/basic_memory/mcp/tools/build_context.py:136-166`)：

```
Base path: ~/basic-memory/
File structure:
  ├── project-a/
  │   ├── notes/
  │   │   ├── coffee-brewing.md
  │   │   └── vim-config.md
  │   └── schema/
  └── project-b/

MCP tools:
  ├── write_note    → create/overwrite Markdown files
  ├── read_note     → read Markdown files
  ├── edit_note     → append/replace content
  ├── delete_note   → delete files
  ├── search_notes  → FTS5 + FastEmbed hybrid search
  ├── build_context → parse wiki links to build graph context
  └── list_directory → file tree browsing
```

** build_context 如何工作**：

```
Agent wants to learn about "coffee"
  → build_context(uri="coffee")
  → Search SQLite to find coffee-brewing.md
  → Parse Markdown frontmatter (title, tags, permalink)
  → Parse [[wiki links]] → find related notes
  → Build GraphContext(results=[primary + observations + relations])
  → Return structured Markdown
```

**Design insight**:

基本内存进行了巧妙的简化：它避免了实体提取、事实冲突检测和复杂的图形查询。它依赖于两件事：
1. **人工编写的 Markdown 已经足够结构化**（frontmatter + wiki 链接 + 观察/关系模式）
2. **MCP 协议让人工智能可以像人类一样阅读笔记、搜索和导航**

这避免了所有五个项目中最复杂的部分——法学硕士提取管道。成本：如果用户不主动写笔记，或者笔记结构不好，系统的记忆能力就会减弱。

> 这种权衡值得注意：这不是“技术上不可能”，而是“工程选择不这样做”。对于个人知识库记忆来说，这个选择是明智的；对于需要从对话中自动提取内存的商业代理来说，mem0 或 LangMem 的自动提取是必要的。

---

## 4.七维模型交叉比较：从“特征比较”到“设计权衡分析”

上下文管理的七个维度：可见性、权威性、温度、形状、检索、压缩、边界。在这里，我们将所有五个系统放置在同一坐标系中。

### 4.1 可见性：将内存存储与模型可见性分开

所有五个系统的共同模式：**内存存储≠模型上下文。**内存系统存储和检索；代理决定注入什么。

唯一的例外是 Letta 的核心内存——它将块直接渲染到上下文窗口中。这意味着 Letta 的核心内存不需要代理做出检索决策，但这也意味着内存规模受到上下文窗口的限制。

### 4.2 权威：冲突解决通常是委托的

七维模型中最不成熟的维度。这五个系统都没有实现明确的权限链（系统 > 组织 > 项目 > 用户 > 任务状态 > 内存 > 摘要）。

实际的分歧在于**冲突被委托给谁**：
- **时间（Graphiti）**：事实自动过期；时间是最权威的仲裁者
- **Agent (mem0 ADD-only + LangMem hot path)**：代理根据检索结果判断哪个是“真相”
- **用户/代理显式操作（Letta + 基本内存）**：最后写入获胜

> **推论**：对于 MVP 阶段的自建系统，“具有代理覆盖能力的基于时间的仲裁”是一个合理的起点。 Graphiti 是唯一将时间构建到数据模型中的系统；其他四种需要在应用层进行手动信息新鲜度管理。

### 4.3 温度：热/冷分层普遍存在但不明确

所有五个系统都有热/冷概念，但实现不同：
- **Graphiti 最明确**：`valid_at`/`invalid_at` 事实字段是内置的热到冷转换机制
- **mem0**：`get_last_messages(limit=10)` 将最近的尾部保持为“热”；矢量搜索中的其他一切都是“温暖的”
- **Letta**：核心内存“热”；档案检索结果“温暖”
- **LangMem**：热路径写入是“热”的；背景提取是“温暖的”
- **基本记忆**：当前打开的笔记是“热门”；检索到的笔记是“温暖的”

**关键观察**：没有系统具有完整的温度管理器 - 温度转换是隐式的（Graphiti 除外）。这意味着对于自建系统来说，**温度管理器是一个差异化机会**：显式管理“热”→“暖”→“冷”→“冻结”转换规则可以显着减少上下文污染。

### 4.4 形状：每个人都进行文本到结构化的转换

所有五个系统的共同模式：
```
Raw input (conversation/documents)
  → LLM extracts structured facts
  → Store structured representation
  → Return the most suitable form for agents at retrieval
```

Graphiti 的形状变换是最完整的（文本→节点/边→社区摘要→时间事实图），但也是最重的。 mem0 的 ADD-only 提取是最轻的。基本内存选择不进行形状转换 - Markdown 按原样存储和返回。

**明确的工程建议**：形状转换的成本（LLM调用+模式设计+冲突处理）与收益（检索精度、关系查询能力）成正比。从 mem0 的 ADD-only 提取开始，逐渐添加实体链接和图结构，比直接跳入 Graphiti 的完整管道风险更低。

### 4.5 检索：多路径召回很重要，但你不需要全部

mem0和Graphiti的前沿实践已经证明：**语义+关键词+图/实体三向融合是最好的检索模式。**但是对于一个MVP来说：
- **语义向量检索**是最不可替代的（必须有）
- **关键字/BM25**成本极低，推荐使用（mem0和Graphiti都使用它）
- **实体链接**是mem0 V3中的一项新功能，适用于具有明确实体的域（用户首选项、项目配置）
- **图遍历**是 Graphiti 的核心区别，只有在需要关系查询时才值得投资

### 4.6 压缩：目标是“交接笔记”，而不是“读书报告”

所有五个系统都以相同的模式进行压缩：
```
Large volume of raw information → LLM → Small volume of structured facts
```

但压缩目标的质量标准有所不同：
- **mem0** 的 ADDITIVE_EXTRACTION_PROMPT 指示 LLM 从对话中提取独立、干净的事实陈述
- **LangMem**的`create_thread_extractor`提取线程摘要+内存蒸馏
- **Graphiti**的提取提取实体和关系，而不是摘要

**关键的工程判断**：压缩不仅应该保留“发生的事情”，还应该保留“我们停止的地方以及下一步要做什么”。 mem0 和 LangMem 都没有实现这一点——它们压缩的事实是独立的，并且不携带“任务状态”。如果自建系统服务于长期任务代理，则需要特别注意在压缩摘要中保存：当前阶段、尝试的方法、失败记录和后续步骤。

### 4.7 边界：最被低估的维度

所有五个系统的边界实现都是非常基本的：
- **最好**：mem0的`(user_id, agent_id, run_id)`三维隔离
- **最灵活**：LangMem 的运行时命名空间注入
- **Coarsest**：Basic Memory 的项目级隔离
- **最弱**：Graphiti 的 group_id （数据库级分区）

**它们都没有实现子代理上下文隔离** - 所有子代理共享相同的内存空间。如果您正在计划多代理协作，那么这是一个需要注意的设计差距。

---

## 5. 设计权衡：您必须了解的五个选择

### 权衡 1：ADD-Only 与 CRUD — 内存系统的基本哲学分歧

```
            ADD-Only                          CRUD
Write complexity    Low (append only)                    High (must determine create/update/delete)
Retrieval pressure  High (depends on scorer curation)     Medium (memory always represents latest state)
Consistency         Weak (old facts don't expire)         Strong (old facts are updated or deleted)
Auditability        Strong (complete write history)       Weak (old values are overwritten)
Suitable scenarios  User preferences, project conventions Configuration rules, permission states
Representative      mem0 V3                              LangMem
```

**选择建议**：如果您的记忆主要提供偏好/习惯/经验等累积信息，则仅 ADD 更稳定。如果您的记忆包含规则/配置/权限等精确信息，则 CRUD 是必要的。

### 权衡 2：时态图与向量 DB — 存储模型决定检索上限

```
                      Temporal Graph (Graphiti)          Vector DB (mem0)
Relational queries    ✓✓✓ (graph traversal, dominant)     ✗ (can't do path queries)
Temporal reasoning    ✓✓✓ (validity window)                ✗ (no time concept)
Fuzzy semantics       ✓ (multi-path fusion)               ✓✓✓ (natural advantage)
Entity provenance     ✓✓✓ (Episode provenance)            ✓ (entity linking)
Infrastructure cost   High (requires graph DB)            Medium (requires vector DB)
Suitable scenarios    Complex agents needing causal QA     Factoid Q&A agents
```

Graphiti 的能力更强，但基础设施成本要高得多。 **大多数代理场景不需要完整的图数据库** - mem0 的“向量 + BM25 + 实体链接”已经覆盖了 80% 的用例。

### 权衡 3：生态系统锁定是一把双刃剑

|项目|生态系统锁定水平|成本|
|---------|------------------------|------|
|朗曼|与LangGraph深度绑定|在LangChain项目之外无法使用 |
|基础记忆 |绑定MCP |无法在外部 MCP 客户端使用 |
|内存0 |独立|需要编写集成逻辑 |
|石墨|绑定到图DB |需要操作图数据库|
|莱塔|独立|需要与您自己的代理运行时集成 |

**结论**：如果您的项目已经使用 LangGraph，LangMem 的零配置集成比生态系统锁定成本更有价值。对于新项目来说，mem0是最容易集成和替换的。

### 权衡 4：自动提取与代理启动的管理

```
                 Auto-Extraction (mem0 / LangMem Background)    Agent-Initiated (LangMem Hot Path / Basic Memory)
Reliability      Write always happens                            Agent may forget to call tools
Quality          Depends on extraction prompt quality            Depends on agent judgment
Cost             Extra LLM calls                                 Zero extra LLM calls (agent already has context)
Timing           Async post-conversation                         Real-time during conversation
Suitable agent   Programming agents, long-task agents            Chat agents, lightweight agents
```

**建议**：同时使用自动提取作为基线保证（不丢失重要信息）和代理发起的管理作为优化路径（提高内存质量）。

---

## 6. 可借用模式及适用条件

### 模式 1：mem0 的多路径融合检索管道

**适用于**：任何需要内存检索的代理系统

**核心方法**：
```
Semantic retrieval + BM25 keyword + Entity linking → Three-way parallel scoring → Fusion ranking → Optional rerank
```

**为什么值得借用**：mem0 V3 在 LoCoMo 基准上从 71.4 提高到 91.6（+20 分），多路径融合是核心贡献者。高精度场景下的单路径检索容易出现“语义缺失→记忆丢失”的故障模式。

**何时不复制**：您的总内存计数< 1000。在这种规模下，纯语义检索就足够了，多路径融合复杂度不值得。

**迁移优先验证**：BM25 词形还原对中文的有效性。 mem0 的 BM25 实现依赖于英语词形还原 (`mem0/utils/lemmatization.py`)；中文场景需要用分词器来替代或补充。

### 模式 2：Graphiti 的事实有效性窗口

**适用于**：内存事实可能随时间变化的场景（用户偏好、项目配置、团队角色）

**核心方法**：
```
EntityEdge {
    valid_at: datetime,     # when the fact became true
    invalid_at: datetime,   # when the fact expired (Nullable)
}
# New fact conflicts with old fact → old fact invalid_at = now()
# Queries return only valid facts by default, but support time travel
```

**为什么值得借用**：这是“不删除旧信息但也不被其污染”的最简单机制。它在 ADD-only 之上添加了一层事实生命周期管理，在 CRUD 之上添加了一层可审计性。

**何时不复制**：您的记忆事实几乎永远不会改变（例如，知识库文档索引）。在这些情况下，有效性窗口纯粹是额外的复杂性。

**迁移的优先验证**：冲突检测成本。 Graphiti 需要检测每个新边和现有边之间的冲突，并且这种检测的复杂性随着实体密度的增加而增加。从简单的“相同实体对+相同边缘类型”检测开始，而不是完整的语义冲突检测。

### 模式 3：Letta 的人类/角色块分离

**适用于**：任何需要记住“用户是谁”和“我应该如何表现”的代理

**核心方法**：
```
human block:   User facts (preferences, habits, background)
persona block: Agent self-perception (role, constraints, behavior guidelines)
```

**为什么值得借用**：这种分离解决了最隐蔽的上下文污染形式之一 - **将“用户所说的”视为“我应该遵循的规则”。** 在单个上下文区域中，模型很难区分这两种类型的信息。将它们分成不同的 XML 标签使得模型更容易通过语义指导正确区分。

**迁移的优先验证**：块字符限制设置。太大了，过滤不了；太小就会丢失关键信息。从 2000 个字符开始，观察 10 个会话，然后进行调整。

###模式4：LangMem的热路径+背景双路径

**适用于**：需要从长期对话中积累知识，同时还需要对话过程中实时内存管理的智能体

**核心方法**：
```
Hot path:   Agent calls manage_memory/search_memory tools during conversation
Background: Background MemoryManager auto-extracts/merges/updates memories from conversation threads
```

**为什么值得借用**：这是最接近“人类记忆模型”的类比——即时记忆（主动记录）+长期巩固（睡眠时自动蒸馏）。对于多轮对话代理，这种双重路径涵盖了“用户明确请求记住”和“系统自动从对话中学习”。

**何时不复制**：单轮任务代理（例如，一次性错误修复）。如果没有“长期积累”的需要，后台模式纯粹是浪费。

**迁移的优先级验证**：后台提取和热路径写入之间的冲突处理。当自动提取的记忆与代理记录的记忆发生冲突时，需要一个明确的合并策略。

### 模式 5：基本记忆的人类-AI 共享记忆格式

**适用于**：人类和人工智能需要协作维护知识的场景

**核心方法**：
```
Markdown + frontmatter + [[wiki links]] + observations/relations pattern
→ Humans edit in Obsidian
→ AI reads/writes via MCP tools
→ SQLite sync indexing
```

**为什么值得借用**：它解决了人工智能记忆系统中最容易被忽视的问题——**如果人工智能写入记忆，人类如何检查和修改它？** 当记忆处于人类无法读取的向量嵌入中时，人类就失去了对记忆系统的最终控制。

**何时不复制**：纯机器对机器代理系统。在这些场景中，人类可读性并不是优先考虑的问题，而是检索性能。

---

## 7. 构建您自己的代理内存系统的工程路线图

基于所有五个系统的设计权衡分析，以下是由七维模型组织的自建路径：

### v0.1 MVP：首先构建“存储”和“检索”

```
Retrieval Router:
  └─ Single-path semantic vector retrieval (embedding + vector store)

Compression Engine:
  └─ LLM extraction: conversation → structured facts
  └─ Reference mem0's ADDITIVE_EXTRACTION_PROMPT

Visibility Filter:
  └─ Retrieved results directly injected into context (agent decides how much to inject)

Storage: SQLite + vector extension or Qdrant
```

**不该做的事情**：实体链接、多路径融合、温度管理、冲突解决、子代理隔离。

**为什么要从这个顺序开始**：检索是记忆系统最核心的价值。没有好的检索，后续的所有优化都是空中楼阁。

### v1.1：多路径召回+温度管理

```
Retrieval Router:
  ├─ Semantic retrieval (existing)
  ├─ BM25 keyword (new, very low cost)
  └─ Entity linking (new, reference mem0 entity store design)

Temperature Manager:
  ├─ Hot: memories from the last N conversation turns
  ├─ Warm: retrieved historical memories
  ├─ Cold: unretrieved old memories (not deleted, not in context)
  └─ Frozen: full conversation transcripts (audit only, never in LLM context)
```

### v1.2：边界隔离+内存生命周期

```
Boundary Controller:
  ├─ user_id isolation (must have)
  ├─ agent_id isolation (multi-agent scenarios)
  └─ run_id isolation (single-task local memory)

Authority Resolver:
  ├─ Time-first (reference Graphiti validity window)
  ├─ Agent can override (reference LangMem hot path)
  └─ Critical constraints hardcoded, not in LLM (reference seven-dimensional model Authority chain)
```

### v1.3+：多代理场景+子代理上下文隔离

```
Boundary Controller Extension:
  ├─ Subagent input narrow: task + artifact references
  ├─ Subagent output narrow: conclusion + evidence + confidence
  └─ Structured handoff (no full conversation history)
```

**优先原则**：每一步都验证前一步的必要性，然后再进行投资。不要在 v0.1 版本构建图形数据库；如果没有多代理需求，请勿构建子代理隔离。

---

## 8. 一句话总结

> **智能体记忆系统选择的核心判断不是“哪个更强大”，而是“你的智能体最害怕失去什么信息”——害怕失去偏好事实→向量检索（mem0模式），害怕失去因果关系→时间图（Graphiti模式），害怕失去精确的上下文控制→结构化块（Letta模式），害怕失去生态系统整合→框架绑定（LangMem模式），害怕失去人类可读性→文件作为内存（Basic Memory模式）。**

---

＃＃ 参考

|项目|源代码 |主要文件分析 |
|---------|------------|---------------------|
|内存0 | https://github.com/mem0ai/mem0（主要，2026-05-06）| `mem0/memory/main.py:331-3222` |
|石墨| https://github.com/getzep/graphiti（主要，2026-05-06）| `graphiti_core/graphiti.py:137-1740` |
|莱塔| https://github.com/letta-ai/letta（主要，2026-05-06）| `letta/schemas/block.py:13-210`、`letta/schemas/memory.py:68-884` |
|朗曼| https://github.com/langchain-ai/langmem（主要，2026-05-06）| `src/langmem/knowledge/tools.py:25-530`、`src/langmem/knowledge/extraction.py:44-447` |
|基础记忆 | https://github.com/basicmachines-co/basic-memory（主要，2026-05-06）| `src/basic_memory/mcp/tools/build_context.py:136-166`、`src/basic_memory/mcp/tools/search.py` |