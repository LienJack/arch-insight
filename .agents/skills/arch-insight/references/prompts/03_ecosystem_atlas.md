# 03 Ecosystem Atlas Ultimate Prompt

You are now entering the ecosystem-level analysis stage. Note: this is NOT the default path. It is an advanced extension layer enabled only when intake has already determined that "a single-repo perspective is insufficient to explain the system".

Your task is no longer to explain a single repository, but to act like a platform architect, technical due diligence lead, or system map designer — figuring out how multiple repositories, multiple services, multiple packages, and multiple infrastructure units actually collaborate, couple, release, extend, and lose control.

Your goal is not to list entities, but to explain:

> What is the real structure of this ecosystem, where is the complexity concentrated, and where are problems most likely to emerge first in the future.

---

## Input Contract You Must Inherit Before Entering This Stage

First inherit what has been confirmed in prior stages:

1. `01_repo_intake` sources, version anchors, access constraints, and coverage boundaries
2. `02_design_philosophy_brain_dump` identified core modules, key boundaries, and pending verification hypotheses
3. Which areas are currently confirmed, which still lack sufficient evidence

Do not write the ecosystem analysis as "reintroducing the system from scratch". It is a perspective upgrade atop the single-repo mental model.

---

## Prerequisites

Only enter this layer in the following scenarios:

- There are multiple key packages / apps / services in a monorepo
- The single repo internally already contains clear multi-system boundaries
- Need to assess deployment boundaries, data boundaries, security boundaries, or team boundaries
- The single-repo main report can no longer independently explain the source of complexity

If the single-repo main flow already sufficiently explains the system shape, do not enable this stage by default just to be "more complete".

---

## Your Stage Goals

1. List key entities in the code ecosystem
2. Find responsibility boundaries between entities
3. Map out dependency flows, call flows, and data flows
4. Find permission boundaries, security boundaries, deployment boundaries, and data boundaries
5. Find gravity centers in the ecosystem
6. Find system-level coupling points, tech debt, and future evolution risks

---

## Core Principles

1. Directory structure ≠ system boundary.
2. Package boundary ≠ runtime boundary.
3. Deployment units, data ownership, and permission boundaries often explain real architecture better than code directories.
4. Ecosystem-level complexity is typically not evenly distributed — it concentrates in a few gravity centers.
5. This step is not supplementary information, but a perspective upgrade.

---

## Evidence Contract (New Mandatory)

Key relationships in the ecosystem analysis must land on concrete evidence wherever possible, not stay at naming guesses.

### Minimum Evidence Requirements

- For key entities, wherever possible give specific paths
- For key dependencies, wherever possible point out call sites, import points, registration points, config points, or schema connection points
- For key cross-boundary links, wherever possible give a specific path chain of "start → relay → landing point"

### Judgment Labels

- `Fact`: directly visible in code, config, deployment files, docs
- `Inference`: relationships derived from naming, structure, and multi-point evidence
- `Pending Verification`: lacking sufficient evidence, should not be written as a conclusion

Especially, do not treat "code organization boundaries" directly as "deployment boundaries".

---

## Boundaries You Must Pay Special Attention To

### 1. Permission Boundaries

- Where authentication happens
- Where authorization happens
- Who holds permission rules

### 2. Data Boundaries

- Who owns core data
- Where data is generated, transformed, landed
- Whether data ownership is ambiguous

### 3. Deployment Boundaries

- Which are independent deployment units
- Which are merely code organization boundaries
- Whether build and release reflect real system boundaries

### 4. Team Boundaries

If discernible from the code, try to judge:

- Which boundaries seem divided by team responsibilities
- Which boundaries seem like historical compromises
- Whether organizational boundaries and code boundaries are misaligned

---

## You Must Search for "Ecosystem Gravity Centers"

Identify the following types of centers:

- Globally shared packages
- Platform-type foundational services
- Control plane systems
- Global configuration or shared schemas
- Central modules where one change ripples to many repos

Then judge which category each falls into:

1. **Healthy center**
   It was meant to be a system pillar.

2. **Dangerous center**
   It was not a design-target skeleton, but has become bound by more and more modules through historical evolution.

---

## You Must Supplement One Cross-Boundary Main Chain

Select at least one most important cross-boundary link and explicitly write out:

1. Starting entity and trigger condition
2. Key modules / services / packages passed through
3. How data or control crosses boundaries
4. Where the final landing point is
5. Which segment is most fragile, and why

If you cannot land on specific paths or interfaces, you must label as `Inference` or `Pending Verification`.

---

## What You Must Output

### 1. Ecosystem Overview

In 1 to 3 paragraphs explain:

- What layers and key units compose this system
- What its overall structure is more like
- Why the single-repo perspective is no longer sufficient

### 2. Key Entity Inventory

List truly important entities by category, and explain their roles.

### 3. Dependency Relationship Summary

Point out who depends on whom, which dependencies are healthy, which are dangerous.

### 4. Data / Call Main Chain

Describe one most important cross-boundary link, and wherever possible attach key path / interface / config evidence.

### 5. Ecosystem Gravity Centers

Point out which entities have abnormally high importance, and judge their health.

### 6. Risks & Tech Debt

Explicitly point out the heaviest coupling points, most fragile boundaries, and areas most likely to become future bottlenecks.

---

## Recommended Output Format

### Ecosystem Overview

`<1-3 paragraphs>`

### Key Entities

| Entity | Type | Responsibility | Boundary Status | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### Dependency Relationship Summary

- `<Dependency 1>`
- `<Dependency 2>`
- `<Dependency 3>`

### Data / Call Main Chain

`<one key cross-boundary link>`

- Key evidence:
- Label: `Fact / Inference / Pending Verification`

### Ecosystem Gravity Centers

1. `<Center A>`: why it's a center, healthy or dangerous
2. `<Center B>`: why it's a center, healthy or dangerous

### Risks & Evolution Judgment

1. `<Risk 1>`
2. `<Risk 2>`
3. `<Risk 3>`

---

## Mandatory Constraints

Do NOT do the following:

- Copy the directory tree and call it an ecosystem map
- Only say "there are many services"
- Only draw diagrams without making judgments
- Only talk about entities without talking about relationships
- Only talk about dependencies without talking about data ownership and deployment boundaries
- Equate package boundaries directly with runtime boundaries
- Fail to provide concrete evidence for cross-boundary main chains

The value of ecosystem analysis is not "more information", but "clearly explaining the real structure and gravity centers of a complex system".
