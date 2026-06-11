---
name: code-audit
description: Analyze code for design and quality issues — code smells, architectural problems, anti-patterns, and convention violations. READ-ONLY. Use when the user asks to audit, review, or scan code for problems.
---

# Code Audit

只读审查，产出 issue 报告。

---

## 流程

### Step 1: 确认范围

向用户确认：

| 参数 | 选项 | 默认 |
|------|------|------|
| **范围** | 指定目录/模块 或 全项目 | 用户指定 |
| **关注点** | `all`（全量）/ `security`（仅安全+合规） | `all` |

> `security` 模式只扫描：红线合规 + 硬编码密钥 + 注入漏洞 + 路径遍历 + 资源泄漏。适合 CI 或快速安全检查。

---

### Step 2: 执行扫描

按关注点逐项扫描。每项用 `rg`（ripgrep）等工具实际检索代码，不只凭记忆。

#### 红线合规

| 检查项 | 检测方法 |
|--------|----------|
| 违反项目红线规则 | 读取 `CONTRIBUTING.md`、`.gitattributes` 等中的禁止修改清单，逐条对照 |

#### 架构问题

| 检查项 | 检测方法 |
|--------|----------|
| 循环依赖 | 检查 import 关系，找 A→B→A 循环；关注跨层引用 |
| 职责不清 | 文件 >300 行、函数 >50 行、一个模块做多件不相关的事 |
| 违反分层 | UI 组件直接调 API/数据库、业务逻辑散落在 UI 中 |

#### 错误处理

| 检查项 | 检测方法 |
|--------|----------|
| 异常被吞 | `rg 'catch\s*\{\s*\}'`、`rg 'catch\s*\(\s*\)\s*\{\s*\}'` |
| 日志无上下文 | 检查 `console.log`/`logger` 调用是否含变量值、请求 ID |
| 错误分类缺失 | 所有错误用同一类型抛出，未区分业务/系统/验证错误 |

#### 安全问题

| 检查项 | 检测方法 |
|--------|----------|
| 硬编码密钥 | `rg '(password\|secret\|token\|api[_-]?key)\s*[:=]\s*["\x27]'`，排除 `process.env` |
| 命令注入 | `rg '\b(exec\|spawn\|eval)\b'`，检查参数是否来自用户输入 |
| 路径遍历 | `rg '\b(readFile\|open)\b'`，检查路径是否拼接用户输入 |
| SQL 注入 | 搜索 SQL 字符串拼接，检查是否使用参数化查询 |

#### 隐藏问题

| 检查项 | 检测方法 |
|--------|----------|
| TODO/FIXME/HACK/XXX | `rg -n 'TODO\|FIXME\|HACK\|XXX' --type-add 'src:*.{ts,js,py,go}' -t src` |
| 废弃代码 | 未被 import 的 export、未被调用的函数、注释掉的代码块 >10 行 |
| 未使用 import | 检查 import 是否实际被引用 |

#### 质量信号

| 检查项 | 检测方法 |
|--------|----------|
| 测试覆盖真实性 | 测试是否有断言、是否只测 happy path、mock 是否超过真实代码量 |
| 命名传达意图 | 变量名 `data`/`info`/`result`/`temp` 过于泛化；函数名如 `process`/`handle` |
| 资源泄漏 | 搜索文件/连接/流打开操作，确认有对应关闭 |
| 魔法数字 | 硬编码数字无常量定义或注释说明 |

---

### Step 3: 整理 & 去重

- 同类问题合并（如多个文件的空 catch 块 → 一个 issue）
- 按 `_shared/conventions.md` 中的严重度定义分配 severity
- 检查已有 issue，避免重复创建

---

### Step 4: 用户确认

**输出汇总表，让用户选择创建哪些：**

```markdown
## 审计发现

共 N 项。选择要创建的 issue：

| # | 问题 | 严重度 | 位置 | 创建? |
|---|------|--------|------|:----:|
| 1 | 硬编码 API Key | critical | src/config.ts:12 | [ ] |
| 2 | 空 catch 块 | medium | src/parser.ts:42, src/loader.ts:78 | [ ] |
| 3 | 循环依赖 | high | src/a.ts ↔ src/b.ts | [ ] |
```

用户确认后再进入 Step 5。

---

### Step 5: 创建 issue

按 `_shared/templates/issue.md` 格式，`source: audit`。文件命名 `issue-<NNN>-<slug>.md`。

---

## 约束

| 规则 | 说明 |
|------|------|
| **只读** | 不修改代码 |
| **用户决策** | 让用户选创建哪些 issue |
| **减少噪音** | 同类合并 |
