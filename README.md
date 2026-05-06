<p align="center">
  <img src="assets/logo.svg" alt="arch-insight logo" width="180">
</p>

# Arch Insight

[English](README.md) | [中文](docs/README.zh-CN.md) | [日本語](docs/README.ja.md)

A Agent Skill that turns source repositories into **design judgment** — not rewriting docs, but distilling design philosophy.

Use it to study other people's projects: quickly understand design intent, extract borrowable patterns, and see tradeoffs clearly. And you don't need to re-scan the entire repo in every new conversation.

## Why This Skill Exists

Using LLMs to analyze other people's codebases typically runs into these problems:

- **Token waste** — scanning the whole repo each time burns through context fast
- **Repeated work** — every new conversation starts from zero, re-scanning code you've already read
- **Shallow analysis** — you get module lists and flowcharts, but no design reasoning or code evidence
- **Style mismatch** — the AI's default writing style is nothing like yours
- **No guidance** — you don't know what to ask the AI to analyze, and the AI doesn't know what to look for

`arch-insight` solves these through phased intake, focused context packing, style alignment, and prompts that push for judgment rather than restatement.

## When to Use

- Studying an open-source project to understand its **design intent**, not just file structure
- Judging which patterns are borrowable and which to avoid, for your own project design
- Generating structured architecture reports for team onboarding or knowledge archiving
- Writing a technical deep-dive article grounded in source code evidence
- Creating a repo overview to quickly build a reading map
- Comparing design approaches across multiple reference repos

## When Not to Use

- Explaining a single file or debugging
- Routine code review
- Just drawing call graphs without caring about design philosophy
- Full-architecture code mapping or exhaustive function analysis

## Installation

### Recommended (interactive)

```bash
npx arch-insight install-release
```

### Platform-specific (non-interactive / CI)

```bash
npx arch-insight install-release --platform codex --platform claude
```

### Update

```bash
npx arch-insight update --platform codex
```

| Platform    | Install Path                                  |
| ----------- | --------------------------------------------- |
| Claude Code | Auto marketplace registration                 |
| Codex       | `~/.codex/skills/arch-insight/`               |
| Gemini      | `~/.gemini/skills/arch-insight/`              |
| OpenCode    | `~/.config/opencode/skills/arch-insight/`     |
| Pi          | `~/.pi/agent/skills/arch-insight/`            |
| Kiro        | `~/.kiro/skills/arch-insight/`                |
| Cursor      | `~/.cursor/plugins/local/arch-insight/`       |

Restart the respective platform after installation.

## Usage

**Explicit invocation:**

```txt
Use the arch-insight skill to analyze this repository and generate architecture documentation.
```

**Natural language invocation:**

```txt
Study the core abstractions and design tradeoffs of this project — I want to reference it for my own architecture design.
```

```txt
Generate a narrative article about the architecture of this codebase.
```

```txt
Give me a source code overview of this repo — I want to quickly build a reading map.
```

The Skill auto-detects output format from your wording:

- "blog style" / "publishable long-form" / "like that article" → **Narrative Article**
- "overview" / "repo tour" / "source map" → **Repo Overview**
- "main report + appendices" / "template output" → **Analysis Package**
- Unclear → minimal inference, will not default to Analysis Package

## Outputs

### Analysis Package

| File                       | What It Answers                                |
| -------------------------- | ---------------------------------------------- |
| `ARCHITECTURE_REPORT.md`   | System overview and overall assessment         |
| `DESIGN_PHILOSOPHY.md`     | What design principles the author insists on   |
| `CORE_ABSTRACTIONS.md`     | What the system's "language" is                |
| `MAIN_FLOW.md`             | Which path best reveals architectural intent   |
| `TRADEOFFS.md`             | Benefits, costs, alternatives, and boundaries  |
| `BORROWABLE_PATTERNS.md`   | What other teams can genuinely take away       |

### Article Modes

- **Narrative Article** → single `NARRATIVE_ARTICLE.md` — opinionated, design-focused, considers migration cost
- **Repo Overview** → single `REPO_OVERVIEW_ARTICLE.md` — fact-dense, scannable, with source paths and reading navigation

## Workflow

The Skill follows a phased pipeline:

### Analysis Package

1. **Repo Intake** — determine scope, project type, source and version anchors
2. **Design Philosophy Brain Dump** — system mental model, core abstractions, design principle hypotheses
3. **Ecosystem Atlas** *(on demand)* — only for monorepo / multi-service / platform scenarios
4. **Architecture Report** — main report + 5 learning appendices

### Narrative Article

1. **Repo Intake**
2. **Design Philosophy Brain Dump**
3. **Narrative Article** — single long-form piece with opinions, design lessons, and migration assessment

### Repo Overview

1. **Repo Intake**
2. **Design Philosophy Brain Dump**
3. **Repo Overview Article** — fact-dense, clearly structured, scannable, with source paths and reading navigation

When a style sample is provided, the Agent establishes a **Style Contract** (audience, tone, structural density, evidence format, prohibitions) before writing. The contract takes priority over template defaults.

## Design Principles

- **Why before What** — understand the problem before explaining the structure
- **Main flow over directory tree** — defining paths are more valuable than folder layouts
- **Core abstractions before implementation details** — identify the language before reading the grammar
- **Evidence first** — every judgment cites a code path
- **Honest about tradeoffs** — every design conclusion covers benefits, costs, alternatives, and boundaries
- **Output makes people smarter, not longer** — readers learn something, not just see more words
- **Focus, don't exhaust** — design philosophy and borrowable patterns over full-architecture code mapping

## Limitations

- Large monorepos may require focusing analysis on key directories
- Runtime behavior (concurrency models, actual data flows) needs logs, tests, or tracing — pure static analysis is insufficient
- Dynamic imports, reflection, code generation, and framework magic reduce analysis accuracy
- Generated reports should be reviewed by project maintainers
- Multi-repo input defaults to comparative design reference, not full ecosystem audit

## Directory Structure

```txt
.agents/
├── plugin.json
└── skills/arch-insight/
    ├── SKILL.md                   # Skill entry point (for Agent consumption)
    ├── references/
    │   ├── RUNNER.md              # Execution manual and output contract
    │   ├── prompts/               # Phased analysis prompts
    │   └── templates/             # Report and appendix templates
    └── examples/
```
[![Star History](https://api.star-history.com/svg?repos=LienJack/arch-insight&type=Date)](https://star-history.com/#LienJack/arch-insight&Date)

## License

MIT
