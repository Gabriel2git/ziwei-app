// 使用chinese-lunar-calendar库实现精确的农历基准年计算
import { getLunar } from 'chinese-lunar-calendar';

// 农历节日常量
const LUNAR_FESTIVALS = {
  SPRING_FESTIVAL: '春节'
};

const SHICHEN_MAP: Record<number, string> = {
  23: '子时',
  0: '子时',
  1: '丑时',
  2: '丑时',
  3: '寅时',
  4: '寅时',
  5: '卯时',
  6: '卯时',
  7: '辰时',
  8: '辰时',
  9: '巳时',
  10: '巳时',
  11: '午时',
  12: '午时',
  13: '未时',
  14: '未时',
  15: '申时',
  16: '申时',
  17: '酉时',
  18: '酉时',
  19: '戌时',
  20: '戌时',
  21: '亥时',
  22: '亥时'
};

const SHICHEN_RANGE_MAP: Record<string, string> = {
  '子时': '23:00-01:00',
  '丑时': '01:00-03:00',
  '寅时': '03:00-05:00',
  '卯时': '05:00-07:00',
  '辰时': '07:00-09:00',
  '巳时': '09:00-11:00',
  '午时': '11:00-13:00',
  '未时': '13:00-15:00',
  '申时': '15:00-17:00',
  '酉时': '17:00-19:00',
  '戌时': '19:00-21:00',
  '亥时': '21:00-23:00'
};

const SHICHEN_INDEX_MAP: Record<number, number> = {
  23: 0,
  0: 0,
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 4,
  8: 4,
  9: 5,
  10: 5,
  11: 6,
  12: 6,
  13: 7,
  14: 7,
  15: 8,
  16: 8,
  17: 9,
  18: 9,
  19: 10,
  20: 10,
  21: 11,
  22: 11
};

function getShichenFromHour(hour: number): string {
  return SHICHEN_MAP[hour] || '未知时辰';
}

function getShichenRange(shichen: string): string {
  return SHICHEN_RANGE_MAP[shichen] || '';
}

function getShichenIndexFromHour(hour: number): number {
  return SHICHEN_INDEX_MAP[hour] || 0;
}

/**
 * 核心逻辑：计算真实的"农历基准年"
 * @param solarDateStr 公历日期字符串 "YYYY-MM-DD"
 * @returns number 农历出生的年份
 */
export function getLunarBaseYear(solarDateStr: string): number {
  if (!solarDateStr) return new Date().getFullYear();
  
  const [year, month, day] = solarDateStr.split('-').map(Number);
  
  try {
    // 使用chinese-lunar-calendar库计算精确的农历日期
    const lunar = getLunar(year, month, day) as any;
    
    // 计算农历基准年
    let lunarYear = year;
    
    // 直接使用备用方法：如果农历月份是12，说明还没过春节，农历年份是前一年
    if (lunar.lunarMonth === 12) {
      lunarYear = year - 1;
    }
    
    return lunarYear;
  } catch (error) {
    console.error("计算农历基准年失败，降级为公历年:", error);
    return year;
  }
}

/**
 * 根据虚岁计算对应的公历年份
 * @param baseYear 农历基准年
 * @param nominalAge 目标虚岁
 * @returns 对应的公历年份
 */
export function getGregorianYearByNominalAge(baseYear: number, nominalAge: number): number {
  // 公式：目标年份 = 农历生年 + 虚岁 - 1
  return baseYear + nominalAge - 1;
}

/**
 * 根据年份获取对应的地支
 * @param year 年份
 * @returns 地支字符串
 */
export function getEarthlyBranchByYear(year: number): string {
  if (isNaN(year)) {
    return '子'; // 默认返回子
  }
  
  // 地支顺序：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 以1900年为基准（1900年是子年）
  const baseYear = 1900;
  const index = (year - baseYear) % 12;
  
  // 处理负数情况
  const normalizedIndex = (index + 12) % 12;
  
  return earthlyBranches[normalizedIndex];
}

export {
  SHICHEN_MAP,
  SHICHEN_RANGE_MAP,
  SHICHEN_INDEX_MAP,
  getShichenFromHour,
  getShichenRange,
  getShichenIndexFromHour
};
