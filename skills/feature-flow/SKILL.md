---
name: feature-flow
description: Full lifecycle for planned new features — requirements, design, implementation, verification. Use when the user asks to add a new capability, feature, or module. Do NOT use for bugs, crashes, or regressions (those go to code-fix).
---

# Feature Flow

需求 → 设计 → 实现 → 验证 → 收尾。

## 触发边界

触发：用户要求新增功能/模块，可提取验收标准。

不触发（交给 code-fix）：报错、traceback、启动失败、测试失败、回归、"这里坏了"。模糊时判断主意图，无法判定问用户。

## 开发方法

### 获取需求
用户口头描述 → 按 `_shared` 约定创建需求文档，**将验收标准单独列出请用户确认**。已有文档 → 直接进入下一步。

### 设计方案
按 `_shared` 约定创建设计文档（`type: feature`）。核心写五件事：
- 每条验收标准对应什么实现
- 涉及哪些文件（新建/修改）
- 现有代码/组件能否复用
- 存在什么风险（上下游影响、兼容性）
- 按依赖排序的实现顺序

**用户确认后再开始编码。**

### 实现
按顺序逐个文件修改，每次改后自查是否与设计一致。改前确认不在红线列表。方案需调整 → 回设计方案更新后继续。

### 验证
按项目实际工具执行 lint、类型检查、涉及模块的测试。无对应工具则跳过。

逐条对照验收标准：
```
| 验收标准 | 状态 | 说明 |
|----------|:----:|------|
```

不自行评估"手动验证通过"——请用户在实际环境逐条确认。

### 收尾
按 `_shared` 约定更新需求文档和设计文档状态。输出改动汇总（文件数、增删行数、验证结果、验收标准通过率）。

开发中发现的预存在 bug → 创建 `source: feature-flow` issue，在报告中列出，不在当前流程修复。问用户下一步：提交代码 / 其他需求。

## 约束

- 先设计后编码，方案用户确认后再动手
- 不改红线文件、不顺手重构无关模块
- 不提交，除非用户要求
