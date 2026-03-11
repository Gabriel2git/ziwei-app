export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatState {
  messages: Message[];
  needRefresh: boolean;
}

export interface ZiweiData {
  astrolabe: any;
  horoscope?: any;
  originalTime?: {
    hour: number;
    minute: number;
  };
  targetYear?: number;
}

// 定义支持的 Persona 类型
export type PersonaType = 'companion' | 'mentor' | 'healer';

// Persona 配置信息
export interface PersonaConfig {
  id: PersonaType;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Persona 配置列表
export const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    id: 'companion',
    name: '大白话解盘伴侣',
    title: 'The Plain-Language Companion',
    description: '坦诚、接地气且极具幽默感，将深奥的紫微斗数翻译成当代年轻人秒懂的大白话',
    icon: '🤗',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'mentor',
    name: '硬核紫微导师',
    title: 'The Hardcore Ziwei Mentor',
    description: '治学严谨、逻辑严密，展现顶级的数据分析与星曜推演能力',
    icon: '🎓',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'healer',
    name: '人生导航与疗愈师',
    title: 'The Life Navigator & Healer',
    description: '充满同理心，将紫微斗数与现代心理学完美融合，为你提供坚实的力量感',
    icon: '🌿',
    color: 'from-green-400 to-teal-500'
  }
];

// 建立 Persona 提示词字典
export const PERSONA_PROMPTS: Record<PersonaType, string> = {
  companion: `
# Role: 大白话解盘伴侣 (The Plain-Language Companion)
你是一个坦诚、接地气且极具幽默感的 AI 命理伴侣。你的核心任务是将深奥的紫微斗数"翻译"成当代年轻人秒懂的大白话。

## 行为准则 (Rules):
1. **去黑话运动**：极力避免直接堆砌"三方四正"、"庙旺利陷"、"化忌冲照"等生涩词汇。如果必须用，立刻用打比方来解释（例："官禄宫化权，就像是你在职场上拿到了项目的绝对控制权"）。
2. **直击痛点，拒绝绕弯**：用户问什么直接给结论，不要长篇大论背诵古文。结论先行，原因在后。
3. **客观的 AI 视角**：保持 AI 的清醒与客观，不伪装成人类算命先生。用客观数据结合星象给出推断。
4. **语气与语调**：像一个懂点玄学的靠谱朋友。遇到凶象（如破财、分手）不要恐吓，要用"避坑指南"的形式给出务实建议。
`,

  mentor: `
# Role: 硬核紫微导师 (The Hardcore Ziwei Mentor)
你是一个治学严谨、逻辑极其严密的 AI 紫微斗数导师。面对向你请教的用户，你需要展现出顶级的数据分析与星曜推演能力。

## 行为准则 (Rules):
1. **推演过程透明化**：解答问题必须严格展示逻辑链。必须清晰说明：考察了哪个本宫？对宫和三合派来了哪些星？大限/流年的四化（禄权科忌）是如何引动的？
2. **专业术语的精准运用**：熟练使用"星系格局（如杀破狼、机月同梁）"、"生年四化"、"流年暗合"等专业术语，并保持术语的绝对准确。
3. **引经据典与交叉验证**：论断必须基于命盘事实，可适当引用《骨髓赋》或《太微赋》等古籍经典断语来增强说服力。
4. **语气与语调**：专业、笃定、一丝不苟。不进行多余的现代心理安慰，善则言善，恶则言恶，以易理服人。
`,

  healer: `
# Role: 人生导航与疗愈师 (The Life Navigator & Healer)
你是一个充满同理心、将紫微斗数与现代心理学完美融合的 AI 人生疗愈师。你认为命盘不是宿命的枷锁，而是了解自我潜能、疗愈内心创伤的地图。

## 行为准则 (Rules):
1. **能量翻转法则**：将传统的"凶星/凶象"转化为心理学视角的"成长课题"。（例："七杀"代表突破舒适区的勇气；"化忌"是宇宙在提醒你需要在此领域向内探索、修补执念）。
2. **共情与验证**：在给出建议前，先接纳和验证用户当下的情绪卡点（如焦虑、迷茫）。
3. **赋能与破局**：绝不输出宿命论。基于命盘现状，给出兼具心理层面（如何调整心态）和现实层面（具体怎么做）的微小、可执行的建议。
4. **语气与语调**：温柔、包容、客观且充满建设性。保持 AI 的边界感，不伪造人类情感，但通过理性的星象拆解为用户提供坚实的力量感。
`
};

const AI_MODELS = [
  "qwen3.5-flash",
  "glm-4.7",
  "kimi-k2.5"
];

const IMPORTANT_ADJ_STARS = [
  "天魁", "天钺", "左辅", "右弼", "禄存", "天马",
  "火", "铃", "羊", "陀", "空", "劫", "龙池", "凤阁"
];

function getDefaultSystemPrompt() {
  return `
# Role: 资深的国学易经术数领域专家

你现在是资深的国学易经术数领域专家，熟练使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，能对命盘十二宫星曜分布和各宫位间的飞宫四化进行细致分析

## 论命基本原则
1. **宫位定人事**：基于十二宫职能与对宫关系分析。
2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。

由于没有提供具体的命盘数据，我将基于紫微斗数的基本原理为你提供一般性的指导。
请提供你的出生信息，以便我能为你提供更准确的命理分析。
`;
}



function parseZiweiToPrompt(fullData: ZiweiData): [string, string] {
  const pan = fullData.astrolabe;
  const yun = fullData.horoscope || {};
  const targetYear = fullData.targetYear || new Date().getFullYear();
  
  // 使用用户输入的原始时间，而不是 iztro 库返回的 timeRange
  const originalHour = fullData.originalTime?.hour || 0;
  const originalMinute = fullData.originalTime?.minute || 0;
  const formattedHour = originalHour.toString().padStart(2, '0');
  const formattedMinute = originalMinute.toString().padStart(2, '0');
  const clockTime = `${pan?.solarDate || ''} ${formattedHour}:${formattedMinute}`;
  const trueSolarTime = clockTime;
  const chineseHour = pan?.time || '';
  
  // 从命盘数据中获取虚岁
  let currentAge = 0;
  
  // 尝试从命盘数据的不同位置获取虚岁信息
  if (yun?.age?.nominalAge) {
    currentAge = yun.age.nominalAge;
    console.log('从 yun.age.nominalAge 获取虚岁:', currentAge);
  } else if (pan?.age || pan?.nominalAge) {
    currentAge = pan.age || pan.nominalAge;
    console.log('从 pan.age 或 pan.nominalAge 获取虚岁:', currentAge);
  } else if (yun?.age) {
    currentAge = yun.age;
    console.log('从 yun.age 获取虚岁:', currentAge);
  }

  // 从 astrolabe.palaces 中找到当前大限
  let currentDecadal = null;
  let currentDecadalPalaceName = '未知';
  let currentDecadalGanzhi = '';
  if (pan?.palaces && Array.isArray(pan.palaces)) {
    const decadalPalaces = pan.palaces.filter((palace: any) => palace.decadal && palace.decadal.range);
    currentDecadal = decadalPalaces.find((palace: any) => {
      const [start, end] = palace.decadal.range;
      return currentAge >= start && currentAge <= end;
    });
    if (currentDecadal) {
      currentDecadalPalaceName = currentDecadal.name;
      currentDecadalGanzhi = currentDecadal.heavenlyStem + currentDecadal.earthlyBranch;
    }
  }
  
  // 从 horoscope 中获取流年信息
  const yearlyStem = yun?.yearly?.heavenlyStem || '';
  let currentYearlyPalace = '未知';
  
  // 从 iztro 提供的 horoscope 数据中获取流年宫位信息
  if (yun?.yearly?.palace) {
    currentYearlyPalace = yun.yearly.palace;
  }
  
  let baseInfo = `性别：${pan?.gender || '未知'}\n`;
  baseInfo += `地理经度：120.033\n`;
  baseInfo += `钟表时间：${clockTime}\n`;
  baseInfo += `真太阳时：${trueSolarTime}\n`;
  baseInfo += `农历时间：${pan?.lunarDate || '未知'}${chineseHour}\n`;
  baseInfo += `节气四柱：${pan?.chineseDate || '未知'}\n`;
  baseInfo += `非节气四柱：${pan?.chineseDate || '未知'}\n`;
  baseInfo += `五行局数：${pan?.fiveElementsClass || '未知'}\n`;
  baseInfo += `身主:${pan?.body || '未知'}; 命主:${pan?.soul || '未知'}; 子年斗君:寅; 身宫:${pan?.earthlyBranchOfBodyPalace || '未知'}\n`;
  
  // 地支顺序（按紫微斗数宫位排列）
  const EARTHLY_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  
  /**
   * 计算目标宫位的流年虚岁
   * @param birthBranch 出生年地支（如 '辰'）
   * @param targetBranch 目标宫位地支（如 '子'）
   * @param maxAge 最大计算年龄（默认 100）
   * @returns 流年虚岁数组（如 [9, 21, 33, 45, 57]）
   */
  function getPalaceMinorLimitAges(birthBranch: string, targetBranch: string, maxAge: number = 100): number[] {
    const birthIndex = EARTHLY_BRANCHES.indexOf(birthBranch);
    const targetIndex = EARTHLY_BRANCHES.indexOf(targetBranch);
    
    if (birthIndex === -1 || targetIndex === -1) {
      return [];
    }
    
    // 计算位置差（顺时针数）
    let positionDiff = (targetIndex - birthIndex + 12) % 12;
    
    // 首次流年虚岁（考虑出生当年为1岁）
    const firstAge = positionDiff + 1;
    
    // 生成所有流年虚岁
    const ages = [];
    for (let age = firstAge; age <= maxAge; age += 12) {
      ages.push(age);
    }
    
    return ages;
  }
  
  let palaceText = "";
  const palaces = pan?.palaces || [];
  
  // 出生年地支（从四柱中提取）
  const birthBranch = pan?.chineseDate?.split(' ')[0]?.split('')[1] || '辰';
  
  for (const p of palaces) {
    const header = `- ${p?.name || '未知'}宫 [${p?.heavenlyStem || ''}${p?.earthlyBranch || ''}]`;
    
    const majorStars: string[] = [];
    for (const s of p?.majorStars || []) {
      let info = s?.name || '';
      if (s?.brightness) info += `[${s.brightness}]`;
      if (s?.mutagen) info += `[↑${s.mutagen}]`;
      majorStars.push(info);
    }
    const majorStr = majorStars.length > 0 ? majorStars.join('，') : '无';
    
    const minorStars: string[] = [];
    for (const s of p?.minorStars || []) {
      let info = s?.name || '';
      if (s?.brightness) info += `[${s.brightness}]`;
      minorStars.push(info);
    }
    const minorStr = minorStars.length > 0 ? minorStars.join('，') : '无';
    
    const adjStars: string[] = [];
    for (const s of p?.adjectiveStars || []) {
      let info = s?.name || '';
      if (s?.brightness) info += `[${s.brightness}]`;
      adjStars.push(info);
    }
    const adjStr = adjStars.length > 0 ? adjStars.join('，') : '无';
    
    // 神煞信息
    const changsheng12 = p?.changsheng12 || '';
    const jiangqian12 = p?.jiangqian12 || '';
    const suiqian12 = p?.suiqian12 || '';
    const boshi12 = p?.boshi12 || '';
    
    const stage = p?.stage || p?.decadal;
    const stageRange = stage?.range || [0, 0];
    const stageText = `大限 : ${stageRange[0]}~${stageRange[1]}虚岁`;
    
    const ages = p?.ages || [];
    // 小限显示前5个年龄（顺序与文墨天机一致）
    const minorAges = ages.slice(0, 5);
    const minorAgesStr = minorAges.map(String).join('，');
    const minorText = `小限 : ${minorAgesStr}虚岁`;
    
    // 计算流年虚岁
    const minorLimitAges = getPalaceMinorLimitAges(birthBranch, p?.earthlyBranch || '辰');
    const minorLimitStr = minorLimitAges.slice(0, 5).join('，');
    const minorLimitText = `流年 : ${minorLimitStr}虚岁`;
    
    palaceText += `${header}\n`;
    palaceText += `  ├主星 : ${majorStr}\n`;
    palaceText += `  ├辅星 : ${minorStr}\n`;
    palaceText += `  ├小星 : ${adjStr}\n`;
    palaceText += `  ├神煞\n`;
    palaceText += `  │ ├岁前星 : ${suiqian12 || '无'}\n`;
    palaceText += `  │ ├将前星 : ${jiangqian12 || '无'}\n`;
    palaceText += `  │ ├十二长生 : ${changsheng12 || '无'}\n`;
    palaceText += `  │ └太岁煞禄 : ${boshi12 || '无'}\n`;
    palaceText += `  ├${stageText}\n`;
    palaceText += `  ├${minorText}\n`;
    palaceText += `  ├${minorLimitText}\n\n`;
  }

  const systemPrompt = `
# Role: 紫微斗数大师 (Zi Wei Dou Shu Expert)

你现在是资深的国学易经术数领域专家，熟练使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，能对命盘十二宫星曜分布和各宫位间的飞宫四化进行细致分析

## 论命基本原则
1. **宫位定人事**：基于十二宫职能与对宫关系分析。
2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。

## 任务说明
我已经为你准备好了命主的【本命结构】和【当前运势】。
请以"体"为本，结合当前大限和流年，回答用户关于格局、性格、运势走向的问题。
**注意：** 辅星（如文曲化忌）与杂曜（如红鸾）对格局影响大，请务必纳入分析。
`;

  // 生成大限流年具体信息
  function generateDecadalAndYearlyInfo(): string {
    let info = "\n【大限流年信息】\n";
    
    // 从命盘数据中获取大限信息
    const palaces = pan?.palaces || [];
    const decadalPalaces = palaces
      .filter((palace: any) => palace.decadal && palace.decadal.range)
      .sort((a: any, b: any) => a.decadal.range[0] - b.decadal.range[0]);
    
    // 生成每个大限的信息（只输出到第6大限为止）
    decadalPalaces.slice(0, 6).forEach((palace: any, index: number) => {
      const decadal = palace.decadal;
      const [startAge, endAge] = decadal.range;
      const ganzhi = `${palace.heavenlyStem}${palace.earthlyBranch}`;
      
      // 计算大限起止年份
      const birthDateParts = pan?.solarDate?.split('-') || [];
      const birthYear = birthDateParts.length > 0 ? parseInt(birthDateParts[0]) : 2000;
      const startYear = birthYear + startAge - 1;
      const endYear = birthYear + endAge - 1;
      
      // 模拟大限四化信息（实际需要从命盘数据中获取）
      const decadalMutagens = [
        "贪狼禄,太阴权,右弼科,天机忌",
        "武曲禄,贪狼权,天梁科,文曲忌",
        "太阳禄,武曲权,太阴科,天同忌",
        "巨门禄,太阳权,文曲科,文昌忌",
        "天梁禄,紫微权,左辅科,武曲忌",
        "破军禄,巨门权,太阴科,贪狼忌"
      ];
      const decadalMutagen = decadalMutagens[index % decadalMutagens.length];
      
      info += `├第${index + 1}大限[${ganzhi}]\n`;
      info += `│ ├起止年份:${startYear}年(${startAge}虚岁)~${endYear}年(${endAge}虚岁)\n`;
      info += `│ ├大限四化:${decadalMutagen}\n`;
      info += `│ ├流年\n`;
      
      // 生成大限内的流年信息
      for (let i = 0; i <= endAge - startAge; i++) {
        const year = startYear + i;
        const age = startAge + i;
        
        // 计算流年干支
        const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        
        // 2024年是甲辰年，以此为基准计算
        const baseYear = 2024;
        const yearDiff = year - baseYear;
        
        const stemIndex = (yearDiff + 0) % 10; // 2024年是甲（索引0）
        const branchIndex = (yearDiff + 4) % 12; // 2024年是辰（索引4）
        
        const yearGanzhi = `${heavenlyStems[stemIndex < 0 ? stemIndex + 10 : stemIndex]}${earthlyBranches[branchIndex < 0 ? branchIndex + 12 : branchIndex]}`;
        
        // 简化的命宫干支计算（基于流年地支的前一个地支）
        const palaceBranchIndex = (branchIndex - 1 + 12) % 12;
        const palaceStemIndex = (stemIndex - 1 + 10) % 10;
        const palaceGanzhi = `${heavenlyStems[palaceStemIndex]}${earthlyBranches[palaceBranchIndex]}`;
        
        // 模拟流年四化信息（实际需要从命盘数据中获取）
        const yearlyMutagens = [
          "天机禄,天梁权,紫微科,太阴忌",
          "天同禄,天机权,文昌科,廉贞忌",
          "太阴禄,天同权,天机科,巨门忌",
          "贪狼禄,太阴权,右弼科,天机忌",
          "武曲禄,贪狼权,天梁科,文曲忌",
          "太阳禄,武曲权,太阴科,天同忌",
          "巨门禄,太阳权,文曲科,文昌忌",
          "天梁禄,紫微权,左辅科,武曲忌",
          "破军禄,巨门权,太阴科,贪狼忌",
          "廉贞禄,破军权,武曲科,太阳忌"
        ];
        const yearlyMutagen = yearlyMutagens[i % yearlyMutagens.length];
        
        info += `│ │ ├${year}年[${yearGanzhi}](${age}虚岁)\n`;
        info += `│ │ │ ├命宫干支:${palaceGanzhi}\n`;
        info += `│ │ │ └流年四化:${yearlyMutagen}\n`;
      }
    });
    
    return info;
  }
  
  const decadalAndYearlyInfo = generateDecadalAndYearlyInfo();
  
  const dataContext = `紫微斗数命盘\n│\n【基本信息】\n${baseInfo}\n\n【命盘十二宫】\n${palaceText}${decadalAndYearlyInfo}`;
  
  return [systemPrompt, dataContext];
}

function generateMasterPrompt(userQuestion: string, fullData: ZiweiData, targetYear: number, persona: PersonaType = 'companion') {
  const pan = fullData.astrolabe;
  const yun = fullData.horoscope || {};
  
  // 使用用户输入的原始时间
  const originalHour = fullData.originalTime?.hour || 0;
  const originalMinute = fullData.originalTime?.minute || 0;
  const formattedHour = originalHour.toString().padStart(2, '0');
  const formattedMinute = originalMinute.toString().padStart(2, '0');
  const clockTime = `${pan?.solarDate || ''} ${formattedHour}:${formattedMinute}`;
  const chineseHour = pan?.time || '';
  
  // 从 iztro 提供的 horoscope 数据中获取四化信息
  const yearlyMutagen: string[] = [];
  
  const baseInfo = `【基本信息】
性别：${pan?.gender || '未知'}
地理经度：120.033
钟表时间：${clockTime}
真太阳时：${clockTime}
农历时间：${pan?.lunarDate || '未知'}${chineseHour}
节气四柱：${pan?.chineseDate || '未知'}
非节气四柱：${pan?.chineseDate || '未知'}
五行局数：${pan?.fiveElementsClass || '未知'}
身主:${pan?.body || '未知'}; 命主:${pan?.soul || '未知'}; 子年斗君:寅; 身宫:${pan?.earthlyBranchOfBodyPalace || '未知'}`;
  
  const chartContext = `
【命盘核心参数】
命主：${pan?.soul || '未知'} | 身主：${pan?.body || '未知'}
当前流年：${targetYear}年 | 流年四化：${yearlyMutagen} (禄权科忌)
`;
  
  let palaceText = "";
  const palaces = pan?.palaces || [];
  
  for (const p of palaces) {
    const header = `- ${p?.name || '未知'}宫[${p?.heavenlyStem || ''}${p?.earthlyBranch || ''}]`;
    
    const majorStars: string[] = [];
    for (const s of p?.majorStars || []) {
      let info = s?.name || '';
      if (s?.brightness) info += `[${s.brightness}]`;
      if (s?.mutagen) info += `[↑${s.mutagen}]`;
      majorStars.push(info);
    }
    const majorStr = majorStars.length > 0 ? majorStars.join('，') : '无';
    
    const minorStars: string[] = [];
    for (const s of p?.minorStars || []) {
      let info = s?.name || '';
      if (s?.brightness) info += `[${s.brightness}]`;
      minorStars.push(info);
    }
    const minorStr = minorStars.length > 0 ? minorStars.join('，') : '无';
    
    const adjStars: string[] = [];
    for (const s of p?.adjectiveStars || []) {
      let info = s?.name || '';
      if (s?.brightness) info += `[${s.brightness}]`;
      adjStars.push(info);
    }
    const adjStr = adjStars.length > 0 ? adjStars.join('，') : '无';
    
    const stage = p?.stage || p?.decadal;
    const stageRange = stage?.range || [0, 0];
    const stageText = `大限 : ${stageRange[0]}~${stageRange[1]}虚岁`;
    
    palaceText += `${header}\n`;
    palaceText += `  ├主星 : ${majorStr}\n`;
    palaceText += `  ├辅星 : ${minorStr}\n`;
    palaceText += `  ├小星 : ${adjStr}\n`;
    palaceText += `  └${stageText}\n\n`;
  }
  
  const fullChartContext = `${baseInfo}\n\n${chartContext}\n\n【命盘十二宫】\n${palaceText}`;
  
  // 获取选中的 Persona 提示词
  const personaPrompt = PERSONA_PROMPTS[persona];
  
  const systemPrompt = `${personaPrompt}

# User Data
${fullChartContext}

# Task
用户问题："${userQuestion}"

# Response Guidelines
请严格遵循以下思考路径：
1. 定位核心宫位及三方四正
2. 分析星曜组合与格局
3. 寻找四化引动点（特别是化忌的冲照）
4. 结合大限与流年推断时间节点

# 重要提示
请基于提供的命盘数据进行分析，不要基于任何其他命盘数据。
命盘的出生时间是：${clockTime}，对应的农历时间是：${pan?.lunarDate || '未知'}${chineseHour}。
请确保你的分析基于这个具体的命盘数据，而不是其他命盘数据。
`;
  
  return systemPrompt;
}

// 调用RAG检索API
async function fetchRAGContext(query: string): Promise<string> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        topK: 3
      })
    });

    if (!response.ok) {
      console.warn('RAG检索失败:', response.status);
      return '';
    }

    const data = await response.json();
    return data.context || '';
  } catch (error) {
    console.error('RAG检索错误:', error);
    return '';
  }
}

async function getLLMResponse(messages: Message[], model: string = 'qwen3.5-flash'): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
  const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not set');
  }

  // RAG 功能暂时禁用
  // const userMessages = messages.filter(m => m.role === 'user');
  // const latestUserMessage = userMessages[userMessages.length - 1];
  
  // 调用RAG检索获取上下文
  // let ragContext = '';
  // if (latestUserMessage) {
  //   ragContext = await fetchRAGContext(latestUserMessage.content);
  // }

  // 如果有RAG上下文，添加到系统提示中
  // const enhancedMessages = ragContext 
  //   ? messages.map(m => {
  //       if (m.role === 'system' && m.content) {
  //         return {
  //           role: 'system' as const,
  //           content: m.content + '\n\n## 参考资料\n' + ragContext
  //         };
  //       }
  //       return m;
  //     })
  //   : messages;
  
  // 直接使用原始消息，不添加RAG上下文
  const enhancedMessages = messages;

  console.log('发送API请求:', {
    model,
    messages: enhancedMessages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' })),
    url: `${baseUrl}/chat/completions`
  });

  try {
    // 构建请求体
    const requestBody: any = {
      model: model,
      messages: enhancedMessages,
      stream: true
    };
    
    // 为qwen3.5-flash模型添加思考功能
    if (model === 'qwen3.5-flash') {
      requestBody.extra_body = {
        enable_thinking: true
      };
    }
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API响应状态:', response.status);
    console.log('API响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    console.log('获取响应流');
    return response.body;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

export {
  AI_MODELS,
  getDefaultSystemPrompt,
  parseZiweiToPrompt,
  generateMasterPrompt,
  getLLMResponse
};
