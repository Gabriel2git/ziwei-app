# 移除 RAG 功能计划

## 目标
暂时移除 AI prompt 中的 RAG 检索内容，因为该功能尚不成熟。

## 当前状态
RAG 功能在 `frontend/src/lib/ai.ts` 文件中实现，主要包括：

1. `fetchRAGContext` 函数 (第 439-465 行) - 调用后端 RAG 检索 API
2. `getLLMResponse` 函数中的 RAG 集成逻辑 (第 479-496 行) - 将 RAG 上下文添加到系统提示中

## 执行步骤

### 步骤 1: 移除 RAG 上下文集成逻辑
- **文件**: `frontend/src/lib/ai.ts`
- **操作**: 注释掉或删除 `getLLMResponse` 函数中的 RAG 相关代码
- **需要移除的代码**:
  - 第 479-483 行: 调用 `fetchRAGContext` 获取 RAG 上下文的代码
  - 第 485-496 行: 将 RAG 上下文添加到系统提示的逻辑
- **保留**: `fetchRAGContext` 函数本身，以便将来重新启用

### 步骤 2: 简化消息处理
- 直接使用原始的 `messages` 数组，不再进行 RAG 增强
- 修改后的代码应直接使用 `messages` 而不是 `enhancedMessages`

### 步骤 3: 使用 Playwright 验证前端
- 使用浏览器 (`E:\TraeFile\chrome-win`) 打开前端页面
- 验证 AI 聊天功能正常工作
- 确认没有 RAG 相关的网络请求或错误

## 代码变更详情

### 变更前:
```typescript
// 获取用户最新的问题
const userMessages = messages.filter(m => m.role === 'user');
const latestUserMessage = userMessages[userMessages.length - 1];

// 调用RAG检索获取上下文
let ragContext = '';
if (latestUserMessage) {
  ragContext = await fetchRAGContext(latestUserMessage.content);
}

// 如果有RAG上下文，添加到系统提示中
const enhancedMessages = ragContext 
  ? messages.map(m => {
      if (m.role === 'system' && m.content) {
        return {
          role: 'system' as const,
          content: m.content + '\n\n## 参考资料\n' + ragContext
        };
      }
      return m;
    })
  : messages;
```

### 变更后:
```typescript
// RAG 功能暂时禁用
// const userMessages = messages.filter(m => m.role === 'user');
// const latestUserMessage = userMessages[userMessages.length - 1];
// let ragContext = '';
// if (latestUserMessage) {
//   ragContext = await fetchRAGContext(latestUserMessage.content);
// }
// 直接使用原始消息，不添加RAG上下文
const enhancedMessages = messages;
```

## 安全检查清单
- [ ] RAG 上下文获取代码已注释/删除
- [ ] AI 聊天功能正常工作
- [ ] 没有 RAG 相关的网络请求错误
- [ ] `fetchRAGContext` 函数保留以便将来重新启用
