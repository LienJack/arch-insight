# arch-insight Runner

This document is the execution manual for `arch-insight`. It distills the repository into a clear product contract: default service is "single-repo source code philosophy interpretation + multi-repo comparative design reference", focused on helping engineers learn design philosophy, core abstractions, main flows, design tradeoffs, and transferable patterns from source code.

## One-Line Usage

First perform "delivery mode determination" (Analysis Package / Deep Dive Article / Repo Overview), then use `01_repo_intake.md` to set boundaries and record reference source anchors, `02_design_philosophy_brain_dump.md` to build the mental model; for complex ecosystems add `03_ecosystem_atlas.md`; finally follow the mode to use `04_architecture_report.md` (Analysis Package), `05_narrative_article.md` (Deep Dive), or `06_repo_overview_article.md` (Repo Overview).

When context material is needed, default to the official `repomix`:

```bash
npx repomix@latest --help
```

If `repomix` is already installed locally, the `npx repomix@latest` examples below can be replaced with `repomix`.

## Capability Source Mapping

This skill explicitly preserves the responsibility mapping of four external sources. When maintaining, do not blur them into vague "inspiration sources" — instead clarify why each stage exists:

| Source Capability | Original Value | Position in This Skill | Usage Boundary |
| --- | --- | --- | --- |
| `repomix` context packing | Pack repos, count tokens, generate AI-friendly context | Context strategy in `01_repo_intake.md`, serving `02` when needed | Context prep only, not a substitute for design judgment |
| Phased mental-model analysis strategy | Browse codebase in phases, first holistic then local, forming a system mental model | `02_design_philosophy_brain_dump.md` | Used to find main flows, core abstractions, design principles, and next deep-dive targets |
| Ecosystem-level expansion analysis | Multi-repo, multi-service, enterprise dependency flows, data flows, security and CI/CD perspectives | `03_ecosystem_atlas.md` | Only enabled for complex ecosystems, not set as default path |
| Narrative architecture report method | `Why > What`, architecture narrative, Mermaid diagrams, design tradeoffs and formal reports | `04_architecture_report.md` and template system | Responsible for final report quality, does not copy its heavier full workflow |

Assembly principles:

1. Context packing capability handles "how to prepare context".
2. Design philosophy brain dump handles "what the system really stands on, and what design principles the author repeatedly insists on".
3. Ecosystem atlas handles "when to upgrade from single-repo perspective to ecosystem perspective".
4. Architecture report and template system handle "how to turn facts into a formal interpretation that teaches the reader".

## Default Paths and Extension Paths

### Path A: Analysis Package (Main Report + Learning Appendices)

Suitable for scenarios requiring structured retention, subsequent retrieval and reuse, and team knowledge base archiving.

Execution order:

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/04_architecture_report.md`

Recommended intermediate outputs:

- `drafts/01-intake.md`
- `drafts/02-design-philosophy-brain-dump.md`

Recommended final outputs:

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`

### Path B: Article - Deep Dive (Narrative Long-Form)

Suitable when the user explicitly wants a finished article "like a tech blog / column", or explicitly wants to "reference someone else's project for their own design decisions", rather than a template pack.

Execution order:

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. (complex ecosystem, optional) `references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/05_narrative_article.md`

Recommended outputs:

- `outputs/NARRATIVE_ARTICLE.md`
- Optional: "Evidence Path Index" appended at the end

Quality gates (must pass before writing):

1. Has a style contract been established (audience, tone, density, evidence format, prohibitions)?
2. Is there a clear thesis first, then materials organized around it (rather than starting from the directory)?
3. Is "design intent → mechanism implementation → cost risk" woven into the main thread?
4. Are borrowable design points explicitly produced, with applicable conditions, inapplicable scenarios, and migration notes?
5. For multi-repo input: are common patterns, divergent choices, applicable contexts, and local inspiration scope formed?
6. Is template-speak and stream-of-consciousness avoided?

Note: Deep Dive may absorb the question awareness from `references/templates/BORROWABLE_PATTERNS.md`, but must not degrade into "main report + 5 appendices" or checklist filling.

### Path C: Article - Repo Overview (Repository Guide)

Suitable when the user wants a source code repository tour to quickly build a repo map and reading path.

Execution order:

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. (complex ecosystem, optional) `references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/06_repo_overview_article.md`

Recommended outputs:

- `outputs/REPO_OVERVIEW_ARTICLE.md`
- Optional: `outputs/REPO_OVERVIEW_SOURCES.md`

Quality gates (must pass before writing):

1. Does the opening quickly tell the reader "what this repo is and whether it's worth reading"?
2. Can the reader locate target information within 30 seconds using the structure navigation and module table?
3. Does the main flow carry key file paths, not just textual description?
4. Are key judgments traceable via a Sources index?
5. Are long commentary and narrative-driven progression avoided?
6. Does the ending provide clear next-step reading paths?

### Path D: Large Repository / Context-Constrained

Suitable when the repository is large, the context window is limited, and file filtering or packing is needed first.

Execution order:

1. `references/prompts/01_repo_intake.md`
2. Based on intake conclusions, decide whether to do context packing or select a focused file set
3. `references/prompts/02_design_philosophy_brain_dump.md`
4. `references/prompts/04_architecture_report.md`

Additional requirements:

- First identify the main flows and abstractions most worth learning, then decide which files to pack.
- If handing materials to another model, prefer handing a curated file set rather than an undifferentiated full-repo compression.

Recommended command sequence:

```bash
# 1) First check the token tree to confirm scope (default o200k_base)
npx repomix@latest --token-count-tree --include "prompts/**/*,templates/**/*"

# 2) Then pack the scoped content (stdin selection supported, stdin takes priority)
printf "README.md\nRUNNER.md\nprompts/01_repo_intake.md\n" | npx repomix@latest --stdin -o outputs/repo-context.xml

# 3) For large volumes, split/compress
npx repomix@latest --include "prompts/**/*,templates/**/*" --split-output 1mb --compress -o outputs/repo-context.xml
```

### Path E: Monorepo / Multi-Service / Platform Ecosystem

Execution order:

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/04_architecture_report.md`

Recommended final outputs:

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`
- Optional supplementary ecosystem appendices, e.g., dependency graph, cross-boundary main chain description, gravity center inventory

### Path F: Knowledge Retention / Onboarding

Suitable for analysis intended for new colleagues, future AI sessions, or long-term knowledge base reuse.

Execution order:

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. Based on complexity, decide whether to add `references/prompts/03_ecosystem_atlas.md`
4. `references/prompts/04_architecture_report.md`
5. Use templates to split stable conclusions into main report and learning appendices

Key requirements:

- Future readers should be able to continue researching without replaying the chat history.
- Every important conclusion should carry path evidence where possible.
- Keep "still-needs-verification" judgments in `drafts/`, not mixed into formal outputs.

## Phased Execution

### Stage 0: Delivery Mode Determination (new mandatory stage)

Goal:

- Determine whether this round's output is `Analysis Package`, `Article - Deep Dive`, or `Article - Repo Overview`.
- If samples are available, extract a style contract (audience, tone, density, evidence presentation, prohibitions); overview/repo tour style samples default toward Repo Overview mode.
- Repo Overview mode focuses on fact density, structural scannability, source evidence, and reading navigation; Deep Dive mode focuses on thesis progression, design tradeoffs, and critical judgment.

Stop conditions:

- Mode is determined and reasons are stated.
- "Delivery modes NOT for this round" are explicitly stated (e.g., this round does not split into 6 template appendices).

### Step 1: Intake

Use `references/prompts/01_repo_intake.md`.

Goal:

- Determine the research subject, project type, and analysis boundaries.
- Record each reference source (local path / GitHub URL / `owner/repo`) and version anchor (branch/tag/commit).
- Remote sources default to `Remote First -> Auto Fallback -> Minimal Clone Fallback` execution, and record remote collection status in intake: `remote attempted` / `remote succeeded` / `fallback triggered` / `blocked`.
- Version anchor must clearly state the source: user-specified, repo default main branch, tag, commit, or unconfirmed.
- Find the 3 to 5 most worthwhile entry points to read first.
- Determine whether to default to `01 -> 02 -> 04` or upgrade to `01 -> 02 -> 03 -> 04`.
- Determine whether context packing, file filtering, or subsystem slicing is needed.
- For large remote repos, first produce a scope strategy, then decide include / ignore / `--compress` / `--split-output`.

Stop conditions:

- Can clearly state this round's scope and deferred scope.
- Can clearly state the project type and basis for judgment.
- Can clearly state each source's version anchor and access constraints (if missing, explicitly note).
- Can clearly state whether the remote link succeeded, whether fallback was triggered, the trigger reason, post-fallback scope, and remaining boundaries.
- The subsequent analysis path is known.

### Step 2: Design Philosophy Brain Dump

Use `references/prompts/02_design_philosophy_brain_dump.md`.

Goal:

- Find the main flow that best reveals the system's philosophy.
- Find the core abstractions and skeleton modules that truly determine the system's shape.
- Distinguish core skeleton, adaptation layer, utility layer, and noise layer.
- Form 2 to 5 verifiable design tradeoff or design principle hypotheses.

Stop conditions:

- A reliable system mental model has been formed.
- Can distinguish system mainline from local complexity.
- Can explain "why the author designed it this way", not just "how the code is organized".

### Step 3: Ecosystem Atlas

Only use `references/prompts/03_ecosystem_atlas.md` for complex ecosystems.

Goal:

- Find key entities, dependencies, data flows, call flows, and deployment boundaries.
- Identify permission boundaries, security boundaries, data ownership, and team boundaries.
- Find ecosystem gravity centers, system-level coupling points, and evolution risks.

Stop conditions:

- Know what the truly critical units of the ecosystem are.
- Know where the complexity is concentrated.
- Know where problems are most likely to emerge first in the future.

### Step 4: Architecture Report

Only `Analysis Package` mode uses `references/prompts/04_architecture_report.md`.

Goal:

- Converge the facts and judgments from prior stages into a formal source code interpretation report.
- Write clearly about project positioning, overall architecture, core modules, key flows, design tradeoffs, risks, and overall assessment.
- Let readers walk away with reusable learning assets, not just a summary.

Stop conditions:

- Clearly explain the problem the system solves.
- Clearly explain at least one main flow.
- Identify true core abstractions and core modules.
- Unpack at least 2 specific design tradeoffs.
- Provide at least 1 honest risk assessment.

### Step 5: Narrative Article (Deep Dive)

Only `Article - Deep Dive` mode uses `references/prompts/05_narrative_article.md`.

Goal:

- Deliver a narrative technical long-form article that can be read/published directly.
- Retain code evidence and path citations, but do not use the template-split document format.
- The main thread must be: problem definition → architecture intent → key mechanisms → design tradeoffs → risk assessment → overall evaluation.

Stop conditions:

- Within the first 3 paragraphs, clearly convey "why this is worth reading".
- At least 1 main flow is thoroughly explained with evidence path support.
- At least 2 tradeoffs have "benefit + cost + boundary".
- At least 1 critical judgment is explicit, not just praise.

### Step 6: Repo Overview Article

Only `Article - Repo Overview` mode uses `references/prompts/06_repo_overview_article.md`.

Goal:

- Deliver a source code repository overview that helps readers quickly build a repo map.
- Prioritize scannability: project positioning, structural navigation, key module table, main flow, Sources index, and next-step reading paths.
- Reduce subjective commentary density; judgment serves navigation, not the article's main thread.

Stop conditions:

- Opening clearly states project positioning and core value.
- Reader can quickly locate key information using structure navigation and module table.
- Main flow carries key file paths, not just textual description.
- Key judgments are traceable via a Sources index.
- Ending provides clear next-step reading paths.

## Output Contract

The goal is not to write more and more analysis, but to output the correct form according to the chosen mode.

### drafts/

Suitable for:

- Scope definition
- System mental model
- Module candidates
- Design principle hypotheses
- Doubts and pending verification judgments

Recommended minimum files:

- `drafts/01-intake.md`
- `drafts/02-design-philosophy-brain-dump.md`
- For complex ecosystems: `drafts/03-ecosystem-overview.md`

### outputs/ (Analysis Package mode)

Recommended files:

- `outputs/ARCHITECTURE_REPORT.md`
- `outputs/DESIGN_PHILOSOPHY.md`
- `outputs/CORE_ABSTRACTIONS.md`
- `outputs/MAIN_FLOW.md`
- `outputs/TRADEOFFS.md`
- `outputs/BORROWABLE_PATTERNS.md`

### outputs/ (Article - Deep Dive mode)

- `outputs/NARRATIVE_ARTICLE.md`
- Optional: `outputs/NARRATIVE_EVIDENCE_INDEX.md`

### outputs/ (Article - Repo Overview mode)

- `outputs/REPO_OVERVIEW_ARTICLE.md`
- Optional: `outputs/REPO_OVERVIEW_SOURCES.md`

If the scope is just a narrow chat analysis, file outputs can be omitted, but the final answer should still include scope description, main flow summary, core abstractions, design tradeoffs, and risk assessment.

## Template Quick Reference

When documents need to be produced, prefer using the real template files in `references/templates/` rather than inventing a second competing structure:

- `references/templates/ARCHITECTURE_REPORT.md`
- `references/templates/DESIGN_PHILOSOPHY.md`
- `references/templates/CORE_ABSTRACTIONS.md`
- `references/templates/MAIN_FLOW.md`
- `references/templates/TRADEOFFS.md`
- `references/templates/BORROWABLE_PATTERNS.md`

These templates each answer different questions:

- Main report explains the system overall and overall judgment
- Design philosophy explains what principles the author repeatedly insists on
- Core abstractions explains what the system's own "language" is
- Main flow explains which path best reveals architectural intent
- Tradeoffs explains benefits, costs, and alternatives
- Borrowable patterns explains what other teams can genuinely take away

Do not write them as different transcription versions of the same long report.

Article - Deep Dive uses:

- `references/templates/NARRATIVE_ARTICLE.md`

Do not forcibly split the article mode back into 6 template appendices.

Article - Repo Overview uses:

- `references/templates/REPO_OVERVIEW_ARTICLE.md`

Do not turn the repo overview into a narrative deep commentary long-form article.

## Sample Quality Anchor

`examples/sample-analysis.md` demonstrates target tone, structure, and judgment strength in a compact example. It is not the one true answer template, but should help maintainers quickly assess:

- Whether the analysis explains `Why > What`
- Whether the main flow genuinely reveals system philosophy
- Whether design tradeoffs have costs written out
- Whether learning appendices have clear distinct responsibilities

## Article Mode Regression Checklist

This checklist is for manually verifying that the two article modes do not drift into each other. After each modification to article-related prompts / templates / routing rules, check against:

### Deep Dive vs. Repo Overview Distinction Check

| Dimension | Deep Dive (pass condition) | Repo Overview (pass condition) |
| --- | --- | --- |
| Opening | Within 3 paragraphs, convey "why worth reading" and state a thesis | Within 3 paragraphs, convey project positioning and core value, without extended commentary |
| Structural scannability | Section progression is natural; continuous narrative paragraphs are acceptable | Has clear information hierarchy (tables/layered lists/short paragraphs); 30 seconds to locate target information |
| Subjective commentary density | High: thesis progression, design tradeoff analysis, critical judgment | Low: judgment only serves navigation understanding; main thread does not run on commentary progression |
| Evidence presentation | Key judgments carry code paths, distributed throughout the text | Key judgments carry code paths, with a centralized Sources index |
| Ending | Provides overall assessment (a judgmental one-liner) | Provides next-step reading paths (specific files/docs/tests) |

### Repo Overview Typical Failure Modes

The following symptoms indicate the repo overview has degraded into a deep dive:

- Opening has 5+ paragraphs of thesis progression before any repo structure information appears
- Missing module table or layered structure navigation; dominated by continuous prose paragraphs
- Heavy use of evaluative language like "breathtaking", "incredibly clever", "beautifully designed"
- No centralized Sources index or evidence paths
- Ending is an overall assessment rather than next-step reading paths

The following symptoms indicate the repo overview is too hollow:

- Only directory rehashing, without design intent explanation for key modules
- Main flow missing key file paths
- All judgments labeled as "inferred" without any source evidence

### Comparison Reference

`docs/test/compound-engineering-工作流如何提升-llm-编码质量-深度解读.md` is a current output sample of the Deep Dive mode, usable as a comparison reference for what the Repo Overview should NOT grow into.

Article mode example outputs (one each for Deep Dive and Repo Overview) are follow-up work; currently `examples/sample-analysis.md` only covers the Analysis Package mode.

## Reference Source & Version Anchor Checklist

For each session involving remote repo input, manually confirm:

1. Does intake record source type (local / URL / `owner/repo`) and version anchor (branch/tag/commit).
2. Does intake record remote collection status: `remote attempted` / `remote succeeded` / `fallback triggered` / `blocked`.
3. Are access constraints explicitly stated (publicly readable, insufficient permissions, network restricted), with distinction between "remote link failed, can fallback" and "repo read access unavailable, must block".
4. For multi-repo input, is the inspiration scope recorded per repo (primary reference / comparative reference / boundary case).
5. Does the Deep Dive article body incorporate sources and anchors into the analysis subject description, rather than omitting them as "some open source repo".

## Context Packing Usage Principles

Context packing tools are context preparation tools, not analysis tools.

Suitable for:

- The repo is large and direct reading costs are high.
- Curated materials need to be handed to a model with a weaker context window.
- An AI-friendly material file needs to be retained offline.

Not recommended to start with:

- The repo is not large; direct `rg`, `ls`, `sed` is faster.
- Core entry points and main flows have not yet been identified.
- What's really needed is design judgment, not context transport.

Correct order:

1. Intake first.
2. Determine the most worthwhile entry points and main flows to study.
3. Then decide whether to do context packing, which files to filter, and whether to compress.

Remote repo supplement:

- URL or shorthand input defaults to `--remote` first (Remote First), not clone first.
- branch/tag/commit defaults to using `--remote-branch` to record version anchor; when absent, use the repo's default main branch or the user-context explicit branch as anchor, and note the source.
- When remote fails (packing failed, remote auth failed, archive download failed and unrecoverable) and the repo is still readable, auto-fallback to minimal clone.
- When remote succeeds but evidence is insufficient (key files missing, token/packing constraints causing core fragment loss, unable to establish source-path-to-conclusion evidence chain), auto-fallback to minimal clone.
- When repo read access itself is unavailable, must mark as `blocked`; do not promise clone can recover.
- Fallback defaults to shallow clone with key paths prioritized, progressively expanding scope based on evidence gaps; do not enter full history audit.

`repomix` parameter highlights (current default path):

- `--include` / `--ignore`: control file scope
- `--stdin`: read file list from stdin, process these files directly
- `--token-count-tree`: output token distribution only, no pack file produced
- `--split-output <size>`: split into multiple numbered output files by size
- `--compress`: extract code structure better suited for analysis, not output a gzip file
- `-o` / `--output`: specify output path; default filename is `repomix-output.xml`
- `--token-count-encoding <encoding>`: default is `o200k_base`; only override explicitly when compatibility with another tokenizer is needed

## Maintenance Rules

1. Do not add or restore a second overlapping repo research skill, and do not re-introduce local packing CLI as the main path.
2. Any path, template, and output adjustments should be uniformly made here and in `references/prompts/`, `references/templates/`.
3. If compatibility with old names or old output names is needed, explicitly mark as historical compatibility; do not let it continue serving as the default story.
