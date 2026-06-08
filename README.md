# Workflow Skills

项目开发标准化工作流技能包，包含代码审查、问题修复、需求实现的全链路流程。采用 [Agent Skills](https://agentskills.io) 标准格式，跨 AI 编程助手通用。

## 包含技能

| Skill | 说明 | 用途 |
|-------|------|------|
| **code-audit** | 代码审查 | 只读分析代码质量、安全隐患、架构问题，输出 issue 报告 |
| **code-fix** | 问题修复 | 从 issue 到修复验证的标准化流程 |
| **feature-flow** | 功能开发 | 需求获取 → 设计 → 编码 → 审查 → 测试 → 收尾 |

## 安装

### 一键安装（推荐）

```bash
# Linux / macOS
curl -fsSL https://raw.githubusercontent.com/klaxonz/workflow-skills/main/scripts/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/klaxonz/workflow-skills/main/scripts/install.ps1 | iex
```

### npx 安装

```bash
# 克隆仓库后使用 CLI 安装
git clone https://github.com/klaxonz/workflow-skills.git
cd workflow-skills

# 安装到当前项目 (Claude Code)
npx skills install claude

# 安装到全局 (~/.claude/skills)
npx skills install global

# 安装到 OpenCode
npx skills install opencode

# 安装特定技能
npx skills install claude code-audit
```

### npx 命令

| 命令 | 说明 |
|------|------|
| `npx skills install <target>` | 安装技能 (默认 claude) |
| `npx skills list <target>` | 列出已安装技能 |
| `npx skills update` | 更新到最新版本 |
| `npx skills uninstall <target>` | 卸载技能 |

target 可选值: `claude`、`opencode`、`windsurf`、`global`、`claude:global`、自定义目录

### 手动安装

```bash
cp -r code-audit code-fix feature-flow .claude/skills/
```

### 其他 Agent (Cursor / Copilot)

从对应 `SKILL.md` 中提取内容，写入 agent 要求的规则文件位置。

## 项目产物结构

在项目中使用 skill 后，会在 `{WORKFLOW_DIR}`（默认 `.workflow`）下生成：

```
.workflow/
├── issues/            # 问题追踪
├── designs/           # 设计方案  
├── requirements/      # 需求文档
└── requirements/.template.md  # 需求模板
```

## 需求模板

```markdown
---
title: <标题>
status: draft
created: <YYYY-MM-DD>
---

# 需求：<标题>

## 背景

## 目标

## 功能描述

## 验收标准
- [ ] 条件 1
- [ ] 条件 2
```

## 配置变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKFLOW_DIR` | 工作目录路径 | `.workflow` |
