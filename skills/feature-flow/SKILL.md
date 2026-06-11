---
name: feature-flow
description: Full lifecycle for planned new features — requirements, design, implementation, and verification. Use when the user asks to add or implement a new capability, feature, or module. Do not use for bugs, crashes, errors, or regressions; those belong to code-fix.
---

# Feature Flow

需求 → 设计 → 编码 → 验证 → 收尾。

---

## 触发边界

**触发：** 用户要求新增功能/模块，且可提取验收标准。

**不触发（交给 code-fix）：** 报错日志、traceback、启动失败、测试失败、回归、"这里坏了"。

**模糊时：** 优先判断主意图，无法判定问用户。

---

## 流程

### Step 0: 获取需求

| 场景 | 行为 |
|------|------|
| `{WORKFLOW_DIR}/requirements/` 下已有需求文档 | 跳到 Step 1 |
| 用户口头描述 | 按 `_shared/templates/requirements.md` 创建，**将验收标准单独列出请用户确认**，通过后再继续 |

需求文档命名 `req-<NNN>-<name>.md`，`<NNN>` 三位递增。

---

### Step 1: 理解需求

1. 读需求文档，摘录：功能目标、验收标准、涉及模块、约束
2. 确认范围：涉及模块、是否触及红线
3. 用 1-2 句话向用户复述，确认理解

---

### Step 2: 设计方案

按 `_shared/templates/design.md`（`type: feature`）输出到 `{WORKFLOW_DIR}/designs/design-<NNN>-<name>.md`。`<NNN>` 取 design 目录下一个可用编号，`<name>` **必须** 与需求文档 frontmatter 的 `name` 一致。

**必须包含：** 需求映射、涉及文件、复用检查、风险点、实现顺序。

**用户确认后再实现。**

---

### Step 3: 编码实现

1. 按实现顺序逐个文件修改
2. 每次改后自查：是否与设计一致、是否引入不需要的格式化
3. 修改前确认不在红线列表
4. 方案需调整 → 回 Step 2 更新后继续

---

### Step 4: 验证

按项目实际工具执行：

| 检查 | 命令 | 无此工具 |
|------|------|----------|
| Lint | `npx eslint` / `flake8` | 跳过 |
| 类型检查 | `npx tsc --noEmit` / `mypy` | 跳过 |
| 测试 | 运行涉及模块的测试 | 跳过 |

逐条对照验收标准：

```markdown
| 验收标准 | 状态 | 说明 |
|----------|:----:|------|
| 用户可选择清晰度 | ✅ | 下拉菜单已实现 |
| 切换视频源 | ✅ | 调用 switchQuality |
| 记住选择 | ✅ | localStorage 存储 |
```

验证结果写回设计文档 `## 验证结果`：
```text
lint: pass  type-check: pass  test: pass  验收标准: 3/3
```

> **不自行评估"手动验证通过"。** 请用户在实际环境中逐条确认验收标准。

---

### Step 5: 收尾

1. 需求文档 `status: done`，设计文档 `status: implemented`
2. 功能取消 → 文档 `status: cancelled`，记录原因
3. 输出报告：

```text
功能: <name>
改动文件: N  (+X / -Y)
验证: lint [pass]  type-check [pass]  test [pass]  验收标准: [3/3]
```

4. 发现的预存在 bug → 创建 issue（`source: feature-flow`），在报告中列出，不在当前流程修复
5. 问用户下一步：提交代码 / 其他需求

---

## 约束

| 规则 | 说明 |
|------|------|
| **先设计后编码** | 方案需确认后实现 |
| **不改红线文件** | 对照项目红线 |
| **不改无关模块** | 不顺手重构 |
| **不提交** | 除非用户要求 |
