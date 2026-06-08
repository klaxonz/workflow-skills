# Workflow Skills

项目开发标准化工作流技能包，包含代码审查、问题修复、需求实现的全链路流程。采用 [Agent Skills](https://agentskills.io) 标准格式，跨 AI 编程助手通用。

## 包含技能

| Skill | 说明 | 用途 |
|-------|------|------|
| **code-audit** | 代码审查 | 只读分析代码质量、安全隐患、架构问题，输出 issue 报告 |
| **code-fix** | 问题修复 | 从 issue 到修复验证的标准化流程 |
| **feature-flow** | 功能开发 | 需求获取 → 设计 → 编码 → 审查 → 测试 → 收尾 |

## 安装

### Claude Code / Windsurf / OpenCode 等（原生支持 Agent Skills）

将 skill 目录复制到 agent 的 skills 目录即可自动发现：

```bash
# Claude Code
cp -r code-audit code-fix feature-flow .claude/skills/

# Windsurf  
cp -r code-audit code-fix feature-flow .windsurf/skills/

# 全局安装（所有项目可用）
cp -r code-audit code-fix feature-flow ~/.claude/skills/
```

### Cursor

从对应 `SKILL.md` 中提取内容，创建 `.cursor/rules/*.mdc` 文件。

### GitHub Copilot

从对应 `SKILL.md` 中提取内容，写入 `.github/copilot-instructions.md`。

### 其他 Agent

从 `SKILL.md` 中提取内容，按 agent 的要求放入对应位置。

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
