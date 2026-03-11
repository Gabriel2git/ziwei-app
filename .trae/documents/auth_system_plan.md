# 鉴权与拦截系统实现计划

## 目标
实现前端密码验证和后端鉴权系统，保护 AI 解析功能不被未授权用户使用。

## 当前状态
- 前端: Next.js 14 + React 18
- 后端: Express.js (server.js)
- AI 聊天 API: /api/chat
- 命盘生成: /api/ziwei (不消耗 Token，无需保护)

## 执行步骤

### 步骤 1: 创建前端鉴权组件
- **文件**: `frontend/src/components/AuthGuard/index.tsx`
- **功能**:
  - 密码输入框组件
  - 验证密码是否为 "gznb"
  - 验证通过后存储状态到 localStorage
  - 未验证时显示遮罩层，禁止访问 AI 聊天

### 步骤 2: 创建前端 Auth Context
- **文件**: `frontend/src/contexts/AuthContext.tsx`
- **功能**:
  - 全局鉴权状态管理
  - 提供 isAuthenticated 状态
  - 提供 login/logout 方法
  - 从 localStorage 恢复登录状态

### 步骤 3: 修改 AI 命理师页面
- **文件**: `frontend/src/app/page.tsx`
- **操作**:
  - 在 AI 命理师页面添加 AuthGuard 组件
  - 未验证时显示密码输入界面
  - 验证通过后正常显示聊天界面

### 步骤 4: 修改前端 API 调用
- **文件**: `frontend/src/lib/ai.ts`
- **操作**:
  - 在 getLLMResponse 函数中添加 Auth Token 到请求头
  - Token 值为 "gznb"

### 步骤 5: 后端鉴权中间件
- **文件**: `src/server.js`
- **操作**:
  - 创建鉴权中间件函数
  - 检查请求头中的 Authorization
  - 验证 Token 是否为 "gznb"
  - 验证失败返回 401 Unauthorized

### 步骤 6: 保护 /api/chat 路由
- **文件**: `src/server.js`
- **操作**:
  - 在 /api/chat 路由前应用鉴权中间件
  - 其他路由（如 /api/ziwei）保持开放

### 步骤 7: 测试验证
- **测试内容**:
  1. 未输入密码时无法访问 AI 聊天
  2. 输入错误密码提示错误
  3. 输入正确密码 "gznb" 后正常访问
  4. 刷新页面后保持登录状态
  5. 后端拒绝无 Token 的请求
  6. 后端拒绝错误 Token 的请求
  7. 命盘生成 API 保持开放

## 代码变更详情

### 前端鉴权组件
```typescript
// AuthGuard 组件
interface AuthGuardProps {
  children: React.ReactNode;
}

// 密码输入界面
// - 标题: "请输入邀请码"
// - 输入框: 密码类型
// - 按钮: "进入"
// - 错误提示: "邀请码错误"
```

### 后端鉴权中间件
```javascript
// 鉴权中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer gznb') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// 应用到 /api/chat
app.post('/api/chat', authMiddleware, async (req, res) => {
  // ...
});
```

### API 请求头
```typescript
// 前端请求时添加 Header
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer gznb'
}
```

## UI 设计

### 密码输入界面
```
┌─────────────────────────────────────┐
│                                     │
│         🔒 邀请码验证               │
│                                     │
│   请输入邀请码以使用 AI 命理师      │
│                                     │
│   ┌─────────────────────────┐      │
│   │  ••••••                 │      │
│   └─────────────────────────┘      │
│                                     │
│   [      进入 AI 命理师      ]     │
│                                     │
│   提示: 请联系管理员获取邀请码      │
│                                     │
└─────────────────────────────────────┘
```

## 安全检查清单
- [ ] 前端密码输入组件正常显示
- [ ] 密码验证逻辑正确
- [ ] localStorage 存储和恢复正常
- [ ] 后端鉴权中间件正常工作
- [ ] /api/chat 受保护
- [ ] /api/ziwei 保持开放
- [ ] 错误密码被拒绝
- [ ] 正确密码通过验证
