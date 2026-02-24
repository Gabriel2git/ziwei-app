import { useState, useEffect } from 'react';

interface SavedCase {
  id: string;
  name: string;
  birthData: any;
  ziweiData: any;
  savedAt: string;
}

export function useSavedCases() {
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);

  // 初始化时从 localStorage 加载保存的案例
  useEffect(() => {
    const storedCases = localStorage.getItem('ziwei_saved_cases');
    if (storedCases) {
      try {
        setSavedCases(JSON.parse(storedCases));
      } catch (error) {
        console.error('加载保存的案例失败:', error);
        setSavedCases([]);
      }
    }
  }, []);

  // 保存案例到 localStorage
  const saveCase = (caseData: SavedCase) => {
    const updatedCases = [...savedCases, caseData];
    setSavedCases(updatedCases);
    localStorage.setItem('ziwei_saved_cases', JSON.stringify(updatedCases));
  };

  // 删除案例
  const deleteCase = (caseId: string) => {
    const updatedCases = savedCases.filter((caseItem) => caseItem.id !== caseId);
    setSavedCases(updatedCases);
    localStorage.setItem('ziwei_saved_cases', JSON.stringify(updatedCases));
  };

  return {
    savedCases,
    saveCase,
    deleteCase
  };
}