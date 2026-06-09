---
name: feature-flow
description: Full feature lifecycle from requirements to merged code — requirements gathering, design, implementation, review, testing, and wrap-up. Use when implementing new features.
---

# Feature Flow Workflow

端到端实现流程：从需求提出 → 需求文档 → 设计方案 → 编码 → 审查 → 测试 → 收尾。

---

## 工作流程

### Step 0: 需求获取

| 场景 | 行为 |
|------|------|
| 已有需求文档（`{WORKFLOW_DIR}/requirements/` 下） | 跳到 Step 1 |
| 用户口头描述需求 | 用 `{WORKFLOW_DIR}/requirements/.template.md` 创建需求文档，向用户复述确认 |

- `<name>` 用英文短横线命名
- 此 name 将作为后续文档的关联标识

### Step 1: 理解需求

- 读取需求文档，摘录关键点
- **确认范围：** 涉及哪个模块、是否触及红线
- 输出确认：1-2 句向用户复述

### Step 2: 设计方案

- 调研相关代码：涉及模块、现有实现、测试情况
- 检查是否存在类似功能可复用
- **输出方案** 到 `{WORKFLOW_DIR}/designs/<name>.md`（与需求同名）
  - 涉及文件列表
  - 改动思路
  - 验收标准
- 用户确认后再实现

### Step 3: 编码实现

- 按设计方案逐个文件修改
- 保持项目代码风格一致
- **红线检查：** 不改未分配模块
- **最小变更：** 只改需要的行

### Step 4: 对照设计审查

- 对照设计方案逐条检查是否覆盖所有需求点和验收标准

### Step 5: 测试验证

| 验证项 | 说明 |
|--------|------|
| Lint | 按项目配置运行 |
| 类型检查 | 如有则运行 |
| 测试 | 运行相关测试 |

### Step 6: 报告 + 收尾

- 汇总改动：涉及文件数、关键修改点
- 更新需求文档 `status: done`
- 更新设计文档 `status: implemented`
- 询问用户下一步操作

---

## 文档命名约定

| 文档类型 | 命名规则 | 示例 |
|---------|---------|------|
| 需求 | `{WORKFLOW_DIR}/requirements/<name>.md` | `video-quality-selector.md` |
| 设计 | `{WORKFLOW_DIR}/designs/<name>.md` | `video-quality-selector.md` |
| 特性 Issue | `{WORKFLOW_DIR}/issues/<name>-<NNN>-<title>.md` | `video-quality-selector-001-player-crash.md` |
| 独立缺陷 | `{WORKFLOW_DIR}/issues/bug-<date>-<NNN>-<title>.md` | `bug-2026-06-07-001-login-failure.md` |

---

## 配置变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKFLOW_DIR` | 工作目录路径 | `.workflow` |

---

## 约束

| 规则 | 说明 |
|------|------|
| **不改红线文件** | 对照项目红线规则 |
| **不改未涉及模块** | 不顺手重构不相关代码 |
| **不提交代码** | 除非用户明确要求 |
| **先设计后编码** | 方案需用户确认后再实现 |
