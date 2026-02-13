# ziwei-app
ai 紫微斗数 pro
```
echo "# AI 紫微斗数 Pro

一款基于紫微斗数的AI命理咨询应用，集成了命盘排盘、大限流
年分析和AI对话功能。

## 🚀 功能特性

### 核心功能
- **紫微斗数排盘**：支持公历和农历输入，自动计算真太阳时
- **大限流年分析**：可视化展示不同大限和流年的运势
- **AI命理咨询**：基于阿里云百炼qwen3-max模型的智能命理
分析
- **专业命盘显示**：参考react-iztro设计的美观命盘布局

### 技术特点
- **双页面设计**：命盘显示和AI对话分离，避免相互干扰
- **实时运限指示**：当前大限高亮显示，方便用户识别
- **三方四正参考线**：帮助用户理解宫位关系
- **星耀分组显示**：主星、辅星、小星分别分组，提高可读性

## 🛠️ 技术栈

- **前端**：Streamlit
- **后端**：Node.js + Express
- **紫微斗数计算**：iztro库
- **AI模型**：阿里云百炼 qwen3-max
- **其他**：Python, JavaScript

## 💻 本地运行

### 前置要求
- Node.js 14+
- Python 3.7+
- 阿里云百炼API密钥（用于AI功能）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <your-github-repo-url>
   cd ziwei_project
```
2. 安装前端依赖
   
   ```
   pip install -r requirements.txt
   ```
3. 安装后端依赖
   
   ```
   npm install
   ```
4. 设置API密钥 在Windows系统中：
   
   ```
   setx DASHSCOPE_API_KEY "your_api_key"
   ```
   在macOS/Linux系统中：
   
   ```
   export DASHSCOPE_API_KEY="your_api_key"
   ```
5. 启动服务
   
   - 启动紫微斗数计算服务：
     ```
     node src/server.js
     ```
   - 启动Streamlit应用：
     ```
     streamlit run app.py
     ```
6. 访问应用 打开浏览器访问： http://localhost:8501
## 📱 使用指南
### 1. 排盘流程
- 在左侧边栏选择历法类型（公历/农历）
- 输入出生日期、时间和性别
- 点击"🚀 开始排盘"按钮
- 查看生成的命盘
### 2. 大限流年选择
- 在命盘下方的控制条中选择不同的大限
- 选择具体的流年查看详细运势
### 3. AI命理咨询
- 切换到"AI 命理咨询"页面
- 输入命理问题，如：
  - "我适合创业还是上班？"
  - "我的正缘有什么特征？"
  - "今年要注意什么？"
- 等待AI回复并进行交流
## 🎯 示例问题
- 格局性格 ："我适合创业还是上班？我的性格有什么特点？"
- 情感婚姻 ："我的正缘有什么特征？什么时候会遇到？"
- 事业财运 ："今年事业运势如何？适合换工作吗？"
- 健康运势 ："我需要注意哪些健康问题？"
- 流年运势 ："今年要注意什么？有什么机遇和挑战？"
## 🔧 配置说明
### API密钥配置
- 阿里云百炼API ：用于AI对话功能
  - 申请地址： https://dashscope.aliyun.com/
  - 环境变量： DASHSCOPE_API_KEY
### 服务配置
- 紫微斗数计算服务 ：运行在 http://localhost:3000
- Streamlit应用 ：运行在 http://localhost:8501
## 📄 许可证
本项目采用MIT许可证。

## 🤝 贡献
欢迎提交Issue和Pull Request来改进这个项目！

## 🙏 致谢
- iztro ：紫微斗数计算库
- react-iztro ：提供了美观的命盘设计参考
- 阿里云百炼 ：提供AI模型支持
- Streamlit ：提供简洁的Web界面框架
