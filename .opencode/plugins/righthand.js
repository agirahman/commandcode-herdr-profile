import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function getRepoRoot() {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    return resolve(dirname(currentFile), "../..");
  } catch {
    return process.cwd();
  }
}

function parsePersona(raw, fallbackName) {
  let name = fallbackName;
  let role = fallbackName;
  let mode = "readonly";
  let desc = "";
  let body = raw.trim();

  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (m) {
    body = m[2].trim();
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/.exec(line);
      if (!kv) continue;
      const k = kv[1].toLowerCase();
      const v = kv[2].trim().replace(/^['"](.*)['"]$/, "$1");
      if (k === "name") name = v;
      if (k === "role") role = v;
      if (k === "mode") mode = v.toLowerCase() === "writer" ? "writer" : "readonly";
      if (k === "description" || k === "desc") desc = v;
    }
  }

  return { name, role, mode, desc, body };
}

function loadAllPersonas(cwd) {
  const map = new Map();
  const repoRoot = getRepoRoot();
  const searchDirs = [
    join(repoRoot, "profiles"),
    join(cwd, "profiles"),
    join(cwd, ".opencode", "profiles"),
  ];

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith(".md") || file.startsWith(".")) continue;
        const fallbackName = file.slice(0, -3).toLowerCase();
        try {
          const raw = readFileSync(join(dir, file), "utf8");
          const persona = parsePersona(raw, fallbackName);
          map.set(persona.name.toLowerCase(), persona);
        } catch {}
      }
    } catch {}
  }

  return map;
}

function getStatePath(cwd) {
  return join(cwd, ".righthand", "active-persona.json");
}

function readActivePersona(cwd) {
  try {
    const p = getStatePath(cwd);
    if (!existsSync(p)) return null;
    const data = JSON.parse(readFileSync(p, "utf8"));
    return data?.active || null;
  } catch {
    return null;
  }
}

function writeActivePersona(cwd, persona) {
  try {
    const dir = join(cwd, ".righthand");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(
      getStatePath(cwd),
      JSON.stringify({ active: persona, updatedAt: new Date().toISOString() }, null, 2) + "\n",
      "utf8"
    );
  } catch {}
}

export function getInjectedPersona(cwd = process.cwd()) {
  const active = readActivePersona(cwd);
  if (!active) return null;
  const personas = loadAllPersonas(cwd);
  const persona = personas.get(active);
  if (!persona) return null;
  return `## Active RightHand Persona: ${persona.name} (${persona.role}) [mode: ${persona.mode}]\n> ${persona.desc}\n\n${persona.body}`;
}

export function setup(ctx) {
  const cwd = ctx?.location?.project || process.cwd();

  // If OpenCode event subscription is available
  if (ctx?.event?.subscribe) {
    const controller = new AbortController();
    (async () => {
      try {
        const stream = await ctx.event.subscribe({
          signal: controller.signal,
          onActivity() {},
        });
        for await (const event of stream) {
          if (event?.type === "session.start" || event?.type === "session.created") {
            const injected = getInjectedPersona(cwd);
            if (injected && ctx?.prompt?.inject) {
              await ctx.prompt.inject(injected);
            }
          }
        }
      } catch {}
    })();
  }
}

export default setup;
