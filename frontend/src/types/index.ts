export interface Star {
  name: string;
  brightness?: string;
  mutagen?: string;
}

export interface Palace {
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars?: Star[];
  minorStars?: Star[];
  adjectiveStars?: Star[];
  decadal?: {
    range: [number, number];
  };
}

export interface Astrolabe {
  palaces: Palace[];
  solarDate?: string;
  lunarDate?: string;
  time?: string;
  timeRange?: string;
  soul?: string;
  body?: string;
  earthlyBranchOfBodyPalace?: string;
  chineseDate?: string;
}

export interface Horoscope {
  age?: {
    nominalAge: number;
  };
  decadal?: {
    heavenlyStem: string;
    range: [number, number];
  };
  yearly?: {
    heavenlyStem: string;
  };
}

export interface ZiweiData {
  astrolabe: Astrolabe;
  horoscope?: Horoscope;
}

export interface BirthFormData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: '男' | '女';
  isLunar: boolean;
  isLeap?: boolean;
}
