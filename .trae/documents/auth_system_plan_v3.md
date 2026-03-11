# 鉴权与拦截系统实现计划 V3（完整体验版）

## 目标
实现安全的鉴权系统，提供完整的验证闭环和良好的用户体验。

## 安全架构设计

### 核心原则
1. **密码不硬编码**: 使用环境变量存储 AUTH_CODE
2. **前端只搬运**: 前端不负责验证，只传递用户输入
3. **后端是裁判**: 后端验证密码是否正确
4. **体验闭环**: 验证失败即时反馈，不让用户困惑

## 执行步骤

### 步骤 1: 后端环境变量配置
- **文件**: `backend/.env` (新建)
- **内容**: `AUTH_CODE=gznb`
- **操作**: 将 `.env` 加入 `.gitignore`

### 步骤 2: 后端鉴权中间件 + 验证接口
- **文件**: `src/server.js`
- **操作**:
  - 加载 dotenv 读取环境变量
  - 创建鉴权中间件
  - **新增**: 创建 `/api/verify-code` 验证接口
  - 验证接口对比 `req.body.code === process.env.AUTH_CODE`
  - 正确返回 200，错误返回 401

### 步骤 3: 保护 /api/chat 路由
- **文件**: `src/server.js`
- **操作**: 在 /api/chat 路由前应用鉴权中间件

### 步骤 4: 创建前端 Auth Context
- **文件**: `frontend/src/contexts/AuthContext.tsx`
- **功能**:
  - 全局鉴权状态管理
  - localStorage 存储用户输入的邀请码
  - 提供 login/logout 方法
  - **新增**: verifyCode 方法调用后端验证接口

### 步骤 5: 创建前端鉴权组件（含验证闭环）
- **文件**: `frontend/src/components/AuthGuard/index.tsx`
- **UI 文案**: "请输入邀请码"、"功德码"
- **功能**:
  - 邀请码输入框
  - **验证流程**:
    1. 用户输入邀请码点击确认
    2. 调用 `/api/verify-code` 验证
    3. 返回 200: 存入 localStorage，关闭遮罩，提示"解锁成功"
    4. 返回 401: 显示红色错误提示"功德码无效或已过期"

### 步骤 6: 修改前端 API 调用
- **文件**: `frontend/src/lib/ai.ts`
- **操作**:
  - 从 localStorage 读取邀请码
  - 添加到请求头 `Authorization`
  - **新增**: 监听 401 错误，触发 logout 并提示

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

### 后端验证接口
```javascript
// /api/verify-code
app.post('/api/verify-code', (req, res) => {
  const { code } = req.body;
  if (code === process.env.AUTH_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: '邀请码错误' });
  }
});
```

### 后端鉴权中间件
```javascript
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.AUTH_CODE) {
    return res.status(401).json({ error: '邀请码错误' });
  }
  next();
}
```

### 前端验证流程
```typescript
// AuthGuard 组件
const handleSubmit = async (code: string) => {
  setIsVerifying(true);
  const response = await fetch('/api/verify-code', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
  
  if (response.ok) {
    localStorage.setItem('auth_code', code);
    setIsAuthenticated(true);
    showToast('解锁成功');
  } else {
    setError('功德码无效或已过期');
  }
  setIsVerifying(false);
};
```

### 前端 API 401 处理
```typescript
// getLLMResponse 函数
if (response.status === 401) {
  logout(); // 清除 localStorage
  showToast('功德码无效，请重新输入');
  throw new Error('Unauthorized');
}
```

### UI 文案
- 标题: "请输入邀请码"
- 按钮: "进入 AI 命理师"
- 成功提示: "解锁成功"
- 错误提示: "功德码无效或已过期"

## 用户体验流程

```
用户进入 AI 命理师页面
       ↓
显示遮罩层 + 邀请码输入框
       ↓
用户输入邀请码点击确认
       ↓
调用 /api/verify-code 验证
       ↓
    ┌──────────┴──────────┐
    ↓                     ↓
  验证成功              验证失败
    ↓                     ↓
关闭遮罩层            显示红色错误
提示"解锁成功"        留在当前页面
    ↓
正常使用 AI 命理师
```

## 安全检查清单
- [ ] .env 文件已创建且未推送到 GitHub
- [ ] 后端使用 process.env.AUTH_CODE 验证
- [ ] /api/verify-code 接口正常工作
- [ ] 前端验证失败时显示错误提示
- [ ] 前端验证成功后才关闭遮罩层
- [ ] 前端 API 调用包含 Authorization Header
- [ ] 前端捕获 401 错误并处理
- [ ] /api/chat 受保护
- [ ] /api/ziwei 保持开放
- [ ] 生产环境配置环境变量
