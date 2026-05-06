# 05 Narrative Article Prompt

What you are about to deliver is a "directly readable and publishable" technical narrative article, not a templated analysis package.

## Input Contract You Must Inherit Before Entering This Stage

First inherit prior stage conclusions, then reorganize narratively:

1. `01_repo_intake` research scope, sources, version anchors, and deferred areas
2. `02_design_philosophy_brain_dump` core mechanisms, main flow, core modules, and pending verification hypotheses
3. If `03_ecosystem_atlas` was enabled, also inherit cross-boundary relationships and system-level risks

The article may reorganize the narrative, but must not lose this boundary information.

## Stage Goals

1. Use the opening 2-4 paragraphs to explain "why this repo is worth reading".
2. Provide a clear main thread: problem definition → architecture intent → key mechanisms → design tradeoffs → design reference & migration assessment → risk assessment → overall evaluation.
3. Support key judgments with real code paths, but avoid directory rehashing and file-by-file explanation.
4. Maintain critical thinking: point out at least 1-3 real risks or boundary conditions; don't portray reference projects as one-directional positive examples.
5. Explicitly produce borrowable design points, and explain applicable conditions, inapplicable scenarios, and migration notes.
6. For multi-repo input, form comparative conclusions of "common patterns + divergent choices + applicable contexts + local inspiration scope", not a concatenation of multiple single-repo summaries.

## Mandatory Constraints

- Do NOT output a "main report + five appendices" structure.
- Do NOT write as a checklist or template fill-in-the-blank.
- Do NOT re-read code in directory tree order.
- Do NOT only praise — must include costs and boundaries.
- Do NOT turn the deep dive into a repo overview (repo map / module listing / Sources-list-dominated).

## Style Contract (Confirm Before Writing)

Form and adhere to the following before writing the body:

- Audience: engineers / TLs / architects
- Tone: restrained, clear, has judgment
- Density: each section has a thesis; no jargon stacking
- Evidence: key judgments carry code paths
- Important flows, interfaces, state boundaries prioritize `path:line`-level evidence
- Prohibitions: template-speak, stream-of-consciousness, README rewriting
- For multi-repo input, supplement: each repo's source and version anchor (local path / URL / `owner/repo` + branch/tag/commit)

## Evidence & Judgment Boundaries

This is an article, but that's not an excuse to shed evidence. Please adhere to:

- Key judgments should wherever possible bind to real code paths
- Conclusions induced from multiple facts should be labeled as `Inference`
- Questions where current evidence is insufficient but worth retaining should be labeled as `Pending Verification`
- Don't build "article flow smoothness" on top of "evidence being omitted"

## Recommended Structure

1. Opening: why this project is worth studying
2. Project's real positioning (not the official slogan)
3. Architecture mainline & control flow
4. The most important 2-5 mechanisms
5. Design tradeoffs (benefit/cost/boundary)
6. Design reference & migration assessment (borrowable points + applicable boundaries)
7. Risks & improvement suggestions
8. Overall assessment (one forceful conclusion)

For each of "the most important 2-5 mechanisms", wherever possible supplement:

1. What key data structures / state / config it depends on
2. What its position is in the main flow
3. Why it was placed here
4. How it collaborates with other modules

The design reference & migration assessment section at minimum covers:

1. What problem this design point solves
2. Why it's worth referencing
3. What project contexts it suits
4. What scenarios it's NOT recommended to copy
5. What to prioritize verifying during migration

## Quality Gates

Self-check before submission:

1. Does the opening answer "why worth reading"?
2. Is at least one main flow thoroughly explained?
3. Are there at least 2 tradeoff analyses?
4. Are there at least 2 borrowable design points with applicable and inapplicable boundaries stated?
5. For multi-repo input, are comparative conclusions formed (common patterns / divergent choices / applicable contexts)?
6. Is there at least 1 critical judgment?
7. Does every important judgment have path evidence?
8. For key mechanisms, are "data structures / flow position / design motivation / collaboration contracts" explained?

## Output Requirements

- Default output: `outputs/NARRATIVE_ARTICLE.md`
- Optional appendix: `outputs/NARRATIVE_EVIDENCE_INDEX.md`
