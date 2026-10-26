# Plan: Command Code Profiles Mod for Herdr (Addy Osmani Style)

## 1. Goal
Bangun repo/mod Command Code `commandcode-herdr-profile` yang memuat mod `/profile` dan koleksi role persona terstandarisasi style Addy Osmani (single-role, 5-axis/structured output, composition contract) untuk dipakai di multi-agent Herdr.

## 2. Core Architecture
- **Mod Engine (`mods/profile.ts`)**:
  - Hook `appendSystemPrompt` untuk inject persona ke agent utama tanpa rusak base prompt.
  - Command `/profile [name|pick|list|off]` dan flag `--profile <name>` saat startup.
  - Multi-source loader: project `.commandcode/profiles/` > user `~/.commandcode/profiles/`.
- **Persona Format (Addy Osmani Standard)**:
  - YAML Frontmatter: `name`, `description`, `role`, `mode` (`writer` | `readonly`), `herdr_tab`.
  - Identity & Perspective (The Who).
  - Framework / Dimensions (misal 5-axis evaluation, OWASP top 10, Core Web Vitals, Clean Architecture).
  - Strict Output Contract.
  - Composition Block (kapan dipanggil, dilarang panggil persona lain langsung).
- **Herdr Integration Protocol**:
  - Writer roles (backend, frontend, devops) wajib worktree terisolasi.
  - Readonly roles (reviewer, auditor, test-engineer, architect) run di main checkout.
  - Tab herdr naming convention: `herdr tab create --workspace <id> --label <role>`.

## 3. Implementation Steps & Proof of Work

### Step 1: Initialize Project Structure & Config
- Buat `package.json`, `tsconfig.json`, `.gitignore`, dan README template.
- **Proof**: File config valid, `npm run build` / tsc lulus check tipe.

### Step 2: Implement Profile Mod Engine (`mods/profile.ts`)
- Port & tingkatkan mod `profile.ts` dari base commandcode:
  - Parse frontmatter metadata + markdown body.
  - Status bar indicator di UI Command Code.
  - Command `/profile` (pick, list, switch, off).
  - CLI flag support (`--default <profile>`).
- **Proof**: Mod dapat di-load oleh Command Code test runner / runtime tanpa error.

### Step 3: Author Personas (Adapted from Addy Osmani + Dev Team)
1. `code-reviewer.md`: 5-axis review (correctness, readability, architecture, security, performance). Readonly.
2. `security-auditor.md`: threat model, OWASP checklist, sanitization audit. Readonly.
3. `test-engineer.md`: QA strategy, coverage gap, edge-case matrix, Prove-It pattern. Readonly.
4. `web-performance-auditor.md`: CWV, bundle budget, network/render waterfall. Readonly.
5. `architect.md`: system boundaries, modularity, tradeoff analysis, ADR format. Readonly.
6. `backend.md`: API, DB migrations, domain logic, error handling. Writer (worktree required).
7. `frontend.md`: UI components, state management, accessibility, design fidelity. Writer (worktree required).
8. `devops.md`: CI/CD, docker, deployment, env setup. Writer (worktree required).
9. `orchestrator.md`: task decomposition, fan-out pattern (/ship style) ke Herdr tabs. Readonly coordinator.
- **Proof**: Semua file punya schema frontmatter valid, output format jelas, dan lolos verifikasi markdown parser.

### Step 4: Add Herdr Helper Scripts & CLI Shortcuts
- Helper script powershell/bash untuk spawn tab Herdr sesuai role (`herdr tab create --label <role>`).
- **Proof**: Script menghasilkan command herdr yang valid dan dapat dieksekusi.

### Step 5: Git Commit & Push
- Commit initial release ke remote `origin/main` sesuai format commit project.
- **Proof**: `git status` clean, commit pushed ke `https://github.com/agirahman/commandcode-herdr-profile.git`.
