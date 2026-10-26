/**
 * Mod `profile`: ganti persona agent Command Code via `/profile <name>`.
 * Dioptimalkan untuk orkestrasi multi-agent Herdr dan adaptasi arsitektur Addy Osmani agent-skills.
 *
 * Profil dibaca dari:
 *   1. ~/.commandcode/profiles/*.md         (global user)
 *   2. <project>/profiles/*.md             (repo level)
 *   3. <project>/.commandcode/profiles/*.md (project overrides)
 *
 * Format file mendukung YAML frontmatter (Addy Osmani style) & legacy header:
 *   ---
 *   name: code-reviewer
 *   description: 5-axis review
 *   role: Senior Code Reviewer
 *   mode: readonly
 *   herdr_tab: code-reviewer
 *   ---
 */

import type {ModApi} from '@commandcode/harness';
import {readFileSync, readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';

export type ProfileMode = 'writer' | 'readonly';

export interface ProfileMetadata {
  name: string;
  label: string;
  role: string;
  desc: string;
  mode: ProfileMode;
  herdrTab?: string;
  body: string;
  sourcePath: string;
}

export function parseProfileFile(filePath: string, fallbackName: string): ProfileMetadata | undefined {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return undefined;
  }

  let name = fallbackName;
  let label = fallbackName;
  let role = fallbackName;
  let desc = '';
  let mode: ProfileMode = 'readonly';
  let herdrTab = fallbackName;
  let body = raw.trim();

  // Parse YAML Frontmatter jika ada
  const frontmatterMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (frontmatterMatch) {
    const fmLines = frontmatterMatch[1].split(/\r?\n/);
    body = frontmatterMatch[2].trim();

    for (const line of fmLines) {
      const match = /^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/.exec(line);
      if (!match) continue;
      const key = match[1].toLowerCase();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');

      if (key === 'name') name = val;
      if (key === 'role') role = val;
      if (key === 'description' || key === 'desc') desc = val;
      if (key === 'mode') mode = val.toLowerCase() === 'writer' ? 'writer' : 'readonly';
      if (key === 'herdr_tab' || key === 'herdrtab') herdrTab = val;
    }
    label = role || name;
  }

  // Fallback parsing (bila tanpa frontmatter lengkap)
  const lines = raw.split(/\r?\n/);
  if (!label || label === fallbackName) {
    for (const line of lines) {
      const m = /^#\s+(.+)$/.exec(line);
      if (m) {
        label = m[1].trim();
        if (!role || role === fallbackName) role = label;
        break;
      }
    }
  }

  if (!desc) {
    for (const line of lines) {
      const m = /^>\s*(.+)$/.exec(line);
      if (m) {
        desc = m[1].trim();
        break;
      }
    }
  }

  if (!frontmatterMatch) {
    for (const line of lines) {
      const m = /^mode:\s*(writer|readonly)\s*$/i.exec(line);
      if (m) {
        mode = m[1].toLowerCase() as ProfileMode;
        break;
      }
    }
  }

  return {
    name: name.toLowerCase(),
    label,
    role,
    desc,
    mode,
    herdrTab: herdrTab || name,
    body,
    sourcePath: filePath,
  };
}

export function loadAllProfiles(cwd: string): Map<string, ProfileMetadata> {
  const map = new Map<string, ProfileMetadata>();
  const searchDirs = [
    join(homedir(), '.commandcode', 'profiles'),
    join(cwd, 'profiles'),
    join(cwd, '.commandcode', 'profiles'),
  ];

  for (const dir of searchDirs) {
    let files: string[];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith('.md') || file.startsWith('.')) continue;
      const fallbackName = file.slice(0, -3).toLowerCase();
      const profile = parseProfileFile(join(dir, file), fallbackName);
      if (profile) {
        map.set(profile.name, profile);
      }
    }
  }

  return map;
}

export default function (cmd: ModApi): void {
  let activeProfile: string | null = null;

  cmd.addFlag('default', {
    type: 'string',
    default: '',
    description: 'Nama profil yang otomatis aktif saat sesi Command Code dibuka.',
  });

  const setStatus = (text: string | null): void => {
    if (cmd.ui.capabilities?.status) {
      cmd.ui.setStatus(text);
    } else if (text) {
      cmd.ui.notify(text);
    }
  };

  const activate = (name: string): ProfileMetadata | undefined => {
    const profiles = loadAllProfiles(cmd.cwd);
    const target = profiles.get(name.toLowerCase());
    if (!target) return undefined;
    activeProfile = target.name;
    setStatus(`profile: ${target.label} [${target.mode}]`);
    return target;
  };

  cmd.hooks({
    appendSystemPrompt: () => {
      if (!activeProfile) return undefined;
      const profiles = loadAllProfiles(cmd.cwd);
      const current = profiles.get(activeProfile);
      if (!current) return undefined;
      return `## Active profile: ${current.label} (${current.mode})\nHerdr Tab: ${current.herdrTab || current.name}\n\n${current.body}`;
    },
  });

  cmd.addCommand({
    name: 'profile',
    description: 'Kelola persona agent Command Code (Herdr multi-agent team)',
    argumentHint: '[name|pick|list|off]',
    handler: async ({args}) => {
      const arg = args.trim().toLowerCase();
      const profiles = loadAllProfiles(cmd.cwd);

      // Interactive pick
      if (!arg || arg === 'pick') {
        const sorted = [...profiles.values()].sort((a, b) => a.name.localeCompare(b.name));
        const picked = await cmd.ui.select({
          title: 'Pilih Profile Persona Herdr',
          options: sorted.map((p) => ({
            label: p.name,
            description:
              (p.name === activeProfile ? '[AKTIF] ' : '') +
              `[${p.mode}] ${p.role}: ${p.desc || p.label}`,
          })),
        });

        if (!picked) {
          return {
            message: 'Tidak ada profil yang dipilih. Gunakan `/profile list` untuk melihat opsi.',
          };
        }

        const profile = activate(picked);
        return {
          message: profile
            ? `Profil aktif: ${profile.label} [${profile.mode}] (Herdr tab: ${profile.herdrTab})`
            : `Profil "${picked}" tidak ditemukan.`,
        };
      }

      // List profiles
      if (arg === 'list') {
        if (profiles.size === 0) {
          return {
            message: 'Belum ada profil tersedia. Simpan file persona di ./profiles/*.md atau ~/.commandcode/profiles/*.md',
          };
        }

        const rows = [...profiles.values()]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => {
            const prefix = p.name === activeProfile ? '=>' : '  ';
            const badge = `[${p.mode}]`;
            return `${prefix} ${p.name.padEnd(24)} ${badge.padEnd(10)} ${p.role} — ${p.desc || p.label}`;
          });

        return {
          message: [
            'Daftar Profile Persona (Herdr Team):',
            ...rows,
            '',
            'Perintah: /profile <name>  |  /profile off  |  /profile pick  |  /profile list',
          ].join('\n'),
        };
      }

      // Turn off profile
      if (arg === 'off' || arg === 'default') {
        activeProfile = null;
        setStatus(null);
        return {message: 'Profil dinonaktifkan — kembali ke persona default Command Code.'};
      }

      // Activate specific profile
      const profile = activate(arg);
      if (profile) {
        return {
          message: `Profil aktif: ${profile.label} [${profile.mode}] (Herdr tab: ${profile.herdrTab})`,
        };
      }

      const available = [...profiles.keys()].sort().join(', ');
      return {
        message: available
          ? `Profil "${arg}" tidak ditemukan. Pilihan tersedia: ${available}`
          : 'Belum ada profil tersedia.',
      };
    },
  });

  cmd.on('session_start', () => {
    const def = cmd.getFlag('default');
    if (typeof def === 'string' && def.trim()) {
      const profile = activate(def.trim().toLowerCase());
      if (!profile) {
        cmd.ui.notify(`Profil default "${def}" tidak ditemukan di folder profiles.`, 'warning');
      }
      return;
    }
    const current = activeProfile ? loadAllProfiles(cmd.cwd).get(activeProfile) : undefined;
    setStatus(current ? `profile: ${current.label} [${current.mode}]` : null);
  });
}
