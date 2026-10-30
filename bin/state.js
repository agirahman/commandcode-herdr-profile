const fs = require('fs');
const path = require('path');

function getStateDir(cwd = process.cwd()) {
  return path.join(cwd, '.righthand');
}

function getStateFile(cwd = process.cwd()) {
  return path.join(getStateDir(cwd), 'active-persona.json');
}

function readState(cwd = process.cwd()) {
  try {
    const p = getStateFile(cwd);
    if (!fs.existsSync(p)) return { active: null };
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { active: null };
  }
}

function writeState(state, cwd = process.cwd()) {
  const dir = getStateDir(cwd);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getStateFile(cwd), JSON.stringify(state, null, 2) + '\n');
}

function getSetupFile(cwd = process.cwd()) {
  return path.join(getStateDir(cwd), 'setup.json');
}

function readSetupState(cwd = process.cwd()) {
  try {
    const p = getSetupFile(cwd);
    if (!fs.existsSync(p)) return { harnesses: [] };
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return { harnesses: [] };
  }
}

function writeSetupState(state, cwd = process.cwd()) {
  const dir = getStateDir(cwd);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getSetupFile(cwd), JSON.stringify(state, null, 2) + '\n');
}

module.exports = { getStateDir, getStateFile, readState, writeState, readSetupState, writeSetupState };
