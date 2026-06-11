---
name: feature-flow
description: Full feature lifecycle for planned new features — requirements gathering, design, implementation, review, testing, and wrap-up. Use when the user asks to add or implement a new capability with acceptance criteria. Do not use for bug reports, crash logs, stack traces, failed tests, runtime errors, import errors, regressions, or startup failures; those belong to code-fix.
---

# Feature Flow Workflow

端到端实现流程：从需求提出 → 需求文档 → 设计方案 → 编码 → 审查 → 测试 → 收尾。

---

## 工作流程

### 触发边界

**触发条件：** 用户要求新增功能、添加模块、实现需求，且包含或可提取验收标准。

**不触发条件（交给 `code-fix`）：**
- 报错日志、traceback、stack trace
- 启动失败、运行时异常、导入错误、测试失败
- 回归、线上缺陷、"刚才这样报错"、"这里坏了" 等 bug 报告

**边界模糊时：** 如果用户描述同时包含「新功能」和「缺陷」要素，优先判断用户主意图。无法判定时向用户确认。

### Step 0: 需求获取

| 场景 | 行为 |
|------|------|
| 已有需求文档（`{WORKFLOW_DIR}/requirements/` 下） | 跳到 Step 1 |
| 用户口头描述需求 | 按 `_shared/templates/requirements.md` 格式创建需求文档，向用户复述确认 |

**创建需求文档时：**
- 创建前重新扫描 `{WORKFLOW_DIR}/requirements/`，取下一个可用三位编号
- 文件必须命名为 `{WORKFLOW_DIR}/requirements/req-<NNN>-<name>.md`
- frontmatter 必须写入 `id: req-<NNN>` 和 `name: <name>`
- `<name>` 用英文短横线命名（kebab-case）
- 此 name 将作为后续文档的关联标识
- 验收标准必须可验证（能判断是否完成）
- 已有需求文档以 frontmatter `id` 和 `name` 为准；缺少时，从文件名 `req-<NNN>-<name>.md` 解析并补齐

---

### Step 1: 理解需求

1. **读取需求文档，摘录关键点**
   - 功能目标
   - 验收标准
   - 涉及模块
   - 约束条件

2. **确认范围**
   - 涉及哪个模块
   - 是否触及红线（对照项目红线规则）

3. **输出确认**
   - 用 1-2 句话向用户复述需求
   - 确认理解是否正确

---

### Step 2: 设计方案

1. **调研相关代码**
   - 涉及模块的现有实现
   - 是否有类似功能可复用
   - 测试覆盖情况

2. **按 `_shared/templates/design.md` 输出方案到 `{WORKFLOW_DIR}/designs/des-feature-<name>.md`**

设计文档 frontmatter：

```yaml
---
type: feature
name: <name>
status: proposed
related_requirement: requirements/req-<NNN>-<name>.md
related_issue:
---
```

**方案必须包含：**

| 项目 | 说明 |
|------|------|
| **需求映射** | 每个验收标准对应的实现方案 |
| **涉及文件** | 需要新建/修改的文件及每个文件的改动概要 |
| **复用检查** | 是否有现有代码可复用，避免重复实现 |
| **风险点** | 可能影响现有功能的改动、需要同步修改的测试 |
| **实现顺序** | 建议的文件修改顺序（考虑依赖关系） |
| **验证结果** | 收尾时填写 lint/type-check/unit-test/manual 的最终结果 |

**示例：**

```markdown
# 设计方案：video-quality-selector

## 需求映射

| 验收标准 | 实现方案 |
|----------|----------|
| 用户可选择视频清晰度 | 在播放器控制栏添加清晰度选择下拉菜单 |
| 选择后切换视频源 | 调用 player.switchQuality(quality) API |
| 记住用户选择 | 存储到 localStorage，下次自动应用 |

## 涉及文件

- `src/components/Player/Controls.tsx` (修改): 添加清晰度选择 UI
- `src/components/Player/QualitySelector.tsx` (新建): 清晰度选择组件
- `src/hooks/useQualityPreference.ts` (新建): 用户偏好存储 hook

## 复用检查

- `Dropdown` 组件可复用，无需重写
- `useLocalStorage` hook 可复用于存储偏好

## 风险点

- 切换清晰度时可能短暂卡顿，需添加 loading 状态
- 需同步修改 Player 组件测试

## 实现顺序

1. `useQualityPreference.ts` (无依赖)
2. `QualitySelector.tsx` (依赖 hook)
3. `Controls.tsx` (依赖组件)
```

**用户确认后再实现。**

---

### Step 3: 编码实现

1. **按设计方案的实现顺序逐个文件修改**

2. **每个文件修改后自检：**
   - 是否与设计方案一致
   - 是否引入不需要的格式化
   - 代码风格是否与项目一致

3. **红线检查**
   - 修改前确认文件不在红线列表中

4. **最小变更**
   - 只改需要的行，不重构不相关代码

5. **方案调整**
   - 如发现设计方案需要调整，回到 Step 2 更新后再继续
   - 重大调整需再次向用户确认

---

### Step 4: 对照设计审查

1. **逐条检查验收标准**
   - 每条是否都已实现
   - 是否有遗漏

2. **对照设计方案检查**
   - 实现是否符合设计意图
   - 是否有偏离

3. **输出检查清单**

```markdown
## 实现检查

| 验收标准 | 状态 | 说明 |
|----------|:----:|------|
| 用户可选择视频清晰度 | ✅ | 下拉菜单已实现 |
| 选择后切换视频源 | ✅ | 调用 switchQuality API |
| 记住用户选择 | ✅ | localStorage 存储 |

偏离设计：无
```

---

### Step 5: 测试验证

按以下优先级执行，项目不具备的工具跳过并注明：

| 验证项 | 命令/方法 | 不具备时 |
|--------|-----------|----------|
| Lint | 按项目配置运行 | 注明"项目无 lint 配置" |
| 类型检查 | 如有则运行 | 跳过 |
| 测试 | 运行涉及模块的测试 | 见下方"无测试时" |
| 集成测试 | 如有则运行 | 跳过 |
| 手动验证 | 按验收标准逐条验证 | **必做** |

**无测试时：**
- 不跳过验证步骤
- 对每个验收标准，构造手动验证用例：
  1. 描述输入/操作
  2. 描述预期输出/行为
  3. 执行并记录结果
- 建议用户补充测试（但不自动创建测试文件，除非需求中包含）

**手动验证示例：**

```markdown
## 手动验证

| 验收标准 | 操作 | 预期结果 | 实际结果 |
|----------|------|----------|----------|
| 用户可选择清晰度 | 播放视频，点击设置图标 | 显示清晰度选项列表 | ✅ 一致 |
| 切换清晰度 | 选择 720p | 视频切换到 720p 源 | ✅ 一致 |
| 记住选择 | 刷新页面 | 自动选择 720p | ✅ 一致 |
```

**验证结果记录格式：**

```
验证: lint [Y/N/SKIP]  type-check [Y/N/SKIP]  test [Y/N/SKIP]  manual [Y/N]
验收标准: [1/3] [2/3] [3/3] (通过/总数)
```

验证结果必须写回功能设计文档的 `## 验证结果`。

---

### Step 6: 报告 + 收尾

1. **汇总改动**
   - 涉及文件数
   - 关键修改点
   - 代码行数变化

2. **更新文档状态**
   - 需求文档 `status: done`
   - 设计文档 `status: implemented`
   - 如果功能中途取消或放弃：
     - 需求文档 `status: cancelled`
     - 设计文档 `status: cancelled`
     - 在文档正文记录取消原因和已完成/未完成的部分

3. **输出报告**

```markdown
## 功能完成报告

**功能**: video-quality-selector

**改动文件**: 3 个
- src/components/Player/Controls.tsx
- src/components/Player/QualitySelector.tsx (新建)
- src/hooks/useQualityPreference.ts (新建)

**代码变化**: +156 -12

**验证**: lint Y  type-check Y  test Y  manual Y

**验收标准**: 3/3 通过
```

4. **处理发现的 bug**

如开发过程中发现了预存在 bug：
- 按 `_shared/templates/issue.md` 创建 issue 文件：`issue-<NNN>-<title>.md`
- 必须填写 `severity`、`category`、`locations`、`source: feature-flow`
- 创建前重新扫描 `{WORKFLOW_DIR}/issues/`，如编号已存在，递增到下一个可用编号
- 在报告中列出发现的 bug
- 建议用户后续用 `code-fix` 处理
- **不在当前功能流程中修复 bug**（除非用户明确要求）

5. **询问用户下一步操作**
   - 是否需要提交代码
   - 是否有其他需求

---

## 文档命名约定

> 完整约定见 `_shared/conventions.md`。

| 文档类型 | 命名规则 | 示例 |
|---------|---------|------|
| 需求 | `{WORKFLOW_DIR}/requirements/req-<NNN>-<name>.md` | `req-001-video-quality.md` |
| 功能设计 | `{WORKFLOW_DIR}/designs/des-feature-<name>.md` | `des-feature-video-quality.md` |
| 修复设计 | `{WORKFLOW_DIR}/designs/des-fix-<issue-id>-<title>.md` | `des-fix-issue-001-player-crash.md` |
| Issue | `{WORKFLOW_DIR}/issues/issue-<NNN>-<title>.md` | `issue-001-player-crash.md` |

---

## 配置变量

工作流目录、命名约定等跨技能配置见 `_shared/conventions.md`。

## 约束

| 规则 | 说明 |
|------|------|
| **先设计后编码** | 方案需用户确认后再实现 |
| **不改红线文件** | 对照项目红线规则 |
| **不改未涉及模块** | 不顺手重构不相关代码 |
| **不提交代码** | 除非用户明确要求 |

> 通用约束见 `_shared/conventions.md`。
