/**
 * Mod `righthand`: switch agent persona via `/righthand <name>` (or `/profile <name>`).
 * Multi-agent orchestration engine for Herdr workspaces, adapted from Addy Osmani agent-skills architecture.
 *
 * Profiles are discovered and loaded from:
 *   1. ~/.commandcode/profiles/*.md         (global user directory)
 *   2. <project>/profiles/*.md             (repository level)
 *   3. <project>/.commandcode/profiles/*.md (project overrides)
 *
 * Profile files support YAML frontmatter (Addy Osmani specification) and legacy headers:
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

  // Parse YAML Frontmatter if present
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

  // Fallback parsing (when frontmatter is missing)
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
  let packageProfilesDir: string | undefined;
  try {
    if (typeof __dirname !== 'undefined') {
      packageProfilesDir = join(__dirname, '..', 'profiles');
    }
  } catch {
    // fallback if __dirname is unavailable
  }

  const searchDirs = [
    ...(packageProfilesDir ? [packageProfilesDir] : []),
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
    description: 'Name of the profile automatically activated upon session startup.',
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

  const commandHandler = async ({args}: {args: string}) => {
    const arg = args.trim().toLowerCase();
    const profiles = loadAllProfiles(cmd.cwd);

    // Interactive pick
    if (!arg || arg === 'pick') {
      const sorted = [...profiles.values()].sort((a, b) => a.name.localeCompare(b.name));
      const picked = await cmd.ui.select({
        title: 'Select RightHand Agent Persona',
        options: sorted.map((p) => {
          const activePrefix = p.name === activeProfile ? '[ACTIVE] ' : '';
          const modeBadge = `[${p.mode.toUpperCase()}]`;
          return {
            label: p.name,
            description: `${activePrefix}${modeBadge} ${p.role}: ${p.desc || p.label}`,
          };
        }),
      });

      if (!picked) {
        return {
          message: 'No persona selected. Run `/righthand list` to view all personas with full descriptions.',
        };
      }

      const profile = activate(picked);
      return {
        message: profile
          ? `Active persona: ${profile.label} [${profile.mode}] (Herdr tab: ${profile.herdrTab})`
          : `Persona "${picked}" not found.`,
      };
    }

    // List profiles
    if (arg === 'list') {
      if (profiles.size === 0) {
        return {
          message: 'No personas found. Place persona markdown files in ./profiles/*.md or ~/.commandcode/profiles/*.md',
        };
      }

      const cards = [...profiles.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => {
          const isCurrent = p.name === activeProfile;
          const marker = isCurrent ? '▶ ' : '• ';
          const status = isCurrent ? ' [ACTIVE]' : '';
          const mode = `[${p.mode.toUpperCase()}]`;
          const header = `${marker}${p.name} ${mode} — ${p.role}${status}`;
          const desc = `    Role & Purpose: ${p.desc || p.label}`;
          const tab = `    Herdr Tab: ${p.herdrTab || p.name}`;
          return `${header}\n${desc}\n${tab}`;
        });

      return {
        message: [
          'RightHand Specialist Personas (Herdr Multi-Agent Team):',
          '========================================================',
          '',
          cards.join('\n\n'),
          '',
          '--------------------------------------------------------',
          'Usage: /righthand <name>  |  /righthand off  |  /righthand pick  |  /righthand list',
          '(Note: /profile is supported as an alias)',
        ].join('\n'),
      };
    }

    // Turn off profile
    if (arg === 'off' || arg === 'default') {
      activeProfile = null;
      setStatus(null);
      return {message: 'Persona deactivated — restored default agent behavior.'};
    }

    // Activate specific profile
    const profile = activate(arg);
    if (profile) {
      return {
        message: `Active persona: ${profile.label} [${profile.mode}] (Herdr tab: ${profile.herdrTab})`,
      };
    }

    const available = [...profiles.keys()].sort().join(', ');
    return {
      message: available
        ? `Persona "${arg}" not found. Available options: ${available}`
        : 'No personas available.',
    };
  };

  cmd.addCommand({
    name: 'righthand',
    description: 'Switch specialist agent persona in Herdr multi-agent team',
    argumentHint: '[name|pick|list|off]',
    handler: commandHandler,
  });

  cmd.addCommand({
    name: 'profile',
    description: 'Alias for /righthand',
    argumentHint: '[name|pick|list|off]',
    handler: commandHandler,
  });

  cmd.on('session_start', () => {
    const def = cmd.getFlag('default');
    if (typeof def === 'string' && def.trim()) {
      const profile = activate(def.trim().toLowerCase());
      if (!profile) {
        cmd.ui.notify(`Default profile "${def}" not found in profiles folder.`, 'warning');
      }
      return;
    }
    const current = activeProfile ? loadAllProfiles(cmd.cwd).get(activeProfile) : undefined;
    setStatus(current ? `profile: ${current.label} [${current.mode}]` : null);
  });
}
