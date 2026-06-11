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
status: open | in_progress | fixed | wontfix | duplicate | blocked
severity: critical | high | medium | low
category: architecture | security | compliance | error-handling | dead-code | test-quality | naming | reliability | maintainability | performance
locations:
  - <文件路径:行号>
source: audit | feature-flow | code-fix | manual
fixed_by:
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|:----:|------|
| `title` | ✅ | 简短描述问题（10-30 字） |
| `status` | ✅ | 问题状态，默认 `open` |
| `severity` | ✅ | 严重程度 |
| `category` | ✅ | 问题类别 |
| `locations` | ✅ | 问题所在文件和行号列表，至少一项 |
| `source` | ✅ | 问题来源 |
| `fixed_by` | ❌ | 修复后填写设计文档路径 |

### 状态定义

| 状态 | 说明 |
|------|------|
| `open` | 已确认，待处理 |
| `in_progress` | 正在修复 |
| `fixed` | 已修复并验证 |
| `wontfix` | 确认不修复 |
| `duplicate` | 与已有 issue 重复 |
| `blocked` | 已尝试但被外部条件或信息缺口阻塞 |

`fixed_by` 只指向最终成功的修复设计文档；失败、阻塞或多次尝试记录在 issue 正文的 `## 修复尝试` 中。

### 类别定义

| 类别 | 说明 |
|------|------|
| `architecture` | 架构问题：循环依赖、职责不清、违反分层 |
| `security` | 安全问题：硬编码密钥、注入漏洞、路径遍历 |
| `compliance` | 合规问题：违反项目红线规则 |
| `error-handling` | 错误处理：异常被吞、日志无上下文、错误类型映射错误 |
| `dead-code` | 废弃代码：未使用的 import、注释掉的代码块 |
| `test-quality` | 测试质量：缺少断言、mock 过度、只测 happy path |
| `naming` | 命名问题：变量名过于泛化、函数名不表达意图 |
| `reliability` | 可靠性问题：竞态、状态不一致、边界条件导致故障 |
| `maintainability` | 可维护性问题：复杂度过高、重复逻辑、难以演进 |
| `performance` | 性能问题：不必要的重复计算、低效查询、资源占用过高 |

**类别边界判断：**
- `error-handling` vs `reliability`：异常 **被吞没或分类错误** 用 `error-handling`；**状态不一致或竞态导致故障** 用 `reliability`
- `maintainability` vs `architecture`：**模块内部** 的重复/复杂度用 `maintainability`；**模块之间** 的依赖/分层问题用 `architecture`
- `compliance` vs `security`：**违反项目自定规则** 用 `compliance`；**外部可攻击的漏洞** 用 `security`
- 无法判定时选最接近的一个，在 issue 正文中说明理由

---

## 文档命名约定

| 文档类型 | 命名规则 | 示例 |
|---------|---------|------|
| 需求 | `req-<NNN>-<name>.md` | `req-001-video-quality.md` |
| 功能设计 | `des-feature-<name>.md` | `des-feature-video-quality.md` |
| 修复设计 | `des-fix-<issue-id>-<title>.md` | `des-fix-issue-001-empty-catch.md` |
| Issue | `issue-<NNN>-<title>.md` | `issue-001-empty-catch.md` |

命名规则：
- `<name>`: 功能名称，英文短横线命名（kebab-case），如 `video-quality-selector`
- `<issue-id>`: Issue 编号，如 `issue-001`
- `<NNN>`: 三位数字编号，从 001 开始递增
- `<title>`: 问题简述的 slug 形式

**slug 规范化规则：**
1. 全部转为小写字母
2. 中文/特殊字符移除或转为英文描述
3. 空格和标点替换为连字符 `-`
4. 多个连字符合并为一个
5. 首尾不带连字符
6. 总长度不超过 60 字符
7. 示例：`"空 catch 块吞没异常"` → `empty-catch-swallows-exceptions`

补充规则：
- 需求编号在 `{WORKFLOW_DIR}/requirements/` 内递增；创建需求前必须重新扫描该目录，取下一个可用三位编号。
- Issue 编号全局递增，不区分来源。来源通过 frontmatter 的 `source` 字段标识。
- 创建 issue 前必须重新扫描 `{WORKFLOW_DIR}/issues/`，如目标编号已存在，递增到下一个可用编号。
- 需求文档必须在 frontmatter 写入 `id: req-<NNN>` 和 `name: <name>`；缺少时，从文件名 `req-<NNN>-<name>.md` 解析并补齐。
- 功能设计文档以 frontmatter `name` 为关联标识；缺少 `name` 时，从文件名 `des-feature-<name>.md` 解析并补齐。
- 修复设计文档以 issue 文件名中的 `issue-<NNN>` 为关联标识，并由 issue frontmatter 的 `fixed_by` 反向指向。
- 设计文档必须按 `_shared/templates/design.md` 创建；功能设计使用 `type: feature`，修复设计使用 `type: fix`。

---

## 通用约束

以下约束适用于所有涉及代码修改的技能：

| 规则 | 说明 |
|------|------|
| **不改红线文件** | 对照项目的红线规则文件（如 `CONTRIBUTING.md` 中的 Do Not Modify 清单、`.gitattributes` 标记的只读文件），不修改明确禁止的文件 |
| **不改未涉及模块** | 不顺手重构或格式化与当前任务无关的代码 |
| **不提交代码** | 除非用户明确要求，否则不执行 git commit/push |
| **保持最小变更** | 只改解决问题需要的行，避免整文件重写 |

工作流目录规则：
- 缺少 `{WORKFLOW_DIR}/issues/`、`{WORKFLOW_DIR}/designs/`、`{WORKFLOW_DIR}/requirements/` 时，按需创建。
- `locations` 可写具体行号（如 `src/foo.ts:42`）、文件路径（如 `src/foo.ts`）或 `project-wide`。

---

## 技能交接

### audit → fix

当 `code-audit` 完成后：
1. 汇总列出所有 issue 编号（如 `issue-001`、`issue-002`）
2. 向用户建议："如需修复，使用 `code-fix` 技能，指定 issue 编号"
3. 用户说"修 issue-001"时，Agent 切换到 `code-fix` 技能
4. `code-fix` 读取对应的 issue 文件，继续修复流程

### user → fix

当用户直接报告缺陷但未指定 issue：
1. 用户只需要提供观察到的现象，不需要先给出原因、代码位置或问题分类
2. 报错日志、traceback、stack trace、启动失败、运行时异常、导入错误、测试失败和回归都属于缺陷报告，不属于 feature-flow 需求
3. Agent 根据现象按 `_shared/templates/issue.md` 创建 issue，`source: manual`
4. issue 文件必须命名为 `{WORKFLOW_DIR}/issues/issue-<NNN>-<title>.md`；创建前重新扫描 `{WORKFLOW_DIR}/issues/`，取下一个可用三位编号
5. `title`、初始 `severity`、初始 `category`、`locations` 由 Agent 根据现象和初步调研填写；定位不明确时 `locations` 可先写 `project-wide`
6. Agent 继续 `code-fix` 流程，通过代码调研、日志/测试/复现来补全根因、影响范围、准确位置和修复方案
7. 只有缺少复现所需的关键输入（如用户账号、具体文件、无法推断的操作步骤）时，才向用户提最少必要问题

### feature-flow 发现 bug

当 `feature-flow` 在开发过程中发现预存在的 bug：
1. 按 `_shared/templates/issue.md` 创建 issue 文件，必须填写 `severity`、`category`、`locations`、`source: feature-flow`
2. 在收尾报告中列出发现的 bug
3. 建议用户后续用 `code-fix` 处理
4. **不在当前功能流程中修复 bug**（除非用户明确要求）

### fix 发现新问题

当 `code-fix` 在修复过程中发现相关问题但超出当前范围：
1. 按 `_shared/templates/issue.md` 创建新 issue 文件，必须填写 `severity`、`category`、`locations`、`source: code-fix`
2. 继续当前修复，不中断
3. 修复完成后向用户报告新 issue，建议后续处理

---

## 配置变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKFLOW_DIR` | 工作目录路径，存放 issues、designs、requirements | `.workflow` |

**`{WORKFLOW_DIR}` 解析规则：**
1. 如果环境变量 `WORKFLOW_DIR` 已设置，使用其值（绝对路径或相对于项目根）
2. 否则使用默认值 `.workflow`（相对于项目根目录）
3. `{WORKFLOW_DIR}/issues/`、`{WORKFLOW_DIR}/designs/`、`{WORKFLOW_DIR}/requirements/` 目录按需创建
4. 各 SKILL.md 不再重复定义此变量，统一引用本文档
