# AI 紫微斗数 - Vercel 部署指南

## 🚀 部署架构

```
Vercel (Next.js 前端)
    ↓ 直接调用
阿里云百炼 API
```

---

## 📋 前置准备

1. **GitHub 账号**：用于托管代码
2. **Vercel 账号**：用于部署 Next.js（免费）
3. **阿里云百炼 API Key**：已获取

---

## 🔧 第一步：推送到 GitHub

### 1.1 确认代码已提交

```bash
# 检查状态
git status

# 应该看到：
# On branch main
# Your branch is ahead of 'origin/main' by 1 commit.
# nothing to commit, working tree clean
```

### 1.2 连接 GitHub 仓库

```bash
# 如果还没有关联远程仓库
git remote add origin https://github.com/你的用户名/ziwei-project.git

# 推送到 GitHub
git push -u origin main
```

---

## ☁️ 第二步：部署到 Vercel

### 2.1 访问 Vercel

1. 打开 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录/注册

### 2.2 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 在 **"Import Git Repository"** 中选择你的仓库
3. 点击 **"Import"**

### 2.3 配置部署

#### 基本配置

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `ziwei-pro`（或你喜欢的名字） |
| **Framework Preset** | `Next.js`（自动检测） |
| **Root Directory** | `frontend` ⚠️ 重要！ |
| **Build Command** | 留空（自动使用 `npm run build`） |
| **Output Directory** | 留空（自动使用 `.next`） |
| **Install Command** | 留空（自动使用 `npm install`） |

#### 环境变量（重要！）

在 **"Environment Variables"** 部分点击 **"Add"**：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_DASHSCOPE_API_KEY` | `sk-62fd1163f8d74324b1b76f4ab32b0805` |

⚠️ **注意**：
- 确保选择 `Automatically expose System Environment Variables`
- 不要把 API Key 提交到 Git（已在 `.gitignore` 中）

### 2.4 开始部署

1. 点击 **"Deploy"** 按钮
2. 等待 1-3 分钟
3. 部署成功后会显示你的网站地址

---

## 🌐 第三步：访问你的网站

部署成功后，Vercel 会提供一个类似这样的地址：

```
https://ziwei-pro.vercel.app
```

点击访问即可使用！

---

## 📝 后续更新

### 更新代码

```bash
# 修改代码后
git add .
git commit -m "Update: 描述你的修改"
git push
```

Vercel 会**自动重新部署**！

---

## 🔒 安全说明

### 环境变量安全

- ✅ API Key 只在 Vercel 服务器端可用
- ✅ 前端通过 `NEXT_PUBLIC_` 前缀访问
- ✅ `.env.local` 已在 `.gitignore` 中，不会被提交

### 如果 API Key 泄露

1. 立即在阿里云百炼平台撤销旧 Key
2. 生成新的 API Key
3. 在 Vercel 项目设置中更新环境变量
4. 重新部署（可选，Vercel 会自动拾取）

---

## 🛠️ 故障排查

### 问题 1：部署失败 - Root Directory 错误

**错误**：Vercel 找不到 `package.json`

**解决**：确保 **Root Directory** 设置为 `frontend`

---

### 问题 2：API 调用失败

**错误**：`DASHSCOPE_API_KEY is not set`

**解决**：
1. 检查 Vercel 项目设置 → Environment Variables
2. 确认 `NEXT_PUBLIC_DASHSCOPE_API_KEY` 已正确添加
3. 重新部署（点击项目右上角的 "Redeploy"）

---

### 问题 3：构建失败

**错误**：`Module not found` 或 TypeScript 错误

**解决**：
1. 确保本地 `npm run build` 能成功
2. 检查所有 import 路径是否正确
3. 查看 Vercel 部署日志的详细错误

---

## 💰 成本说明

| 服务 | 免费套餐 | 限制 |
|------|-----------|------|
| **Vercel** | Hobby 计划 | 100GB 带宽/月，无限部署 |
| **阿里云百炼** | 免费额度 | 根据你的账户情况 |

**总成本：$0/月（基础使用）**

---

## 🎯 自定义域名（可选）

### 添加自定义域名

1. 在 Vercel 项目 → **Settings** → **Domains**
2. 输入你的域名（如 `ziwei.yourdomain.com`）
3. 按照提示配置 DNS
4. 等待生效（几分钟到几小时）

---

## 📚 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [阿里云百炼控制台](https://bailian.console.aliyun.com)

---

**祝你部署顺利！🎉**
