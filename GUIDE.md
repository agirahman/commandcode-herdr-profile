# RightHand — Cross-harness install guide

RightHand personas are portable skills. Each harness has its own install path. Use **one** route; adding more gives you overlapping copies.

## Routes overview

| Route | Best for |
|---|---|
| Plugin door | Claude Code, Codex, Cursor, Kimi, OMP, Antigravity, Cline |
| Pi package | Pi |
| Shared folder copy | OpenCode, Amp, Gemini CLI, Hermes, Copilot, Antigravity project |
| Git clone | Any harness that reads repo skills |

## Plugin-door installs (Claude Code / Codex / Cursor / Kimi / OMP / Antigravity / Cline)

Install commands mirror the upstream support table:

- **Claude Code**: `/plugin marketplace add https://github.com/agirahman/righthand` then `/plugin install righthand@righthand`
- **Codex**: `codex plugin marketplace add agirahman/righthand` then `codex plugin add righthand@righthand`
- **Cursor**: `agent plugin marketplace add https://github.com/agirahman/righthand` then install from Customize panel
- **Kimi Code**: `/plugins install https://github.com/agirahman/righthand`
- **Oh My Pi**: `omp plugin marketplace add agirahman/righthand`; `omp plugin install righthand@righthand`
- **Antigravity**: `agy plugin install https://github.com/agirahman/righthand`
- **Cline (CLI)**: `cline plugin install https://github.com/agirahman/righthand.git`

Updates: use each harness's own update command or re-run install. Removal: use each harness's uninstall command.

## Pi (package)

```
pi install git:github.com/agirahman/righthand
```

Reads `pi.skills` from `package.json`. Update with `pi update --extensions`.

## Shared-folder install

For harnesses scanning `.agents/skills/`, clone the repo and symlink/copy `skills/` into `.agents/skills/` (or project-specific skills folder). Activate via skill request:

```
cd /path/to/project
git clone https://github.com/agirahman/righthand righthand
# copy skills (or use a symlink)
cp -r righthand/skills .agents/skills/  # Unix
```

On Windows use `Copy-Item -Recurse`.

## Git-clone deep install

1. Clone the repo.
2. Launch your harness inside repo directory (verify it reads root skils).

## Usage modes (MVP)

- `/righthand` runtime switching is Command Code-only.
- On other harnesses, ask explicitly: "Use righthand-backend skill for this task" or "Switch to orchestrator persona".
- Writer personas should run in isolated git worktrees (`wt/<ticket>-<slug>`), using `scripts/herdr-spawn.*`.

## Verification

After install, list available skills (harness UI or CLI). You should see 12 `righthand-*` personas.

## Known limitations (MVP)

- No native slash command shim beyond Command Code (`/profile`/`/righthand`).
- No orchestration automation; use `herdr-spawn.*`.
- No single-file bundle (Phase 2).
- No combined "righthand-all" persona bundle yet.