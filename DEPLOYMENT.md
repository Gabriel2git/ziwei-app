# 紫微斗数应用 - 云端部署指南

## 部署架构

```
Streamlit Cloud (app1.py)
    ↓ HTTP 请求
Render Node.js API (src/server.js)
```

## 前置要求

1. **GitHub 账号**：用于托管代码
2. **Render 账号**：用于部署 Node.js API（免费）
3. **Streamlit Cloud 账号**：用于部署 Streamlit 应用（免费）

## 部署步骤

### 第一步：推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/ziwei-project.git
git push -u origin main
```

### 第二步：部署 Node.js API 到 Render

1. 访问 [https://render.com](https://render.com)
2. 注册/登录账号
3. 点击 **"New +"** → **"Web Service"**
4. 连接 GitHub 仓库
5. 配置部署：
   - **Name**: `ziwei-api`
   - **Environment**: `Node`
   - **Root Directory**: 留空（根目录）
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
6. 点击 **"Create Web Service"**
7. 等待部署完成（约 2-5 分钟）
8. 复制 API URL（如：`https://ziwei-api.onrender.com`）

### 第三步：部署 Streamlit 到 Streamlit Cloud

1. 访问 [https://share.streamlit.io](https://share.streamlit.io)
2. 注册/登录账号
3. 点击 **"New app"**
4. 连接 GitHub 仓库
5. 配置应用：
   - **Repository**: 选择你的仓库
   - **Branch**: `main`
   - **Main file path**: `app1.py`
6. 点击 **"Advanced settings..."**
7. 在 **Secrets** 中添加环境变量：
   ```
   ZIWEI_API_URL=https://ziwei-api.onrender.com/api/ziwei
   OPENAI_API_KEY=你的-openai-api-key
   ```
8. 点击 **"Deploy"**
9. 等待部署完成（约 2-3 分钟）
10. 复制分享链接

### 第四步：测试

1. 访问 Streamlit Cloud 提供的分享链接
2. 测试排盘功能
3. 验证 API 连接正常

## 成本说明

| 服务 | 免费套餐 | 限制 |
|------|-----------|------|
| **Render** | 750 小时/月 | 免费套餐足够个人使用 |
| **Streamlit Cloud** | 无限制 | 完全免费 |

**总成本：$0/月**

## 故障排查

### 问题 1：API 连接失败

**错误信息**：`无法连接到紫微斗数计算服务`

**解决方案**：
1. 检查 Render 服务状态
2. 确认 `ZIWEI_API_URL` 环境变量正确
3. 检查 Render 日志是否有错误

### 问题 2：应用启动失败

**解决方案**：
1. 检查 Streamlit Cloud 部署日志
2. 确认 `requirements.txt` 包含所有依赖
3. 检查 Python 语法错误

### 问题 3：免费套餐休眠

**现象**：首次访问时加载较慢

**原因**：Render 免费套餐在 15 分钟无活动后会休眠

**解决方案**：
- 正常现象，首次访问需要 30-60 秒唤醒
- 如需 24/7 在线，考虑升级到付费套餐

## 更新部署

### 更新 Streamlit 应用

```bash
# 修改代码后
git add .
git commit -m "Update app"
git push
# Streamlit Cloud 会自动重新部署
```

### 更新 Node.js API

```bash
# 修改代码后
git add .
git commit -m "Update API"
git push
# Render 会自动重新部署
```

## 备选方案

### 方案 A：仅部署 Streamlit（使用模拟数据）

如果不想部署 Node.js 服务，可以修改 `app1.py`：

```python
# 在 get_ziwei_data 函数中
# 直接返回模拟数据，不调用 API
```

**优点**：
- ✅ 只需一个平台
- ✅ 完全免费

**缺点**：
- ❌ 数据不准确
- ❌ 仅用于演示

### 方案 B：使用 VPS

如果需要完全控制和 24/7 在线：

1. 购买 VPS（腾讯云、阿里云等）
2. 安装 Node.js 和 Python
3. 同时运行两个服务
4. 使用 Nginx 反向代理

**成本**：约 ¥50-100/月

## 联系支持

如有问题，请查看：
- [Streamlit Cloud 文档](https://docs.streamlit.io/streamlit-cloud)
- [Render 文档](https://render.com/docs)
