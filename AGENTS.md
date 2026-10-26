# Memory

## Project Overview
See @README.md for project overview and @package.json for available npm/pnpm commands for this project.

## Code Style Guidelines
- Use descriptive variable names
- Follow existing patterns in the codebase
- Extract complex conditions into meaningful boolean variables

## Release Workflow (GitHub Releases & npm Registry)

Setiap ada perubahan kode atau fitur baru:
1. **Bump Versi**:
   - Update `version` di `package.json` (semver: patch/minor/major).
2. **Build & Test**:
   - `npm test` (validasi semua profil & persona).
   - `npm run build` (compile TypeScript ke `dist/`).
3. **Commit & Tag**:
   - Commit perubahan: `git commit -m "..."` (jangan gunakan trailer bot).
   - Buat tag git: `git tag v<version>` dan push: `git push origin main --tags` (atau `git push origin v<version>`).
4. **Publish ke npm Registry**:
   - `npm publish --access=public`
5. **Buat GitHub Release**:
   - Gunakan format judul release wajib:
     `v<version>: <Rangkuman apa yang baru/diubah> version <version>`
     *Contoh:* `v0.5.18: cached token tracking, provider fixes version 0.5.18`
   - Isi deskripsi release harus terstruktur dengan section:
     - `### Feat` (Fitur & kemampuan baru)
     - `### Fix` (Perbaikan bug & masalah)
     - `### Chore` (Maintenance manifest, build, dependency)
   - Perintah CLI:
     ```bash
     gh release create v<version> --latest --title "v<version>: <summary> version <version>" --notes "### Feat
- ...

### Fix
- ...

### Chore
- ..."
     ```

## Architecture Notes
- RightHand persona engine disuntikkan via hook `appendSystemPrompt` Command Code.
- Penamaan persona mengikuti format frontmatter Markdown Addy Osmani.
- Pembagian mode: `readonly` untuk inspeksi langsung, `writer` untuk pembuatan git worktree isolasi (`wt/<ticket>-<slug>`).

## Common Workflows
- Validasi profile: `npm test`
- Build TypeScript: `npm run build`
- Typecheck: `npm run typecheck`

