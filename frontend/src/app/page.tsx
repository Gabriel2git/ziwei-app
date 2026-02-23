'use client';

import { useState, useRef, useEffect } from 'react';
import BirthForm from '@/components/BirthForm';
import { getShichenIndexFromHour, getLunarBaseYear, getGregorianYearByNominalAge, getEarthlyBranchByYear } from '@/lib/shichen';
import {
  Message,
  AI_MODELS,
  getDefaultSystemPrompt,
  parseZiweiToPrompt,
  generateMasterPrompt,
  getLLMResponse
} from '@/lib/ai';
import ZiweiChart from '@/components/ZiweiChart';

// 1. 类型定义补充（替代原本的 any）
interface SavedCase {
  id: string;
  name: string;
  birthData: BirthData;
  ziweiData: any; // 建议后续在 @/lib/ai 或相关文件中定义完整的 ZiweiData 类型
  savedAt: string;
}

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

// 2. 环境变量配置 API 地址（兼容本地和生产环境）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 3. 抽离 LocalStorage 逻辑为自定义 Hook
function useSavedCases() {
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ziwei_saved_cases');
      if (saved) setSavedCases(JSON.parse(saved));
    } catch (error) {
      console.error('加载保存的命例失败:', error);
    }
  }, []);

  const saveCase = (newCase: SavedCase) => {
    const updatedCases = [...savedCases, newCase];
    setSavedCases(updatedCases);
    localStorage.setItem('ziwei_saved_cases', JSON.stringify(updatedCases));
  };

  const deleteCase = (caseId: string) => {
    const updatedCases = savedCases.filter(c => c.id !== caseId);
    setSavedCases(updatedCases);
    localStorage.setItem('ziwei_saved_cases', JSON.stringify(updatedCases));
  };

  return { savedCases, saveCase, deleteCase };
}

export default function Home() {
  // === 状态管理 ===
  const [currentPage, setCurrentPage] = useState<'命盘显示' | 'AI 命理师'>('命盘显示');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  
  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [ziweiData, setZiweiData] = useState<any>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needRefreshChat, setNeedRefreshChat] = useState(false);
  
  const [debugPrompt, setDebugPrompt] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  
  const [horoscopeYear, setHoroscopeYear] = useState(new Date().getFullYear());
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [nominalAge, setNominalAge] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showSavedCases, setShowSavedCases] = useState(false);
  
  const [selectedDecadal, setSelectedDecadal] = useState<DecadalInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { savedCases, saveCase, deleteCase } = useSavedCases();

  // === 基础方法 ===
  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.toggle('dark');
    setDarkMode(isDark);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // === 命例管理方法 ===
  const handleSaveCurrentCase = () => {
    if (!birthData || !ziweiData) {
      alert('请先排盘后再保存命例');
      return;
    }
    const caseName = prompt('请输入命例名称:');
    if (!caseName) return;

    saveCase({
      id: Date.now().toString(),
      name: caseName,
      birthData,
      ziweiData,
      savedAt: new Date().toISOString()
    });
    alert('命例保存成功！');
  };

  const handleLoadSavedCase = (caseData: SavedCase) => {
    setBirthData(caseData.birthData);
    setZiweiData(caseData.ziweiData);
    setHasBirthData(true);
    setShowSavedCases(false);
    alert('命例加载成功！');
  };

  const handleDeleteSavedCase = (caseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除这个命例吗？')) {
      deleteCase(caseId);
      alert('命例删除成功！');
    }
  };

  // === 核心业务逻辑 ===
  const fetchZiweiData = async (data: BirthData, targetYear: number) => {
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

  const handleHoroscopeDateChange = async (date: Date) => {
    if (!birthData || isRefreshingData) return;
    
    const newYear = date.getFullYear();
    if (newYear === horoscopeYear) return;
    
    setIsRefreshingData(true);
    try {
      setHoroscopeYear(newYear);
      const realZiweiData = await fetchZiweiData(birthData, newYear);
      setZiweiData(realZiweiData);
      
      const baseYear = getLunarBaseYear(birthData.birthday);
      setNominalAge(newYear - baseYear + 1);
      
      const [sysPrompt, dataContext] = parseZiweiToPrompt(realZiweiData);
      setMessages([
        { role: 'system', content: sysPrompt },
        { role: 'system', content: dataContext },
        { 
          role: 'assistant', 
          content: '你好！我已经根据你选择的大限更新了命盘分析。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」' 
        }
      ]);
      setDebugPrompt(`=== 系统提示词 ===\n${sysPrompt}\n\n=== 数据上下文 ===\n${dataContext}`);
    } catch (error) {
      console.error('更新命盘数据失败:', error);
    } finally {
      setIsRefreshingData(false);
    }
  };

  const handleDataLoaded = async (data: BirthData) => {
    setBirthData(data);
    setHasBirthData(true);
    setNeedRefreshChat(true);
    
    try {
      const realZiweiData = await fetchZiweiData(data, horoscopeYear);
      setZiweiData(realZiweiData);
      
      const [sysPrompt, dataContext] = parseZiweiToPrompt(realZiweiData);
      setMessages([
        { role: 'system', content: sysPrompt },
        { role: 'system', content: dataContext },
        { 
          role: 'assistant', 
          content: '你好！我已经完整解析了这张命盘的本命结构。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」' 
        }
      ]);
    } catch (error) {
      console.error('获取后端数据失败:', error);
      setMessages([
        { 
          role: 'assistant', 
          content: `抱歉，无法获取命盘数据。请检查网络连接或后端服务是否开启。\n\n错误信息: ${error instanceof Error ? error.message : '未知错误'}` 
        }
      ]);
    } finally {
      setNeedRefreshChat(false);
    }
  };

  // === AI 对话逻辑 ===
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const systemPrompt = ziweiData 
        ? generateMasterPrompt(inputMessage, ziweiData, horoscopeYear)
        : getDefaultSystemPrompt();

      const dynamicMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...newMessages.filter(m => m.role !== 'system')
      ];

      const stream = await getLLMResponse(dynamicMessages, selectedModel);
      if (!stream) throw new Error('Failed to get response stream');
      
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';
      
      const tempMessageIndex = newMessages.length;
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0]?.delta?.content) {
                aiResponseContent += data.choices[0].delta.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[tempMessageIndex] = { role: 'assistant', content: aiResponseContent };
                  return newMsgs;
                });
              }
            } catch (e) {
              // 忽略流解析过程中的非致命错误
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 响应失败:', error);
      setMessages(prev => [
        ...prev.slice(0, -1), 
        {
          role: 'assistant',
          content: `抱歉，AI 服务调用失败。请确保环境变量配置正确或稍后重试。\n\n错误详情: ${error instanceof Error ? error.message : '未知错误'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // === 历史记录导入导出 ===
  const saveChatHistory = () => {
    if (messages.length === 0) return;
    
    const chatData = {
      birth_date: birthData?.birthday || '',
      gender: birthData?.gender || '',
      messages: messages.filter(m => m.role !== 'system'),
      timestamp: new Date().toLocaleString('zh-CN')
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ziwei_chat_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadChatHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chatData = JSON.parse(e.target?.result as string);
        if (chatData.messages) {
          setMessages(chatData.messages);
        }
      } catch (err) {
        console.error('加载聊天历史失败:', err);
        alert('聊天历史文件格式错误');
      }
    };
    reader.readAsText(file);
    // 重置 input 值以便能重复加载同名文件
    event.target.value = '';
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#0f1a1a] dark:to-[#0a1414]">
      <div className="flex h-full">
        {/* 左侧侧边栏 */}
        <aside className="w-84 bg-white dark:bg-[#1a2a2a] shadow-xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              🟣 AI 紫微斗数 Pro
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <div className="mb-6 space-y-2">
            <button
              onClick={() => setCurrentPage('命盘显示')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                currentPage === '命盘显示'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              📊 命盘显示
            </button>
            <button
              onClick={() => setCurrentPage('AI 命理师')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                currentPage === 'AI 命理师'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              🤖 AI 命理师
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">AI 模型</h2>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            >
              {AI_MODELS.map((model) => (
                <option key={model} value={model} className="text-gray-900 dark:text-gray-100">{model}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <BirthForm onDataLoaded={handleDataLoaded} />
          </div>
        </aside>

        {/* 右侧主区域 */}
        <main className="flex-1 p-6 overflow-hidden">
          {currentPage === '命盘显示' ? (
            <div className="max-w-6xl mx-auto h-full overflow-y-auto">
              {hasBirthData && birthData ? (
                <>
                  <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-8">
                    <div className="flex justify-center mb-6">
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
                  
                    {/* 大限和流年控制面板 */}
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
                                  // 实现点击切换逻辑：点击选择，再点击取消
                                  if (selectedDecadal && selectedDecadal.start === decadalInfo.start) {
                                    setSelectedDecadal(null);
                                    setSelectedYear(null); // 取消大限时也取消流年
                                  } else {
                                    setSelectedDecadal(decadalInfo);
                                    setSelectedYear(null); // 切换大限时也取消流年，确保流年宫位名称消除
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
                                    // 实现点击切换逻辑：点击选择，再点击取消
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

                    {/* 命例管理与调试区域 */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-sky-500 dark:text-sky-400">管理与调试</h3>
                      <div className="flex flex-wrap gap-3 mb-6">
                        <button onClick={handleSaveCurrentCase} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          保存当前命例
                        </button>
                        <button onClick={() => setShowSavedCases(!showSavedCases)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          {showSavedCases ? '收起命例列表' : `查看命例 (${savedCases.length})`}
                        </button>
                        <button 
                          onClick={() => {
                            if (ziweiData) {
                              const [sysPrompt, dataContext] = parseZiweiToPrompt(ziweiData);
                              setDebugPrompt(`=== 系统提示词 ===\n${sysPrompt}\n\n=== 数据上下文 ===\n${dataContext}`);
                            } else {
                              setDebugPrompt('❌ 数据未就绪');
                            }
                            setShowDebug(true);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          🔍 查看 AI Prompts
                        </button>
                      </div>

                      {showSavedCases && savedCases.length > 0 && (
                        <div className="mb-6 bg-gray-50 dark:bg-[#2a3a3a] rounded-lg p-4 shadow-inner">
                          <div className="space-y-2">
                            {savedCases.map((caseData) => (
                              <div key={caseData.id} className="flex justify-between items-center p-3 bg-white dark:bg-[#3a4a4a] rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all" onClick={() => handleLoadSavedCase(caseData)}>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{caseData.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    保存时间: {new Date(caseData.savedAt).toLocaleString()}
                                  </div>
                                </div>
                                <button onClick={(e) => handleDeleteSavedCase(caseData.id, e)} className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md transition-colors text-sm">
                                  删除
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {showDebug && (
                        <div className="mt-6 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-green-400">📜 Prompt 调试输出</h3>
                            <button onClick={() => setShowDebug(false)} className="px-3 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 text-sm">
                              关闭
                            </button>
                          </div>
                          <pre className="text-green-300 text-sm overflow-x-auto whitespace-pre-wrap font-mono bg-black/50 p-4 rounded-lg">
                            {debugPrompt}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[600px] bg-white/50 dark:bg-[#1a2a2a]/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">👈</div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 font-medium mb-2">请在左侧输入信息开始排盘</p>
                    <p className="text-gray-400 dark:text-gray-500 mb-4">支持公历和农历，精确到时辰</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                      <span className="text-base">💡</span> 按 F11 全屏浏览效果最佳
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-[#2a3a3a]/50">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    🤖 AI 命理师 
                    <span className="text-xs font-normal px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                      {selectedModel}
                    </span>
                  </h2>
                </div>
                
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                  {messages.filter(m => m.role !== 'system').map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-none'
                          : 'bg-gray-50 dark:bg-[#2a3a3a] border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-[#e0f0f0] rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-50 dark:bg-[#2a3a3a] border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none">
                        <div className="flex space-x-2 items-center h-6">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-[#2a3a3a] border-t border-gray-100 dark:border-gray-800 shrink-0">
                  <div className="flex justify-between mb-3">
                    <div className="flex gap-2">
                      <button onClick={saveChatHistory} className="px-3 py-1.5 text-sm bg-white dark:bg-[#3a4a4a] text-gray-600 dark:text-gray-300 rounded-lg hover:text-blue-600 border border-gray-200 dark:border-gray-600 transition-colors shadow-sm">
                        💾 导出对话
                      </button>
                      <label className="px-3 py-1.5 text-sm bg-white dark:bg-[#3a4a4a] text-gray-600 dark:text-gray-300 rounded-lg hover:text-green-600 border border-gray-200 dark:border-gray-600 transition-colors shadow-sm cursor-pointer">
                        📂 导入对话
                        <input type="file" accept=".json" onChange={loadChatHistory} className="hidden" />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={hasBirthData ? "输入你想询问的命理问题..." : "请先在左侧输入出生信息排盘..."}
                      disabled={!hasBirthData}
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-[#1a2a2a] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed shadow-inner transition-all"
                      rows={2}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim() || !hasBirthData}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center min-w-[100px]"
                    >
                      {isLoading ? '思考中...' : '发送'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}