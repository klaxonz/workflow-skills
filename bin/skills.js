#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const SKILLS = ['code-audit', 'code-fix', 'feature-flow'];

const AGENT_DIRS = {
  claude: ['.claude/skills', path.join(os.homedir(), '.claude/skills')],
  opencode: ['.opencode/skills', path.join(os.homedir(), '.config/opencode/skills')],
  windsurf: ['.windsurf/skills', path.join(os.homedir(), '.windsurf/skills')],
};

function getSkillDir() {
  const source = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(source, 'code-audit', 'SKILL.md'))) {
    return source;
  }
  const pkg = path.resolve(__dirname, '..', '..', '..');
  if (fs.existsSync(path.join(pkg, 'code-audit', 'SKILL.md'))) {
    return pkg;
  }
  return source;
}

function resolveTarget(target) {
  const cwd = process.cwd();
  if (target === 'claude') return [path.join(cwd, '.claude', 'skills')];
  if (target === 'opencode') return [path.join(cwd, '.opencode', 'skills')];
  if (target === 'windsurf') return [path.join(cwd, '.windsurf', 'skills')];
  if (target === 'global') return [path.join(os.homedir(), '.claude', 'skills')];
  const match = target.match(/^(\w+):(global|project)$/);
  if (match) {
    const [, agent, scope] = match;
    const dirs = AGENT_DIRS[agent] || [];
    return [dirs[scope === 'global' ? 1 : 0] || path.join(cwd, `.${agent}`, 'skills')];
  }
  if (target && !target.includes(':')) {
    return [path.resolve(target)];
  }
  return [path.join(cwd, 'skills')];
}

function findExistingLink(skillDir, targetDir) {
  if (!fs.existsSync(targetDir)) return null;
  const skillName = path.basename(skillDir);
  const targetPath = path.join(targetDir, skillName);
  try {
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink()) {
      return targetPath;
    }
  } catch (e) { /* not found */ }
  return null;
}

function install(targets, skills) {
  const sourceDir = getSkillDir();
  skills = skills || SKILLS;
  let installed = 0;

  for (const target of targets) {
    for (const name of skills) {
      const src = path.join(sourceDir, name);
      const targetDir = resolveTarget(target)[0];

      if (!fs.existsSync(src)) {
        console.error(`  [SKIP] Skill not found: ${name}`);
        continue;
      }

      fs.mkdirSync(targetDir, { recursive: true });

      const dest = path.join(targetDir, name);
      const existing = findExistingLink(src, targetDir);

      if (existing && existing === dest) {
        console.log(`  [OK] ${name} → ${target} (already installed)`);
        installed++;
        continue;
      }

      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }

      try {
        fs.symlinkSync(src, dest, 'dir');
        console.log(`  [OK] ${name} → ${target} (symlink)`);
        installed++;
      } catch (e) {
        copyDir(src, dest);
        console.log(`  [OK] ${name} → ${target} (copied)`);
        installed++;
      }
    }
  }

  return installed;
}

function uninstall(targets, skills) {
  skills = skills || SKILLS;
  let removed = 0;

  for (const target of targets) {
    const targetDir = resolveTarget(target)[0];
    if (!fs.existsSync(targetDir)) {
      console.log(`  [SKIP] Target not found: ${target}`);
      continue;
    }

    for (const name of skills) {
      const dest = path.join(targetDir, name);
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
        console.log(`  [OK] Removed: ${name} from ${target}`);
        removed++;
      } else {
        console.log(`  [SKIP] Not installed: ${name} in ${target}`);
      }
    }
  }

  return removed;
}

function list(targets) {
  for (const target of targets) {
    const targetDir = resolveTarget(target)[0];
    console.log(`\n${target}:`);
    if (!fs.existsSync(targetDir)) {
      console.log('  (not found)');
      continue;
    }
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    let found = false;
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const mdPath = path.join(targetDir, e.name, 'SKILL.md');
      if (fs.existsSync(mdPath)) {
        const link = e.isSymbolicLink() ? ' (symlink)' : '';
        console.log(`  ${e.name}${link}`);
        found = true;
      }
    }
    if (!found) console.log('  (no skills installed)');
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function printHelp() {
  console.log(`
Usage: npx skills <command> [options]

Commands:
  install [target] [skills...]   Install skills to target agent
  uninstall [target] [skills...] Remove skills from target
  list [target]                  List installed skills
  update                         Re-link skills from latest source

Targets:
  claude        Claude Code (project)
  opencode      OpenCode (project)
  windsurf      Windsurf (project)
  global        Global Claude Code (~/.claude/skills)
  claude:global Global Claude Code
  <path>        Custom target directory

Skills:
  code-audit    Code review and quality analysis
  code-fix      Fix identified issues
  feature-flow  Full feature lifecycle

Examples:
  npx skills install claude
  npx skills install global
  npx skills install opencode code-audit
  npx skills list claude
  npx skills uninstall claude
`);
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    process.exit(0);
  }

  if (cmd === 'install') {
    const targets = args[1] ? [args[1]] : ['claude'];
    const skills = args.length > 2 ? args.slice(2) : null;
    console.log(`\nInstalling skills to ${targets.join(', ')}...\n`);
    const count = install(targets, skills);
    console.log(`\nDone. ${count} skill(s) installed.`);
  } else if (cmd === 'uninstall') {
    const targets = args[1] ? [args[1]] : ['claude'];
    const skills = args.length > 2 ? args.slice(2) : null;
    console.log(`\nRemoving skills from ${targets.join(', ')}...\n`);
    const count = uninstall(targets, skills);
    console.log(`\nDone. ${count} skill(s) removed.`);
  } else if (cmd === 'list') {
    const targets = args[1] ? [args[1]] : Object.keys(AGENT_DIRS);
    list(targets);
  } else if (cmd === 'update') {
    const targets = args[1] ? [args[1]] : Object.keys(AGENT_DIRS).map(k => `${k}:project`);
    console.log('\nUpdating skills...\n');
    const count = install(targets);
    console.log(`\nDone. ${count} skill(s) updated.`);
  } else {
    console.error(`Unknown command: ${cmd}`);
    printHelp();
    process.exit(1);
  }
}

main();
