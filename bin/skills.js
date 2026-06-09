#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');
const SHARED_DIR_NAME = '_shared';

const AGENT_DIRS = {
  codex: ['.agents/skills', path.join(os.homedir(), '.agents/skills')],
  claude: ['.claude/skills', path.join(os.homedir(), '.claude/skills')],
  opencode: ['.opencode/skills', path.join(os.homedir(), '.config/opencode/skills')],
  windsurf: ['.windsurf/skills', path.join(os.homedir(), '.windsurf/skills')],
};

/**
 * 自动发现技能目录
 */
function discoverSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .filter(d => fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name);
}

/**
 * 解析目标路径
 */
function resolveTarget(target) {
  const cwd = process.cwd();
  if (AGENT_DIRS[target]) return [path.join(cwd, AGENT_DIRS[target][0])];
  const match = target.match(/^(\w+):(global|project)$/);
  if (match) {
    const [, agent, scope] = match;
    const dirs = AGENT_DIRS[agent];
    if (!dirs) throw new Error(`Unknown agent target: ${agent}`);
    return [scope === 'global' ? dirs[1] : path.join(cwd, dirs[0])];
  }
  if (target && (!target.includes(':') || path.isAbsolute(target))) {
    return [path.resolve(target)];
  }
  throw new Error(`Invalid target: ${target}`);
}

/**
 * 查找已存在的符号链接
 */
function findExistingLink(src, targetDir) {
  if (!fs.existsSync(targetDir)) return null;
  const name = path.basename(src);
  const targetPath = path.join(targetDir, name);
  try {
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink()) {
      return targetPath;
    }
  } catch (e) { /* not found */ }
  return null;
}

/**
 * 安装技能和共享资源
 */
function install(targets, skills) {
  skills = skills || discoverSkills();
  const sharedSrc = path.join(SKILLS_DIR, SHARED_DIR_NAME);
  let installed = 0;

  for (const target of targets) {
    const targetDir = resolveTarget(target)[0];
    fs.mkdirSync(targetDir, { recursive: true });

    // 安装技能
    for (const name of skills) {
      const src = path.join(SKILLS_DIR, name);
      if (!fs.existsSync(src)) {
        console.error(`  [SKIP] Skill not found: ${name}`);
        continue;
      }

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

    // 安装 _shared 目录
    if (fs.existsSync(sharedSrc)) {
      const sharedDest = path.join(targetDir, SHARED_DIR_NAME);
      const existingShared = findExistingLink(sharedSrc, targetDir);

      if (existingShared && existingShared === sharedDest) {
        console.log(`  [OK] _shared → ${target} (already installed)`);
        continue;
      }

      if (fs.existsSync(sharedDest)) {
        fs.rmSync(sharedDest, { recursive: true, force: true });
      }

      try {
        fs.symlinkSync(sharedSrc, sharedDest, 'dir');
        console.log(`  [OK] _shared → ${target} (symlink)`);
      } catch (e) {
        copyDir(sharedSrc, sharedDest);
        console.log(`  [OK] _shared → ${target} (copied)`);
      }
    }
  }

  return installed;
}

/**
 * 卸载技能和共享资源
 */
function uninstall(targets, skills) {
  skills = skills || discoverSkills();
  let removed = 0;

  for (const target of targets) {
    const targetDir = resolveTarget(target)[0];
    if (!fs.existsSync(targetDir)) {
      console.log(`  [SKIP] Target not found: ${target}`);
      continue;
    }

    // 卸载技能
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

    // 卸载 _shared
    const sharedDest = path.join(targetDir, SHARED_DIR_NAME);
    if (fs.existsSync(sharedDest)) {
      fs.rmSync(sharedDest, { recursive: true, force: true });
      console.log(`  [OK] Removed: _shared from ${target}`);
    }
  }

  return removed;
}

/**
 * 列出已安装技能
 */
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

    // 显示 _shared
    const sharedPath = path.join(targetDir, SHARED_DIR_NAME);
    if (fs.existsSync(sharedPath)) {
      const stat = fs.lstatSync(sharedPath);
      const link = stat.isSymbolicLink() ? ' (symlink)' : '';
      console.log(`  ${SHARED_DIR_NAME}${link}`);
      found = true;
    }

    if (!found) console.log('  (no skills installed)');
  }
}

/**
 * 复制目录
 */
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

/**
 * 打印帮助信息
 */
function printHelp() {
  const skills = discoverSkills();
  console.log(`
Usage: npx @klaxonz/workflow-skills <command> [options]

Commands:
  install <target> [skills...]   Install skills to target agent
  uninstall <target> [skills...] Remove skills from target
  list [target]                  List installed skills
  update <target>                Re-link skills from latest source

Targets:
  codex         Codex (project)
  codex:global  Codex (global)
  claude        Claude Code (project)
  claude:global Claude Code (global)
  opencode      OpenCode (project)
  opencode:global OpenCode (global)
  windsurf      Windsurf (project)
  windsurf:global Windsurf (global)
  <path>        Custom target directory

Skills (auto-discovered):
${skills.map(s => `  ${s}`).join('\n')}

Shared resources:
  _shared/      Cross-skill conventions and templates

Examples:
  npx @klaxonz/workflow-skills install codex
  npx @klaxonz/workflow-skills install codex:global
  npx @klaxonz/workflow-skills install claude
  npx @klaxonz/workflow-skills install opencode code-audit
  npx @klaxonz/workflow-skills list codex
  npx @klaxonz/workflow-skills uninstall codex
`);
}

/**
 * 要求指定目标
 */
function requireTarget(args, command) {
  if (!args[1]) {
    console.error(`Missing target. Usage: npx @klaxonz/workflow-skills ${command} <target> [skills...]`);
    printHelp();
    process.exit(1);
  }
  return [args[1]];
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    process.exit(0);
  }

  if (cmd === 'install') {
    const targets = requireTarget(args, 'install');
    const skills = args.length > 2 ? args.slice(2) : null;
    console.log(`\nInstalling skills to ${targets.join(', ')}...\n`);
    const count = install(targets, skills);
    console.log(`\nDone. ${count} skill(s) installed.`);
  } else if (cmd === 'uninstall') {
    const targets = requireTarget(args, 'uninstall');
    const skills = args.length > 2 ? args.slice(2) : null;
    console.log(`\nRemoving skills from ${targets.join(', ')}...\n`);
    const count = uninstall(targets, skills);
    console.log(`\nDone. ${count} skill(s) removed.`);
  } else if (cmd === 'list') {
    const targets = args[1] ? [args[1]] : Object.keys(AGENT_DIRS);
    list(targets);
  } else if (cmd === 'update') {
    const targets = requireTarget(args, 'update');
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