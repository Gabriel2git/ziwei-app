# 鉴权与拦截系统实现计划 V2（安全版）

## 目标
实现安全的鉴权系统，密码通过环境变量管理，防止 GitHub 泄露。

## 安全架构设计

### 核心原则
1. **密码不硬编码**: 使用环境变量存储 AUTH_CODE
2. **前端只搬运**: 前端不负责验证，只传递用户输入
3. **后端是裁判**: 后端验证密码是否正确
4. **GitHub 安全**: .env 文件加入 .gitignore，不推送

## 执行步骤

### 步骤 1: 后端环境变量配置
- **文件**: `backend/.env` (新建)
- **内容**: `AUTH_CODE=gznb`
- **操作**: 将 `.env` 加入 `.gitignore`

### 步骤 2: 后端鉴权中间件
- **文件**: `src/server.js`
- **操作**:
  - 加载 dotenv 读取环境变量
  - 创建鉴权中间件，验证 `req.headers.authorization === process.env.AUTH_CODE`
  - 错误返回 401 Unauthorized

### 步骤 3: 保护 /api/chat 路由
- **文件**: `src/server.js`
- **操作**: 在 /api/chat 路由前应用鉴权中间件

### 步骤 4: 创建前端 Auth Context
- **文件**: `frontend/src/contexts/AuthContext.tsx`
- **功能**:
  - 全局鉴权状态管理
  - localStorage 存储用户输入的邀请码
  - 提供 login/logout 方法

### 步骤 5: 创建前端鉴权组件
- **文件**: `frontend/src/components/AuthGuard/index.tsx`
- **UI 文案**: "请输入邀请码"、"功德码"
- **功能**:
  - 邀请码输入框
  - 验证通过后存储到 localStorage
  - 未验证时显示遮罩层

### 步骤 6: 修改前端 API 调用
- **文件**: `frontend/src/lib/ai.ts`
- **操作**:
  - 从 localStorage 读取用户输入的邀请码
  - 添加到请求头 `Authorization`
  - 前端不判断对错，只负责搬运

### 步骤 7: 修改 AI 命理师页面
- **文件**: `frontend/src/app/page.tsx`
- **操作**: 集成 AuthGuard 组件

### 步骤 8: 部署配置
- **操作**:
  - 在 Render/Vercel 环境变量中设置 AUTH_CODE=gznb
  - 确保生产环境使用环境变量

## 代码变更详情

### 后端 .env 文件
```
AUTH_CODE=gznb
```

### 后端鉴权中间件
```javascript
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.AUTH_CODE) {
    return res.status(401).json({ error: '邀请码错误' });
  }
  next();
}
```

### 前端 API 调用
```typescript
const authCode = localStorage.getItem('auth_code');
headers: {
  'Authorization': authCode || ''
}
```

### UI 文案
- 标题: "请输入邀请码"
- 按钮: "进入 AI 命理师"
- 提示: "请联系管理员获取邀请码"

## 安全检查清单
- [ ] .env 文件已创建且未推送到 GitHub
- [ ] 后端使用 process.env.AUTH_CODE 验证
- [ ] 前端从 localStorage 读取邀请码
- [ ] 前端不硬编码密码
- [ ] /api/chat 受保护
- [ ] /api/ziwei 保持开放
- [ ] 生产环境配置环境变量
