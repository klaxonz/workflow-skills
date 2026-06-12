#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

function discoverSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .filter(d => fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].split('\n');
  const meta = {};
  for (const line of lines) {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return meta;
}

function validateShared() {
  console.log('\n[共享资源检查]');
  const sharedDir = path.join(SKILLS_DIR, '_shared');
  const required = [
    { path: path.join(sharedDir, 'conventions.md'), name: 'conventions.md' },
    { path: path.join(sharedDir, 'templates', 'requirements.md'), name: 'templates/requirements.md' },
    { path: path.join(sharedDir, 'templates', 'issue.md'), name: 'templates/issue.md' },
    { path: path.join(sharedDir, 'templates', 'design.md'), name: 'templates/design.md' }
  ];

  let passed = 0;
  let failed = 0;

  for (const item of required) {
    if (fs.existsSync(item.path)) {
      console.log(`  OK: _shared/${item.name}`);
      passed++;
    } else {
      console.error(`  FAIL: _shared/${item.name} 不存在`);
      failed++;
    }
  }

  return { passed, failed };
}

function validateSkill(name) {
  const skillDir = path.join(SKILLS_DIR, name);
  const mdPath = path.join(skillDir, 'SKILL.md');

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(mdPath)) {
    errors.push('SKILL.md 不存在');
    return { errors, warnings };
  }

  const content = fs.readFileSync(mdPath, 'utf-8');

  const meta = parseFrontmatter(content);
  if (!meta) {
    errors.push('缺少 YAML frontmatter');
    return { errors, warnings };
  }

  if (!meta.name) {
    errors.push('frontmatter 缺少 name 字段');
  } else if (meta.name !== name) {
    errors.push(`frontmatter name "${meta.name}" 与目录名 "${name}" 不匹配`);
  }

  if (!meta.description) {
    errors.push('frontmatter 缺少 description 字段');
  } else if (meta.description.length < 10) {
    warnings.push('description 过短，建议至少 10 个字符');
  }

  if (!content.includes('## 约束')) {
    errors.push('缺少 ## 约束 章节');
  }

  if (!content.includes('_shared')) {
    warnings.push('未引用 _shared 约定');
  }

  return { errors, warnings };
}

function main() {
  console.log('验证 workflow-skills...\n');

  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  const sharedResult = validateShared();
  totalPassed += sharedResult.passed;
  totalFailed += sharedResult.failed;

  console.log('\n[技能检查]');
  const skills = discoverSkills();

  if (skills.length === 0) {
    console.error('  未发现任何技能目录');
    process.exit(1);
  }

  console.log(`  发现 ${skills.length} 个技能: ${skills.join(', ')}\n`);

  for (const name of skills) {
    const result = validateSkill(name);

    if (result.errors.length === 0) {
      console.log(`  OK: ${name}`);
      totalPassed++;
    } else {
      console.error(`  FAIL: ${name}`);
      for (const err of result.errors) {
        console.error(`    - ${err}`);
      }
      totalFailed++;
    }

    for (const warn of result.warnings) {
      console.warn(`    WARN: ${warn}`);
      totalWarnings++;
    }
  }

  console.log(`\n[汇总]`);
  console.log(`  通过: ${totalPassed}`);
  console.log(`  失败: ${totalFailed}`);
  if (totalWarnings > 0) {
    console.log(`  警告: ${totalWarnings}`);
  }

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main();
