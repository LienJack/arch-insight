# 06 Repo Overview Article Prompt

What you are about to deliver is a "source code overview" article that helps readers quickly build a repository map, not a narrative deep commentary.

## Input Contract You Must Inherit Before Entering This Stage

The source code overview must also inherit prior stage conclusions, not browse through directories afresh:

1. `01_repo_intake` research scope, sources, version anchors, and deferred areas
2. `02_design_philosophy_brain_dump` core modules, main flow, key boundaries
3. If `03_ecosystem_atlas` was enabled, supplement key cross-boundary relationships and risk notes

The overview article's emphasis is "helping readers quickly orient", not cancelling prior analysis results.

## Stage Goals

1. Use a concise opening to explain project positioning, core value, and applicable scenarios.
2. Provide scannable repo structure navigation: directory layering, key module table, main flow explanation.
3. Every important judgment must carry source code path or document evidence.
4. End with clear next-step reading paths.

## Mandatory Constraints

- Do NOT output a "main report + five appendices" structure.
- Do NOT write long thesis progressions or continuous expressive commentary.
- Do NOT re-read code in directory tree order; only annotate truly critical paths.
- Do NOT have judgments without evidence; judgments that cannot find source evidence should be labeled as inference or directly omitted.

## Module Identification Requirements (New Mandatory)

Do not treat "module = top-level directory" as the default premise. Before writing key modules, first slice through these lenses:

1. Business function
2. Data flow stages
3. Responsibility change boundaries

The "key modules" that ultimately enter the overview should be responsibility units that help readers quickly build a mental model, not a raw directory listing.

## Style Contract (Confirm Before Writing)

Form and adhere to the following before writing the body:

- Audience: engineers / people who want to quickly understand the repo
- Tone: overview-style, fact-first, clear and restrained
- Density: information-dense but scannable (use tables, layered lists, short paragraphs)
- Evidence: key judgments carry source code paths, concentrated in a Sources section or inline annotations
- Main flow and key modules prioritize `path:line`-level evidence
- Prohibitions: long commentary arcs, evidence-free judgments, directory dumps, story-style headline threading

## Evidence & Judgment Boundaries

Please clearly distinguish:

- `Fact`: directly verifiable from source code / docs / config
- `Inference`: induced from multiple clues
- `Pending Verification`: current evidence insufficient, should not be written as a conclusion

For key modules and the main flow, prioritize giving real paths, preferably with line numbers.

## Recommended Structure

1. **Project Positioning** (2-4 paragraphs): what this repo is, what problem it solves, where its core value lies
2. **Repo Structure Navigation**: directory tree layered explanation (only list key directories/files, annotate responsibilities)
3. **Key Modules** (table): module name, responsibility, entry file, key data structures, dependencies, evidence
4. **Main Flow**: complete chain from entry to output, annotate key files, call relationships, and data/state changes at each step
5. **Design Notes** (optional, restrained): only write design choices that truly affect understanding; don't expand commentary
6. **Sources & Evidence Index**: centrally list source code path evidence for all key judgments in the text
7. **Next-Step Reading Paths**: what the reader should read next after this overview (files, docs, tests)

## Quality Gates

Self-check before submission:

1. Does the opening quickly tell the reader "what this repo is and whether it's worth reading"?
2. Can the reader locate target information within 30 seconds using the structure navigation and module table?
3. Does the main flow carry key file paths, not just textual description?
4. Are key judgments traceable via a Sources index?
5. Are long commentary and narrative-driven progression avoided?
6. Does the ending provide clear next-step reading paths?
7. Are key modules not a simple directory dump but the result of responsibility slicing?

## Output Requirements

- Default output: `outputs/REPO_OVERVIEW_ARTICLE.md`
- Optional appendix: `outputs/REPO_OVERVIEW_SOURCES.md`
