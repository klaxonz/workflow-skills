---
name: code-audit
description: Analyze code for design and quality issues — code smells, architectural problems, anti-patterns, and convention violations. READ-ONLY analysis; produces issue reports without making changes.
---

# Code Audit Workflow

对项目代码进行 **只读审查**，输出问题报告，不做自动修复。

---

## 工作流程

### Step 1: 确定范围与深度

向用户确认以下参数：

| 参数 | 选项 | 说明 |
|------|------|------|
| **范围** | 指定模块 / 全量 | 默认：用户指定的模块 |
| **深度** | quick / standard / deep | 默认：standard |
| **关注点** | 架构 / 安全 / 质量 / 全部 | 默认：全部 |

**深度说明：**

| 深度 | 扫描内容 | 预计时间 |
|------|----------|----------|
| **quick** | 红线合规 + 安全硬伤，跳过质量信号和隐藏问题 | 5-10 分钟 |
| **standard** | 完整扫描表，同类问题合并 | 15-30 分钟 |
| **deep** | standard + 追踪调用链、检查测试真实覆盖率、分析依赖关系图 | 30-60 分钟 |

---

### Step 2: 扫描

按以下检查项逐项扫描。每项给出具体检测方法：

#### 红线合规

| 检查项 | 检测方法 |
|--------|----------|
| 对照项目红线规则 | 读取项目中的红线规则文件（如 `CLAUDE.md`、`.cursorrules`、`CONTRIBUTING.md`），逐条检查代码是否违反 |

#### 架构问题

| 检查项 | 检测方法 |
|--------|----------|
| 循环依赖 | 检查 import/require 关系图，找 A→B→A 循环；重点关注跨层引用（如 utils 引用 components） |
| 职责不清 | 单个文件超过 300 行、单个函数超过 50 行、一个模块做两件以上不相关的事 |
| 违反分层 | 表现层直接访问数据层（如 UI 组件直接调用 API/数据库）、业务逻辑散落在 UI 代码中 |

#### 错误处理

| 检查项 | 检测方法 |
|--------|----------|
| 异常被吞 | 搜索 `catch {}`、`catch(e){}` 空 catch 块、`.catch(() => {})` |
| 日志无上下文 | 搜索 `console.log`/`logger` 调用，检查是否包含足够定位信息（变量值、请求 ID 等） |
| 错误分类缺失 | 所有错误都用同一类型抛出，没有区分业务错误/系统错误/验证错误 |

#### 安全问题

| 检查项 | 检测方法 |
|--------|----------|
| 硬编码密钥/Token | 搜索 `password`、`secret`、`token`、`api_key`、`apikey` 等关键词的字符串赋值，排除配置文件和 `process.env` 引用 |
| 命令注入 | 搜索 `exec`、`spawn`、`eval`、`Function(` 调用，检查参数是否来自用户输入且未过滤 |
| 路径遍历 | 搜索文件读写操作（`fs.readFile`、`open(` 等），检查路径是否拼接用户输入 |
| SQL 注入 | 搜索 SQL 拼接（字符串拼接 SQL、模板字符串 SQL），检查是否使用参数化查询 |

#### 隐藏问题

| 检查项 | 检测方法 |
|--------|----------|
| TODO/FIXME/HACK/XXX | `grep -rn 'TODO\|FIXME\|HACK\|XXX' --include='*.ts' --include='*.js'`（按项目语言调整扩展名） |
| 废弃代码 | 未被 import 的 export、未被调用的函数、注释掉的代码块超过 10 行 |
| 未使用 import | IDE 报告或 `ts-unused-exports` 等工具检测结果 |

#### 质量信号

| 检查项 | 检测方法 |
|--------|----------|
| 测试覆盖真实性 | 检查测试是否有断言、是否只测 happy path、mock 是否过度（mock 超过真实代码） |
| 命名传达意图 | 变量名 `data`/`info`/`result`/`temp` 等过于泛化；函数名不能表达行为（如 `process`、`handle`） |
| 资源泄漏 | 搜索文件/连接/流的打开操作，确认有对应的关闭（try/finally、using、on('close')） |
| 魔法数字 | 硬编码的数字没有常量定义或注释说明含义 |

> **quick 深度**：只扫红线合规 + 安全问题。
> **deep 深度**：额外绘制模块依赖图、分析测试覆盖率数据、追踪关键函数调用链。

---

### Step 3: 去重

创建 issue 前检查 `{WORKFLOW_DIR}/issues/` 目录下已有的未关闭 issue（`open`、`in_progress`、`blocked`）：

- 相同问题不重复创建
- 同类问题合并到一个 issue（如多个文件有相同的空 catch 块）
- 在 issue 中列出所有涉及位置

---

### Step 4: 输出 issue

每个问题一个文件，路径 `{WORKFLOW_DIR}/issues/`。

**文件命名：** `issue-<NNN>-<title>.md`

- `<NNN>`: 三位数字编号，全局递增（检查已有 issue 确定起始编号）
- `<title>`: 问题简述的英文 slug 形式

创建文件前重新扫描 `{WORKFLOW_DIR}/issues/`。如编号已存在，递增到下一个可用编号。

**格式：** 参照 `_shared/templates/issue.md`，其中 `source: audit`。

**示例：**

```markdown
---
title: 空 catch 块吞没异常
status: open
severity: medium
category: error-handling
locations:
  - src/utils/parser.ts:42
source: audit
fixed_by:
---

## 问题描述

`parseConfig` 函数的 catch 块为空，配置解析失败时无任何日志或错误传播。

```typescript
try {
  return JSON.parse(content);
} catch {}  // 问题所在
```

## 影响

配置错误时静默使用默认值，可能导致难以排查的行为异常。用户不知道配置加载失败。

## 建议方向

1. 至少记录错误日志
2. 考虑是否应向上传播或使用默认值并 warn
3. 检查其他文件是否有相同问题，一并修复

## 修复尝试
```

---

### Step 5: 汇总

输出优先级最高的 3-5 个问题，每个附修复思路。

**格式：**

```markdown
## 审计汇总

共发现 N 个问题，其中 critical M 个、high K 个。

### 优先处理

| 编号 | 问题 | 严重度 | 修复思路 |
|------|------|--------|----------|
| issue-001 | 硬编码 API Key | critical | 移至环境变量 |
| issue-002 | 空 catch 块 | medium | 添加错误日志 |
| issue-003 | 循环依赖 | high | 重构模块拆分 |

### 后续操作

- 如需修复，使用 `code-fix` 技能，指定 issue 编号（如 "修 issue-001"）
- 如需更深入分析某问题，可指定单个 issue 再次运行 deep 审计
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
| **只读** | 不修改任何代码文件 |
| **用户决策** | 汇总后由用户决定修什么 |
| **减少噪音** | 同类问题合并，不拆分多个 issue |

> 通用约束见 `_shared/conventions.md`。
