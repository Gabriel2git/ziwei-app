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
  
  let palaceText = "";
  const palaces = pan?.palaces || [];
  
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
    palaceText += `  ├${minorText}\n\n`;
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

  const dataContext = `紫微斗数命盘\n│\n【基本信息】\n${baseInfo}\n\n【命盘十二宫】\n${palaceText}`;
  
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
