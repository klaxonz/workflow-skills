---
name: code-audit
description: Analyze code for problems — bugs, design flaws, security risks, maintainability issues. Read-only. Use when asked to audit, review, or scan code.
---

# Code Audit

审查代码，发现问题。只读，不修改。

## 审查方法

逐文件阅读代码，理解意图、数据流、边界条件。

每读一个文件问自己：
- 这段代码可能以什么方式出错？（空值、越界、并发、异常路径）
- 下一个维护者能看懂吗？（命名、结构、重复、死代码）
- 外部输入是否触达危险操作？（exec、文件读写、SQL、不安全的反序列化）
- 用对了项目的基础设施吗？（分层、错误类型、已有工具函数）

不要被常见检查项限制——发现任何值得关注的问题都应记录。自动化搜索（rg）作为辅助，你的判断才是核心。

安全、错误处理、架构、可维护性、测试质量、性能……都是合理方向。

## 输出

将发现整理为汇总表，让用户选择哪些创建 issue：

```
## 审计发现 — 共 N 项

请回复要创建哪些（"全部" / "1,2,4" / "跳过"）：

| # | 问题 | 严重度 | 位置 |
|---|------|--------|------|
```

严重度按 `_shared/conventions.md` 定义分配。同类问题合并，减少噪音。

用户确认后按 `_shared` 约定创建 issue，`source: audit`。

## 约束

- 只读，不修改代码
- 合并同类问题，不要刷屏
- 尊重项目红线文件（查阅 CONTRIBUTING.md 等）
