---
alwaysApply: true
---
# 紫微斗数项目开发规范

## 一、项目技术栈
- **前端**: Next.js 14.1.0 + React 18 + TypeScript
- **样式**: Tailwind CSS 3.3.0
- **核心库**: iztro (命盘计算)

## 二、AI 助手执行指令
1. **不破坏现有逻辑**: 不随意重构无关代码
2. **思考后执行**: 复杂逻辑先输出推导步骤，对齐后再编码
3. **组件精简**: 单文件超 500 行时主动建议拆分

## 三、Playwright 配置
- **浏览器路径**: `E:\TraeFile\chrome-win\chrome.exe`

## 四、PowerShell 命令规范
- **不支持 `&&`**: 使用 `;` 或 `cwd` 参数
- **推荐**: `cwd` 指定工作目录，避免命令分隔符
