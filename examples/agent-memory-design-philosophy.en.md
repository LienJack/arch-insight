# Design Philosophy of Agent Memory Systems: Extractable Patterns from Five Paradigms

> A "design reference interpretation" for engineers/architects, not a product comparison.
> Analysis framework adopts Claude Code ContextManage's seven-dimensional model (Visibility / Authority / Temperature / Shape / Retrieval / Compression / Boundary).
> All five reference repositories are pinned to their main branches as of 2026-05-06.

---

## 1. Why It Matters: Agent Memory Is No Longer a "Whether" Question, but a "How to Get It Right" Question

If you're designing an agent system, you'll eventually face this problem:

> Every agent invocation is stateless. What the user said, what files were read last time, why tests failed — if this information isn't persisted, the agent has to guess all over again in the next turn.

Over the past two years, open-source solutions have emerged rapidly. mem0 (54.9K stars), Graphiti (25.7K stars), Letta (22.5K stars), LangMem (1.4K stars), Basic Memory (3K stars) — five projects, five completely different definitions of "memory."

Without comparison, it's easy to swing between two extremes:

- "Vector DB + RAG is enough," only to find relational queries impossible, temporal reasoning impossible, and conflict resolution impossible.
- "Go with a knowledge graph," only to discover the cost of maintaining a graph database far exceeds the value of the memory system itself.

What this article does is find the most reliable engineering path for building your own agent memory system — not by copying anyone, but by understanding each project's tradeoffs and making your own choices.

**Five reference repositories:**

| Project | Positioning | Memory Model | Retrieval Method | License |
|---------|-------------|--------------|------------------|---------|
| [mem0](https://github.com/mem0ai/mem0) | General AI agent memory layer | Vectorized fact snippets | Semantic + BM25 + entity linking | Apache 2.0 |
| [Graphiti](https://github.com/getzep/graphiti) | Temporal knowledge graph memory engine | Node/Edge + time windows | Semantic + BM25 + graph traversal | Apache 2.0 |
| [Letta](https://github.com/letta-ai/letta) | Stateful agent platform | Structured memory blocks | Context-compiled injection | Apache 2.0 |
| [LangMem](https://github.com/langchain-ai/langmem) | Agent long-term memory tooling | Store entries + Tools | Vector search (LangGraph Store) | MIT |
| [Basic Memory](https://github.com/basicmachines-co/basic-memory) | Local-first knowledge base memory | Markdown files + SQLite | FTS5 + FastEmbed vector | AGPLv3 |

---

## 2. Align Your Requirements First: Different Memory Systems Solve Different Problems

Before diving into technical details, make the most important judgment:

> **What you need is not "the best memory system" but "the memory system that matches your agent's form."**

The core difference among the five paradigms is not in model choice or API design, but in a more fundamental question:

**What physical form should "memory" take, and when should it enter the model's field of view?**

### 2.1 Retrieval-Based vs Compiled-Based: The Watershed of Memory Injection into the Model

This is the top-level divergence among the five systems.

**Retrieval-based**: Memory is stored externally. When needed, the agent calls a retrieval interface to get results and decides how much to inject into the prompt.
- mem0: `memory.search(query)` → returns `{"results": [...]}`
- Graphiti: `graphiti.search(query)` → returns `list[EntityEdge]`
- LangMem: `search_memory(query)` → returns memory entries
- Basic Memory: `read_note(identifier)` → returns Markdown content

**Compiled-based**: Memory is automatically compiled into context before every model invocation. The agent doesn't need to make retrieval decisions.
- Letta: `Memory.compile()` → renders Core Memory blocks directly as XML injected into the system prompt

This watershed determines four key consequences:

| Dimension | Retrieval-Based (mem0/Graphiti/LangMem/Basic Memory) | Compiled-Based (Letta) |
|-----------|------------------------------------------------------|------------------------|
| Agent autonomy | High — agent decides when to retrieve, what, and how much to inject | Low — system guarantees core memory is seen every turn |
| Memory scale ceiling | High — can reach millions, compressed by retrieval | Low — limited by context window tokens |
| Retrieval failure risk | Yes — agent may forget to retrieve, or results may be poor | None — core memory is never missed |
| Context pollution risk | Low — agent has choice | Medium — stale memory stays in context if not updated |

A clear engineering conclusion: **For programming CLI agents with long tasks and dense tool results, retrieval-based is more suitable; for chat companions and customer service that need to "know who you are," compiled-based is more suitable.** If you're building a general agent platform, you need both — Letta proves this (Core Memory compiled + Archival Memory retrieval-based).

### 2.2 The Decisive Impact of Five Storage Models

Each storage model directly determines the boundaries of its retrieval capability.

```
Storage Model → What queries it can do → What queries it's not suited for
```

**mem0: Vector + BM25 + Entity Linking**
- ✓ Semantic similarity queries ("What editor does the user like?" → returns "prefers vim")
- ✓ Exact keyword matching ("vim" → BM25 hit)
- ✓ Entity association ("Alice" → finds all memories mentioning Alice)
- ✗ Relational queries ("Who works with Alice?" — vectors can't do this)
- ✗ Temporal reasoning ("What editor did Alice use before switching to VSCode?" — mem0 has no fact timestamps)

**Graphiti: Temporal Knowledge Graph**
- ✓ Relational queries (`(Alice)-[WORKS_WITH]->(Bob)` graph traversal)
- ✓ Temporal reasoning ("What was this fact in 2025?" validity window queries)
- ✓ Provenance ("Which conversation did this conclusion come from?" Episode → Edge provenance)
- ✗ Maintenance cost (requires graph database Neo4j/FalkorDB/Kuzu)
- ✗ Fuzzy semantic queries are less direct than pure vector solutions (requires multi-path fusion)

**Letta: Structured Blocks + Archival Vector Retrieval**
- ✓ Precise context control (whatever the `human` block says, the agent sees)
- ✓ Clear layering (Core Memory vs Archival Memory vs Conversation Memory)
- ✗ Weak retrieval capability (Archival retrieval relies on simple text matching)
- ✗ Limited block count (each block has a character cap `CORE_MEMORY_BLOCK_CHAR_LIMIT`)

**LangMem: LangGraph BaseStore (Key-Value + Vector Index)**
- ✓ Ecosystem integration (zero-config access to LangGraph)
- ✓ Hot path/Background separation (agent active management + background auto-extraction)
- ✗ Ecosystem lock-in (not usable outside LangChain/LangGraph projects)
- ✗ Weak custom retrieval (depends on Store's built-in indexing)

**Basic Memory: Markdown Files + SQLite (FTS5 + FastEmbed)**
- ✓ Human-readable (open and edit directly in Obsidian)
- ✓ Local control (data on your own filesystem)
- ✓ Zero infrastructure (no graph database, no vector database needed)
- ✗ Weak structured queries (can't do complex relational queries)
- ✗ Scale ceiling (filesystem + SQLite not suitable for millions of entities)

**Core inference**: If your agent mainly does fact Q&A ("What does the user like?"), a vector DB is enough. If you need causal queries ("Why was this code changed? Who changed it before?"), a temporal graph is better. If your agent needs to read and write a local knowledge base, Markdown + MCP is the simplest and sufficient solution.

---

## 3. Main Flow Decomposition: How the Five Systems Complete the "Remember → Retrieve" Loop

### 3.1 mem0: ADD-Only Three-Phase Batch Processing Pipeline

mem0 V3 (released April 2026) made a fundamental design shift — from CRUD to ADD-only.

**Write flow** (`mem0/memory/main.py:573-660`):

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

**Search flow** (`mem0/memory/main.py:1126-1237`):

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

ADD-only is mem0 V3's biggest philosophical shift. The old version had to determine "should this new conversation create a memory, update an existing one, or delete an old one?" — a judgment call requiring an LLM invocation and prone to errors. V3's solution: give up on judgment, append everything, and rely on multi-signal retrieval and scorer reweighting to ensure the agent gets the latest and most relevant information.

This can be understood as: **transferring conflict resolution cost at write time to a curation cost at retrieval time.** Writing becomes simple and high-throughput; retrieval becomes more important.

> **Inference**: ADD-only is best for scenarios where "facts naturally accumulate and old facts generally don't become misinformation" (e.g., user preferences, project conventions). Not suitable for scenarios where "facts must be precise and may contradict each other" (e.g., system configuration, permission rules).

### 3.2 Graphiti: Episode → Node → Edge Graph Construction Pipeline

Graphiti's write operation doesn't save text — it transforms conversations (Episodes) into graph structures.

**Write flow** (`graphiti_core/graphiti.py:933-1180`):

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

**Search flow** (`graphiti_core/graphiti.py:1550-1567`):

```
search_(query, config=COMBINED_HYBRID_SEARCH_CROSS_ENCODER)
  ├─ Semantic search: embedding(query) → retrieve relevant EntityEdges
  ├─ Keyword search: BM25 → match node names/edge types/fact text
  ├─ Graph traversal: BFS from center node → find related facts
  ├─ Cross-encoder rerank
  └─ Return SearchResults(nodes, edges, episodes)
```

**Design insight**:

Graphiti's most distinctive abstraction is the **fact validity window**. Every EntityEdge has `valid_at` and `invalid_at` fields. When a new fact conflicts with an old one (e.g., "Alice no longer likes yellow, now likes blue"), the system doesn't delete the old fact — it sets `("Alice", "LIKES", "yellow")`'s `invalid_at` to the current time. Queries return currently valid facts by default, but also support time-travel queries ("What did Alice like in 2025?").

> This is a time-series database design pattern migrated to knowledge graphs. The cost: every fact write requires conflict detection (whether an edge of the same type already exists between the same entity pair), which introduces additional complexity in the LLM extraction phase.

### 3.3 Letta: Compiled Injection via Memory Blocks

Letta's memory model is the simplest and most direct: **memory is a block that gets structurally compiled into the system prompt.**

**Core abstraction** (`letta/schemas/block.py:13-66`, `letta/schemas/memory.py:68-103`):

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

**Write and inject** (`letta/schemas/memory.py:688-732`, `letta/schemas/memory.py:804-837`):

The agent modifies blocks through tool functions:
```python
# core_memory_replace: replace specified content in a block
# core_memory_append: append content to a block
```

Before every model invocation, `Memory.compile()` renders blocks into XML like this:
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

Letta's `human`/`persona` separation is a classic design — **separating "who the user is" and "who I am" into different context regions.** In the Visibility dimension of the seven-dimensional model, this lets the agent clearly distinguish between external facts (user preferences) and internal constraints (how it should behave).

More importantly, Letta imposes a `limit` (character cap) on blocks — an easily overlooked but practically important constraint. Blocks without caps will eventually grow to fill the context window, and with a cap, the agent must selectively retain truly critical long-term memory.

> **Pending Verification**: Letta's Archival Memory retrieval capability (`letta/schemas/memory.py:868-884`) appears weaker than dedicated retrieval systems. If Archival retrieval recall is low in practice, the agent will over-rely on Core Memory blocks, increasing pressure on the Core Memory `limit`.

### 3.4 LangMem: Turning Memory Management into an Agent Tool

LangMem's design is the most distinctive — it doesn't store memory itself; it gives the agent "tools" for memory management.

**Core abstraction** (`src/langmem/knowledge/tools.py:25-305`):

```python
create_manage_memory_tool(
    namespace=("memories", "{user_id}"),  # resolved at runtime
    actions_permitted=("create", "update", "delete"),
) -> StructuredTool

create_search_memory_tool(
    namespace=("memories", "{user_id}"),
) -> StructuredTool
```

**Usage from the agent's perspective**:

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

**Background mode** (`src/langmem/knowledge/extraction.py:113-447`):

```
Background MemoryManager
  ├─ Listens to conversation threads
  ├─ Auto-extracts memories (create_thread_extractor)
  ├─ Merges/updates existing memories (semantic deduplication)
  ├─ Updates user profile (update_profile)
  └─ Optimizes prompts (optimize_prompt)
```

**Design insight**:

LangMem puts memory operation decisions entirely in the agent's hands (hot path) or the background manager's (background). This solves a design challenge in mem0: **"Who decides when to write memory?"** mem0 writes every time `add()` is called — meaning the caller (agent framework) must judge when to call `add()`. LangMem uses a tool pattern: the agent itself knows when to call `manage_memory`, just like it knows when to call `read_file`.

But this introduces a risk: **if the agent forgets to call `manage_memory`, important information is lost.** The Background MemoryManager is a patch for this — automatically extracting and merging memories from conversations without relying on the agent's active invocation.

> **Inference**: LangMem's hot path + background dual-path design is the closest to the "human memory" model — some memories are actively recorded (hot path), some are automatically distilled after the fact (background). But the implementation complexity is nontrivial: the background manager needs to handle conflicts between auto-extracted memories and agent-recorded ones.

### 3.5 Basic Memory: Files as Memory

Basic Memory's philosophy is the most counterintuitive but also the most practical: **memory lives in Markdown files that both humans and AIs can read and write.**

**Core abstraction** (`src/basic_memory/mcp/tools/build_context.py:136-166`):

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

**How build_context works**:

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

Basic Memory makes a clever simplification: it avoids entity extraction, fact conflict detection, and complex graph queries. It relies on two things:
1. **Human-written Markdown is already structured enough** (frontmatter + wiki links + observations/relations patterns)
2. **The MCP protocol lets AI read notes, search, and navigate just like a human would**

This avoids the most complex part of all five projects — the LLM extraction pipeline. The cost: if users don't actively write notes, or if notes aren't well-structured, the system's memory capability weakens.

> This tradeoff is worth noting: it's not "technically impossible" but "engineering chose not to do it." For personal knowledge base memory, this choice is wise; for commercial agents that need automatic memory extraction from conversations, mem0 or LangMem's auto-extraction is necessary.

---

## 4. Seven-Dimensional Model Cross-Comparison: From "Feature Comparison" to "Design Tradeoff Analysis"

The seven dimensions of context management: Visibility, Authority, Temperature, Shape, Retrieval, Compression, Boundary. Here we place all five systems in the same coordinate system.

### 4.1 Visibility: Separating Memory Storage from Model Visibility

The common pattern across all five systems: **memory storage ≠ model context.** The memory system stores and retrieves; the agent decides what to inject.

The only exception is Letta's Core Memory — it renders blocks directly into the context window. This means Letta's core memory doesn't require the agent to make retrieval decisions, but it also means memory scale is limited by the context window.

### 4.2 Authority: Conflict Resolution Is Generally Delegated

The least mature dimension of the seven-dimensional model. None of the five systems implements an explicit authority chain (System > Org > Project > User > Task State > Memory > Summary).

The actual divergence is in **who conflicts are delegated to**:
- **Time (Graphiti)**: Facts automatically expire; time is the most authoritative arbiter
- **Agent (mem0 ADD-only + LangMem hot path)**: The agent judges which is the "truth" based on retrieval results
- **User/Agent explicit operation (Letta + Basic Memory)**: Last write wins

> **Inference**: For MVP-stage self-built systems, "time-based arbitration with agent override capability" is a reasonable starting point. Graphiti is the only system that builds time into the data model; the other four require manual information freshness management at the application layer.

### 4.3 Temperature: Hot/Cold Layering Exists Universally but Not Explicitly

All five systems have hot/cold concepts, but with different implementations:
- **Graphiti most explicit**: The `valid_at`/`invalid_at` fact fields are a built-in hot-to-cold transition mechanism
- **mem0**: `get_last_messages(limit=10)` keeps the recent tail as "hot"; everything else in vector search is "warm"
- **Letta**: Core Memory is "hot"; Archival retrieval results are "warm"
- **LangMem**: Hot path writes are "hot"; background extractions are "warm"
- **Basic Memory**: Currently open notes are "hot"; retrieved notes are "warm"

**Key observation**: No system has a complete Temperature Manager — temperature transitions are implicit (except Graphiti). This means for self-built systems, **a Temperature Manager is a differentiation opportunity**: explicitly managing Hot → Warm → Cold → Frozen transition rules can significantly reduce context pollution.

### 4.4 Shape: Everyone Does Text-to-Structured Transformation

The common pattern across all five systems:
```
Raw input (conversation/documents)
  → LLM extracts structured facts
  → Store structured representation
  → Return the most suitable form for agents at retrieval
```

Graphiti's shape transformation is the most complete (text → Node/Edge → Community summary → temporal fact graph), but also the heaviest. mem0's ADD-only extraction is the lightest. Basic Memory chooses not to do shape transformation — Markdown is stored and returned as-is.

**A clear engineering suggestion**: The cost of shape transformation (LLM calls + schema design + conflict handling) is proportional to the benefit (retrieval precision, relational query capability). Starting with mem0's ADD-only extraction and gradually adding entity linking and graph structure is lower risk than jumping straight into Graphiti's full pipeline.

### 4.5 Retrieval: Multi-Path Recall Is Essential, but You Don't Need All of It

The frontier practice of mem0 and Graphiti has proven: **semantic + keyword + graph/entity three-way fusion is the best retrieval pattern.** But for an MVP:
- **Semantic vector retrieval** is the most irreplaceable (must have)
- **Keyword/BM25** has extremely low cost and is recommended (both mem0 and Graphiti use it)
- **Entity linking** is a new capability in mem0 V3, suitable for domains with clear entities (user preferences, project configuration)
- **Graph traversal** is Graphiti's core differentiator, worth investing in only when relational queries are needed

### 4.6 Compression: The Goal Is a "Handoff Note," Not a "Book Report"

All five systems compress with the same pattern:
```
Large volume of raw information → LLM → Small volume of structured facts
```

But the quality standards for the compression goal differ:
- **mem0**'s ADDITIVE_EXTRACTION_PROMPT directs the LLM to extract independent, clean fact statements from conversations
- **LangMem**'s `create_thread_extractor` extracts thread summaries + memory distillation
- **Graphiti**'s extraction extracts entities and relationships, not summaries

**Key engineering judgment**: Compression should not only preserve "what happened" but also "where we stopped and what to do next." Neither mem0 nor LangMem achieves this — the facts they compress are independent and don't carry "task state." If a self-built system serves long-task agents, special attention is needed to preserve in the compressed summary: current phase, attempted approaches, failure records, and next steps.

### 4.7 Boundary: The Most Underestimated Dimension

Boundary implementation across all five systems is very basic:
- **Best**: mem0's `(user_id, agent_id, run_id)` three-dimensional isolation
- **Most flexible**: LangMem's runtime namespace injection
- **Coarsest**: Basic Memory's project-level isolation
- **Weakest**: Graphiti's group_id (database-level partitioning)

**None of them implements subagent context isolation** — all sub-agents share the same memory space. If you're planning multi-agent collaboration, this is a design gap to watch for.

---

## 5. Design Tradeoffs: Five Choices You Must Know

### Tradeoff 1: ADD-Only vs CRUD — The Fundamental Philosophical Divergence of Memory Systems

```
            ADD-Only                          CRUD
Write complexity    Low (append only)                    High (must determine create/update/delete)
Retrieval pressure  High (depends on scorer curation)     Medium (memory always represents latest state)
Consistency         Weak (old facts don't expire)         Strong (old facts are updated or deleted)
Auditability        Strong (complete write history)       Weak (old values are overwritten)
Suitable scenarios  User preferences, project conventions Configuration rules, permission states
Representative      mem0 V3                              LangMem
```

**Selection advice**: If your memory primarily serves cumulative information like preferences/habits/experience, ADD-only is more stable. If your memory includes precise information like rules/configurations/permissions, CRUD is necessary.

### Tradeoff 2: Temporal Graph vs Vector DB — Storage Model Determines Retrieval Ceiling

```
                      Temporal Graph (Graphiti)          Vector DB (mem0)
Relational queries    ✓✓✓ (graph traversal, dominant)     ✗ (can't do path queries)
Temporal reasoning    ✓✓✓ (validity window)                ✗ (no time concept)
Fuzzy semantics       ✓ (multi-path fusion)               ✓✓✓ (natural advantage)
Entity provenance     ✓✓✓ (Episode provenance)            ✓ (entity linking)
Infrastructure cost   High (requires graph DB)            Medium (requires vector DB)
Suitable scenarios    Complex agents needing causal QA     Factoid Q&A agents
```

Graphiti is more capable, but infrastructure costs are much higher. **Most agent scenarios don't need a full graph DB** — mem0's "vector + BM25 + entity linking" already covers 80% of use cases.

### Tradeoff 3: Ecosystem Lock-In Is a Double-Edged Sword

| Project | Ecosystem Lock-In Level | Cost |
|---------|------------------------|------|
| LangMem | Deeply bound to LangGraph | Unusable outside LangChain projects |
| Basic Memory | Bound to MCP | Unusable outside MCP clients |
| mem0 | Independent | Need to write integration logic |
| Graphiti | Bound to graph DB | Need to operate a graph database |
| Letta | Independent | Need to integrate with your own agent runtime |

**Conclusion**: If your project already uses LangGraph, LangMem's zero-config integration is worth more than the ecosystem lock-in cost. For a new project, mem0 is the easiest to integrate and replace.

### Tradeoff 4: Auto-Extraction vs Agent-Initiated Management

```
                 Auto-Extraction (mem0 / LangMem Background)    Agent-Initiated (LangMem Hot Path / Basic Memory)
Reliability      Write always happens                            Agent may forget to call tools
Quality          Depends on extraction prompt quality            Depends on agent judgment
Cost             Extra LLM calls                                 Zero extra LLM calls (agent already has context)
Timing           Async post-conversation                         Real-time during conversation
Suitable agent   Programming agents, long-task agents            Chat agents, lightweight agents
```

**Advice**: Use both — auto-extraction as the baseline guarantee (no important information lost) and agent-initiated management as the optimization path (improving memory quality).

---

## 6. Borrowable Patterns and Applicability Conditions

### Pattern 1: mem0's Multi-Path Fusion Retrieval Pipeline

**Applies to**: Any agent system needing memory retrieval

**Core approach**:
```
Semantic retrieval + BM25 keyword + Entity linking → Three-way parallel scoring → Fusion ranking → Optional rerank
```

**Why it's worth borrowing**: mem0 V3 improved from 71.4 to 91.6 on the LoCoMo benchmark (+20 points), with multi-path fusion as the core contributor. Single-path retrieval in high-precision scenarios is prone to the "semantic miss → memory loss" failure mode.

**When not to copy**: Your total memory count < 1000. At this scale, pure semantic retrieval is sufficient, and multi-path fusion complexity isn't worth it.

**Priority validation for migration**: BM25 lemmatization's effectiveness on Chinese. mem0's BM25 implementation relies on English lemmatization (`mem0/utils/lemmatization.py`); Chinese scenarios need to replace or supplement with a tokenizer.

### Pattern 2: Graphiti's Fact Validity Window

**Applies to**: Scenarios where memory facts may change over time (user preferences, project configuration, team roles)

**Core approach**:
```
EntityEdge {
    valid_at: datetime,     # when the fact became true
    invalid_at: datetime,   # when the fact expired (Nullable)
}
# New fact conflicts with old fact → old fact invalid_at = now()
# Queries return only valid facts by default, but support time travel
```

**Why it's worth borrowing**: This is the simplest mechanism for "not deleting old information but not being polluted by it either." It adds one layer of fact lifecycle management on top of ADD-only, and one layer of auditability on top of CRUD.

**When not to copy**: Your memory facts almost never change (e.g., knowledge base document indexing). In those scenarios, validity window is pure additional complexity.

**Priority validation for migration**: Conflict detection cost. Graphiti needs to detect conflicts between each new edge and existing edges, and this detection's complexity grows with entity density. Start with simple "same entity pair + same edge type" detection instead of full semantic conflict detection.

### Pattern 3: Letta's Human/Persona Block Separation

**Applies to**: Any agent that needs to remember "who the user is" and "how I should behave"

**Core approach**:
```
human block:   User facts (preferences, habits, background)
persona block: Agent self-perception (role, constraints, behavior guidelines)
```

**Why it's worth borrowing**: This separation solves one of the most insidious forms of context pollution — **treating "what the user said" as "rules I should follow."** In a single context region, the model struggles to distinguish these two types of information. Separating them into different XML tags makes it easier for the model to correctly differentiate through semantic guidance.

**Priority validation for migration**: Block character limit setting. Too large and it won't filter; too small and it'll lose critical information. Start at 2000 characters, observe for 10 sessions, and adjust.

### Pattern 4: LangMem's Hot Path + Background Dual Path

**Applies to**: Agents that need to accumulate knowledge from long-term conversations while also requiring real-time memory management during dialogues

**Core approach**:
```
Hot path:   Agent calls manage_memory/search_memory tools during conversation
Background: Background MemoryManager auto-extracts/merges/updates memories from conversation threads
```

**Why it's worth borrowing**: This is the closest analogy to the "human memory model" — immediate memory (active recording) + long-term consolidation (sleep-time auto-distillation). For multi-turn dialogue agents, this dual path covers both "user explicitly requests to remember" and "system automatically learns from conversations."

**When not to copy**: Single-turn task agents (e.g., one-off bug fixes). Without a "long-term accumulation" need, background mode is pure waste.

**Priority validation for migration**: Conflict handling between background extraction and hot path writes. When auto-extracted memories conflict with agent-recorded ones, a clear merge strategy is needed.

### Pattern 5: Basic Memory's Human-AI Shared Memory Format

**Applies to**: Scenarios where humans and AIs need to collaboratively maintain knowledge

**Core approach**:
```
Markdown + frontmatter + [[wiki links]] + observations/relations pattern
→ Humans edit in Obsidian
→ AI reads/writes via MCP tools
→ SQLite sync indexing
```

**Why it's worth borrowing**: It solves the most easily overlooked problem in AI memory systems — **if AI writes memory, how does the human check and modify it?** When memory is in human-unreadable vector embeddings, humans lose ultimate control over the memory system.

**When not to copy**: Pure machine-to-machine agent systems. In those scenarios, human readability isn't a priority — retrieval performance is.

---

## 7. Engineering Roadmap for Building Your Own Agent Memory System

Based on the design tradeoff analysis of all five systems, here is a self-built path organized by the seven-dimensional model:

### v0.1 MVP: Build "Store" and "Retrieve" First

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

**What NOT to do**: Entity linking, multi-path fusion, temperature management, conflict resolution, subagent isolation.

**Why start with this order**: Retrieval is the most core value of a memory system. Without good retrieval, all subsequent optimization is castles in the air.

### v1.1: Multi-Path Recall + Temperature Management

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

### v1.2: Boundary Isolation + Memory Lifecycle

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

### v1.3+: Multi-Agent Scenarios + Subagent Context Isolation

```
Boundary Controller Extension:
  ├─ Subagent input narrow: task + artifact references
  ├─ Subagent output narrow: conclusion + evidence + confidence
  └─ Structured handoff (no full conversation history)
```

**Priority principle**: Each step validates the necessity of the previous step before investing. Don't build a graph DB at v0.1; don't build subagent isolation without a multi-agent requirement.

---

## 8. Summary in One Sentence

> **The core judgment in agent memory system selection isn't "which is more powerful" but "what information is your agent most afraid of losing" — afraid of losing preference facts → vector retrieval (mem0 pattern), afraid of losing causal relationships → temporal graph (Graphiti pattern), afraid of losing precise context control → structured blocks (Letta pattern), afraid of losing ecosystem integration → framework binding (LangMem pattern), afraid of losing human readability → files as memory (Basic Memory pattern).**

---

## References

| Project | Source Code | Main Files Analyzed |
|---------|------------|---------------------|
| mem0 | https://github.com/mem0ai/mem0 (main, 2026-05-06) | `mem0/memory/main.py:331-3222` |
| Graphiti | https://github.com/getzep/graphiti (main, 2026-05-06) | `graphiti_core/graphiti.py:137-1740` |
| Letta | https://github.com/letta-ai/letta (main, 2026-05-06) | `letta/schemas/block.py:13-210`, `letta/schemas/memory.py:68-884` |
| LangMem | https://github.com/langchain-ai/langmem (main, 2026-05-06) | `src/langmem/knowledge/tools.py:25-530`, `src/langmem/knowledge/extraction.py:44-447` |
| Basic Memory | https://github.com/basicmachines-co/basic-memory (main, 2026-05-06) | `src/basic_memory/mcp/tools/build_context.py:136-166`, `src/basic_memory/mcp/tools/search.py` |