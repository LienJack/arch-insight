# 04 Architecture Report Ultimate Prompt

What you are about to write is not notes, not a directory explanation, and not a chat summary. It is a formal source code interpretation report that can genuinely be used by engineers, Tech Leads, architects, or future AI sessions.

This report must enable the reader, without re-reading the entire repo code, to:

1. Build a correct system mental model
2. Understand the truly important abstractions, modules, and boundaries
3. Understand at least one key main flow
4. Understand core design tradeoffs
5. Form their own judgment on the system's strengths, risks, and evolution direction
6. Know which ideas and patterns are worth borrowing

If your report is just "organizing what you've seen", that's not enough. You must organize opinions, not just materials.

---

## Input Contract You Must Inherit Before Entering This Stage

The formal report must explicitly inherit prior stage conclusions, not freely reinvent:

1. `01_repo_intake` research scope, sources, version anchors, deferred areas, and access constraints
2. `02_design_philosophy_brain_dump` core abstractions, main flow, module-level judgments, and pending verification hypotheses
3. If `03_ecosystem_atlas` was enabled, also inherit cross-boundary relationships, gravity centers, and system-level risks

If the report corrects prior stage conclusions, you must explain the basis for the correction.

---

## Your Stage Goals

Converge the observations, facts, main flow understanding, design principle judgments, and ecosystem judgments from prior stages into a structured, readable, reusable, judgment-bearing formal report, and explicitly split out learning appendices.

---

## 7 Questions the Report Must Answer

1. What problem is this system actually solving?
2. What are its true system boundaries and core abstractions?
3. How does its most critical flow actually run through?
4. Which design decisions are most critical?
5. What are the benefits, costs, and alternatives for each of these decisions?
6. What are the risks and technical debt most worth being vigilant about right now?
7. What can other engineers genuinely learn from this?

---

## Writing Principles

1. Don't stitch drafts together — reorganize the narrative.
2. Don't rewrite the README as a report.
3. Don't flatten by directory — organize sections by system logic.
4. Every important module must be explained back into the whole system.
5. Every important judgment should provide code path evidence wherever possible; if external materials are used, explicitly mark them.
6. Unpack at least 2 to 4 truly concrete design tradeoffs.
7. Provide at least 1 explicit critical judgment, not just pure praise.
8. Throughout the text, prioritize answering `Why > What`.

---

## Evidence Contract (New Mandatory)

The formal report is allowed to have opinions, but cannot lose verifiability.

### Evidence Requirements for Key Judgments

- Core judgments should wherever possible attach real source paths
- Important flows, interfaces, state boundaries should prioritize `path:line`-level evidence
- If a conclusion comes from induction across multiple points, explicitly state that this is `Inference`
- If a point remains uncertain, explicitly mark as `Pending Verification`; don't pretend it's confirmed

### Module-Level Minimum Explanation Requirements

For each core module entering the body text, at minimum answer:

- Its role in the entire system
- What complexity it absorbs
- What its contract is with adjacent modules
- How it embodies the overall design philosophy

Do not write core modules as "directory introductions".

---

## What Your Narrative Mainline Should Be

It is recommended to organize in this priority order:

1. Project positioning & core value
2. Overall architecture
3. Core abstractions & module system
4. Key flow breakdown
5. Design tradeoff deep analysis
6. Risks, problems & improvement suggestions
7. Patterns worth borrowing
8. Overall assessment

You can adjust, but must guarantee:

- Give the map first, then drill down
- Explain the mainline first, then details
- Explain why it matters first, then how it's implemented

---

## How Each Section Should Be Written

### 1. Project Positioning & Core Value

Don't just say "this is an X framework / Y tool". Explain:

- What problem it truly solves
- Why it deserves to be independently designed this way
- Where its true architectural center of gravity lies

### 2. Overall Architecture

Give the reader a general map:

- How many layers the system has
- Which layers are the skeleton
- Which mainline is the most important
- Which boundaries are the most critical

A diagram is good, but the diagram is not the point. The point is whether you tell the reader:

- Where control authority flows
- Where complexity is concentrated

### 3. Core Abstractions & Module System

Don't list too many modules. Better to list fewer, but each one is truly core.

For each core abstraction or module, answer at minimum:

- Why it exists
- What key boundary it controls
- Whether it absorbs complexity or spreads complexity
- What its contract is with other modules
- What its key data structures / config / state are
- What its position is in the main flow

### 4. Key Flow Breakdown

Thoroughly explain at least one most representative main flow:

- Request flow
- Call flow
- Data flow
- Task flow
- Build flow

The emphasis is not the call sequence, but:

- Who catches the input
- Who does the first dispatch
- Who truly makes the core decisions
- Who touches the external world
- Which step best reveals architectural intent
- Where data or state undergoes key transformation
- What the key evidence paths are

### 5. Design Tradeoff Deep Analysis

This section must read like "analysis", not "praise".

For each design point, wherever possible answer:

- What the current approach is
- What the alternatives are
- Why alternatives weren't chosen
- What benefits the current approach brings
- What costs the current approach incurs
- Whether these costs are worth it

### 6. Risks, Problems & Improvement Suggestions

Point out problems that truly affect future evolution, such as:

- Complexity growing in layers that shouldn't be complex
- Shared layers becoming global gravity centers
- Boundaries beginning to fail
- Too many implicit conventions
- Extension mechanisms becoming hard to constrain

### 7. Patterns Worth Borrowing

Don't vaguely say "code structure is clear". Explicitly point out:

- What pattern is worth borrowing
- What prerequisites it suits
- What costs to watch out for when borrowing
- When NOT to copy it (which prerequisites failing would make it invalid)

### 8. Overall Assessment

At the end, don't just summarize — give one forceful overall judgment.

The reader should know by this point:

- What this system is most worth learning
- What to be most vigilant about
- If continuing to study, where to look next

---

## What You Must Output

The final report should at minimum contain:

### 1. Project Positioning & Core Value

`<1-3 paragraphs>`

### 2. Overall Architecture

`<system layers + a diagram + explanation>`

### 3. Core Abstractions & Module System

`<abstraction inventory + 2-4 core module deep-dives>`

### 4. Key Flow Breakdown

`<at least one main flow + diagram + textual explanation>`

### 5. Design Tradeoff Deep Analysis

`<at least 2-4 design points>`

### 6. Risks, Problems & Improvement Suggestions

`<at least 1-3 real problems>`

### 7. Patterns Worth Borrowing

`<at least 2-5 patterns or judgments>`

### 8. Overall Assessment

`<one judgmental closing line>`

### 9. Evidence & Judgment Boundaries (can go in appendix)

- Key evidence path index
- Which judgments in the text are `Inference`
- Which areas in the text are still `Pending Verification`

---

## Mandatory Constraints

Do NOT write like this:

- Directory-by-directory introduction
- File-by-file rehashing
- No main flow
- No design tradeoffs
- No risk judgments
- No overall assessment
- Only praise, no critique
- Only diagrams without explanations
- Not distinguishing facts, inferences, pending verification
- Wrote about core modules without explaining their contract with the main flow and adjacent modules

This report's true value is not in information volume, but in whether it helps the reader see:

- The system's skeleton
- Where complexity lives
- The costs of design choices
- The risks of evolution
- The ideas truly worth transferring
