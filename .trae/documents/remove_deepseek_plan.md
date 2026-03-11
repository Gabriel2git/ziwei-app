# 移除 deepseek-v3.2 模型计划

## 目标

从大模型列表中移除 `deepseek-v3.2` 模型。

## 当前状态

模型列表定义在 `frontend/src/lib/ai.ts` 文件中：

```typescript
const AI_MODELS = [
  "qwen3.5-flash",
  "deepseek-v3.2",  // 需要移除
  "glm-4.7",
  "kimi-k2.5"
];
```

## 执行步骤

### 步骤 1: 更新模型列表

* **文件**: `frontend/src/lib/ai.ts`

* **操作**: 从 `AI_MODELS` 数组中移除 `"deepseek-v3.2"` 项

* **变更后**:

  ```typescript
  const AI_MODELS = [
    "qwen3.5-flash",
    "glm-4.7",
    "kimi-k2.5"
  ];
  ```

### 步骤 2: 检查默认模型设置

* **检查位置**: `getLLMResponse` 函数中的默认参数

* **当前代码**: `async function getLLMResponse(messages: Message[], model: string = 'deepseek-v3.2')`

* **操作**: 将默认模型从 `deepseek-v3.2` 改为 `qwen3.5-flash`

### 步骤 3: 验证其他引用

* 检查项目中是否有其他硬编码引用 `deepseek-v3.2` 的地方

* 确保移除后不会影响现有功能

## 安全检查清单

* [ ] `deepseek-v3.2` 已从 `AI_MODELS` 数组中移除

* [ ] 默认模型参数已更新

* [ ] 前端模型选择器正常显示剩余模型

* [ ] AI 聊天功能正常工作

