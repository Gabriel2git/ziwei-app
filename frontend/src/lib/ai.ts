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

const AI_MODELS = [
  "deepseek-v3.2",
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
    
    // 生成每个大限的信息
    decadalPalaces.forEach((palace: any, index: number) => {
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
        "天梁禄,紫微权,左辅科,武曲忌"
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
        
        // 模拟流年干支（实际需要从命盘数据中获取）
        const yearGanzhiMap: Record<number, string> = {
          2005: "乙酉", 2006: "丙戌", 2007: "丁亥", 2008: "戊子", 2009: "己丑",
          2010: "庚寅", 2011: "辛卯", 2012: "壬辰", 2013: "癸巳", 2014: "甲午",
          2015: "乙未", 2016: "丙申", 2017: "丁酉", 2018: "戊戌", 2019: "己亥",
          2020: "庚子", 2021: "辛丑", 2022: "壬寅", 2023: "癸卯", 2024: "甲辰"
        };
        const yearGanzhi = yearGanzhiMap[year] || "未知";
        
        // 模拟命宫干支（实际需要从命盘数据中获取）
        const palaceGanzhiMap: Record<number, string> = {
          2005: "乙酉", 2006: "丙戌", 2007: "丁亥", 2008: "戊子", 2009: "己丑",
          2010: "戊寅", 2011: "己卯", 2012: "庚辰", 2013: "辛巳", 2014: "壬午",
          2015: "癸未", 2016: "甲申", 2017: "乙酉", 2018: "丙戌", 2019: "丁亥",
          2020: "戊子", 2021: "己丑", 2022: "戊寅", 2023: "己卯", 2024: "庚辰"
        };
        const palaceGanzhi = palaceGanzhiMap[year] || "未知";
        
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

function generateMasterPrompt(userQuestion: string, fullData: ZiweiData, targetYear: number) {
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
  
  const systemPrompt = `
# Role: 资深的国学易经术数领域专家

你现在是资深的国学易经术数领域专家，熟练使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，能对命盘十二宫星曜分布和各宫位间的飞宫四化进行细致分析

## 论命基本原则
1. **宫位定人事**：基于十二宫职能与对宫关系分析。
2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。

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

请用温暖、客观、建设性的语言输出建议。
遇到凶象（如化忌、空劫），不要只说不好，要给出"趋避建议"。

# 重要提示
请基于提供的命盘数据进行分析，不要基于任何其他命盘数据。
命盘的出生时间是：${clockTime}，对应的农历时间是：${pan?.lunarDate || '未知'}${chineseHour}。
请确保你的分析基于这个具体的命盘数据，而不是其他命盘数据。
`;
  
  return systemPrompt;
}

async function getLLMResponse(messages: Message[], model: string = 'deepseek-v3.2'): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
  const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not set');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.body;
}

export {
  AI_MODELS,
  getDefaultSystemPrompt,
  parseZiweiToPrompt,
  generateMasterPrompt,
  getLLMResponse
};
