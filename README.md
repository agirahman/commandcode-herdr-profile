<div align="center">

# RightHand

**Specialist agent personas and multi-agent orchestration engine for Herdr workspaces across coding harnesses.**  
*Adapted from Addy Osmani's [agent-skills](https://github.com/addyosmani/agent-skills) architectural patterns.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@agirahman/righthand.svg)](https://www.npmjs.com/package/@agirahman/righthand)
[![Command Code](https://img.shields.io/badge/Command%20Code-Mod-purple.svg)](https://commandcode.ai/)
[![Pi](https://img.shields.io/badge/Pi-Extension-cyan.svg)](https://github.com/mario-dn/pi)
[![OpenCode](https://img.shields.io/badge/OpenCode-Plugin-green.svg)](https://opencode.ai/)
[![Oh My Pi](https://img.shields.io/badge/Oh%20My%20Pi-Extension-magenta.svg)](https://github.com/can1357/oh-my-pi)
[![Herdr](https://img.shields.io/badge/Orchestration-Herdr-orange.svg)](https://herdr.dev/)

</div>

---

## Overview

`righthand` acts as your executive second-in-command for multi-agent workflows in [Herdr](https://herdr.dev/) and standalone coding harnesses. It provides a modular persona engine and curated specialist roles designed for autonomous pair-programming, ticket-driven delegation, and workspace isolation across coding harnesses.

Instead of treating an AI agent as a generic monolith, RightHand injects targeted personas via native extensions and hooks across supported harnesses (**Command Code**, **Pi**, **OpenCode**, **Oh My Pi**) or via portable skill standards. Each persona maintains a single perspective, follows rigid output standards, and operates with clear execution boundaries.

### Architectural Principles

- **Single-Perspective Personas**: Each persona embodies a specialized engineering role with a clear evaluation lens, rigid output format, and strict execution boundaries.
- **No Recursive Persona Invocations**: Personas do not invoke other personas at runtime. Multi-agent coordination occurs at the user or orchestrator level across Herdr tabs.
- **Ticket & Worktree Isolation**: Sub-agents communicate through explicit tickets, structured reports, and isolated git worktrees rather than unstructured shared state.
- **Dedicated Harness Folders**: Native extensions and plugins are maintained in clean, harness-specific folders (`.commandcode/`, `.pi/`, `.omp/`, `.opencode/`), backed by a unified CLI and state engine.

---

## Persona Catalog

The catalog combines developer team roles with Addy Osmani's specialized audit personas (12 personas: 7 `readonly`, 5 `writer`):

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

## Unified CLI (`righthand`)

RightHand includes a built-in CLI for inspecting and switching active personas across all harnesses. Active persona state is persistently stored in `.righthand/active-persona.json`.

```bash
# Display all 12 personas and current active state
righthand list

# Switch to a persona
righthand switch backend
righthand switch security-auditor
# Shortcut:
righthand frontend

# Output the active persona prompt (for prompt injection or shell pipelines)
righthand inject

# Reset to default agent behavior
righthand off
```

---

## Supported Harnesses & Installation

### 1. Command Code (`.commandcode/`)
RightHand was originally built as a first-class Command Code mod.

- **Install via CLI**:
  ```bash
  cmdc mods add -g @agirahman/righthand
  ```
- **Slash Commands in session**:
  - `/righthand` or `/profile` — open fuzzy picker or show active persona.
  - `/righthand <persona>` — switch persona on-the-fly.
  - `/righthand off` — restore default prompt.
- **Details**: See [`.commandcode/README.md`](./.commandcode/README.md).

### 2. Pi Coding Agent (`.pi/`)
Pi supports native extensions that hook agent lifecycle events.

- **Setup**: Place or symlink [`.pi/extensions/righthand.ts`](./.pi/extensions/righthand.ts) into your project's `.pi/extensions/` or global `~/.pi/agent/extensions/`.
- **Slash Command**:
  - `/righthand <persona>` — interactive slash command with full tab-autocomplete for all 12 personas.
  - `/righthand off` — clear persona.
- **Status Indicator**: Displays current persona badge in the Pi UI status bar.
- **Details**: See [`.pi/README.md`](./.pi/README.md).

### 3. Oh My Pi (`.omp/`)
Oh My Pi automatically discovers native extensions placed in `<cwd>/.omp/extensions/`.

- **Setup**: Place [`.omp/extensions/righthand.ts`](./.omp/extensions/righthand.ts) in `.omp/extensions/`.
- **Behavior**: Auto-discovered by OMP runtime without manual plugin trust approval prompts. Hooks `before_agent_start` and registers `/righthand`.
- **Details**: See [`.omp/README.md`](./.omp/README.md).

### 4. OpenCode (`.opencode/`)
OpenCode uses server plugins and runtime prompt injection.

- **Setup**: Place [`.opencode/plugins/righthand.js`](./.opencode/plugins/righthand.js) in `.opencode/plugins/`.
- **CLI Ingestion**: Use `righthand switch <persona>` and inject into your OpenCode session:
  ```bash
  opencode run "$(righthand inject) <your query>"
  ```
- **Details**: See [`.opencode/README.md`](./.opencode/README.md).

### 5. Cross-Harness Portable Skills (`skills/`)
For harnesses that support portable Agent Skills or custom plugins (Claude Code, Cursor, Codex, Kimi Code, Cline):

- Persona skills are available under `skills/righthand-<persona>/SKILL.md`.
- Activate by requesting the persona in conversation (e.g., *"Act as righthand-backend"*).
- Compatible plugin manifests are included: `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.kimi-plugin/`, `.cline-plugin/`, and `.agents/`.

---

## Herdr Multi-Agent Orchestration

[Herdr](https://herdr.dev/) is an orchestration platform and multi-agent workspace manager that allows developers to run, supervise, and coordinate multiple AI coding agents in parallel tabs across dedicated workspaces.

### Worktree Isolation for Writer Personas

To prevent merge conflicts when multiple agents work simultaneously on the same repository, writer roles (`backend`, `frontend`, `editor`, `devops`, `worker`) must operate in isolated, ticket-prefixed git worktrees:

```bash
# Worktree format: wt/<ticket-id>-<slug>
git worktree add "wt/T1-auth-api" -b "T1-auth-api"
```

Readonly roles (`orchestrator`, `architect`, `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`, `product-manager`) inspect the main working tree directly without spawning worktree branches.

### Automated Tab Spawning

Helper scripts automate creating Herdr workspace tabs and provisioning ticket worktrees:

#### PowerShell (`scripts/herdr-spawn.ps1`)
```powershell
.\scripts\herdr-spawn.ps1 -Workspace "w1" -Role "backend" -Ticket "T1" -Description "auth-api"
```

#### POSIX Shell (`scripts/herdr-spawn.sh`)
```bash
./scripts/herdr-spawn.sh w1 backend T1 auth-api
```

---

## Testing & Validation

```bash
# Validate all persona profiles, cross-harness skills, and plugin manifests
npm test

# Typecheck TypeScript across all harness extensions
npm run typecheck

# Build compiled output to dist/
npm run build
```

---

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code style, persona frontmatter specifications, and testing workflow.

---

## License

RightHand is licensed under the [MIT License](./LICENSE).
