# Persona 人格选择功能实现计划

## 目标
在 AI 命理师界面前加入三个人格选择界面，让用户可以选择不同的 AI 角色进行命理分析。

## 三个人格角色

### 1. Companion (大白话解盘伴侣)
- **定位**: 大众娱乐、流量盘
- **特点**: 接地气、幽默、去黑话、直击痛点
- **语气**: 像懂点玄学的靠谱朋友

### 2. Mentor (硬核紫微导师)
- **定位**: 专业硬核、口碑盘
- **特点**: 治学严谨、逻辑严密、推演透明、专业术语
- **语气**: 专业、笃定、一丝不苟

### 3. Healer (人生导航与疗愈师)
- **定位**: 情绪疗愈、高客单价留存盘
- **特点**: 同理心、心理学融合、能量翻转、赋能破局
- **语气**: 温柔、包容、客观且充满建设性

## 执行步骤

### 步骤 1: 更新 ai.ts 添加 Persona 支持
- **文件**: `frontend/src/lib/ai.ts`
- **操作**:
  1. 添加 `PersonaType` 类型定义
  2. 添加 `PERSONA_PROMPTS` 字典
  3. 修改 `generateMasterPrompt` 函数，接受 persona 参数
  4. 修改 `getLLMResponse` 函数，传递 persona 信息

### 步骤 2: 创建 Persona 选择组件
- **文件**: `frontend/src/components/PersonaSelector.tsx`
- **功能**:
  - 显示三个人格卡片
  - 支持点击选择
  - 显示当前选中状态
  - 每个人格显示图标、标题、简介

### 步骤 3: 修改 AI 命理师页面
- **文件**: `frontend/src/app/page.tsx` 或相关组件
- **操作**:
  1. 在 AI 命理师界面前添加 Persona 选择步骤
  2. 将选中的 persona 传递到聊天组件
  3. 根据 persona 动态生成系统提示词

### 步骤 4: 更新状态管理
- **操作**:
  1. 添加 persona 状态到全局状态或组件状态
  2. 确保 persona 选择在会话期间保持
  3. 支持切换 persona 后重新生成提示词

### 步骤 5: 测试验证
- **测试内容**:
  1. 三个人格选择界面正常显示
  2. 选择不同人格后 AI 回复风格正确变化
  3. Persona 状态正确保持
  4. 响应式布局正常

## 代码变更详情

### ai.ts 变更
```typescript
// 1. 定义支持的 Persona 类型
export type PersonaType = 'companion' | 'mentor' | 'healer';

// 2. 建立 Persona 提示词字典
export const PERSONA_PROMPTS: Record<PersonaType, string> = {
  companion: `...`,
  mentor: `...`,
  healer: `...`
};

// 3. 修改 generateMasterPrompt 函数
function generateMasterPrompt(
  userQuestion: string, 
  fullData: ZiweiData, 
  targetYear: number,
  persona: PersonaType = 'companion'  // 新增参数
) {
  const personaPrompt = PERSONA_PROMPTS[persona];
  // ... 整合 personaPrompt 到系统提示中
}
```

### PersonaSelector 组件结构
```typescript
interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
}

// 三个人格卡片布局
// - 图标 + 标题 + 简介
// - 选中状态高亮
// - 点击切换
```

## UI 设计建议

### 人格选择界面布局
```
┌─────────────────────────────────────┐
│  选择你的 AI 命理师                  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │  🤗    │ │  🎓    │ │  🌿   ││
│  │大白话  │ │ 硬核  │ │ 疗愈  ││
│  │解盘伴侣│ │ 导师  │ │ 师   ││
│  │[选中]  │ │       │ │      ││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
│  [开始对话] 按钮                    │
└─────────────────────────────────────┘
```

## 安全检查清单
- [ ] PersonaType 类型定义正确
- [ ] PERSONA_PROMPTS 字典内容完整
- [ ] generateMasterPrompt 正确整合 persona
- [ ] PersonaSelector 组件正常渲染
- [ ] 人格切换功能正常
- [ ] AI 回复风格随 persona 变化
- [ ] 响应式布局正常
