<div align="center">

# RightHand

**Specialist agent personas and multi-agent orchestration engine for Herdr workspaces across coding harnesses.**  
*Adapted from Addy Osmani's [agent-skills](https://github.com/addyosmani/agent-skills) architectural patterns.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@agirahman/righthand.svg)](https://www.npmjs.com/package/@agirahman/righthand)
[![Command Code](https://img.shields.io/badge/Command%20Code-Mod-purple.svg)](https://commandcode.ai/)
[![Herdr](https://img.shields.io/badge/Orchestration-Herdr-orange.svg)](https://herdr.dev/)

</div>

---

## Overview

`righthand` acts as your executive second-in-command for multi-agent workflows in [Herdr](https://herdr.dev/). It provides a modular persona engine and curated specialist roles designed for autonomous pair-programming, ticket-driven delegation, and workspace isolation across coding harnesses.

Instead of treating an AI agent as a generic monolith, RightHand injects targeted personas via Command Code's `appendSystemPrompt` hook. Each persona maintains a single perspective, follows rigid output standards, and operates with clear execution boundaries.

### Architectural Principles

This mod focuses on targeted persona injection and workspace isolation:

- **Single-Perspective Personas**: Each persona embodies a specialized engineering role with a clear evaluation lens, rigid output format, and strict execution boundaries.
- **No Recursive Persona Invocations**: Personas do not invoke other personas at runtime. Multi-agent coordination occurs at the user or orchestrator level across Herdr tabs.
- **Ticket & Worktree Isolation**: Sub-agents communicate through explicit tickets, structured reports, and isolated git worktrees rather than unstructured shared state.

> [!IMPORTANT]
> **Personas do not invoke other personas.** Orchestration occurs at the user or orchestrator level via Herdr tabs. Sub-agents communicate through tickets, reports, and isolated git worktrees rather than recursive runtime calls.

---

## Persona Catalog

The catalog combines developer team roles with Addy Osmani's specialized audit personas:

| Profile | Mode | Role Title | Core Focus | Output Framework / Deliverable |
|---|---|---|---|---|
| `orchestrator` | `readonly` | Team Orchestrator | Decomposing tasks into tickets (`T1`, `T2`), worktree lane assignment, Herdr tab dispatch | Ticket contract matrix, worktree plan, merge checklist |
| `product-manager` | `readonly` | Product Manager | Clarifying ambiguities (min. 2 questions), scoping features, drafting acceptance criteria | Product Spec (Problem statement, User stories, AC, Out-of-scope) |
| `architect` | `readonly` | Software Architect | Module boundaries, coupling reduction, subsystem contracts, tradeoff analysis | Architecture Decision Record (ADR) + System boundary diagram |
| `worker` | `writer` | General Worker | General-purpose tasks: CLI tools, build automation, data migrations, glue code | Status report, minimal file diff, verification proof |
| `backend` | `writer` | Backend Engineer | API contracts, database queries/migrations, server-side trust boundaries | API diff, automated test assertions, migration idempotency proof |
| `frontend` | `writer` | Frontend Engineer | Semantic HTML, CSS-first layout, state colocation, responsive UX, accessibility (a11y) | Component diff, keyboard/screen-reader audit, visual check proof |
| `editor` | `writer` | Video & Motion Editor | Programmatic animation, HyperFrames HTML-to-video timeline sync, motion design, rendering | Video diff, check validation proof, snapshot/render deliverables |
| `devops` | `writer` | DevOps Engineer | Deterministic CI/CD pipelines, Docker containerization, secrets hygiene, rollbacks | Pipeline/container diff, reproducibility checklist, build verification |
| `code-reviewer` | `readonly` | Senior Code Reviewer | Multi-dimensional evaluation across 5 engineering axes | 5-axis review report (P1–P4 severity) anchored to `file:line` |
| `security-auditor` | `readonly` | Security Auditor | Vulnerability discovery, OWASP Top 10 compliance, sanitization, threat modeling | Threat matrix (Critical–Low) + actionable remediation snippets |
| `test-engineer` | `readonly` | Test Engineer | Testing pyramid strategy, coverage gap analysis, edge-case matrices, Prove-It bug verification | Test matrix (Unit/Integration/E2E), reproduction and regression cases |
| `web-performance-auditor` | `readonly` | Web Performance Auditor | Core Web Vitals (LCP, INP, CLS), asset budgets, main-thread bottleneck elimination | Performance scorecard (Quick/Deep mode) + priority optimizations |

---

## Installation

### 1. Via Command Code CLI (Recommended)

Install directly from npm across your environment:

```bash
# Install globally for all projects (user scope)
cmdc mods add -g @agirahman/righthand

# Or install for the current project only
cmdc mods add @agirahman/righthand
```

### 2. Manual Global Installation (User Level)

Alternatively, copy the files manually into your user configuration (`~/.commandcode/`):

#### Windows (PowerShell)

```powershell
# Create destination directories
New-Item -ItemType Directory -Force "$HOME\.commandcode\mods"
New-Item -ItemType Directory -Force "$HOME\.commandcode\profiles"

# Copy mod engine and profile files
Copy-Item ".\mods\righthand.ts" "$HOME\.commandcode\mods\righthand.ts" -Force
Copy-Item ".\profiles\*.md" "$HOME\.commandcode\profiles\" -Force
```

#### macOS / Linux (POSIX sh)

```bash
# Create destination directories
mkdir -p ~/.commandcode/mods ~/.commandcode/profiles

# Copy mod engine and profile files
cp ./mods/righthand.ts ~/.commandcode/mods/righthand.ts
cp ./profiles/*.md ~/.commandcode/profiles/
```

### Local Project Overrides

To customize or extend profiles for a specific codebase, place markdown profile files in:
- `<project-root>/.commandcode/profiles/*.md`
- `<project-root>/profiles/*.md`

The mod loads project-level profiles with precedence over global user-level profiles.

---

## Usage in Command Code

### Slash Commands

Once installed, use `/righthand` (or its alias `/profile`) within any Command Code session:

```bash
# Launch interactive fuzzy picker
/righthand
# (or /profile)

# Switch directly to a persona
/righthand backend
/righthand code-reviewer
/righthand orchestrator

# Display all available personas with detailed roles and Herdr tabs
/righthand list

# Deactivate the current persona and restore default behavior
/righthand off
```

### Session Startup Flag

You can initialize a Command Code session with a persona pre-selected:

```bash
cmdc --mod-option default=backend
```

---

## Herdr Multi-Agent Orchestration

[Herdr](https://herdr.dev/) is an orchestration platform and multi-agent workspace manager that allows developers to run, supervise, and coordinate multiple AI coding agents in parallel tabs across dedicated workspaces.

### Worktree Isolation for Writer Personas

To prevent conflicts when multiple agents work in parallel within the same repository, writer roles (`backend`, `frontend`, `editor`, `devops`, `worker`) must operate in dedicated, ticket-prefixed git worktrees:

```bash
# Worktree format: wt/<ticket-id>-<slug>
git worktree add "wt/T1-integration-backend" -b "T1-integration-backend"
```

Readonly roles (`orchestrator`, `architect`, `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`, `product-manager`) inspect the main working tree directly without spawning worktree branches.

### Automated Tab Spawning

Helper scripts automate creating Herdr workspace tabs and provisioning ticket worktrees:

#### PowerShell Helper (`scripts/herdr-spawn.ps1`)

```powershell
.\scripts\herdr-spawn.ps1 -Workspace "w1" -Role "backend" -Ticket "T1" -Description "auth-api"
```

#### Bash Helper (`scripts/herdr-spawn.sh`)

```bash
./scripts/herdr-spawn.sh w1 backend T1 auth-api
```

The script performs the following sequence:
1. Validates the persona mode (`writer` vs `readonly`).
2. Generates an isolated git branch and worktree at `wt/T1-auth-api` for writer roles.
3. Invokes `herdr tab create --workspace w1 --label backend-T1`.
4. Outputs the exact command to launch Command Code in the target tab.

> [!TIP]
> Use `orchestrator` as the lead agent in your main Herdr tab. When you submit a feature request, the orchestrator outputs an atomic ticket table (`T1`, `T2`, `T3`, ...) and delegates tasks across worker tabs.

---

## Validation & Quality Assurance

Ensure TypeScript types and persona definitions pass integrity checks:

```bash
# Validate frontmatter keys, schema conformity, and composition blocks
npm test

# Verify TypeScript compilation of the mod engine
npm run typecheck
```

---

# RightHand — Cross-harness Availability (Phase 1)

## Command Code (runtime switch)

On Command Code, `/righthand <persona>` switches the active persona for the whole session; the mod in `mods/righthand.ts` injects the selected persona via `appendSystemPrompt`.

On every other harness, personas are available as portable **skills** (`skills/righthand-<persona>/SKILL.md`). Activate one by requesting that skill in your conversation/task.

## Install across harnesses

### Plugin-door installs
| Harness | Command |
|---|---|
| Claude Code | `/plugin marketplace add https://github.com/agirahman/righthand` then `/plugin install righthand@righthand` |
| Codex | `codex plugin marketplace add agirahman/righthand`; `codex plugin add righthand@righthand` |
| Cursor | `agent plugin marketplace add https://github.com/agirahman/righthand` then install from Customize panel |
| Kimi Code | `/plugins install https://github.com/agirahman/righthand` |
| Oh My Pi | `omp plugin marketplace add agirahman/righthand`; `omp plugin install righthand@righthand` |
| Antigravity | `agy plugin install https://github.com/agirahman/righthand` |
| Cline (CLI) | `cline plugin install https://github.com/agirahman/righthand.git` |

### Package install
| Harness | Command |
|---|---|
| Pi | `pi install git:github.com/agirahman/righthand` |

### Shared-folder install
For harnesses that scan skills under a shared `.agents/skills/` (OpenCode, Amp, Antigravity project, Copilot), clone the repo and point the harness at `skills/` (or copy it), then trigger a persona skill by request.

### Single-file bundle
No single-file bundle in MVP. Use per-skill files under `skills/`. Future phases may add a combined bundle.

## Commands and modes

- Runtime `/righthand` switch: **Command Code only**.
- On other harnesses:
  - Use a persona: "use righthand-backend" or reference `skills/righthand-backend/SKILL.md`.
  - Worktree/workflow isolation still applies to writer personas (`backend`,`frontend`,`devops`,`worker`,`editor`) via `scripts/herdr-spawn.*`.
  - readonly personas inspect main checkout directly.

## Personas

12 personas shipped (7 `readonly`, 5 `writer`):

- readonly: `orchestrator`, `product-manager`, `architect`, `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`
- writer: `worker`, `backend`, `frontend`, `editor`, `devops`

## Limitations (MVP)

- `/righthand` interactive switching is Command Code-only; elsewhere switch via skill activation.
- Native command shims (`.claude/commands`, `.pi/extensions`, `.opencode/plugins`) are not yet shipped; planned Phase 2.
- Herdr orchestration remains driven by existing `scripts/herdr-spawn.*`.

## Validation

```
npm test           # profiles + skills + manifests
npm run typecheck  # TypeScript
npm run build      # compile dist/
```

## Roadmap

Planned enhancements for future updates:
- **Bundled Skills Layer**: Ship dedicated workflow skills (such as test-driven development and systematic debugging) directly inside the package.
- **Orchestrator Skill Delegation**: Enable the lead orchestrator to attach specialized workflow skills dynamically when dispatching tickets to worker personas.
- **Automated Worktree Lifecycle Management**: Automated cleanup, status verification, and merge tooling for completed ticket worktree branches.
