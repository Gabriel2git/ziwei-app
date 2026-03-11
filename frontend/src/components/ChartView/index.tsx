import { useRef } from 'react';
import html2canvas from 'html2canvas';
import ZiweiChart from '@/components/ZiweiChart';
import { getLunarBaseYear, getGregorianYearByNominalAge, getEarthlyBranchByYear } from '@/lib/shichen';

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
  onTestAIPrompt?: (savedCase: SavedCase) => void;
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
  onTestAIPrompt
}: ChartViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // 导出命盘为图片
  const handleExportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // 提高清晰度
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `紫微斗数命盘_${birthData?.birthday || Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('导出命盘失败:', error);
      alert('导出命盘失败，请重试');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full overflow-y-auto pb-16 md:pb-0">
      {ziweiData && birthData ? (
        <>
          <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center mb-6" ref={chartRef}>
              <ZiweiChart 
                ziweiData={{
                  astrolabe: ziweiData?.astrolabe,
                  horoscope: {
                    decadal: selectedDecadal 
                      ? ziweiData?.astrolabe?.palaces?.find((p: any) => p.earthlyBranch === selectedDecadal.branch) 
                      : null,
                    yearly: selectedYear 
                      ? ziweiData?.astrolabe?.palaces?.find((p: any) => p.earthlyBranch === getEarthlyBranchByYear(selectedYear))
                      : null
                  }
                }}
              />
            </div>
          
            {ziweiData?.astrolabe && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {ziweiData.astrolabe.palaces?.
                    filter((palace: any) => palace.decadal?.range)
                    .map((palace: any) => ({
                      ...palace,
                      startAge: palace.decadal.range[0]
                    }))
                    .sort((a: any, b: any) => a.startAge - b.startAge)
                    .map((palace: any) => (
                      <button
                        key={palace.name}
                        onClick={() => {
                          const decadalInfo: DecadalInfo = {
                            start: palace.decadal?.range?.[0],
                            end: palace.decadal?.range?.[1],
                            stem: palace.heavenlyStem,
                            branch: palace.earthlyBranch
                          };
                          if (selectedDecadal && selectedDecadal.start === decadalInfo.start) {
                            setSelectedDecadal(null);
                            setSelectedYear(null);
                          } else {
                            setSelectedDecadal(decadalInfo);
                            setSelectedYear(null);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedDecadal?.start === palace.decadal?.range?.[0] 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {palace.decadal?.range?.[0]}-{palace.decadal?.range?.[1]}岁
                      </button>
                    ))}
                </div>
                
                {selectedDecadal && (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 10 }, (_, index) => {
                      const targetAge = Number(selectedDecadal.start) + index;
                      const baseYear = getLunarBaseYear(birthData.birthday);
                      const year = getGregorianYearByNominalAge(baseYear, targetAge);
                      return (
                        <button
                          key={year}
                          onClick={() => {
                            if (selectedYear === year) {
                              setSelectedYear(null);
                            } else {
                              setSelectedYear(year);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedYear === year 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
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
                💾 保存命例
              </button>
              <button
                onClick={() => setShowSavedCases(!showSavedCases)}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                📂 历史命例 ({savedCases.length})
              </button>
              <button
                onClick={handleExportChart}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                🖼️ 导出命盘
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
                              if (onTestAIPrompt) {
                                onTestAIPrompt(savedCase);
                              }
                            }}
                            className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                            title="将命例数据作为prompt发送给AI进行测试"
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
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          {/* 动态箭头引导 */}
          <div className="mb-6 flex flex-col items-center">
            <div className="animate-bounce">
              <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-sm text-purple-500 mt-2 font-medium">点击左上角菜单开始排盘</span>
          </div>
          <p className="text-lg">请在左侧输入出生信息开始排盘</p>
          <p className="mt-2 text-sm opacity-75">按F11全屏浏览效果更佳</p>
        </div>
      )}
    </div>
  );
}
