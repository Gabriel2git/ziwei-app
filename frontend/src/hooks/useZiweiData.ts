import { useState } from 'react';
import { getShichenIndexFromHour, getLunarBaseYear } from '@/lib/shichen';
import { parseZiweiToPrompt, Message } from '@/lib/ai';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
}

interface ZiweiData {
  astrolabe: any;
  horoscope?: any;
  originalTime?: {
    hour: number;
    minute: number;
  };
  targetYear?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useZiweiData() {
  const [ziweiData, setZiweiData] = useState<ZiweiData | null>(null);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [horoscopeYear, setHoroscopeYear] = useState(new Date().getFullYear());

  const fetchZiweiData = async (data: BirthData, targetYear: number): Promise<ZiweiData> => {
    const shichenIndex = getShichenIndexFromHour(data.birthTime);
    const response = await fetch(`${API_BASE_URL}/api/ziwei`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthday: data.birthday,
        hourIndex: shichenIndex,
        minute: data.birthMinute,
        gender: data.gender,
        longitude: data.longitude,
        targetYear: targetYear
      }),
    });

    if (!response.ok) throw new Error(`API 请求失败: ${response.statusText}`);
    
    const realZiweiData = await response.json();
    realZiweiData.originalTime = { hour: data.birthTime, minute: data.birthMinute };
    return realZiweiData;
  };

  const loadZiweiData = async (data: BirthData): Promise<ZiweiData> => {
    const realZiweiData = await fetchZiweiData(data, horoscopeYear);
    setZiweiData(realZiweiData);
    return realZiweiData;
  };

  const updateHoroscopeYear = async (birthData: BirthData, newYear: number): Promise<ZiweiData> => {
    if (isRefreshingData) return ziweiData!;
    
    setIsRefreshingData(true);
    try {
      setHoroscopeYear(newYear);
      const realZiweiData = await fetchZiweiData(birthData, newYear);
      setZiweiData(realZiweiData);
      return realZiweiData;
    } catch (error) {
      console.error('更新命盘数据失败:', error);
      throw error;
    } finally {
      setIsRefreshingData(false);
    }
  };

  return {
    ziweiData,
    isRefreshingData,
    horoscopeYear,
    loadZiweiData,
    updateHoroscopeYear,
    setZiweiData
  };
}
