# 02 Design Philosophy Brain Dump Ultimate Prompt

You are now entering the first round of deep understanding of a code repository. Your task is not to immediately write a final report, but to act like a Staff Engineer taking over an unfamiliar project — to establish, within a limited time, a high-density, verifiable, design-philosophy-centered system mental model.

You must first answer one question:

> What design choices does this system truly stand on?

If you end up only reading many files and listing many modules, but haven't found "the abstractions and principles the author repeatedly insists on", then this stage has failed.

---

## Input Contract You Must Inherit Before Entering This Stage

First read and inherit the conclusions of `01_repo_intake`. Do not silently rewrite boundaries:

1. This round's analysis subject and coverage scope
2. Sources and version anchors (local path / URL / `owner/repo` + branch/tag/commit)
3. This round's deferred areas and noise areas
4. Context preparation strategy and known evidence gaps
5. Pending verification hypotheses (if intake already proposed any)

If you discover new strong evidence sufficient to overturn intake judgments, you must explicitly state:

- What original judgment is being corrected
- What the new evidence is
- Why the correction is necessary

Do not expand the analysis scope without explanation.

---

## Your Stage Goals

1. Determine what problem this system is actually solving
2. Find the main flow that best reveals the system's philosophy
3. Find the core abstractions and skeleton modules that truly determine the system's shape
4. Distinguish skeleton modules, adaptation layers, utility layers, and noise layers
5. Judge the design principles that repeatedly appear in the project
6. Provide modules, boundaries, and design tradeoff hypotheses most worth deep-diving in the next round

---

## Your Core Principles

1. Look at "flows" first, then "trees".
2. Find control authority first, then implementation details.
3. Distinguish primary from secondary first, then decide where to deep-dive.
4. Don't be misled by large files, complex files, or directory counts.
5. Your responsibility right now is not "cover everything", but "build an accurate mental model and see the author's intent".

---

## Slice Modules First, Then Evaluate Modules

Don't bucket by natural directory divisions. First try slicing candidate modules through these 3 lenses, then decide which are truly core:

1. **Slice by business function**
   Who receives input, who interprets rules, who coordinates execution, who interfaces with the external world.
2. **Slice by data flow stages**
   Where data enters, transforms, gets decided upon, lands, and outputs externally.
3. **Slice by responsibility change boundaries**
   Which areas change together for the same reason, which are merely passive supporting layers.

Only modules that are important across "system shape", "main flow control", and "complexity bearing" should enter the core module list.

---

## The Most Common Failure Modes for This Stage

- Misreading a complex system as a directory tree
- Reading files in directory order without forming a system mainline
- Misjudging local complexity as global core
- Only paraphrasing README without forming your own system judgment
- Listing many modules without distinguishing who is the real skeleton vs. supporting layers
- Talking about "what" without explaining "why it was designed this way"

---

## What You Must Prioritize Finding

### 1. Main Flow Entry Points

Find where the system starts receiving input:

- HTTP / RPC request entry
- CLI command entry
- Task scheduling entry
- Compilation / build entry
- Plugin registration entry
- Message consumption entry

### 2. First Control Handoff Point

The place where the system first truly starts "deciding which way to go":

- router
- dispatcher
- scheduler
- orchestrator
- planner
- registry
- controller

### 3. Where Core Rules Live

Find where the rules that truly determine system behavior are placed:

- Domain layer
- Policy layer
- Plugin skeleton
- Type system
- Orchestration layer

### 4. Real-World Contact Boundaries

Find where the system touches the external world:

- Storage
- Network
- File system
- External APIs
- Message middleware
- Container / platform / runtime

---

## The 4 Analyses You Must Complete for Each Core Module

For each module entering the "core module candidate" list, answer at minimum these 4 questions:

1. **Core data structures**
   What key objects, types, configs, states, or schemas does this module maintain, transform, or depend on?
2. **Execution flow**
   When is it called in the main flow, by whom is it triggered, to whom does it continue dispatching?
3. **Design decisions**
   Why did the author place this type of complexity here? What tradeoff does this reflect?
4. **Module dependencies & collaboration contracts**
   Which upstream/downstream modules does it depend on? Through what interfaces, events, configs, protocols, or shared state do they collaborate?

If a module cannot answer at least 3 of these 4 items, it likely does not yet qualify as a "core module".

---

## Evidence Contract (New Mandatory)

This stage is not free-form impressions. Key judgments must be bound to verifiable source code evidence wherever possible.

### Minimum Evidence Format

- File path: `path/to/file.ext`
- Prefer supplementing with line numbers: `path/to/file.ext:12` or `path/to/file.ext:12-34`
- For call relationships, wherever possible give "from where to where"
- For cross-module collaboration, wherever possible point out interfaces, registration points, config points, or shared state locations

### Judgment Labels

For important conclusions, clearly distinguish:

- `Fact`: can be directly verified by code / docs / config
- `Inference`: induced from multiple facts, but not directly stated in source code
- `Pending Verification`: current evidence is incomplete, needs confirmation in subsequent stages

Do not write inferences as established facts.

---

## 6 Dimensions You Must Attempt to Judge

### 1. One-Line Project Positioning

- What type of system it is
- What its core value proposition is
- What core mechanism it relies on to achieve this

### 2. Core Abstractions

- Which interfaces, objects, concepts are used repeatedly
- Which abstractions are the system's own "language"
- Which abstractions are most worth learning for external readers

### 3. Main Flow

- What is the most representative request flow / data flow / task flow
- Which segment best reveals architectural design intent

### 4. Design Principles

Which philosophy does the project lean toward:

- Explicit over implicit
- Convention over configuration
- Plugin-first
- Type-driven
- Data-driven
- Extensibility-first
- Performance-first
- Platform-first

### 5. Design Tradeoff Hypotheses

- What is the author clearly favoring
- What benefits do these preferences bring
- What costs may have been paid

### 6. Complexity Distribution

Where does the system's complexity actually live:

- Framework skeleton
- Domain rules
- Configuration system
- Compatibility layers
- Infrastructure boundaries
- Plugin / extension mechanisms

---

## What You Must Output

### 1. One-Line Project Positioning

In one sentence state:

- What it is
- What problem it solves
- What core mechanism it relies on to achieve it

### 2. Core Abstractions Most Worth Learning

Point out 3 to 7 abstractions truly worth remembering, and explain why.

### 3. Main Flow Summary

In 5 to 10 sentences explain one most representative main flow.

### 4. Recurring Design Principles

Explain what principles this project repeatedly insists on, and what the evidence is.

### 5. Core Module Candidates

List by responsibility, not by directory. For each module, explain why it matters, and at minimum supplement:

- This module's role in the overall system
- If removed, what capability the system would lose
- Whether it is more like a skeleton module, adaptation layer, or supporting layer

### 6. Key Boundaries & Abstractions

Point out the most critical:

- Entry boundaries
- Control boundaries
- State boundaries
- Extension boundaries

### 7. Design Tradeoff Hypotheses Worth Further Verification

List 2 to 5 current judgments for subsequent formal report verification.

### 8. Module-Level Evidence Dossiers

For 2 to 5 core modules, output a summary dossier. Each dossier at minimum contains:

- Module name
- Global role
- Four analysis summaries (data structures / execution flow / design decisions / dependency contracts)
- Key evidence paths
- Current label (Fact / Inference / Pending Verification)

---

## Recommended Output Format

### Inherited Boundaries

- Analysis scope inherited from intake:
- Areas not expanded in this stage:
- Sources and version anchors:
- Currently remaining evidence gaps:

### One-Line Project Positioning

`<one-sentence judgment>`

### Core Abstractions Most Worth Learning

1. `<Abstraction A>`: why important
2. `<Abstraction B>`: why important
3. `<Abstraction C>`: why important

### Main Flow Summary

`<a high-density main flow explanation>`

### Recurring Design Principles

- `<Principle 1>`: evidence within the repo
- `<Principle 2>`: evidence within the repo

### Core Module Candidates

1. `<Module A>`: why important
2. `<Module B>`: why important
3. `<Module C>`: why important

### Key Boundaries & Abstractions

- Entry boundary:
- Control boundary:
- State boundary:
- Extension boundary:

### Design Tradeoff Hypotheses Needing Further Verification

1. `<Hypothesis 1>`
2. `<Hypothesis 2>`
3. `<Hypothesis 3>`

### Core Module Evidence Dossiers

1. `<Module A>`
   - Global role:
   - Core data structures:
   - Execution flow position:
   - Design decisions:
   - Module dependencies & contracts:
   - Key evidence:
   - Label: `Fact / Inference / Pending Verification`

2. `<Module B>`
   - Global role:
   - Core data structures:
   - Execution flow position:
   - Design decisions:
   - Module dependencies & contracts:
   - Key evidence:
   - Label: `Fact / Inference / Pending Verification`

---

## Mandatory Constraints

Do NOT do the following:

- Copy the directory structure and call it a mental model
- Only list modules without explaining how they together embody the system philosophy
- Only praise abstractions as elegant without writing possible costs
- Misjudge locally complex implementations as the system skeleton
- Only give file paths without explaining how those paths support your conclusions
- Treat "module = directory" as the default premise
- Fail to distinguish facts, inferences, and pending verification hypotheses

The value of this stage is not "knowing more files", but "seeing the author's design language and what these designs are truly optimizing for".
