---
title: <问题简述>
status: open
severity: critical | high | medium | low
confidence: <0-100>  <!-- 审计 agent 对判断的确信度，可选 -->
category: architecture | security | compliance | error-handling | dead-code | test-quality | naming | reliability | maintainability | performance
locations:
  - <文件路径:行号>
source: audit | code-build | code-fix | code-ship | manual
fixed_by:
---

## 代码证据

<!-- 贴出有问题的代码片段，标注行号。这是 fix agent 最重要的消费字段 -->
```
<代码片段>
```

## 问题描述

<!-- 为什么这是问题，一句话 -->

## 建议方向

<!-- 修复思路（方向性，不是详细方案） -->

## 同类模式

<!-- 相同问题模式的其他位置，可选——避免 fix agent 修完一个漏掉一批 -->

## 现象与复现

<!-- 仅 source: manual；source: audit 删除此段 -->

- 现象：
- 复现步骤：
- 期望结果：
- 实际结果：
- 环境：

## 影响

<!-- 不修复的后果 -->

## 修复尝试

<!-- 失败/阻塞时追加记录；成功时 fixed_by 指向最终方案 -->
