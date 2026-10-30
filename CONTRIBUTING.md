# Contributing to RightHand

Thank you for your interest in contributing to **RightHand**! RightHand provides specialized AI personas and multi-agent orchestration for coding harnesses across developer workflows.

---

## Architecture Overview

RightHand supports multiple coding harnesses through dedicated, isolated harness folders and a shared persona core:

```
righthand/
├── .commandcode/         # Command Code mod, manifests, and profiles
├── .pi/                  # Pi native extension (.pi/extensions/righthand.ts)
├── .omp/                 # Oh My Pi native extension (.omp/extensions/righthand.ts)
├── .opencode/            # OpenCode server plugin (.opencode/plugins/righthand.js)
├── bin/                  # Unified CLI (`righthand switch`, `inject`, `list`, `off`)
├── profiles/             # Source persona profiles (Markdown with YAML frontmatter)
├── skills/               # Portable cross-harness skill definitions (SKILL.md)
├── scripts/              # Herdr multiplexer spawn helpers
└── test/                 # Test suites for profiles, skills, and manifests
```

---

## Persona System Conventions

Each persona is defined in `profiles/<name>.md` using YAML frontmatter:

```yaml
---
name: backend
role: Backend Engineer
mode: writer
tab: backend
---
```

### Modes
- **`readonly`**: For inspection, code review, architecture planning, security auditing, and test design. Agents in readonly mode do not modify implementation files.
- **`writer`**: For implementation tasks (frontend, backend, devops, worker). Agents work in isolated git worktree lanes (`wt/<ticket>-<slug>`).

### Synchronization
When modifying or adding a persona in `profiles/`:
1. Ensure `profiles/<name>.md` has valid frontmatter.
2. Mirror the persona into `skills/righthand-<name>/SKILL.md`.
3. Update autocomplete lists in `.commandcode/mods/righthand.ts`, `.pi/extensions/righthand.ts`, and `bin/state.js` if a new persona is added.

---

## Local Development & Testing

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Testing
Run the test suites before submitting any changes:

```bash
# Validate all persona profiles and cross-harness manifests
npm test

# Typecheck TypeScript files across all harness extensions
npm run typecheck

# Build compiled output to dist/
npm run build
```

---

## Pull Request Guidelines

1. **Create a Topic Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Commit Hygiene**:
   - Write clear, concise commit messages.
   - Do not include automated bot trailers or unrelated file changes.
3. **Verify Everything**:
   - `npm test` must pass (12/12 profiles, 12/12 skills, 10/10 manifests).
   - `npm run typecheck` must pass with 0 errors.
4. **Submit PR**:
   - Open a pull request targeting the `main` branch.
   - Provide a concise description of changes and test steps.
