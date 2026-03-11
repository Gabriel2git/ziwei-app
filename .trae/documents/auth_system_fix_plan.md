# 鉴权系统修复计划

## 问题列表

### 1. 密码可见性

* **问题**: 输入密码时不可见，用户不知道输入了什么

* **修复**: 添加显示/隐藏密码切换按钮

### 2. 界面流程分离

* **问题**: 选择命理师和 AI 聊天界面混合在一起

* **修复**:

  * 输入邀请码 → 选择命理师界面（独立页面）

  * 选择命理师 → AI 聊天界面（独立页面）

  * 两个界面完全分离，不混合显示

### 3. 文字颜色调整

* **问题**: 浅色背景下三个命理师人格的文字颜色不清晰

* **修复**: 调整 PersonaSelector 组件在浅色模式下的文字颜色

### 4. 默认主题

* **问题**: 默认主题可能是深色

* **修复**: 确保默认主题为浅色模式

## 执行步骤

### 步骤 1: 添加密码显示/隐藏功能

* **文件**: `frontend/src/components/AuthGuard/index.tsx`

* **修改**:

  * 添加 showPassword 状态

  * 添加眼睛图标按钮切换显示/隐藏

  * 输入框类型在 text 和 password 之间切换

### 步骤 2: 分离界面流程

* **文件**: `frontend/src/app/page.tsx`

* **修改**:

  * 创建独立的页面状态管理

  * 输入邀请码后显示选择命理师界面

  * 选择命理师后才显示聊天界面

  * 移除混合显示的逻辑

### 步骤 3: 修复文字颜色

* **文件**: `frontend/src/components/PersonaSelector/index.tsx`

* **修改**:

  * 调整未选中卡片的文字颜色

  * 确保浅色模式下文字清晰可见

  * 选中状态使用渐变背景，文字为白色

### 步骤 4: 设置默认主题

* **文件**: `frontend/src/app/layout.tsx` 或主题配置文件

* **修改**:

  * 确保默认主题为浅色

  * 检查 localStorage 中是否有主题设置

## 代码变更详情

### 密码显示/隐藏

```tsx
const [showPassword, setShowPassword] = useState(false);

<input
  type={showPassword ? 'text' : 'password'}
  // ...
/>
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? '🙈' : '👁️'}
</button>
```

### 界面状态管理

```tsx
// 页面状态: 'auth' | 'select-persona' | 'chat'
const [aiPageState, setAiPageState] = useState('auth');

// 输入邀请码成功后
setAiPageState('select-persona');

// 选择命理师后
setAiPageState('chat');
```

### 文字颜色修复

```tsx
// 未选中卡片在浅色模式下的文字颜色
className="text-gray-900 dark:text-white" // 标题
className="text-gray-500 dark:text-gray-400" // 副标题
className="text-gray-600 dark:text-gray-300" // 描述
```

## UI 流程

```
用户点击 AI 命理师
       ↓
┌─────────────────────┐
│   输入邀请码界面     │
│   [密码输入框]       │
│   [显示/隐藏按钮]    │
│   [进入按钮]         │
└─────────────────────┘
       ↓ 验证成功
┌─────────────────────┐
│   选择命理师界面     │
│   [三个卡片选择]     │
│   [大白话/硬核/疗愈] │
└─────────────────────┘
       ↓ 选择后
┌─────────────────────┐
│   AI 聊天界面        │
│   [聊天窗口]         │
│   [输入框]           │
└─────────────────────┘
```

## 安全检查清单

* [ ] 密码显示/隐藏功能正常

* [ ] 三个界面完全分离

* [ ] 浅色模式下文字颜色清晰

* [ ] 默认主题为浅色

* \[ ]

