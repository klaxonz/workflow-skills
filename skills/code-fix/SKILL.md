---
name: code-fix
description: Fix issues identified by code-audit or other issue reports. Use when the user wants to fix a specific issue by number, resolve audit findings, or says "fix issue XXX" or "修 issue XXX".
---

# Code Fix Workflow

修复问题报告的标准化流程，从 issue 到验证通过的完整闭环。

---

## 工作流程

### Step 0: 前置检查

1. **检查工作区状态**
   - 运行 `git status` / `git diff`，确认不覆盖他人未提交改动
   - 未提交改动不涉及本 issue 的 `locations` 或计划修改文件时，记录后继续
   - 未提交改动涉及同一文件或会影响修复判断时，先向用户确认

2. **定位 issue 文件**
   - 在 `{WORKFLOW_DIR}/issues/` 目录下查找指定 issue
   - 如 issue 编号不明确，列出可选 issue 供用户选择

3. **读取并验证 issue**
   - 读取 issue 文件，理解问题描述、影响、建议方向
   - 验证 issue frontmatter 包含必要字段：`title`、`status`、`severity`、`category`、`locations`、`source`
   - 格式不符时，按 `_shared/templates/issue.md` 补全缺失字段

4. **确认范围**
   - 涉及哪些文件（从 `locations` 字段和问题描述中提取）
   - 是否触及红线（对照项目红线规则）

5. **标记状态**
   - issue frontmatter 中 `status` 改为 `in_progress`

---

### Step 1: 调研代码

1. **理解现有逻辑**
   - 读取问题相关的源代码
   - 理解问题所在函数/模块的职责
   - 找出上下游调用者

2. **检查测试情况**
   - 是否有覆盖该代码的测试
   - 测试是否覆盖问题场景

3. **检查同类问题**
   - 搜索是否有相同模式的其他位置
   - 如有，询问用户是否一并修复（减少噪音）

---

### Step 2: 设计方案

按 `_shared/templates/design.md` 输出简短方案到 `{WORKFLOW_DIR}/designs/des-fix-<issue-id>-<title>.md`。

设计文档 frontmatter：

```yaml
---
type: fix
name: <issue-id>
status: proposed
related_requirement:
related_issue: issues/<issue-file>.md
---
```

**方案必须包含：**

| 项目 | 说明 |
|------|------|
| **根因** | 为什么会出现这个问题（不是"代码写错了"，而是设计/流程/认知层面的原因） |
| **修复思路** | 具体改什么、怎么改（1-3 句话，足以让审查者理解意图） |
| **涉及文件** | 列出需要修改的文件及每个文件的改动概要 |
| **潜在风险** | 修复可能影响的上下游、是否需要同步修改测试 |
| **同类问题** | 是否有相同模式的其他位置需要一并修复 |
| **验证结果** | 收尾时填写 lint/type-check/test/manual 的最终结果 |

**示例：**

```markdown
# 修复方案：issue-001 空 catch 块

## 根因

开发者对异常处理的认识不足，认为配置解析失败可以用默认值，但忽略了日志记录的重要性。

## 修复思路

1. 在 catch 块中添加错误日志，记录解析失败的原因
2. 保持返回默认值的行为（符合原设计意图）
3. 同步修改测试，覆盖异常场景

## 涉及文件

- `src/utils/parser.ts`: 添加 catch 块日志
- `src/utils/parser.test.ts`: 添加异常场景测试

## 潜在风险

- 日志格式需与项目现有日志风格一致
- 不影响调用方的错误处理逻辑

## 同类问题

- `src/utils/loader.ts:78` 有相同的空 catch 块，建议一并修复
```

**进入编码规则：**
- 涉及跨模块改动、公共接口变更、数据迁移、权限/安全逻辑或行为兼容性变化时，必须等待用户确认
- 低风险局部修复（如死代码、命名、空 catch、缺少日志、测试断言补充）可直接实施，并在方案文档中记录判断依据

---

### Step 3: 实施修复

1. **按设计方案逐个文件修改**

2. **每次修改后复查：**
   - 是否引入新问题（lint 错误、类型错误、逻辑遗漏）
   - 是否超出方案范围（顺手重构、格式化不相关代码）

3. **红线检查**
   - 修改前确认文件不在红线列表中

4. **最小变更**
   - 优先使用精确替换（Edit 工具），避免整文件重写
   - 只改解决问题需要的行

5. **方案调整**
   - 如发现修复方案需要调整，回到 Step 2 更新方案后再继续
   - 重大调整需再次向用户确认
   - 如确认无法继续修复，将 issue `status` 改为 `blocked`，并在 issue 的 `## 修复尝试` 中记录阻塞原因和已验证事实

---

### Step 4: 自我审查

1. **覆盖检查**
   - 所有问题点是否已覆盖
   - issue 中列出的所有位置是否都已处理

2. **改动检查**
   - 改动是否符合设计方案
   - 是否有遗漏或多余改动

3. **格式检查**
   - 是否引入了不需要的格式化
   - 代码风格是否与项目一致

---

### Step 5: 验证

按以下优先级执行，项目不具备的工具跳过并注明：

| 验证项 | 命令/方法 | 不具备时 |
|--------|-----------|----------|
| Lint | 按项目配置运行（如 `npx eslint`、`flake8`、`cargo clippy`） | 注明"项目无 lint 配置" |
| 类型检查 | 如有（如 `npx tsc --noEmit`、`mypy`） | 跳过 |
| 相关测试 | 运行涉及文件的测试 | 如无测试，手动验证修复逻辑 |
| 手动验证 | 对修复点构造边界用例，确认修复有效且无副作用 | **必做** |

**手动验证方法：**
1. 构造触发原问题的输入
2. 确认问题不再复现
3. 构造边界用例，确认无副作用

**验证结果记录格式：**

```
验证: lint [Y/N/SKIP]  type-check [Y/N/SKIP]  test [Y/N/SKIP]  manual [Y/N]
```

验证结果必须写回修复设计文档的 `## 验证结果`。验证失败时，不关闭 issue；在 issue 的 `## 修复尝试` 中记录失败命令、失败原因和下一步建议。

---

### Step 6: 关闭 issue + 报告结果

1. **更新 issue 状态**
   - issue frontmatter `status` 改为 `fixed`
   - 填写 `fixed_by: designs/des-fix-<issue-id>-<title>.md`
   - 修复设计文档 frontmatter `status` 改为 `implemented`

2. **输出简短报告**

```
<文件>:<行号> — 修复了什么问题
验证: lint Y  type-check Y  test Y  manual Y

改动文件: N 个
新增代码: +X 行
删除代码: -Y 行
```

3. **后续操作**
   - 如修复过程中创建了新 issue，按 `_shared/templates/issue.md` 填写 `severity`、`category`、`locations`、`source: code-fix`，向用户报告并建议后续处理
   - 如用户要求，可继续修复下一个 issue

---

## 配置变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKFLOW_DIR` | 工作目录路径 | `.workflow` |

---

## 约束

| 规则 | 说明 |
|------|------|
| **保持最小变更** | 只改解决问题需要的行 |
| **不改红线文件** | 对照项目红线规则 |
| **不改未涉及模块** | 不顺手格式化不相关代码 |
| **不提交代码** | 除非用户明确要求 |

> 通用约束见 `_shared/conventions.md`。
