# AI 紫微斗数 Pro - Frontend (React/Next.js + react-iztro)

基于 React + Next.js + react-iztro 的紫微斗数前端应用，使用专业的开源组件库。

## 🚀 技术栈

- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **紫微斗数**: react-iztro (⭐️ 专业开源组件)
- **部署**: Vercel (推荐)

## ✨ react-iztro 功能特性

| 功能 | 说明 |
|------|------|
| 完整命盘展示 | 包含所有主星、辅星、杂耀 |
| 四化显示 | 生年四化、运限四化 |
| 神煞流耀 | 完整的神煞和流耀系统 |
| 亮度显示 | 星曜庙旺平陷亮度 |
| 运限指示 | 大限、小限、流年、流月、流日、流时 |
| 三方四正 | 动态三方四正指示线 |
| 飞星展示 | 点击宫干显示飞化 |
| 零配置集成 | 开箱即用，简单易用 |

## 📁 项目结构

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── globals.css   # 全局样式
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页（主应用）
│   └── components/        # React 组件
│       └── BirthForm.tsx # 出生信息表单
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问: **http://localhost:3000**

## 📖 使用说明

### react-iztro 基本用法

```tsx
import { Iztrolabe } from "react-iztro"

function App() {
  return (
    <div style={{ width: 1024, margin: '50px auto' }}>
      <Iztrolabe 
        birthday="2000-5-23"       // 出生日期
        birthTime={10}              // 时辰索引 (0-23)
        birthdayType="solar"        // "solar" 阳历 | "lunar" 农历
        gender="male"               // "male" 男 | "female" 女
        horoscopeDate={new Date()}  // 运限日期（可选）
      />
    </div>
  );
}
```

### 参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `birthday` | string | 出生日期 (YYYY-M-D) | - |
| `birthTime` | number | 时辰索引 (0-23) | - |
| `birthdayType` | string | 历法类型 ("solar" \| "lunar") | - |
| `gender` | string | 性别 ("male" \| "female") | - |
| `horoscopeDate` | Date | 运限日期 | 当前时间 |
| `horoscopeHour` | number | 流时时辰索引 | 自动获取 |

## 🚀 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 访问 https://vercel.com
3. 导入仓库
4. 一键部署！

### 构建生产版本

```bash
npm run build
npm start
```

## 📚 相关链接

- [react-iztro GitHub](https://github.com/sylarlong/react-iztro) - 紫微斗数 React 组件库
- [Next.js 文档](https://nextjs.org/docs) - Next.js 官方文档
- [React 文档](https://react.dev) - React 官方文档
- [Tailwind CSS 文档](https://tailwindcss.com/docs) - Tailwind CSS 文档
- [紫微派 - 在线排盘](http://ziweipai.com) - react-iztro 官方演示

## 下一步计划

- [ ] 集成 AI 命理师对话功能
- [ ] 添加对话历史保存与加载
- [ ] 完善响应式设计
- [ ] 性能优化

## 许可证

ISC

---

**感谢 react-iztro 作者的优秀工作！** 🌟
