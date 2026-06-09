---
name: code-fix
description: Fix issues identified by code-audit or other issue reports. Use when the user wants to fix a specific issue by number, resolve audit findings, or says "fix issue XXX" or "修 issue XXX".
---

# Code Fix Workflow

修复问题报告的标准化流程，从 issue 到验证通过的完整闭环。

---

## 工作流程

### Step 0: 前置检查

- 运行 `git status` / `git diff`，确认不覆盖他人未提交改动
- 定位 issue 文件（`{WORKFLOW_DIR}/issues/` 下）
- 读取 issue，理解问题描述、影响、建议方向
- **确认范围：** 涉及哪些文件、是否触及红线
- **标记状态：** issue frontmatter 中 `status` 改为 `in_progress`

### Step 1: 调研代码

- 读取问题相关的源代码，理解现有逻辑、上下游调用者、测试情况
- 检查是否存在同类问题（批量修，减少噪音）

### Step 2: 设计方案

- 输出简短方案到 `{WORKFLOW_DIR}/designs/<issue-name>.md`
- 明确：**根因 -> 修复思路 -> 涉及文件 -> 潜在风险**
- **用户确认后** 进入编码

### Step 3: 实施修复

- 逐个文件修改，保持项目代码风格一致
- 每次修改后复查是否引入新问题
- **红线检查：** 不碰未分配模块

### Step 4: 自我审查

- 所有问题点是否已覆盖
- 改动是否符合预期、无遗漏
- 是否引入了不需要的格式化

### Step 5: 验证

- Lint 检查
- 类型检查（如有）
- 运行相关测试

### Step 6: 关闭 issue + 报告结果

- issue frontmatter `status` 改为 `fixed`，填写 `fixed_by`
- 简短报告格式：
  ```
  <文件>:<行号> — 修复了什么问题
  验证: lint Y  test Y
  ```

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
| **不改未涉及模块** | 不顺手格式化不相关代码 |
| **保持最小变更** | 只改解决问题需要的行 |
| **不提交代码** | 除非用户明确要求 |
