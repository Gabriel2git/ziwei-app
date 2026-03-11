# 更新 API Key 计划

## 目标
将阿里云百炼 API Key 更新为新的 Key，并确保不会暴露在代码仓库中。

## 当前状态
- 旧 API Key: `sk-62fd1163f8d74324b1b76f4ab32b0805` (在 `.env.local` 中)
- 新 API Key: `sk-3825e3ea9b384f21b68272846cd802b1` (用户提供)

## 执行步骤

### 步骤 1: 更新本地环境变量文件
- **文件**: `frontend/.env.local`
- **操作**: 将 `NEXT_PUBLIC_DASHSCOPE_API_KEY` 的值更新为新 Key
- **安全说明**: `.env.local` 已在 `.gitignore` 中，不会被提交到 Git

### 步骤 2: 更新 Vercel 环境变量
- **操作**: 在 Vercel Dashboard 中更新生产环境的环境变量
- **变量名**: `NEXT_PUBLIC_DASHSCOPE_API_KEY`
- **新值**: `sk-3825e3ea9b384f21b68272846cd802b1`
- **步骤**:
  1. 登录 Vercel Dashboard
  2. 进入项目设置
  3. 找到 Environment Variables
  4. 更新 `NEXT_PUBLIC_DASHSCOPE_API_KEY`
  5. 重新部署项目

### 步骤 3: 更新 Render 后端环境变量（如需要）
- **操作**: 如果后端也使用了该 API Key，需要在 Render 中更新
- **变量名**: `DASHSCOPE_API_KEY`
- **新值**: `sk-3825e3ea9b384f21b68272846cd802b1`

### 步骤 4: 验证更新
- **本地测试**: 运行前端，测试 AI 功能是否正常工作
- **生产测试**: 在 Vercel 部署后，测试生产环境的 AI 功能

## 安全检查清单
- [ ] `.env.local` 文件在 `.gitignore` 中
- [ ] 代码中没有硬编码 API Key
- [ ] Vercel 环境变量已更新
- [ ] 旧 API Key 已失效或不再使用

## 注意事项
1. **不要**将新的 API Key 提交到 Git 仓库
2. **不要**在代码中硬编码 API Key
3. **不要**在日志中打印 API Key
4. 更新后测试确保功能正常
