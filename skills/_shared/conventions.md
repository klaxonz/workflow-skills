---
name: _shared
description: Cross-skill conventions — not a skill itself; referenced by other skills.
---

# 跨技能约定

本文档定义所有技能共享的约定，避免重复定义并确保一致性。

---

## 语言约定

| 字段 | 语言 | 原因 |
|------|------|------|
| Frontmatter (`name`, `description`) | 英文 | 机器可读，符合工具解析标准 |
| 正文内容 | 中文 | 面向中文用户，表达更自然 |

---

## 问题格式

### Frontmatter Schema

```yaml
---
title: <问题简述>
status: open | in_progress | fixed | wontfix
severity: critical | high | medium | low
category: architecture | security | compliance | error-handling | dead-code | test-quality | naming
location: <文件路径:行号>
source: audit | feature-flow | manual
fixed_by: <!-- 修复后填写设计文档路径 -->
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|:----:|------|
| `title` | ✅ | 简短描述问题（10-30 字） |
| `status` | ✅ | 问题状态，默认 `open` |
| `severity` | ✅ | 严重程度 |
| `category` | ✅ | 问题类别 |
| `location` | ✅ | 问题所在文件和行号 |
| `source` | ✅ | 问题来源 |
| `fixed_by` | ❌ | 修复后填写设计文档路径 |

### 类别定义

| 类别 | 说明 |
|------|------|
| `architecture` | 架构问题：循环依赖、职责不清、违反分层 |
| `security` | 安全问题：硬编码密钥、注入漏洞、路径遍历 |
| `compliance` | 合规问题：违反项目红线规则 |
| `error-handling` | 错误处理：异常被吞、日志无上下文 |
| `dead-code` | 废弃代码：未使用的 import、注释掉的代码块 |
| `test-quality` | 测试质量：缺少断言、mock 过度、只测 happy path |
| `naming` | 命名问题：变量名过于泛化、函数名不表达意图 |

---

## 文档命名约定

| 文档类型 | 命名规则 | 示例 |
|---------|---------|------|
| 需求 | `<name>.md` | `video-quality-selector.md` |
| 设计 | `<name>.md` | `video-quality-selector.md` |
| 审计 Issue | `audit-<NNN>-<title>.md` | `audit-001-empty-catch.md` |
| 功能 Issue | `feat-<name>-<NNN>-<title>.md` | `feat-video-quality-001-player-crash.md` |
| 独立缺陷 | `bug-<date>-<NNN>-<title>.md` | `bug-2026-06-07-001-login-failure.md` |

命名规则：
- `<name>`: 功能名称，英文短横线命名（kebab-case）
- `<NNN>`: 三位数字编号，从 001 开始
- `<title>`: 问题简述的 slug 形式
- `<date>`: 日期格式 YYYY-MM-DD

---

## 通用约束

以下约束适用于所有涉及代码修改的技能：

| 规则 | 说明 |
|------|------|
| **不改红线文件** | 对照项目红线规则（如 CLAUDE.md、.cursorrules），不修改明确禁止的文件 |
| **不改未涉及模块** | 不顺手重构或格式化与当前任务无关的代码 |
| **不提交代码** | 除非用户明确要求，否则不执行 git commit/push |
| **保持最小变更** | 只改解决问题需要的行，避免整文件重写 |

---

## 技能交接

### audit → fix

当 `code-audit` 完成后：
1. 汇总列出所有 issue 编号（如 `audit-001`、`audit-002`）
2. 向用户建议："如需修复，使用 `code-fix` 技能，指定 issue 编号"
3. 用户说"修 audit-001"时，Agent 切换到 `code-fix` 技能
4. `code-fix` 读取对应的 issue 文件，继续修复流程

### feature-flow 发现 bug

当 `feature-flow` 在开发过程中发现预存在的 bug：
1. 创建 issue 文件，`source: feature-flow`
2. 在收尾报告中列出发现的 bug
3. 建议用户后续用 `code-fix` 处理
4. **不在当前功能流程中修复 bug**（除非用户明确要求）

### fix 发现新问题

当 `code-fix` 在修复过程中发现相关问题但超出当前范围：
1. 创建新 issue 文件
2. 继续当前修复，不中断
3. 修复完成后向用户报告新 issue，建议后续处理

---

## 配置变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKFLOW_DIR` | 工作目录路径，存放 issues、designs、requirements | `.workflow` |
