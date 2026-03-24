# FatePilot

一个基于 React + Next.js 和 Node.js 的智能紫微斗数命理分析应用，集成 AI 命理师功能和 RAG 检索增强生成能力。

## ✨ 功能特点

- 📊 **紫微斗数排盘** - 完整的命盘计算与展示，包括主星、辅星、小星等信息
- 🤖 **AI 命理师** - 基于 AI 模型的智能命理分析，支持多种命理师人格
- 🔐 **邀请码验证** - 功德码验证机制，保护 AI 功能不被滥用
- 🧠 **RAG 检索增强** - 集成知识库检索，提供更准确的命理分析
- 📱 **响应式设计** - 完美适配电脑端和手机端
- ⏰ **真太阳时校验** - 基于经度的真太阳时计算
- 🎨 **美观界面** - 参考文墨天机设计，信息密度高
- 🔄 **四化计算** - 完整的四化（禄、权、科、忌）计算
- 📅 **大运流年** - 包含大限和流年信息
- 🎭 **多种命理师人格** - 大白话解盘伴侣、硬核紫微导师、人生导航与疗愈师

## 🛠️ 技术栈

### 前端
- **React 18** - 前端 UI 库
- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的 CSS 框架

### 后端
- **Node.js** - 紫微斗数计算服务
- **iztro** - 紫微斗数计算库
- **阿里云百炼** - AI 模型和向量嵌入服务

### 部署
- **Vercel** - 前端部署
- **Render** - 后端 API 部署

## 📁 项目结构

```
ziwei_project/
├── frontend/                 # React + Next.js 前端
│   ├── src/
│   │   ├── app/              # Next.js 应用路由
│   │   ├── components/       # UI 组件
│   │   │   ├── AIChat/       # AI 聊天组件
│   │   │   ├── AIFortuneTeller/  # AI 命理师主组件
│   │   │   ├── AuthGuard/    # 邀请码验证组件
│   │   │   ├── ChartView/    # 命盘视图组件
│   │   │   ├── PersonaSelector/  # 命理师选择组件
│   │   │   ├── RagTest/      # RAG 测试组件
│   │   │   ├── Sidebar/      # 侧边栏组件
│   │   │   ├── ZiweiChart/   # 紫微斗数命盘组件
│   │   │   └── BirthForm.tsx # 出生信息表单
│   │   ├── contexts/         # React Context
│   │   │   └── AuthContext.tsx  # 认证状态管理
│   │   ├── hooks/            # 自定义 React Hooks
│   │   │   ├── useAIChat.ts  # AI 聊天逻辑
│   │   │   └── useZiweiData.ts # 命盘数据管理
│   │   ├── lib/              # 工具函数和 AI 集成
│   │   └── types/            # TypeScript 类型定义
│   ├── package.json          # 前端依赖
│   └── next.config.js        # Next.js 配置
├── src/                      # Node.js 后端
│   └── server.js             # API 服务入口
├── backend/                  # 后端配置
│   ├── .env                  # 本地环境变量
│   └── services/             # 后端服务
├── .trae/                    # 项目文档和规格文件
├── package.json              # 后端依赖
├── README.md                 # 项目说明
└── .gitignore                # Git 忽略文件
```

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- 阿里云百炼 API Key（用于 AI 功能）

### 本地运行

#### 1. 克隆项目

```bash
git clone git@github.com:Gabriel2git/ziwei-app.git
cd ziwei-app
```

#### 2. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd frontend
npm install
```

#### 3. 配置环境变量

**后端环境变量** (`backend/.env`):
```env
# 鉴权配置
AUTH_CODE=your_auth_code_here
```

**前端环境变量** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
DASHSCOPE_API_KEY=your_aliyun_dashscope_api_key
```

#### 4. 启动服务

```bash
# 启动后端 API 服务（在项目根目录）
node src/server.js

# 启动前端开发服务器（在 frontend 目录）
npm run dev
```

前端应用将在 http://localhost:3000 打开
后端 API 服务将在 http://localhost:3001 运行

## 📱 使用说明

### 1. 输入出生信息
- 选择历法（公历/农历）
- 输入出生日期和时间
- 选择性别
- 选择出生地（用于真太阳时计算）

### 2. 开始排盘
点击「开始排盘」按钮生成命盘

### 3. 查看命盘
- 十二宫布局显示
- 包含主星、辅星、小星信息
- 显示大限和流年信息
- 真太阳时校验结果

### 4. AI 命理咨询
- **邀请码验证**：首次使用 AI 命理师功能需要输入邀请码
- **选择命理师人格**：
  - 🤗 大白话解盘伴侣 - 用通俗易懂的语言解释命盘
  - 🎓 硬核紫微导师 - 专业深入的命理分析
  - 🌿 人生导航与疗愈师 - 结合心理学的温暖建议
- **调试功能**：点击调试按钮可查看完整的 system prompt

### 5. RAG 测试
- 单独的 RAG 功能测试界面
- 输入查询，查看检索结果

## 🔐 邀请码验证功能

### 功能说明
AI 命理师功能消耗 AI 大模型 Token，需要邀请码（功德码）才能使用。

### 验证流程
1. 用户点击「AI 命理师」页面
2. 系统检查是否已验证邀请码
3. 未验证用户显示邀请码输入界面
4. 输入正确的邀请码后，可永久使用 AI 功能

### 配置邀请码

**本地开发**：
在 `backend/.env` 文件中设置：
```env
AUTH_CODE=your_invitation_code
```

**生产环境（Render）**：
1. 登录 Render Dashboard
2. 找到后端服务
3. 点击 **Environment** 标签
4. 添加环境变量：
   - **Key**: `AUTH_CODE`
   - **Value**: 你的邀请码
5. 点击 **Save Changes**

## 🌐 云端部署

### 架构说明
- **前端**：部署在 Vercel
- **后端**：部署在 Render
- **跨域**：后端已配置 CORS 允许前端域名访问

### 前端部署（Vercel）

#### 1. 准备环境变量
在 Vercel Dashboard 中设置：
```env
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
DASHSCOPE_API_KEY=your_aliyun_dashscope_api_key
```

#### 2. 部署步骤
1. 登录 Vercel Dashboard
2. 导入 GitHub 仓库
3. 设置根目录为 `frontend`
4. 配置环境变量
5. 点击 Deploy

#### 3. 自定义域名（可选）
- 在 Vercel 项目设置中添加自定义域名
- 配置 DNS 解析

### 后端部署（Render）

#### 1. 准备环境变量
在 Render Dashboard 中设置：
```env
AUTH_CODE=your_invitation_code
```

#### 2. 部署步骤
1. 登录 Render Dashboard
2. 创建新的 Web Service
3. 导入 GitHub 仓库
4. 设置启动命令：`node src/server.js`
5. 配置环境变量
6. 点击 Create Web Service

#### 3. 注意事项
- Render 免费版会在一段时间不活动后休眠
- 首次访问可能需要等待服务唤醒（约 30 秒）

### 生产环境地址

- **前端**：https://ziwei-app-gz.vercel.app/
- **后端**：https://ziwei-api-zdy7.onrender.com

## 🎛️ 核心功能说明

### 紫微斗数计算
- 使用 iztro 库进行专业的紫微斗数计算
- 支持阳历和阴历出生日期
- 基于经度的真太阳时计算
- 完整的十二宫信息，包括主星、辅星、小星

### AI 命理分析
- 基于命盘信息生成详细的 AI 提示词
- 包含四化计算和大运流年信息
- 支持多种命理师人格（Persona）
- 集成 glm-4.7、qwen3.5-flash、kimi-k2.5 等模型

### RAG 检索增强
- 基于阿里云百炼的向量嵌入服务
- 支持文本和 PDF 文档的向量化
- 智能检索相关命理知识
- 提高 AI 分析的准确性和相关性

### 命理师人格（Persona）

#### 1. 大白话解盘伴侣（The Plain-Language Companion）
- **风格**：通俗易懂，接地气
- **特点**：用大白话解释复杂的命理概念
- **适用**：初学者，想要轻松了解命盘的用户

#### 2. 硬核紫微导师（The Hardcore Ziwei Mentor）
- **风格**：专业严谨，学术派
- **特点**：深入分析星曜组合、四化飞星
- **适用**：有一定基础，想要深入学习的研究者

#### 3. 人生导航与疗愈师（The Life Navigator & Healer）
- **风格**：温暖包容，心理学视角
- **特点**：将命盘与心理成长结合，提供建设性建议
- **适用**：寻求人生指引和心灵慰藉的用户

### 界面设计
- 参考文墨天机的设计风格
- 响应式布局，适配各种设备
- 清晰的命盘信息展示
- 支持深色模式

## 🔧 常见问题排查

### 1. 邀请码验证失败
**现象**：输入邀请码后显示"邀请码错误"
**排查**：
- 检查 Render 环境变量 `AUTH_CODE` 是否设置
- 确认后端代码已更新（支持生产环境变量）
- 查看 Render 日志确认环境变量加载情况

### 2. 网络错误
**现象**：显示"网络错误，请稍后重试"
**排查**：
- 检查 Vercel 环境变量 `NEXT_PUBLIC_API_URL` 是否正确
- 确认 Render 后端服务正在运行
- 检查浏览器开发者工具的网络请求

### 3. Persona 切换后 prompt 不更新
**现象**：切换命理师后调试窗口显示旧的 prompt
**原因**：已修复，确保使用最新代码

## 📝 更新日志

### v3.6.0 (2026-03-11)
- ✅ 修复 Vercel + Render 跨域问题
- ✅ 添加邀请码验证功能
- ✅ 修复 Persona 切换后 debugPrompt 不同步问题
- ✅ 优化 AI 模型排序（glm-4.7 默认首位）
- ✅ 添加未排盘检查，防止未排盘选择 Persona

### v3.5.0 (2026-03-05)
- ✅ 集成 RAG 检索增强功能
- ✅ 添加 qwen3.5-flash 模型支持
- ✅ 优化前端性能和用户体验
- ✅ 修复 TypeScript 编译错误

### v3.0.0 (2026-02-18)
- ✅ 前端迁移：从 Streamlit 改为 React + Next.js
- ✅ 功能增强：添加真太阳时校验、完整的星曜信息
- ✅ AI 提示词优化：包含详细的命盘信息和四化计算
- ✅ 代码重构：采用现代化的前端架构

### v2.0.0
- 代码重构：采用关注点分离原则
- 模块拆分：config, calculations, api_client, prompts, ui_components

### v1.0.0
- 初始版本发布
- 完整的紫微斗数排盘功能
- AI 命理师集成
- 响应式设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC License

## 🙏 致谢

- [iztro](https://github.com/sylarlong/iztro) - 紫微斗数计算库
- [React](https://react.dev/) - 前端 UI 库
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Vercel](https://vercel.com/) - 前端部署平台
- [Render](https://render.com/) - 后端部署平台
- [阿里云百炼](https://bailian.aliyun.com/) - AI 模型和向量嵌入服务

---

**注意**：本应用仅供娱乐和研究使用，命理分析结果不构成任何决策建议。
