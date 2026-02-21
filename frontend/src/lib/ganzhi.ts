// 天干地支相关工具函数

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 根据公历年获取干支纪年
 * @param year 公历年，如 2003
 * @returns 干支纪年，如 '癸未'
 */
export function getYearGanZhi(year: number): string {
  // 公元4年为甲子年
  const heavenlyStemIndex = (year - 4) % 10;
  const earthlyBranchIndex = (year - 4) % 12;
  
  const stem = HEAVENLY_STEMS[heavenlyStemIndex < 0 ? heavenlyStemIndex + 10 : heavenlyStemIndex];
  const branch = EARTHLY_BRANCHES[earthlyBranchIndex < 0 ? earthlyBranchIndex + 12 : earthlyBranchIndex];
  
  return stem + branch;
}

/**
 * 根据大限起始年龄计算该大限的起始年份
 * @param birthYear 出生年份
 * @param startAge 大限起始虚岁
 * @returns 大限起始年份
 */
export function getDecadalStartYear(birthYear: number, startAge: number): number {
  return birthYear + startAge - 1;
}
