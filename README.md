# Workflow Skills

面向 AI 编程 Agent 的项目开发工作流技能包，覆盖代码审查、问题修复和功能交付。

技能库本身保持 Agent 无关；不同平台的插件入口放在共享的 `skills/` 目录旁边。

## 包含技能

| Skill | 用途 |
|-------|------|
| `code-audit` | 只读审查代码质量、架构、安全隐患和约定问题 |
| `code-fix` | 基于 issue 的修复流程，从定位问题到验证结果 |
| `feature-flow` | 需求、设计、实现、审查、测试和收尾的完整功能交付流程 |

## 项目结构

```text
skills/
  _shared/
    conventions.md          跨技能约定（issue 格式、命名规则、通用约束、交接协议）
    templates/
      issue.md              统一的问题报告模板
      requirements.md       需求文档模板
  code-audit/
    SKILL.md
  code-fix/
    SKILL.md
  feature-flow/
    SKILL.md

.codex-plugin/
  plugin.json

.claude-plugin/
  plugin.json

.opencode/
  INSTALL.md
```

## 安装

如果你的 Agent 支持插件市场，优先通过插件市场安装。否则可以直接使用已发布的 npm 包；普通用户不需要 clone 仓库。

```bash
npx @klaxonz/workflow-skills install codex:global
```

### Codex

优先通过 Codex 插件市场安装。仓库中的 `.codex-plugin/plugin.json` 会把 Codex 指向 `./skills/`。

不使用插件市场时，可以通过 npm 直接安装：

```bash
npx @klaxonz/workflow-skills install codex
npx @klaxonz/workflow-skills install codex:global
```

### Claude Code

优先通过 Claude 插件市场安装。仓库中的 `.claude-plugin/plugin.json` 用于插件分发。

不使用插件市场时，可以通过 npm 直接安装：

```bash
npx @klaxonz/workflow-skills install claude
npx @klaxonz/workflow-skills install claude:global
```

### OpenCode

见 `.opencode/INSTALL.md`。

也可以通过 npm 直接安装：

```bash
npx @klaxonz/workflow-skills install opencode
npx @klaxonz/workflow-skills install opencode:global
```

### 一行安装脚本

```bash
# Linux / macOS
curl -fsSL https://raw.githubusercontent.com/klaxonz/workflow-skills/main/scripts/install.sh | bash -s -- codex:global
```

```powershell
# Windows PowerShell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/klaxonz/workflow-skills/main/scripts/install.ps1))) -Target codex:global
```

## CLI

CLI 是给不使用原生插件系统的环境准备的显式安装器。

| 命令 | 说明 |
|------|------|
| `npx @klaxonz/workflow-skills install <target> [skills...]` | 安装技能到指定目标 |
| `npx @klaxonz/workflow-skills list [target]` | 列出已安装技能 |
| `npx @klaxonz/workflow-skills update <target>` | 从当前来源重新链接技能 |
| `npx @klaxonz/workflow-skills uninstall <target> [skills...]` | 卸载已安装技能 |

target 可选值：`codex`、`codex:global`、`claude`、`claude:global`、`opencode`、`opencode:global`、`windsurf`、`windsurf:global`，或自定义目录路径。

CLI 没有默认 target。请显式选择要安装到哪个 Agent。

## 工作流产物

技能在 `{WORKFLOW_DIR}` 下创建工作流文档，默认目录 `.workflow`。

```text
.workflow/
  issues/          问题报告
  designs/         设计方案
  requirements/    需求文档
```

文档模板内置于 `skills/_shared/templates/`，无需手动创建。

## 开发

只有在修改技能、插件 manifest 或安装器时才需要 clone 仓库：

```bash
git clone https://github.com/klaxonz/workflow-skills.git
cd workflow-skills
node scripts/validate.js
```

### 添加新技能

1. 在 `skills/` 下创建目录，添加 `SKILL.md`（含 frontmatter）
2. 在 `_shared/conventions.md` 中更新相关约定（如有新文档类型）
3. 运行 `node scripts/validate.js` 验证

验证脚本会自动发现 `skills/` 目录下的新技能，无需手动注册。
