#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');
const SHARED_DIR_NAME = '_shared';
const INSTALL_MARKER = '.workflow-skills-installed';

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

function unique(items) {
  return [...new Set(items)];
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
 * 检查目标是否为指向当前源目录的符号链接
 */
function isCurrentSymlink(src, dest) {
  try {
    const stat = fs.lstatSync(dest);
    if (stat.isSymbolicLink()) {
      return fs.realpathSync(dest) === fs.realpathSync(src);
    }
  } catch (e) { /* not found */ }
  return false;
}

function isManagedCopy(dest) {
  return fs.existsSync(path.join(dest, INSTALL_MARKER));
}

function canReplace(src, dest) {
  if (!fs.existsSync(dest)) return true;
  if (isCurrentSymlink(src, dest)) return true;
  return isManagedCopy(dest);
}

function writeInstallMarker(dest, src) {
  fs.writeFileSync(
    path.join(dest, INSTALL_MARKER),
    `source=${path.basename(src)}\nmanaged-by=@klaxonz/workflow-skills\n`
  );
}

function createSummary() {
  return { installed: 0, updated: 0, skipped: 0, removed: 0 };
}

function formatSummary(summary, noun) {
  const parts = [];
  if (summary.installed) parts.push(`${summary.installed} installed`);
  if (summary.updated) parts.push(`${summary.updated} updated`);
  if (summary.removed) parts.push(`${summary.removed} removed`);
  if (summary.skipped) parts.push(`${summary.skipped} skipped`);
  return parts.length ? `${noun}: ${parts.join(', ')}` : `${noun}: no changes`;
}

function hasManagedSkill(targetDir) {
  return discoverSkills().some(name => {
    const src = path.join(SKILLS_DIR, name);
    const dest = path.join(targetDir, name);
    return fs.existsSync(path.join(dest, 'SKILL.md')) && canReplace(src, dest);
  });
}

/**
 * 安装技能和共享资源
 */
function install(targets, skills) {
  skills = unique(skills || discoverSkills());
  const sharedSrc = path.join(SKILLS_DIR, SHARED_DIR_NAME);
  const summary = createSummary();

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

      if (isCurrentSymlink(src, dest)) {
        console.log(`  [OK] ${name} → ${target} (already installed)`);
        summary.skipped++;
        continue;
      }

      const existed = fs.existsSync(dest);
      if (fs.existsSync(dest)) {
        if (!canReplace(src, dest)) {
          console.log(`  [SKIP] ${name} → ${target} (existing unmanaged path)`);
          summary.skipped++;
          continue;
        }
        fs.rmSync(dest, { recursive: true, force: true });
      }

      try {
        fs.symlinkSync(src, dest, 'dir');
        console.log(`  [OK] ${name} → ${target} (symlink)`);
        summary[existed ? 'updated' : 'installed']++;
      } catch (e) {
        copyDir(src, dest);
        writeInstallMarker(dest, src);
        console.log(`  [OK] ${name} → ${target} (copied)`);
        summary[existed ? 'updated' : 'installed']++;
      }
    }

    // 安装 _shared 目录
    if (fs.existsSync(sharedSrc)) {
      if (!hasManagedSkill(targetDir)) {
        console.log(`  [SKIP] _shared → ${target} (no managed skills installed)`);
        summary.skipped++;
        continue;
      }

      const sharedDest = path.join(targetDir, SHARED_DIR_NAME);

      if (isCurrentSymlink(sharedSrc, sharedDest)) {
        console.log(`  [OK] _shared → ${target} (already installed)`);
        summary.skipped++;
        continue;
      }

      const sharedExisted = fs.existsSync(sharedDest);
      if (fs.existsSync(sharedDest)) {
        if (!canReplace(sharedSrc, sharedDest)) {
          console.log(`  [SKIP] _shared → ${target} (existing unmanaged path)`);
          summary.skipped++;
          continue;
        }
        fs.rmSync(sharedDest, { recursive: true, force: true });
      }

      try {
        fs.symlinkSync(sharedSrc, sharedDest, 'dir');
        console.log(`  [OK] _shared → ${target} (symlink)`);
        summary[sharedExisted ? 'updated' : 'installed']++;
      } catch (e) {
        copyDir(sharedSrc, sharedDest);
        writeInstallMarker(sharedDest, sharedSrc);
        console.log(`  [OK] _shared → ${target} (copied)`);
        summary[sharedExisted ? 'updated' : 'installed']++;
      }
    }
  }

  return summary;
}

/**
 * 卸载技能和共享资源
 */
function uninstall(targets, skills) {
  skills = unique(skills || discoverSkills());
  const allSkills = discoverSkills();
  const summary = createSummary();

  for (const target of targets) {
    const targetDir = resolveTarget(target)[0];
    if (!fs.existsSync(targetDir)) {
      console.log(`  [SKIP] Target not found: ${target}`);
      continue;
    }

    // 卸载技能
    for (const name of skills) {
      const src = path.join(SKILLS_DIR, name);
      const dest = path.join(targetDir, name);
      if (fs.existsSync(dest)) {
        if (!canReplace(src, dest)) {
          console.log(`  [SKIP] ${name} in ${target} (existing unmanaged path)`);
          summary.skipped++;
          continue;
        }
        fs.rmSync(dest, { recursive: true, force: true });
        console.log(`  [OK] Removed: ${name} from ${target}`);
        summary.removed++;
      } else {
        console.log(`  [SKIP] Not installed: ${name} in ${target}`);
        summary.skipped++;
      }
    }

    // 卸载 _shared
    const sharedDest = path.join(targetDir, SHARED_DIR_NAME);
    const stillInstalled = allSkills.some(name => fs.existsSync(path.join(targetDir, name)));
    if (fs.existsSync(sharedDest)) {
      const sharedSrc = path.join(SKILLS_DIR, SHARED_DIR_NAME);
      if (stillInstalled) {
        console.log(`  [SKIP] Keeping _shared in ${target} (still in use)`);
        summary.skipped++;
      } else if (canReplace(sharedSrc, sharedDest)) {
        fs.rmSync(sharedDest, { recursive: true, force: true });
        console.log(`  [OK] Removed: _shared from ${target}`);
        summary.removed++;
      } else {
        console.log(`  [SKIP] _shared in ${target} (existing unmanaged path)`);
        summary.skipped++;
      }
    }
  }

  return summary;
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
    const summary = install(targets, skills);
    console.log(`\nDone. ${formatSummary(summary, 'install')}.`);
  } else if (cmd === 'uninstall') {
    const targets = requireTarget(args, 'uninstall');
    const skills = args.length > 2 ? args.slice(2) : null;
    console.log(`\nRemoving skills from ${targets.join(', ')}...\n`);
    const summary = uninstall(targets, skills);
    console.log(`\nDone. ${formatSummary(summary, 'uninstall')}.`);
  } else if (cmd === 'list') {
    const targets = args[1] ? [args[1]] : Object.keys(AGENT_DIRS);
    list(targets);
  } else if (cmd === 'update') {
    const targets = requireTarget(args, 'update');
    console.log('\nUpdating skills...\n');
    const summary = install(targets);
    console.log(`\nDone. ${formatSummary(summary, 'update')}.`);
  } else {
    console.error(`Unknown command: ${cmd}`);
    printHelp();
    process.exit(1);
  }
}

main();
