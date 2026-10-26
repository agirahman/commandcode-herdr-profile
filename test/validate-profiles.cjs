const fs = require('node:fs');
const path = require('node:path');

const profilesDir = path.join(__dirname, '..', 'profiles');
const files = fs.readdirSync(profilesDir).filter((f) => f.endsWith('.md'));

console.log(`Checking ${files.length} profile files in ${profilesDir}...`);

let failed = 0;
const expectedKeys = ['name', 'description', 'role', 'mode', 'herdr_tab'];
const roles = [];

for (const file of files) {
  const filePath = path.join(profilesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
  if (!fmMatch) {
    console.error(`FAIL: [${file}] Missing YAML frontmatter block.`);
    failed++;
    continue;
  }

  const fmLines = fmMatch[1].split(/\r?\n/);
  const metadata = {};
  for (const line of fmLines) {
    const m = /^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (m) {
      metadata[m[1].toLowerCase()] = m[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  }

  // Check required keys
  for (const key of expectedKeys) {
    if (!metadata[key]) {
      console.error(`FAIL: [${file}] Missing frontmatter key: ${key}`);
      failed++;
    }
  }

  // Check mode
  if (metadata.mode !== 'writer' && metadata.mode !== 'readonly') {
    console.error(`FAIL: [${file}] Invalid mode '${metadata.mode}', must be 'writer' or 'readonly'`);
    failed++;
  }

  // Check Composition block
  if (!content.includes('## Composition')) {
    console.error(`FAIL: [${file}] Missing '## Composition' section (Addy Osmani spec rule)`);
    failed++;
  }

  // Check Orchestrator ticket requirement
  if (metadata.name === 'orchestrator') {
    if (!content.includes('T1') || !content.includes('worktree')) {
      console.error(`FAIL: [${file}] Orchestrator must include ticket format T1 and worktree instructions`);
      failed++;
    }
  }

  roles.push({
    name: metadata.name,
    role: metadata.role,
    mode: metadata.mode,
    tab: metadata.herdr_tab,
  });
  console.log(`OK: [${file}] -> ${metadata.name} (${metadata.role}) [${metadata.mode}]`);
}

if (failed > 0) {
  console.error(`\nValidation FAILED with ${failed} errors.`);
  process.exit(1);
}

console.log(`\nALL ${files.length} PROFILES VALID!`);
console.table(roles);
