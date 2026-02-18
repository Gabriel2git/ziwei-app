import axios from 'axios';
import type { ZiweiData, BirthFormData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_ZIWEI_API_URL || 'http://localhost:3001/api/ziwei';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function getZiweiData(params: {
  birthday: string;
  hourIndex: number;
  gender: string;
  targetYear: number;
  isLunar?: boolean;
  isLeap?: boolean;
}): Promise<ZiweiData> {
  const response = await apiClient.post('', params);
  return response.data;
}
