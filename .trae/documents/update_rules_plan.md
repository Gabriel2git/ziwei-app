# 更新项目规则文件计划

## 目标
更新 `.trae/rules/project_rules.md` 文件，添加以下内容：
1. Playwright 浏览器路径配置
2. PowerShell 命令语法解决方案

## 当前状态
- 规则文件路径: `E:\TraeFile\ziwei_project\.trae\rules\project_rules.md`
- Chrome 浏览器路径: `E:\TraeFile\chrome-win\chrome.exe`
- 问题: Trae 在运行命令时提示 "PowerShell 不支持 && 语法"

## 执行步骤

### 步骤 1: 添加 Playwright 浏览器配置
在规则文件中添加 Playwright 相关配置：
- 浏览器可执行文件路径
- 使用说明

### 步骤 2: 添加 PowerShell 命令语法规范
在规则文件中添加 PowerShell 命令执行规范：
- 说明 PowerShell 不支持 `&&` 语法
- 提供正确的命令执行方式
- 使用 `;` 或分步执行命令

### 步骤 3: 验证规则文件更新
- 确保规则文件格式正确
- 确保新增内容清晰易懂

## 代码变更详情

### 新增内容 1: Playwright 浏览器配置
```markdown
## 七、Playwright 配置
- **浏览器路径**: `E:\TraeFile\chrome-win\chrome.exe`
- **使用方式**: 在使用 Playwright 工具时，浏览器会自动检测此路径
- **注意**: 此浏览器为项目专用的 Chromium 版本，用于前端自动化测试
```

### 新增内容 2: PowerShell 命令语法规范
```markdown
## 八、PowerShell 命令执行规范
- **重要提示**: PowerShell 不支持 `&&` 语句分隔符（这是 Bash/Linux 语法）
- **错误示例**: `cd path && npm run dev`
- **正确方式**:
  - 方式 1: 使用 `;` 分隔符: `cd path; npm run dev`
  - 方式 2: 使用 `cwd` 参数指定工作目录，单独执行命令
  - 方式 3: 分步执行命令
- **推荐做法**: 使用 `cwd` 参数指定工作目录，避免使用命令分隔符
```

## 安全检查清单
- [ ] Playwright 浏览器路径已添加到规则文件
- [ ] PowerShell 命令语法规范已添加到规则文件
- [ ] 规则文件格式正确，无语法错误
