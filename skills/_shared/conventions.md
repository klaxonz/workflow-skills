---
name: _shared
description: Cross-skill conventions — not a skill itself; referenced by other skills.
---

# 跨技能约定

本文档定义所有技能共享的约定。

---

## 语言约定

| 字段 | 语言 |
|------|------|
| Frontmatter (`name`, `description`) | 英文 |
| 正文内容 | 中文 |

---

## Issue 格式

### Frontmatter Schema

```yaml
---
title: <问题简述>
status: open | in_progress | fixed | wontfix | duplicate | blocked
severity: critical | high | medium | low
category: architecture | security | compliance | error-handling | dead-code | test-quality | naming | reliability | maintainability | performance
locations:
  - <文件路径:行号>
source: audit | feature-flow | code-fix | manual
fixed_by:
---
```

### 状态定义

| 状态 | 说明 |
|------|------|
| `open` | 待处理 |
| `in_progress` | 正在修复 |
| `fixed` | 已修复并验证 |
| `wontfix` | 确认不修复 |
| `duplicate` | 与已有 issue 重复 |
| `blocked` | 因外部条件或信息缺口阻塞 |

### 严重度定义

| 严重度 | 条件（满足任一） |
|--------|-----------------|
| `critical` | 安全漏洞可被外部利用；数据丢失/损坏；核心功能完全不可用 |
| `high` | 用户可感知的功能异常但核心流程可绕过；潜在安全风险需要特定条件触发 |
| `medium` | 非核心功能异常、代码质量问题、本地可绕过、日志缺失 |
| `low` | 纯代码风格、命名改进、未使用的代码、仅影响开发者体验 |

无法判定时选择较低严重度，在 issue 正文中注明判断依据。

### 类别定义 & 边界

| 类别 | 说明 | 判定 |
|------|------|------|
| `architecture` | 循环依赖、职责不清、违反分层 | 问题在 **模块之间** |
| `security` | 硬编码密钥、注入漏洞、路径遍历 | **外部可攻击** |
| `compliance` | 违反项目红线规则 | **项目自定规则** |
| `error-handling` | 异常被吞、日志无上下文、错误类型映射错误 | 异常 **被吞没或分类错误** |
| `dead-code` | 未使用的 import、注释掉的代码块、TODO 堆积 | 不可达代码 |
| `test-quality` | 缺少断言、mock 过度、只测 happy path | 测试价值不足 |
| `naming` | 变量名泛化、函数名不表意 | 命名无法传达意图 |
| `reliability` | 竞态、状态不一致、边界条件导致故障 | **状态不一致或竞态** |
| `maintainability` | 复杂度高、重复逻辑 | 问题在 **模块内部** |
| `performance` | 重复计算、低效查询 | 可量化的性能浪费 |

---

## 文档命名约定

| 类型 | 命名 | 示例 |
|------|------|------|
| 需求 | `req-<NNN>-<name>.md` | `req-001-video-quality.md` |
| 设计 | `design-<NNN>-<name>.md` | `design-001-fix-empty-catch.md` |
| Issue | `issue-<NNN>-<slug>.md` | `issue-001-empty-catch.md` |

- `<NNN>`: 三位数字，全局递增。创建前扫描目录取下一个可用编号。
- `<name>`: kebab-case 英文。
- `<slug>`: 全小写，空格→连字符，中文→英文，≤60 字符，首尾无连字符。

**设计文档通过 frontmatter 的 `related_issue` 或 `related_requirement` 反向关联，不依赖文件名解析。**

---

## 通用约束

| 规则 | 说明 |
|------|------|
| **不改红线文件** | 对照项目的红线规则文件（`CONTRIBUTING.md` 中的禁止修改清单等） |
| **不改未涉及模块** | 不顺手重构或格式化无关代码 |
| **最小变更** | 只改解决问题需要的行，避免整文件重写 |
| **不提交代码** | 除非用户明确要求 |

---

## WORKFLOW_DIR

默认 `.workflow`（相对于项目根）。可通过环境变量 `WORKFLOW_DIR` 覆盖。

缺少 `{WORKFLOW_DIR}/issues/`、`{WORKFLOW_DIR}/designs/`、`{WORKFLOW_DIR}/requirements/` 时按需创建。

---

## 技能交接

| 场景 | 行为 |
|------|------|
| audit → fix | audit 汇总后，用户指定 issue 编号，切换到 code-fix |
| user → fix | 用户报告缺陷（报错日志/traceback 等），code-fix 先创建 `source: manual` issue 再修复 |
| feature-flow 发现 bug | 创建 issue（`source: feature-flow`），在报告中列出，不中断当前功能流程 |
| fix 发现新问题 | 创建新 issue（`source: code-fix`），继续当前修复，完成后报告 |
