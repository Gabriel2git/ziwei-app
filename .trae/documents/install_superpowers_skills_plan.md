# Superpowers 安装计划

## 任务目标
在 Trae IDE 中安装 https://github.com/obra/superpowers 项目提供的 skills

## 背景分析

Superpowers 是一个完整的软件开发生Workflow框架，专为 AI 编码助手设计。它包含以下核心 skills：

1. **brainstorming** - 编码前的设计构思
2. **writing-plans** - 详细实现计划
3. **subagent-driven-development** - 子代理驱动开发
4. **test-driven-development** - 测试驱动开发
5. **systematic-debugging** - 系统化调试
6. **requesting-code-review** - 代码审查
7. **using-git-worktrees** - Git工作树并行开发
8. **finishing-a-development-branch** - 开发分支完成工作流

**注意**：Superpowers 原本是为 Claude Code、Cursor、Codex 设计的，Trae IDE 有自己的 skill 系统（`.trae/skills/`），需要适配。

## 安装步骤

### 步骤1：分析现有 Trae Skill 格式
- 查看现有的 skill 文件格式（已查看 `parallel-task-agent/SKILL.md`）
- 了解 Trae skill 的 YAML 头部规范
- 确认技能触发条件和使用方式

### 步骤2：获取 Superpowers Skills 源码
- 从 GitHub 仓库获取所有 skill 文件
- 位置：`https://github.com/obra/superpowers/tree/main/skills`

### 步骤3：创建 Trae 兼容的 Skill 文件
将以下核心 skills 转换为 Trae 格式：

1. **brainstorming** - 设计构思技能
   - 在编码前激活
   - 通过问题细化想法
   - 分块展示设计供验证

2. **writing-plans** - 计划编写技能
   - 批准设计后激活
   - 将工作分解为小任务（每个2-5分钟）
   - 每个任务包含精确的文件路径和验证步骤

3. **subagent-driven-development** - 子代理开发技能
   - 计划激活后启动
   - 为每个任务分配新的子代理
   - 两阶段审查（规格合规性 → 代码质量）

4. **test-driven-development** - TDD 技能
   - 实现过程中激活
   - 强制 RED-GREEN-REFACTOR 循环

5. **systematic-debugging** - 系统调试技能
   - 调试问题激活
   - 4阶段根因分析过程

6. **requesting-code-review** - 代码审查技能
   - 任务之间激活
   - 按严重程度报告问题

### 步骤4：安装 Skill 文件到项目
- 在 `.trae/skills/` 目录下创建相应的 skill 子目录
- 每个 skill 包含 `SKILL.md` 文件

### 步骤5：验证安装
- 测试各个 skill 是否能正确触发
- 验证 skill 的工作流程是否符合预期

## 预期结果
成功在 Trae IDE 中安装 Superpowers 的核心 skills，使 AI 助手能够遵循更规范的开发生命周期工作流程。
