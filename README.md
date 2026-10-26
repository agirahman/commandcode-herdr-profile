<div align="center">

# Command Code Profile Mod for Herdr

**Specialist agent personas and orchestration mod for Command Code within multi-agent Herdr workspaces.**  
*Adapted from Addy Osmani's [agent-skills](https://github.com/addyosmani/agent-skills) architectural patterns.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/commandcode-herdr-profile.svg)](https://www.npmjs.com/package/commandcode-herdr-profile)
[![Command Code](https://img.shields.io/badge/Command%20Code-Mod-purple.svg)](https://commandcode.ai/)
[![Herdr](https://img.shields.io/badge/Orchestration-Herdr-orange.svg)](https://herdr.dev/)

</div>

---

## Overview

`commandcode-herdr-profile` provides a modular persona engine and a curated catalog of engineering personas designed for autonomous pair-programming and multi-agent coordination in [Herdr](https://herdr.dev/).

Instead of treating an AI agent as a generic monolith, this mod injects targeted personas via Command Code's `appendSystemPrompt` hook. Each persona maintains a single perspective, follows rigid output standards, and operates with clear execution boundaries.

### Architectural Principles

This project adheres to the three-tier composition model established by Addy Osmani's agent specification:

| Layer | Definition | Example | Responsibility |
|---|---|---|---|
| **Persona** | A specialized role with a distinct perspective and rigid output format. | `code-reviewer`, `security-auditor` | The *Who* — adopts an evaluation lens and delivers a structured report. |
| **Skill** | An executable workflow with discrete steps and exit criteria. | `test-driven-development`, `systematic-debugging` | The *How* — invoked within a persona or directly by the session. |
| **Command** | An entry point composing personas and skills across workspaces. | `/profile`, `/ship`, Herdr orchestrator | The *When* — coordinates execution and merges findings. |

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
cmdc mods add -g commandcode-herdr-profile

# Or install for the current project only
cmdc mods add commandcode-herdr-profile
```

### 2. Manual Global Installation (User Level)

Alternatively, copy the files manually into your user configuration (`~/.commandcode/`):

#### Windows (PowerShell)

```powershell
# Create destination directories
New-Item -ItemType Directory -Force "$HOME\.commandcode\mods"
New-Item -ItemType Directory -Force "$HOME\.commandcode\profiles"

# Copy mod engine and profile files
Copy-Item ".\mods\profile.ts" "$HOME\.commandcode\mods\profile.ts" -Force
Copy-Item ".\profiles\*.md" "$HOME\.commandcode\profiles\" -Force
```

#### macOS / Linux (POSIX sh)

```bash
# Create destination directories
mkdir -p ~/.commandcode/mods ~/.commandcode/profiles

# Copy mod engine and profile files
cp ./mods/profile.ts ~/.commandcode/mods/profile.ts
cp ./profiles/*.md ~/.commandcode/profiles/
```

### Local Project Overrides

To customize or extend profiles for a specific codebase, place markdown profile files in:
- `<project-root>/.commandcode/profiles/*.md`
- `<project-root>/profiles/*.md`

The mod loads project-level profiles with precedence over global user-level profiles.

---

## Usage in Command Code

### Interactive Slash Commands

Once installed, use the `/profile` command within any Command Code session:

```bash
# Launch interactive fuzzy picker
/profile

# Switch directly to a persona
/profile backend
/profile code-reviewer
/profile orchestrator

# Display all available profiles and their current active state
/profile list

# Deactivate the current profile and restore the base persona
/profile off
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

To prevent conflicts when multiple agents work in parallel within the same repository, writer roles (`backend`, `frontend`, `devops`, `worker`) must operate in dedicated, ticket-prefixed git worktrees:

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
