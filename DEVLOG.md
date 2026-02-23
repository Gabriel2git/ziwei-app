# 开发日志

## 2026-02-21 深色模式功能实现

### 功能描述
- 实现了深色模式切换功能，用户可以通过页面左上角的切换按钮在浅色模式和深色模式之间自由切换
- 切换按钮会根据当前模式显示不同的图标（太阳图标表示浅色模式，月亮图标表示深色模式）
- 所有页面元素都支持深色模式，包括背景、文字、边框等
- 命盘宫位的边框样式也会根据深色模式自动调整（浅色模式为黑色边框，深色模式为白色边框）

### 技术实现
1. **更新 Tailwind CSS 配置**：
   - 在 `tailwind.config.js` 文件中添加了 `darkMode: 'class'` 配置，以支持通过类名切换深色模式

2. **实现切换功能**：
   - 在 `page.tsx` 文件中实现了 `toggleDarkMode` 函数
   - 函数通过操作 `document.documentElement.classList` 来添加或移除 'dark' 类
   - 同时更新 `darkMode` 状态，以确保切换按钮的图标正确显示

3. **样式调整**：
   - 为所有页面元素添加了 `dark:` 前缀的 Tailwind 类，以定义深色模式下的样式
   - 调整了命盘宫位的边框样式，确保在深色模式下清晰可见
   - 为深色模式下的命盘宫位添加了浅灰色背景（#333333），以提高文字的可读性
   - 确保深色模式下的文字颜色为白色，与背景形成良好对比

4. **后续优化**：
   - 调整了命盘内部元素的样式，确保背景透明，避免影响整体视觉效果
   - 确保所有样式更改使用 `!important` 标记，以覆盖默认样式
   - 调整了深色模式下星耀的颜色，提高可读性：
     - 深紫色 → 亮黄色 (#ffff6b)，在灰色背景下更亮眼
     - 红色 → 亮红色 (#ff8080)
     - 绿色 → 亮绿色 (#80ff80)
     - 蓝色 → 亮蓝色 (#8080ff)

## 2026-02-21 深色模式重构

### 问题描述
- 深色模式下的样式更改没有生效，星耀颜色调整不明显
- 需要更彻底的深色模式重构，确保所有元素在深色背景下都清晰可见

### 技术实现
1. **重构深色模式切换逻辑**：
   - 将 'dark' 类从 document.documentElement 移到 document.body，以确保样式选择器正确匹配
   - 更新 toggleDarkMode 函数，操作 body 元素的 classList

2. **优化命盘样式**：
   - 为浅色模式下的命盘宫位添加半透明白色背景，提高对比度
   - 为深色模式下的命盘宫位使用更深的灰色背景 (#2d2d2d)，使文字和星耀更突出
   - 确保所有命盘内部元素的背景为透明，避免影响整体视觉效果

3. **增强星耀可读性**：
   - 使用 CSS filter: brightness(1.5) 提高深色模式下所有星耀的亮度
   - 特别为紫色星耀设置亮黄色 (#ffff6b) 并加粗，确保在深色背景下最亮眼
   - 调整其他颜色星耀为更亮的版本，提高在深色背景上的可见度

4. **改进样式选择器**：
   - 使用 `body.dark` 作为选择器前缀，确保样式在深色模式下正确应用
   - 为所有样式规则添加 `!important` 标记，确保覆盖默认样式

### 相关文件更改
- `frontend/tailwind.config.js`：添加了 `darkMode: 'class'` 配置
- `frontend/src/app/page.tsx`：
  - 实现了 `toggleDarkMode` 函数和切换按钮
  - 更新了 toggleDarkMode 函数，操作 body 元素的 classList
  - 重构了命盘样式，增强深色模式下的可读性
  - 改进了星耀颜色调整，确保在深色背景下清晰可见
- `frontend/src/components/BirthForm.tsx`：添加了深色模式支持

### 测试结果
- 深色模式切换功能正常工作
- 所有页面元素在深色模式下显示正确
- 命盘宫位的边框样式在深色模式下自动调整
- 切换按钮的图标会根据当前模式正确显示

### 后续计划
- 考虑添加系统主题自动检测功能，根据用户的系统主题偏好自动设置初始模式
- 优化深色模式下的对比度和可读性
- 添加更多主题选项，如高对比度模式等

## 2026-02-21 虚岁计算 bug 修复

### 问题描述
- 对于农历新年前出生的用户，虚岁计算错误，导致大限和流年计算不准确
- 例如：2000-1-4 出生的用户，5-14 岁大限应从 2003 年开始，但之前计算为 2004 年开始

### 技术实现
1. **核心逻辑修复**：
   - 在 `frontend/src/lib/shichen.ts` 中使用 `chinese-lunar-calendar` 库计算农历基准年
   - 重写 `getLunarBaseYear` 函数，通过库的方法获取准确的农历年份
   - 对于农历新年前出生的用户，自动返回正确的农历年份

2. **函数实现**：
   ```typescript
   export function getLunarBaseYear(solarDateStr: string): number {
     if (!solarDateStr) return new Date().getFullYear();
     
     const [year, month, day] = solarDateStr.split('-').map(Number);
     
     try {
       // 使用chinese-lunar-calendar库创建公历日期对象
       const solar = Solar.fromYmdHms(year, month, day, 0, 0, 0);
       
       // 获取农历日期对象
       const lunar = solar.getLunar();
       
       // 获取农历年份
       const lunarYear = lunar.getYear();
       
       console.log(`公历 ${solarDateStr} 对应的农历年份: ${lunarYear}`);
       
       return lunarYear;
     } catch (error) {
       console.error("计算农历基准年失败，降级为公历年:", error);
       return year;
     }
   }
   ```

3. **更新大限和流年计算**：
   - 在 `page.tsx` 中使用 `getLunarBaseYear` 计算农历基准年
   - 大限起始年份 = 农历基准年 + 起始虚岁 - 1
   - 动态生成流年按钮，确保大限范围内的年份正确
   - 修正流年虚岁计算逻辑，考虑出生当年可能为虚岁1岁或2岁的情况

### 测试结果
- 2000-1-4 出生的用户，农历基准年正确计算为 1999 年
- 5-14 岁大限起始年份正确计算为 2003 年（1999 + 5 - 1）
- 流年按钮显示正确的年份范围：2003-2012
- 使用 `chinese-lunar-calendar` 库确保了农历年份计算的准确性
- 解决了之前手动计算农历新年日期的复杂性问题

### 相关文件更改
- `frontend/src/lib/shichen.ts`：
  - 导入 `chinese-lunar-calendar` 库
  - 重写 `getLunarBaseYear` 函数，使用库的方法计算农历基准年
  - 实现 `getGregorianYearByNominalAge` 函数
- `frontend/src/app/page.tsx`：
  - 更新大限和流年计算逻辑
  - 添加调试日志，跟踪农历基准年和大限起始年份
  - 动态生成流年按钮，确保年份范围正确

---

## 2026-02-21 流年计算显示在 AI Prompt 中

### 功能描述
在 AI 命理师的提示词生成中，为每个宫位添加了流年虚岁信息的显示，使 AI 能够基于流年虚岁进行更准确的命理分析。

### 实现细节
- **文件**：`frontend/src/lib/ai.ts`
- **核心功能**：
  1. 添加了地支顺序数组 `EARTHLY_BRANCHES`，用于计算宫位位置差
  2. 实现了 `getPalaceMinorLimitAges` 函数，计算目标宫位的流年虚岁
  3. 从四柱中提取出生年地支，作为流年计算的基准
  4. 为每个宫位添加 "流年" 字段，显示前5个流年虚岁

### 技术原理
- 根据地支顺序计算宫位位置差（顺时针数）
- 首次流年虚岁 = 位置差 + 1
- 之后每12年循环一次，生成流年虚岁数组
- 在 AI Prompt 的数据上下文中显示流年虚岁信息

### 测试结果
- 庚辰年出生的用户，子宫的流年虚岁计算为：9, 21, 33, 45, 57
- 所有宫位的流年虚岁显示正确
- AI Prompt 中宫位信息包含完整的流年虚岁数据

---

## 2026-02-21 虚岁生年两岁特殊情况优化

### 问题描述
解决了生年虚岁为2岁时，大限与流年按钮不对应的问题。

### 原因分析
- **计算基准不一致**：大限选择按钮使用农历基准年计算，而查找当前大限时却使用公历出生年份
- **逻辑差异**：导致生年虚岁为2岁的情况下，大限和流年的计算结果不匹配

### 解决方案
- **文件**：`frontend/src/app/page.tsx`
- **核心修改**：
  1. 在查找当前大限时，使用与大限选择按钮相同的农历基准年
  2. 统一使用 `getGregorianYearByNominalAge` 函数计算大限年份范围
  3. 确保大限选择和流年显示的计算逻辑完全一致

### 测试结果
- 2000-01-04 出生的用户（生年虚岁2岁）：
  - 4-13 岁大限起始年份正确计算为 2002 年
  - 流年按钮显示正确的年份范围：2002-2011
  - 大限选择按钮与流年按钮对应关系正确
  - 其他年龄段的大限和流年按钮显示正常

### 技术改进
- 统一了大限和流年的计算基准，提高了系统的一致性
- 优化了生年虚岁特殊情况的处理，增强了系统的鲁棒性
- 减少了计算逻辑的差异，降低了维护成本

## 2026-02-23 取消对react-iztro的依赖重构命盘

### 问题描述
- 之前使用react-iztro库渲染命盘，存在以下问题：
  - 库的版本更新不及时，可能存在安全隐患
  - 库的组件结构不够灵活，难以满足自定义需求
  - 库的渲染逻辑复杂，不利于调试和维护
  - 对库的依赖增加了项目的体积和复杂性

### 技术实现
1. **移除react-iztro依赖**：
   - 从项目中移除react-iztro库的依赖
   - 不再使用库提供的组件和工具函数

2. **重构命盘组件**：
   - **ZiweiChart组件**：负责命盘的整体布局，使用CSS Grid实现4x4的宫位网格
   - **PalaceCell组件**：负责单个宫位的渲染，包括星曜、宫名、干支等信息
   - **CenterInfo组件**：负责命盘中心信息的显示，包括出生信息、命盘标题等
   - **constants.ts**：定义命盘相关的常量，如地支顺序、宫位映射等

3. **数据结构优化**：
   - 设计更合理的数据结构，更好地表示命盘信息
   - 优化宫位数据的传递和处理方式
   - 使用TypeScript接口定义数据结构，提高代码的类型安全性

4. **样式优化**：
   - 使用Tailwind CSS实现命盘的样式，提高样式的可维护性
   - 确保命盘在不同屏幕尺寸下都能正确显示，响应式设计
   - 支持深色/浅色模式，确保在两种模式下都有良好的视觉效果

5. **代码示例**：
   ```tsx
   // ZiweiChart组件核心代码
   export default function ZiweiChart(props: ZiweiChartProps) {
     const { ziweiData } = props;
     if (!ziweiData || !ziweiData.astrolabe) return <div>暂无命盘数据</div>;

     const { astrolabe, horoscope } = ziweiData;
     const palaces = astrolabe.palaces || [];

     return React.createElement(
       'div',
       {
         className: 'w-[90%] aspect-square md:aspect-auto md:h-[640px] grid grid-cols-4 grid-rows-4 gap-[1px] bg-gray-800 border-2 border-gray-800 mx-auto'
       },
       EARTHLY_BRANCHES.map((branch) => {
         const palaceData = palaces.find((p: any) => p.earthlyBranch === branch);
         return React.createElement(
           'div',
           {
             key: branch,
             className: `${GRID_MAPPING[branch]} bg-white relative`
           },
           React.createElement(PalaceCell, {
             palace: palaceData,
             horoscope: horoscope
           })
         );
       }),
       React.createElement(
         'div',
         {
           className: 'col-start-2 col-span-2 row-start-2 row-span-2 bg-[#f8f9fa] relative z-10'
         },
         React.createElement(CenterInfo, {
           astrolabe: astrolabe,
           horoscope: horoscope
         })
       )
     );
   }
   ```

### 测试结果
- 命盘渲染正常，所有宫位信息显示正确
- 命盘在不同屏幕尺寸下都能正确显示
- 命盘在深色/浅色模式下都有良好的视觉效果
- 命盘的布局和样式符合预期
- 系统稳定性提高，不再依赖外部库

### 相关文件更改
- `src/components/ZiweiChart/index.tsx`（新建）：实现命盘的整体布局
- `src/components/ZiweiChart/PalaceCell.tsx`（新建）：实现单个宫位的渲染
- `src/components/ZiweiChart/CenterInfo.tsx`（新建）：实现命盘中心信息的显示
- `src/components/ZiweiChart/constants.ts`（新建）：定义命盘相关的常量

### 技术改进
- 提高了系统的稳定性和可维护性，不再依赖外部库
- 实现了更灵活的命盘渲染逻辑，便于后续扩展和定制
- 使用Tailwind CSS实现样式，提高了样式的可维护性
- 支持响应式设计，确保命盘在不同屏幕尺寸下都能正确显示
- 使用TypeScript接口定义数据结构，提高了代码的类型安全性

## 2026-02-23 身宫和来因宫视觉标识

### 功能描述
- 在命盘上增加身宫和来因宫的视觉标识，提高命盘可读性，使命理分析师能够快速识别这两个重要宫位

### 技术实现
1. **身宫标识**：
   - 在`PalaceCellProps`接口中添加`earthlyBranchOfBodyPalace`字段
   - 在`ZiweiChart`组件中从`astrolabe.earthlyBranchOfBodyPalace`获取身宫所在地支
   - 在`PalaceCell`组件中添加`isBodyPalace`判断：`palace.earthlyBranch === earthlyBranchOfBodyPalace`
   - 在宫位名称旁边添加绿色的[身宫]标签，使用`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`确保在两种模式下都清晰可见

2. **来因宫标识**：
   - 在`PalaceCellProps`接口中添加`birthYearStem`字段
   - 在`ZiweiChart`组件中从`astrolabe.chineseDate`提取出生年干（如"戊寅年"的"戊"）
   - 在`PalaceCell`组件中添加`isOriginPalace`判断：`palace.heavenlyStem === birthYearStem`
   - 在宫位右上角添加红底白字[来因]标签，使用`bg-red-600 text-white`确保在两种模式下都清晰可见

3. **代码示例**：
   ```tsx
   // PalaceCell组件中身宫和来因宫的判断逻辑
   export default function PalaceCell({ palace, horoscope, earthlyBranchOfBodyPalace, birthYearStem }: PalaceCellProps) {
     if (!palace) return null;

     // 判断是否为身宫
     const isBodyPalace = palace.earthlyBranch === earthlyBranchOfBodyPalace;
     
     // 判断是否为来因宫
     const isOriginPalace = palace.heavenlyStem === birthYearStem;

     return (
       <div className={`w-full h-full p-1.5 flex flex-col justify-between
         ${isCurrentDecadal ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
         ${isCurrentYearly ? 'ring-2 ring-red-500 bg-red-50' : ''}
       `}>
         {/* 其他代码 */}
         
         {/* 底部：基石区 (宫名、干支、大限) */}
         <div className="border-t border-dashed border-gray-300 pt-1 mt-auto flex justify-between items-end">
           <div className="flex flex-col">
             {/* 大限岁数 */}
             <span className="text-[10px] text-gray-500">
               {palace.decadal?.range?.[0]}~{palace.decadal?.range?.[1]}
             </span>
             {/* 宫名 */}
             <div className="flex items-center gap-1">
               <span className="text-sm font-bold text-red-700">{palace.name}</span>
               {/* 身宫标识 */}
               {isBodyPalace && (
                 <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-1 py-0.5 rounded">
                   [身宫]
                 </span>
               )}
             </div>
           </div>
           {/* 干支 */}
           <div className="flex flex-col items-end">
             {/* 来因宫标识 */}
             {isOriginPalace && (
               <span className="text-xs bg-red-600 text-white px-1 py-0.5 rounded mb-1">
                 [来因]
               </span>
             )}
             <span className="text-lg font-bold text-blue-800">
               {palace.heavenlyStem}{palace.earthlyBranch}
             </span>
           </div>
         </div>
       </div>
     );
   }
   ```

### 测试结果
- 身宫标识正确显示在对应宫位的名称旁边，绿色标签清晰可见
- 来因宫标识正确显示在对应宫位的右上角，红底白字醒目
- 在深色/浅色模式下，两个标识都清晰可见
- 标识不破坏现有的宫位内部布局，与其他元素和谐共存

### 相关文件更改
- `src/components/ZiweiChart/PalaceCell.tsx`：
  - 在`PalaceCellProps`接口中添加`earthlyBranchOfBodyPalace`和`birthYearStem`字段
  - 添加`isBodyPalace`和`isOriginPalace`判断逻辑
  - 在宫位名称旁边添加身宫标识
  - 在宫位右上角添加来因宫标识
- `src/components/ZiweiChart/index.tsx`：
  - 从`astrolabe`中提取身宫地支和出生年干
  - 将这些数据作为props传递给`PalaceCell`组件

### 技术改进
- 提高了命盘的可读性，使命理分析师能够快速识别身宫和来因宫
- 实现了深色/浅色模式的支持，确保在不同环境下都有良好的显示效果
- 优化了标识的位置和样式，不破坏现有的宫位布局
- 使用TypeScript接口定义数据结构，提高了代码的类型安全性

## 2026-02-23 大限与流年四化动态渲染架构

### 功能描述
- 实现大限与流年四化的动态渲染，无需每次切换年份都请求后端计算，提高用户体验和系统性能

### 技术实现
1. **四化反查映射**：
   - 创建`SIHUA_TABLE`静态映射表，实现天干到四化的映射（如"甲" -> { 禄: "廉贞", 权: "破军", 科: "武曲", 忌: "太阳" }）
   - 实现`getMutagensByStem`函数，根据天干获取四化星
   - 实现`getDynamicSiHua`函数，根据星曜名称和天干获取四化状态，用于反查

2. **数据传递链路**：
   - 在`ZiweiChart`组件中从`horoscope`提取大限天干和流年天干
   - 在`PalaceCellProps`接口中添加`decadalStem`和`yearlyStem`字段
   - 将这些数据作为props传递给`PalaceCell`组件

3. **动态四化引擎**：
   - 在`PalaceCell`组件中，为每个主星计算三种四化状态：
     1. `birthSiHua`：本命生年四化（后端直接下发）
     2. `decadalSiHua`：动态大限四化（前端通过`getDynamicSiHua`函数推算）
     3. `yearlySiHua`：动态流年四化（前端通过`getDynamicSiHua`函数推算）

4. **UI视觉渲染**：
   - 生年四化：使用黄底红字标签 `生禄`，样式为`bg-yellow-200 dark:bg-yellow-800 text-red-600 dark:text-red-300`
   - 大限四化：使用蓝底白字/蓝字标签 `限禄`，样式为`bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300`
   - 流年四化：使用紫/粉底白字标签 `流禄`，样式为`bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300`，并添加`animate-pulse`动画效果

5. **代码示例**：
   ```typescript
   // sihua.ts核心代码
   export const SIHUA_TABLE = {
     '甲': { 禄: '廉贞', 权: '破军', 科: '武曲', 忌: '太阳' },
     '乙': { 禄: '天机', 权: '天梁', 科: '紫微', 忌: '太阴' },
     '丙': { 禄: '天同', 权: '天机', 科: '文昌', 忌: '廉贞' },
     '丁': { 禄: '太阴', 权: '天同', 科: '天机', 忌: '巨门' },
     '戊': { 禄: '贪狼', 权: '太阴', 科: '右弼', 忌: '天机' },
     '己': { 禄: '武曲', 权: '贪狼', 科: '天梁', 忌: '紫微' },
     '庚': { 禄: '太阳', 权: '武曲', 科: '太阴', 忌: '天同' },
     '辛': { 禄: '巨门', 权: '太阳', 科: '文曲', 忌: '文昌' },
     '壬': { 禄: '天梁', 权: '紫微', 科: '左辅', 忌: '武曲' },
     '癸': { 禄: '破军', 权: '巨门', 科: '太阴', 忌: '贪狼' }
   };

   export function getDynamicSiHua(starName: string, stem?: string): string | null {
     if (!stem) return null;
     
     const sihuaMap = getMutagensByStem(stem);
     
     if (sihuaMap['禄'] === starName) return '禄';
     if (sihuaMap['权'] === starName) return '权';
     if (sihuaMap['科'] === starName) return '科';
     if (sihuaMap['忌'] === starName) return '忌';
     
     return null;
   }
   ```

   ```tsx
   // PalaceCell组件中四化渲染核心代码
   {palace.majorStars?.map((star: any) => {
     // 1. 本命生年四化 (后端直接下发)
     const birthSiHua = star.mutagen; // 如 '禄'
     // 2. 动态大限四化 (前端推算)
     const decadalSiHua = getDynamicSiHua(star.name, decadalStem);
     // 3. 动态流年四化 (前端推算)
     const yearlySiHua = getDynamicSiHua(star.name, yearlyStem);
     
     return (
       <div key={star.name} className="flex items-center flex-wrap gap-1">
         <span className="text-red-700 font-bold text-lg leading-tight">{star.name}</span>
         {/* 亮度 */}
         {star.brightness && <span className="text-xs text-gray-500">{star.brightness}</span>}
         
         {/* 视觉层：用不同的底色区分三代四化，形成视觉阶梯 */}
         
         {/* 生年四化：经典黄底红字 */}
         {birthSiHua && (
           <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-red-600 dark:text-red-300 px-0.5 rounded border border-red-200">
             生{birthSiHua}
           </span>
         )}

         {/* 大限四化：沉稳蓝底白字/蓝字 */}
         {decadalSiHua && (
           <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-0.5 rounded border border-blue-200">
             限{decadalSiHua}
           </span>
         )}

         {/* 流年四化：醒目紫/粉底白字（流年最重，需要最吸睛） */}
         {yearlySiHua && (
           <span className="text-xs bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300 px-0.5 rounded border border-fuchsia-200 animate-pulse">
             流{yearlySiHua}
           </span>
         )}
       </div>
     );
   })}
   ```

### 测试结果
- 大限四化和流年四化能够根据选择的年份动态计算和显示
- 不同四化状态使用不同颜色标签区分，清晰可见
- 在深色/浅色模式下，所有四化标签都能正确显示
- 切换年份时，四化标签能够瞬间更新，无需等待后端响应
- 性能优化效果明显，用户体验流畅

### 相关文件更改
- `src/lib/sihua.ts`（新建）：
  - 创建`SIHUA_TABLE`静态映射表
  - 实现`getMutagensByStem`和`getDynamicSiHua`函数
- `src/components/ZiweiChart/PalaceCell.tsx`：
  - 在`PalaceCellProps`接口中添加`decadalStem`和`yearlyStem`字段
  - 实现动态四化渲染逻辑
  - 添加四化标签的样式
- `src/components/ZiweiChart/index.tsx`：
  - 从`horoscope`提取大限天干和流年天干
  - 将这些数据作为props传递给`PalaceCell`组件

### 技术改进
- 实现了前端动态四化计算，无需每次切换年份都请求后端，提高了系统性能和用户体验
- 使用静态映射表和反查机制，确保四化计算的准确性和效率
- 优化了UI视觉效果，使用不同颜色标签区分不同类型的四化，提高了命盘的可读性
- 使用TypeScript接口定义数据结构，提高了代码的类型安全性
- 实现了响应式设计，确保在不同屏幕尺寸和模式下都有良好的显示效果