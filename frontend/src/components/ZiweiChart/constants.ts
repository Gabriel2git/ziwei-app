// frontend/src/components/ZiweiChart/constants.ts

// 顺时针定义的十二地支，用于遍历生成格子
export const EARTHLY_BRANCHES = [
  '巳', '午', '未', '申',
  '酉', '戌', '亥', '子',
  '丑', '寅', '卯', '辰'
];

// 4x4 网格的绝对坐标映射（核心：地支锁定物理位置）
export const GRID_MAPPING: Record<string, string> = {
  '巳': 'col-start-1 row-start-1',
  '午': 'col-start-2 row-start-1',
  '未': 'col-start-3 row-start-1',
  '申': 'col-start-4 row-start-1',
  '酉': 'col-start-4 row-start-2',
  '戌': 'col-start-4 row-start-3',
  '亥': 'col-start-4 row-start-4',
  '子': 'col-start-3 row-start-4',
  '丑': 'col-start-2 row-start-4',
  '寅': 'col-start-1 row-start-4',
  '卯': 'col-start-1 row-start-3',
  '辰': 'col-start-1 row-start-2',
};
