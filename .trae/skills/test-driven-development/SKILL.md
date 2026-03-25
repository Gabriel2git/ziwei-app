---
name: "test-driven-development"
description: "测试驱动开发技能。强制 RED-GREEN-REFACTOR 循环：先写失败的测试，观察测试失败，编写最小代码，观察测试通过，重构。删除测试前写的代码。"
---

# Test-Driven Development - 测试驱动开发

## 何时使用

当满足以下条件时，**必须**使用此技能：

1. **实现新功能** - 需要编写功能代码时
2. **修复bug** - 需要确保bug不再出现
3. **重构代码** - 需要验证重构没有破坏功能

## TDD 核心原则

### RED - 写失败的测试
1. 先写一个测试
2. 运行测试，确认失败
3. 失败信息应该指向你需要实现的功能

### GREEN - 写最小代码
1. 编写最少的代码让测试通过
2. 不要优化，不要完善
3. 只要测试通过就行

### REFACTOR - 重构
1. 重构代码
2. 保持测试通过
3. 删除重复代码

## 工作流程

### 1. 写测试 (RED)

首先编写一个测试用例：

```typescript
// 测试用户登录功能
test('用户使用正确密码可以登录', () => {
  const result = login('user@example.com', 'correct-password');
  expect(result.success).toBe(true);
});
```

运行测试，确认失败：
```
FAIL  tests/login.test.ts
  用户使用正确密码可以登录
    Expected: true
    Received: undefined
```

### 2. 写最小代码 (GREEN)

编写最少的代码让测试通过：

```typescript
function login(email, password) {
  return { success: true };
}
```

运行测试，确认通过：
```
PASS  tests/login.test.ts
```

### 3. 重构 (REFACTOR)

如果需要，改进代码但保持测试通过：

```typescript
function login(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Missing credentials' };
  }
  // 实际登录逻辑
  return { success: true };
}
```

运行测试，确认仍然通过：
```
PASS  tests/login.test.ts
```

## 测试文件位置

根据项目结构：
- 前端项目: `frontend/src/**/*.test.ts` 或 `*.spec.ts`
- 后端项目: `backend/tests/*.test.js`

## 测试框架

根据现有项目配置使用：
- Jest (JavaScript/TypeScript)
- Vitest
- Playwright (E2E测试)

## 最佳实践

### DO

✅ **先写测试** - 始终先写测试再写实现
✅ **小步前进** - 每次只写一个测试
✅ **快速验证** - 频繁运行测试
✅ **测试隔离** - 每个测试独立，不依赖其他测试
✅ **清晰命名** - 测试名称描述预期行为

### DON'T

❌ **不要先写实现** - 永远不要先写代码再写测试
❌ **不要跳过失败** - 测试失败时不要忽略
❌ **不要测试过多** - 一个测试一个断言
❌ **不要测试细节** - 测试行为而非实现

## 测试命名规范

使用描述性名称：

```typescript
// ✅ 好：描述预期行为
test('用户登录成功返回用户信息')

// ❌ 差：描述实现细节
test('login函数返回对象')
```

## 触发条件

此技能在以下情况自动触发：

1. 开始实现新功能
2. 修复bug
3. 重构代码

## 与其他技能的配合

- **writing-plans** - 计划中包含测试任务
- **brainstorming** - 设计时考虑可测试性
- **requesting-code-review** - 审查测试质量
