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

const SIHUA_TABLE: Record<string, Record<string, string>> = {
  "甲": {"禄": "廉贞", "权": "破军", "科": "武曲", "忌": "太阳"},
  "乙": {"禄": "天机", "权": "天梁", "科": "紫微", "忌": "太阴"},
  "丙": {"禄": "天同", "权": "天机", "科": "文昌", "忌": "廉贞"},
  "丁": {"禄": "太阴", "权": "天同", "科": "天机", "忌": "巨门"},
  "戊": {"禄": "贪狼", "权": "太阴", "科": "右弼", "忌": "天机"},
  "己": {"禄": "武曲", "权": "贪狼", "科": "天梁", "忌": "文曲"},
  "庚": {"禄": "太阳", "权": "武曲", "科": "太阴", "忌": "天同"},
  "辛": {"禄": "巨门", "权": "太阳", "科": "文曲", "忌": "文昌"},
  "壬": {"禄": "天梁", "权": "紫微星", "科": "左辅", "忌": "武曲"},
  "癸": {"禄": "破军", "权": "巨门", "科": "太阴", "忌": "贪狼"}
};

function getMutagensByStem(stem: string) {
  return SIHUA_TABLE[stem] || {};
}

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
  
  const clockTime = `${pan?.solarDate || ''} ${pan?.timeRange?.split('~')[0] || ''}`;
  const trueSolarTime = clockTime;
  const chineseHour = pan?.time || '';
  
  let baseInfo = `性别：${pan?.gender || '未知'}\n`;
  baseInfo += `地理经度：120.033\n`;
  baseInfo += `钟表时间：${clockTime}\n`;
  baseInfo += `真太阳时：${trueSolarTime}\n`;
  baseInfo += `农历时间：${pan?.lunarDate || '未知'}${chineseHour}\n`;
  baseInfo += `节气四柱：${pan?.chineseDate || '未知'}\n`;
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
      if (IMPORTANT_ADJ_STARS.includes(s?.name || '')) {
        let info = s?.name || '';
        if (s?.brightness) info += `[${s.brightness}]`;
        adjStars.push(info);
      }
    }
    const adjStr = adjStars.length > 0 ? adjStars.join('，') : '无';
    
    const decadalRange = p?.decadal?.range || [0, 0];
    const decadalText = `大限 : ${decadalRange[0]}~${decadalRange[1]}虚岁\n`;
    
    const ages = p?.ages || [];
    const minorAges = ages.length > 5 ? ages.filter((_: number, i: number) => i % 2 === 0) : ages.slice(0, 5);
    const minorAgesStr = minorAges.map(String).join('，');
    const minorText = `小限 : ${minorAgesStr}虚岁\n`;
    
    const yearlyAges = ages.length > 5 ? ages.filter((_: number, i: number) => i % 2 === 1) : ages.slice(1, 6);
    const yearlyAgesStr = yearlyAges.map(String).join('，');
    const yearlyText = `流年 : ${yearlyAgesStr}虚岁\n`;
    
    palaceText += `${header}\n`;
    palaceText += `  ├主星 : ${majorStr}\n`;
    palaceText += `  ├辅星 : ${minorStr}\n`;
    palaceText += `  ├小星 : ${adjStr}\n`;
    palaceText += `  ├${decadalText.trim()}\n`;
    palaceText += `  ├${minorText.trim()}\n`;
    palaceText += `  └${yearlyText.trim()}\n\n`;
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
我已经为你准备好了命主的【本命结构】。
请以"体"为本，回答用户关于格局、性格、运势走向的问题。
**注意：** 辅星（如文曲化忌）与杂曜（如红鸾）对格局影响大，请务必纳入分析。
`;

  const dataContext = `【基本信息】\n${baseInfo}\n\n【命盘十二宫】\n${palaceText}`;
  
  return [systemPrompt, dataContext];
}

function generateMasterPrompt(userQuestion: string, fullData: ZiweiData, targetYear: number) {
  const pan = fullData.astrolabe;
  const yun = fullData.horoscope || {};
  
  const yearlyMutagen: string[] = [];
  if (yun?.yearly?.heavenlyStem) {
    const yearlyStem = yun.yearly.heavenlyStem;
    const yearlyMuts = getMutagensByStem(yearlyStem);
    yearlyMutagen.push(yearlyMuts['禄'] || '', yearlyMuts['权'] || '', yearlyMuts['科'] || '', yearlyMuts['忌'] || '');
  }
  
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
      if (IMPORTANT_ADJ_STARS.includes(s?.name || '')) {
        let info = s?.name || '';
        if (s?.brightness) info += `[${s.brightness}]`;
        adjStars.push(info);
      }
    }
    const adjStr = adjStars.length > 0 ? adjStars.join('，') : '无';
    
    const decadalRange = p?.decadal?.range || [0, 0];
    const decadalText = `│ │ ├大限 : ${decadalRange[0]}~${decadalRange[1]}虚岁\n`;
    
    palaceText += `${header}\n`;
    palaceText += `│ │ ├主星 : ${majorStr}\n`;
    palaceText += `│ │ ├辅星 : ${minorStr}\n`;
    palaceText += `│ │ ├小星 : ${adjStr}\n`;
    palaceText += decadalText;
    palaceText += `│ │\n`;
  }
  
  const fullChartContext = `${chartContext}\n\n【命盘十二宫】\n│ │\n${palaceText}`;
  
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
`;
  
  return systemPrompt;
}

async function getLLMResponse(messages: Message[], model: string = 'deepseek-v3.2') {
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
  getLLMResponse,
  getMutagensByStem
};
