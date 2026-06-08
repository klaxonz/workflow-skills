#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS = ['code-audit', 'code-fix', 'feature-flow'];

const REQUIRED_META = ['name', 'description'];

function validateSkill(name) {
  const skillDir = path.join(ROOT, name);
  const mdPath = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(mdPath)) {
    console.error(`  FAIL: ${name} — SKILL.md missing`);
    return false;
  }

  const content = fs.readFileSync(mdPath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    console.error(`  FAIL: ${name} — no YAML frontmatter`);
    return false;
  }

  const lines = frontmatterMatch[1].split('\n');
  const meta = {};
  for (const line of lines) {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.+)/);
    if (m) meta[m[1]] = m[2].trim();
  }

  for (const key of REQUIRED_META) {
    if (!meta[key]) {
      console.error(`  FAIL: ${name} — missing required field: ${key}`);
      return false;
    }
  }

  if (!content.includes('## ') && !content.includes('### ')) {
    console.warn(`  WARN: ${name} — no markdown headings found`);
  }

  return true;
}

function main() {
  console.log('Validating skills...\n');
  let passed = 0;
  let failed = 0;

  for (const name of SKILLS) {
    if (validateSkill(name)) {
      console.log(`  OK: ${name}`);
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
