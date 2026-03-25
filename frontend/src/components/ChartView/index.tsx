﻿﻿﻿﻿﻿﻿import { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import ZiweiChart from '@/components/ZiweiChart';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
}

interface DecadalInfo {
  start: number;
  end: number;
  stem: string;
  branch: string;
}

interface SavedCase {
  id: string;
  name: string;
  birthData: BirthData;
  ziweiData: any;
  savedAt: string;
}

interface ChartViewProps {
  ziweiData: any;
  birthData: BirthData | null;
  selectedDecadal: DecadalInfo | null;
  setSelectedDecadal: (decadal: DecadalInfo | null) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  savedCases: SavedCase[];
  showSavedCases: boolean;
  setShowSavedCases: (show: boolean) => void;
  onSaveCase: () => void;
  onLoadCase: (caseData: SavedCase) => void;
  onDeleteCase: (caseId: string, event: React.MouseEvent) => void;
  onYearChange?: (year: number) => void;
  onTestAIPrompt?: (savedCase: SavedCase) => void;
}

function getDecadalStartYear(targetYear: number, currentNominalAge: number, decadalStartAge: number): number {
  return targetYear - (currentNominalAge - decadalStartAge);
}

export default function ChartView({
  ziweiData,
  birthData,
  selectedDecadal,
  setSelectedDecadal,
  selectedYear,
  setSelectedYear,
  savedCases,
  showSavedCases,
  setShowSavedCases,
  onSaveCase,
  onLoadCase,
  onDeleteCase,
  onYearChange,
  onTestAIPrompt,
}: ChartViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const decadalButtons = useMemo(() => {
    const palaces = ziweiData?.astrolabe?.palaces || [];
    return palaces
      .filter((palace: any) => Array.isArray(palace?.decadal?.range) && palace.decadal.range.length === 2)
      .map((palace: any) => ({
        start: Number(palace.decadal.range[0]),
        end: Number(palace.decadal.range[1]),
        stem: palace.heavenlyStem || '',
        branch: palace.earthlyBranch || '',
        name: palace.name || '',
      }))
      .sort((a: any, b: any) => a.start - b.start);
  }, [ziweiData?.astrolabe?.palaces]);

  const handleExportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `紫微命盘_${birthData?.birthday || Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('导出命盘失败:', error);
      alert('导出命盘失败，请重试');
    }
  };

  const handleSelectDecadal = (item: any) => {
    if (!ziweiData?.horoscope?.age?.nominalAge || !ziweiData?.targetYear) {
      return;
    }

    const decadalInfo: DecadalInfo = {
      start: item.start,
      end: item.end,
      stem: item.stem,
      branch: item.branch,
    };

    if (selectedDecadal && selectedDecadal.start === decadalInfo.start) {
      setSelectedDecadal(null);
      setSelectedYear(null);
      return;
    }

    setSelectedDecadal(decadalInfo);

    const firstYear = getDecadalStartYear(
      Number(ziweiData.targetYear),
      Number(ziweiData.horoscope.age.nominalAge),
      Number(decadalInfo.start),
    );
    setSelectedYear(firstYear);
    onYearChange?.(firstYear);
  };

  const yearsOfSelectedDecadal = useMemo(() => {
    if (!selectedDecadal || !ziweiData?.horoscope?.age?.nominalAge || !ziweiData?.targetYear) {
      return [] as number[];
    }

    const startYear = getDecadalStartYear(
      Number(ziweiData.targetYear),
      Number(ziweiData.horoscope.age.nominalAge),
      Number(selectedDecadal.start),
    );

    const totalYears = Number(selectedDecadal.end) - Number(selectedDecadal.start) + 1;
    return Array.from({ length: Math.max(totalYears, 0) }, (_, index) => startYear + index);
  }, [selectedDecadal, ziweiData?.horoscope?.age?.nominalAge, ziweiData?.targetYear]);

  return (
    <div className="max-w-6xl mx-auto h-full overflow-y-auto pb-16 md:pb-0">
      {ziweiData && birthData ? (
        <>
          <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-4 md:p-8">
            <div className="flex justify-center mb-6" ref={chartRef}>
              <ZiweiChart
                ziweiData={{
                  astrolabe: ziweiData?.astrolabe,
                  horoscope: ziweiData?.horoscope,
                }}
              />
            </div>

            {ziweiData?.astrolabe && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {decadalButtons.map((item: any) => (
                    <button
                      key={`${item.stem}${item.branch}-${item.start}`}
                      onClick={() => handleSelectDecadal(item)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        selectedDecadal?.start === item.start
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title={`${item.name} ${item.stem}${item.branch}`}
                    >
                      {item.start}-{item.end}岁
                    </button>
                  ))}
                </div>

                {selectedDecadal && (
                  <div className="flex flex-wrap gap-2">
                    {yearsOfSelectedDecadal.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          if (selectedYear === year) {
                            return;
                          }
                          setSelectedYear(year);
                          onYearChange?.(year);
                        }}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          selectedYear === year
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                onClick={onSaveCase}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                保存命例
              </button>
              <button
                onClick={() => setShowSavedCases(!showSavedCases)}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                历史命例 ({savedCases.length})
              </button>
              <button
                onClick={handleExportChart}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                导出命盘
              </button>
            </div>

            {showSavedCases && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">已保存的命例</h3>
                {savedCases.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">暂无保存的命例</p>
                ) : (
                  <div className="space-y-2">
                    {savedCases.map((savedCase) => (
                      <div
                        key={savedCase.id}
                        onClick={() => onLoadCase(savedCase)}
                        className="bg-white dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{savedCase.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {savedCase.birthData.birthday} | {savedCase.birthData.gender === 'male' ? '男' : '女'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTestAIPrompt?.(savedCase);
                            }}
                            className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                            title="将命例数据作为 Prompt 发送给 AI 进行测试"
                          >
                            测试AI
                          </button>
                          <button
                            onClick={(e) => onDeleteCase(savedCase.id, e)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-300 px-6">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full font-bold text-sm md:text-base">
              <span>点击顶部导航栏开始使用</span>
            </div>
          </div>

          <div className="w-full max-w-2xl bg-white dark:bg-[#1a2a2a] border border-purple-200 dark:border-purple-800 rounded-2xl p-5 md:p-6 shadow-lg">
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">完整使用流程</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
              <li>点击顶部导航栏（桌面）或底部菜单（手机）进入相应页面。</li>
              <li>在侧边栏输入出生信息后点击“开始排盘”。</li>
              <li>在命盘页点击大限/流年按钮，观察命盘动态边框变化。</li>
              <li>在顶部导航栏切到 AI 命理师页面，选择命理师并开始提问。</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
