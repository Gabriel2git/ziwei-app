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

export {
  SHICHEN_MAP,
  SHICHEN_RANGE_MAP,
  SHICHEN_INDEX_MAP,
  getShichenFromHour,
  getShichenRange,
  getShichenIndexFromHour
};
