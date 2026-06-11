---
name: code-fix
description: Fix issues identified by audit or reported by user. Use when the user asks to fix a specific issue by number, submits a bug, pastes a crash log, traceback, stack trace, failed test, runtime error, import error, regression, startup failure, or says "fix issue XXX" or "修 issue XXX".
---

# Code Fix

从 issue 到验证通过的修复流程。

---

## 流程

### Step 0: 定位 issue

- 用户指定编号 → 读取 `{WORKFLOW_DIR}/issues/issue-<NNN>-*.md`
- 用户报告缺陷但没有 issue → 按 `_shared/templates/issue.md` 创建 `source: manual`，再继续
- 创建前扫描目录取下一个可用编号
- 定位不明确时 `locations` 写 `project-wide`，`severity`、`category` 先填最可能的，后续调研补全
- issue frontmatter `status` 改为 `in_progress`

---

### Step 1: 调研

1. 读问题相关代码，理解函数/模块职责和上下游调用者
2. 对 `source: manual` issue，从现象出发定位根因和准确 `locations`
3. 检查是否有覆盖该代码的测试
4. 搜索同类模式的其他位置

---

### Step 2: 设计方案

按 `_shared/templates/design.md`（`type: fix`）输出方案到 `{WORKFLOW_DIR}/designs/design-<NNN>-<name>.md`。

**必须包含：** 根因、修复思路、涉及文件、潜在风险。

**确认规则：**
- 跨模块改动、接口变更、行为兼容性变化 → **必须等用户确认**
- 局部改动（死代码删除、加日志、加 import）→ 可自定，在方案中记录判断依据
- 不确定 → 问用户

---

### Step 3: 实施

1. 按方案逐个文件修改，用精确替换（Edit），避免整文件重写
2. 每次改后自查：是否引入新问题、是否超出方案范围
3. 修改前确认文件不在红线列表中
4. 方案需要调整 → 回 Step 2 更新后再继续
5. 无法继续 → issue `status: blocked`，在 `## 修复尝试` 记录原因

---

### Step 4: 验证

按项目实际工具执行：

| 检查 | 命令 | 无此工具 |
|------|------|----------|
| Lint | `npx eslint` / `flake8` / `cargo clippy` | 跳过 |
| 类型检查 | `npx tsc --noEmit` / `mypy` | 跳过 |
| 测试 | 运行涉及文件的测试 | 跳过 |

验证结果写回设计文档 `## 验证结果`。格式：
```text
lint: pass  type-check: pass  test: pass
```

验证失败 → 回 Step 3 修正，或更新方案回 Step 2。

> **不自行评估"手动验证通过"。** 修改后请用户在实际环境中确认行为是否符合预期。

---

### Step 5: 收尾

1. issue `status: fixed`，`fixed_by: designs/design-<NNN>-<name>.md`
2. 设计文档 `status: implemented`
3. 输出报告：

```text
改动文件: N
+新增 -删除
验证: lint [pass/fail/skip]  type-check [pass/fail/skip]  test [pass/fail/skip]

请在实际环境中确认修复效果。
```

4. 修复中新发现的问题 → 创建 issue（`source: code-fix`），报告后建议后续处理

---

## 约束

| 规则 | 说明 |
|------|------|
| **最小变更** | 只改需要的行 |
| **不改红线文件** | 对照项目红线 |
| **不改无关模块** | 不顺手重构 |
| **不提交** | 除非用户要求 |
