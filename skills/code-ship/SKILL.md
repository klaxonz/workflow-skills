---
name: code-ship
description: Prepare code for release. ALWAYS use when user says commit message/写提交/pr 描述/PR summary/release notes/changelog/发版/提交前检查/帮我提交/改了什么/总结变更. Generates structured git output from diffs and history.
---

# Code Ship

代码准备好了，帮它走出去。

## 触发

- "帮我写 commit message" / "总结一下我改了什么"
- "帮我写 PR 描述" / "给这个 PR 写个摘要"
- "生成 release notes" / "写 changelog"
- "提交前帮我看一眼改了什么"（Pre-commit review）
- "帮我写个 version tag"

不触发（交给其他 skill）：改代码、修 bug、加功能、审计代码。

## 核心方法

所有交付都遵循：**读变更 → 理解意图 → 生成文本。**

### 读变更
先获取变更内容——`git diff`（未提交）、`git diff main...HEAD`（分支）、`git log`（历史）。确认变更范围和边界。**按 `_shared` 约定的探索方法快速理解变更涉及的文件上下文。**

### 理解意图
不是翻译 diff——是理解开发者做了什么、为什么做。从文件名、函数签名变化、注释、issue 引用中提取意图。一个变更可能包含多个逻辑块，分开理解。

### 生成文本

**Commit message** — 遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
```
<type>(<scope>): <简述>

<详细说明（如需）>
```
type: feat / fix / refactor / docs / test / chore
简述：一行说清做了什么。动词开头，中文英文皆可，保持项目现有风格。

**PR 描述** — 包含：
- 做了什么（一段话）
- 为什么这么做（背景/动机）
- 怎么验证（测试/截图/步骤）

**Release notes** — 从 commit history 聚合，按 type 分组：
```
## 新功能
- ...
## 修复
- ...
## 其他
- ...
```

**Pre-commit review** — 快速过一遍 diff，指出明显的遗漏（调试代码、console.log、硬编码临时值、未关联 issue 的大改动）。只提醒，不阻塞。

### 风格
生成内容融入项目现有风格。读一下已有的 commit message 和 PR 描述，模仿其格式、语言、详细程度。

## 约束

- 改文档/CHANGELOG 前确认文件不在红线列表
- 不擅自提交代码——生成文本让用户确认后再提交
- 不提交，除非用户明确要求
- Pre-commit review 是提醒，不是阻塞——用户可以选择忽略
- Pre-commit review 发现的问题按 `_shared` 约定创建 issue，`source: code-ship`
