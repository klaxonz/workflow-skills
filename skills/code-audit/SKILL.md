---
name: code-audit
description: Analyze code for design and quality issues — code smells, architectural problems, anti-patterns, and convention violations. READ-ONLY analysis; produces issue reports without making changes.
---

# Code Audit Workflow

对项目代码进行 **只读审查**，输出问题报告，不做自动修复。

---

## 工作流程

### Step 1: 确定范围

- 分析哪个模块 / 全量？
- 特定关注点？（架构 / 安全 / 仅新增代码）

### Step 2: 扫描

重点关注以下方面（通用常识如 SQL 注入、Magic Number 等不再罗列）：

| 类别 | 重点 |
|------|------|
| **红线合规** | 对照项目红线规则，逐条确认 |
| **架构** | 循环依赖、职责不清、违反分层 |
| **错误处理** | 异常被吞、日志无上下文、错误分类缺失 |
| **安全问题** | 硬编码密钥/Token、命令注入、路径遍历 |
| **隐藏问题** | TODO/FIXME/HACK/XXX 残留、废弃代码、未使用 import |
| **质量信号** | 测试是否真实覆盖、命名是否传达意图、资源泄漏 |

> 同类问题合并报告，不拆多个 issue。

### Step 3: 去重

创建 issue 前检查已有 open 状态的 issue，避免重复。

### Step 4: 输出 issue

每个问题一个文件，路径 `{WORKFLOW_DIR}/issues/`，格式：

```markdown
---
title: <问题简述>
status: open
severity: critical | high | medium | low
category: architecture | security | compliance | error-handling | dead-code | test-quality | naming
location: <文件路径:行号>
---

## 问题描述

## 影响

## 建议方向
```

### Step 5: 汇总

输出优先级最高的 3-5 个问题，每个附修复思路。

---

## 配置变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKFLOW_DIR` | 工作目录路径 | `.workflow` |

---

## 约束

| 规则 | 说明 |
|------|------|
| **只读** | 不修改任何代码文件 |
| **用户决策** | 汇总后由用户决定修什么 |
| **减少噪音** | 同类合并，不拆分 |
