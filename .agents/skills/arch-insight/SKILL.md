---
name: arch-insight
description: "Use when systematically studying one or more reference repositories to extract design philosophy, core abstractions, main flows, design tradeoffs, and borrowable patterns."
---

# arch-insight

An analysis skill for "source code philosophy interpretation & design reference assessment." It combines `repomix` context preparation, phased mental-model exploration, ecosystem-level expansion perspectives, and narrative architecture report styling into a research path suitable for team engineers to reuse.

## Output Language Detection (Mandatory)

Before any analysis begins, determine the output language based on the user's input language:

1. **User writes in Chinese** → Output all documents in Simplified Chinese (zh-CN)
2. **User writes in English** → Output all documents in English
3. **User writes in Japanese** → Output all documents in Japanese
4. **Unclear / mixed / ambiguous** → Ask the user: "Which language would you like the output in? (English / 中文 / 日本語)"

This applies to ALL output: reports, articles, templates, drafts, and inline responses. Do NOT default to any language — always detect from user input or ask explicitly.

Supported output languages: English, Simplified Chinese (zh-CN), Japanese.

## Delivery Mode Determination (Mandatory)

Before any analysis begins, determine which delivery mode the user wants. Do not skip:

1. `Analysis Package` (main report + 5 appendices)
2. `Article - Deep Dive` (single narrative long-form article, opinionated, emphasizes design lessons & migration assessment)
3. `Article - Repo Overview` (repository guide, fact-dense, scannable structure)

Decision rules:

- User mentions "like that article", "blog style", "publishable long-form", "opinion piece", "no template pack" → default to `Article - Deep Dive`.
- User mentions "I want to reference this project for my own architecture design", "where can this design be borrowed, where can't it", "help me assess migration" → default to `Article - Deep Dive`.
- User mentions "overview", "repo tour", "source map", "repository guide", or provides an overview-style sample link → default to `Article - Repo Overview`.
- User explicitly mentions "main report + appendices", "template output", "split documents" → default to `Analysis Package`.
- When unclear, make a minimal inference from the user's wording. Do not default to Analysis Package.

## Style Alignment Gate (Mandatory)

If the user provides a style sample (link, title, screenshot, paragraph), form a `Style Contract` before writing:

- Who is the audience (engineers/architects/team)
- Tone (restrained, critical, pedagogical, narrative-driven / overview-style, fact-first)
- Structural density (section granularity, diagram-to-text ratio, whether tables are kept)
- Evidence presentation (in-text path references, footnotes, appendix / source path annotations, Sources section)
- Prohibitions (template-speak, stream-of-consciousness, table-of-contents rehashing / long commentary arcs, evidence-free judgments, wrong-language output)

If the Style Contract conflicts with default templates, the Style Contract takes priority.

For Repo Overview mode, the default Style Contract direction should lean toward: fact-dense, scannable structure (tables/layered trees), source path evidence, next-step reading navigation — not narrative long commentary.

## When to Use

- User wants to study why a repository was designed a certain way, not just how the code is written.
- User wants to treat one or more reference repos as "design reference for my own project", assessing which patterns are borrowable, under what conditions, and with what migration risks.
- User wants to extract borrowable abstractions, patterns, main flows, and tradeoffs from open-source or internal projects.
- User wants source code onboarding, design review, learning-oriented architecture interpretation, or formal analysis reports.
- User wants a repository overview / source guide to quickly build a mental map and reading path.

Not suitable for:

- Single file explanation, general error diagnosis, code review, simple function walkthrough.
- Do NOT default to ecosystem-level deep investigation; multi-repo input in this skill defaults to "comparative design reference", not automatic upgrade to ecosystem consulting.

## Shortest Path

Read `references/RUNNER.md` first, then choose the path based on delivery mode:

### A. Analysis Package (default technical research path)

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/04_architecture_report.md`

If intake determines this is a monorepo, multi-service, or platform ecosystem, add:

4. `references/prompts/03_ecosystem_atlas.md`

### B. Article - Deep Dive (narrative long-form path)

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/05_narrative_article.md`

For complex ecosystems, insert between 2 and 3:

4. `references/prompts/03_ecosystem_atlas.md`

### C. Article - Repo Overview (repository guide path)

1. `references/prompts/01_repo_intake.md`
2. `references/prompts/02_design_philosophy_brain_dump.md`
3. `references/prompts/06_repo_overview_article.md`

For complex ecosystems, insert between 2 and 3:

4. `references/prompts/03_ecosystem_atlas.md`

## What You Will Deliver

`Analysis Package` default outputs:

- One main report: `references/templates/ARCHITECTURE_REPORT.md`
- A set of learning appendices:
  - `references/templates/DESIGN_PHILOSOPHY.md`
  - `references/templates/CORE_ABSTRACTIONS.md`
  - `references/templates/MAIN_FLOW.md`
  - `references/templates/TRADEOFFS.md`
  - `references/templates/BORROWABLE_PATTERNS.md`

`Article - Deep Dive` default outputs:

- One standalone article: `references/templates/NARRATIVE_ARTICLE.md`
- Optional appendix: evidence path index (not required to be split out)

`Article - Repo Overview` default outputs:

- One standalone article: `references/templates/REPO_OVERVIEW_ARTICLE.md`
- Optional appendix: Sources & evidence path index (not required to be split out)

## Core Principles

1. Understand what problem the author was solving before explaining how the code is organized.
2. Find the main flow that best reveals the system's philosophy before looking at the directory tree.
3. Identify core abstractions and boundaries before discussing implementation details.
4. Provide code path evidence for every important judgment.
5. For every design conclusion, address benefit, cost, alternatives, and boundaries.
6. Treat context packing tools as context preparation means, not analysis substitutes.
7. Reports should teach the reader something, not just rewrite the README at greater length.

## Codex Usage Recommendations

- Prefer `rg`, `ls`, `sed`, and close reading of key files to establish facts.
- Determine delivery mode first, then organize materials; do not produce a template pack and then "rewrite" it into a long-form article.
- For large repositories, do intake and file filtering first, then decide if context packing is needed.
- When using `repomix`, prefer "small-step filtering":
  1. First check token distribution tree: `npx repomix@latest --token-count-tree ...`
  2. Use include / ignore or stdin to select files: `--include` / `--ignore` / `--stdin`
  3. Then decide whether to compress or split output: `--compress` / `--split-output`
- GitHub URL / `owner/repo` input defaults to `Remote First`, and record status in intake: `remote attempted` / `remote succeeded` / `fallback triggered` / `blocked`.
- When remote fails or evidence is insufficient, fallback to minimal shallow clone (`--depth=1` + key paths first); mark `blocked` when repo read access is unavailable.
- Do not default to using subagents; only delegate when the user explicitly requests it.
- Use real paths, real abstraction names, and real call relationships in output. Avoid vague judgments.
- Reference sources support local paths, GitHub URLs, `owner/repo` shorthand, branch, tag, commit; intake must record source and version anchor.
