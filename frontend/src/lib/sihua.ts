// 紫微斗数天干四化表
// 格式：天干 -> { 禄, 权, 科, 忌 }
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

/**
 * 根据天干获取四化星
 * @param stem 天干
 * @returns 四化星对象 { 禄, 权, 科, 忌 }
 */
export function getMutagensByStem(stem: string): { 禄: string, 权: string, 科: string, 忌: string } {
  return SIHUA_TABLE[stem] || { 禄: '', 权: '', 科: '', 忌: '' };
}

/**
 * 根据星曜名称和天干，获取该星曜在当前天干下的四化状态
 * @param starName 星曜名称
 * @param stem 天干
 * @returns 四化状态：'禄' | '权' | '科' | '忌' | null
 */
export function getDynamicSiHua(starName: string, stem?: string): string | null {
  if (!stem) return null;
  
  const sihuaMap = getMutagensByStem(stem);
  
  if (sihuaMap['禄'] === starName) return '禄';
  if (sihuaMap['权'] === starName) return '权';
  if (sihuaMap['科'] === starName) return '科';
  if (sihuaMap['忌'] === starName) return '忌';
  
  return null;
}
