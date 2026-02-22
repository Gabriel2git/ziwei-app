declare module 'chinese-lunar-calendar' {
  export interface LunarInfo {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: string;
    lunarMonth: number;
    lunarDay: number;
    ganzhiYear: string;
    ganzhiMonth: string;
    ganzhiDay: string;
    isLeap: boolean;
    festival?: string;
  }

  export function getLunar(solarYear: number, solarMonth: number, solarDay: number): LunarInfo;
  export function getSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeap?: boolean): { solarYear: number; solarMonth: number; solarDay: number };
}
