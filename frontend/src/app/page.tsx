'use client';

import { useState, useRef, useEffect } from 'react';
import BirthForm from '@/components/BirthForm';
import { getShichenIndexFromHour, getLunarBaseYear, getGregorianYearByNominalAge } from '@/lib/shichen';
import {
  Message,
  AI_MODELS,
  getDefaultSystemPrompt,
  parseZiweiToPrompt,
  generateMasterPrompt,
  getLLMResponse
} from '@/lib/ai';
import { Solar } from 'chinese-lunar-calendar';


export default function Home() {
  const [currentPage, setCurrentPage] = useState<'命盘显示' | 'AI 命理师'>('命盘显示');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<{
    birthday: string;
    birthTime: number;
    birthMinute: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
    longitude: number;
  } | null>(null);
  const [ziweiData, setZiweiData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [needRefreshChat, setNeedRefreshChat] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugPrompt, setDebugPrompt] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [horoscopeYear, setHoroscopeYear] = useState(new Date().getFullYear());
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [nominalAge, setNominalAge] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 切换深色模式
  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark');
    
    if (isDark) {
      htmlElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      htmlElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  // 处理命盘日期变化
  const handleHoroscopeDateChange = async (date: Date) => {
    if (!birthData || isRefreshingData) return;
    
    const newYear = date.getFullYear();
    if (newYear === horoscopeYear) return; // 避免重复更新
    
    setIsRefreshingData(true);
    
    try {
      // 更新运势年份
      setHoroscopeYear(newYear);
      
      // 将小时数转换为时辰索引
      const shichenIndex = getShichenIndexFromHour(birthData.birthTime);
      
      // 重新获取命盘数据
      const response = await fetch('http://localhost:3001/api/ziwei', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthday: birthData.birthday,
          hourIndex: shichenIndex,
          minute: birthData.birthMinute,
          gender: birthData.gender,
          longitude: birthData.longitude,
          targetYear: newYear
        }),
      });
      
      if (!response.ok) {
        throw new Error('API 请求失败');
      }
      
      const realZiweiData = await response.json();
      
      // 保存用户输入的原始时间
      realZiweiData.originalTime = {
        hour: birthData.birthTime,
        minute: birthData.birthMinute
      };
      
      // 更新命盘数据
      setZiweiData(realZiweiData);
      
      // 计算虚岁并更新状态
          if (birthData) {
            try {
              // 1. 拿到用户真实的农历出生年
              const baseYear = getLunarBaseYear(birthData.birthday);
              
              // 2. 虚岁 = 目标年份 - 农历出生年 + 1
              const calculatedAge = newYear - baseYear + 1;
              
              setNominalAge(calculatedAge);
              console.log('计算的真实虚岁:', calculatedAge);
            } catch (error) {
              console.error('虚岁计算错误:', error);
            }
          }
      
      // 更新 AI prompt
      const [sysPrompt, dataContext] = parseZiweiToPrompt(realZiweiData);
      setMessages([
        { role: 'system', content: sysPrompt },
        { role: 'system', content: dataContext },
        { 
          role: 'assistant', 
          content: '你好！我已经根据你选择的大限更新了命盘分析。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」' 
        }
      ]);
      
      // 更新调试 prompt
      setDebugPrompt(`=== 系统提示词 ===\n${sysPrompt}\n\n=== 数据上下文 ===\n${dataContext}`);
    } catch (error) {
      console.error('更新命盘数据失败:', error);
    } finally {
      setIsRefreshingData(false);
    }
  };
  
  const handleZiweiDataLoaded = (data: any) => {
    console.log('✅ 命盘数据加载完成:', data);
    setZiweiData(data);
    setNeedRefreshChat(true);
    
    const [sysPrompt, dataContext] = parseZiweiToPrompt(data);
    setMessages([
      { role: 'system', content: sysPrompt },
      { role: 'system', content: dataContext },
      { 
        role: 'assistant', 
        content: '你好！我已经完整解析了这张命盘的本命结构。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」' 
      }
    ]);
    setNeedRefreshChat(false);
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDataLoaded = async (data: {
    birthday: string;
    birthTime: number;
    birthMinute: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
    longitude: number;
  }) => {
    setBirthData(data);
    setHasBirthData(true);
    setNeedRefreshChat(true);
    
    console.log('🟢 handleDataLoaded 被调用:', data);
    
    try {
      // 将小时数转换为时辰索引
      const shichenIndex = getShichenIndexFromHour(data.birthTime);
      console.log('🟢 转换后的时辰索引:', shichenIndex);
      
      // 从后端 API 获取真实数据
      const response = await fetch('http://localhost:3001/api/ziwei', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthday: data.birthday,
          hourIndex: shichenIndex,
          minute: data.birthMinute,
          gender: data.gender,
          longitude: data.longitude,
          targetYear: horoscopeYear
        }),
      });
      
      if (!response.ok) {
        throw new Error('API 请求失败');
      }
      
      const realZiweiData = await response.json();
      console.log('🟢 从后端 API 获取真实数据成功:', realZiweiData);
      
      // 保存用户输入的原始时间
      realZiweiData.originalTime = {
        hour: data.birthTime,
        minute: data.birthMinute
      };
      
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
      console.error('❌ 从后端 API 获取数据失败:', error);
      
      // 如果 API 请求失败，显示错误信息
      setMessages([
        { 
          role: 'assistant', 
          content: `抱歉，无法获取命盘数据。请检查网络连接后重试。\n\n错误信息: ${error instanceof Error ? error.message : '未知错误'}` 
        }
      ]);
    } finally {
      setNeedRefreshChat(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      let systemPrompt: string;
      
      if (ziweiData) {
        systemPrompt = generateMasterPrompt(inputMessage, ziweiData, horoscopeYear);
      } else {
        systemPrompt = getDefaultSystemPrompt();
      }

      const dynamicMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...newMessages.filter(m => m.role !== 'system')
      ];

      const stream = await getLLMResponse(dynamicMessages, selectedModel);
      if (!stream) {
        throw new Error('Failed to get response stream');
      }
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';
      
      const tempMessageIndex = newMessages.length;
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

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
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 响应失败:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `抱歉，AI 服务调用失败。请确保已在 \`.env.local\` 文件中配置了正确的 \`NEXT_PUBLIC_DASHSCOPE_API_KEY\`。\n\n错误详情: ${error instanceof Error ? error.message : '未知错误'}`
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
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

  const saveChatHistory = () => {
    if (messages.length > 0) {
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
    }
  };

  const loadChatHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
      <div className="flex h-full">
        <aside className="w-84 bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              🟣 AI 紫微斗数 Pro
            </h1>
            <button
              onClick={() => {
                console.log('点击了切换按钮');
                toggleDarkMode();
              }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">导航</h2>
            <div className="space-y-2">
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

        <main className="flex-1 p-6 overflow-hidden">
          {currentPage === '命盘显示' ? (
            <div className="max-w-6xl mx-auto h-full overflow-y-auto">
              {hasBirthData && birthData ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">

                    <div className="flex justify-center">
                    <IztrolabeWrapper 
                      birthday={birthData.birthday}
                      birthTime={birthData.birthTime}
                      birthdayType={birthData.birthdayType}
                      gender={birthData.gender}
                      horoscopeYear={horoscopeYear}
                      onHoroscopeDateChange={handleHoroscopeDateChange}
                    />
                  </div>
                  </div>
                  
                  {/* 大限和流年选择按钮 */}
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    {/* 大限选择 */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {ziweiData?.astrolabe?.palaces ? (
                          // 从十二宫位中获取大限信息，并按起始年龄从小到大排序
                          ziweiData.astrolabe.palaces
                            .filter((palace: any) => palace.decadal && palace.decadal.range)
                            .map((palace: any) => ({
                              decadal: palace.decadal,
                              palaceName: palace.name,
                              palaceGanzhi: palace.heavenlyStem + palace.earthlyBranch
                            }))
                            .sort((a: any, b: any) => a.decadal.range[0] - b.decadal.range[0])
                            .map((item: any, index: number) => {
                            const { decadal, palaceName, palaceGanzhi } = item;
                            const [startAge, endAge] = decadal.range;
                            
                            // ⭐️ 新逻辑：获取真实的农历基准年
                            const baseYear = birthData?.birthday ? getLunarBaseYear(birthData.birthday) : 2000;
                            
                            // 计算该大限的起止年份
                            const startYear = getGregorianYearByNominalAge(baseYear, startAge);
                            const endYear = getGregorianYearByNominalAge(baseYear, endAge);
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  // 点击时，跳转到该大限第一年的 6 月 1 日（避开年初春节边界）
                                  handleHoroscopeDateChange(new Date(startYear, 5, 1));
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  horoscopeYear >= startYear && horoscopeYear <= endYear
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                disabled={isRefreshingData}
                              >
                                {startAge}~{endAge} [{palaceGanzhi}]
                              </button>
                            );
                          })
                        ) : (
                          // 如果没有命盘数据，使用硬编码的大限范围
                          [
                            { range: '5~14', year: 2003, ganzhi: '辛未' },
                            { range: '15~24', year: 2013, ganzhi: '庚午' },
                            { range: '25~34', year: 2023, ganzhi: '己巳' },
                            { range: '35~44', year: 2033, ganzhi: '戊辰' },
                            { range: '45~54', year: 2043, ganzhi: '丁卯' },
                            { range: '55~64', year: 2053, ganzhi: '丙寅' },
                            { range: '65~74', year: 2063, ganzhi: '丁丑' },
                            { range: '75~84', year: 2073, ganzhi: '丙子' },
                            { range: '85~94', year: 2083, ganzhi: '乙亥' },
                            { range: '95~104', year: 2093, ganzhi: '甲戌' },
                            { range: '105~114', year: 2103, ganzhi: '癸酉' },
                            { range: '115~124', year: 2113, ganzhi: '壬申' }
                          ].map((period, index) => {
                            // 计算该大限对应的流年范围
                            const startYear = period.year;
                            const endYear = startYear + 9;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => handleHoroscopeDateChange(new Date(startYear, 5, 1))}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  horoscopeYear >= startYear && horoscopeYear <= endYear
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                disabled={isRefreshingData}
                              >
                                {period.range} [{period.ganzhi}]
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                    
                    {/* 流年选择 */}
                    <div className="mt-4">
                      {(() => {
                        if (ziweiData?.astrolabe?.palaces && birthData) {
                          // 从十二宫位中找到当前选中的大限
                          const birthDateParts = birthData.birthday.split('-');
                          const birthYear = parseInt(birthDateParts[0]);
                          
                          // ⭐️ 新逻辑：获取真实的农历基准年
                          const baseYear = birthData?.birthday ? getLunarBaseYear(birthData.birthday) : 2000;
                          
                          const currentPeriod = ziweiData.astrolabe.palaces
                            .filter((palace: any) => palace.decadal && palace.decadal.range)
                            .map((palace: any) => ({
                              decadal: palace.decadal,
                              palaceName: palace.name
                            }))
                            .find((item: any) => {
                              const [startAge, endAge] = item.decadal.range;
                              const startYear = getGregorianYearByNominalAge(baseYear, startAge);
                              const endYear = getGregorianYearByNominalAge(baseYear, endAge);
                              return horoscopeYear >= startYear && horoscopeYear <= endYear;
                            });
                          
                          if (currentPeriod) {
                            const [startAge, endAge] = currentPeriod.decadal.range;
                            
                            // ⭐️ 新逻辑：获取真实的农历基准年
                            const baseYear = birthData?.birthday ? getLunarBaseYear(birthData.birthday) : 2000;
                            console.log(`农历基准年: ${baseYear}, 出生年份: ${birthData?.birthday}`);
                            
                            // 计算该大限的起始年份
                            const startYear = getGregorianYearByNominalAge(baseYear, startAge);
                            console.log(`大限起始年龄: ${startAge}, 大限起始年份: ${startYear}`);

                            return (
                              <div>
                                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{startAge}~{endAge} 大限流年</div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: endAge - startAge + 1 }, (_, i) => startYear + i).map((year, yearIndex) => {
                                    console.log(`生成流年年份: ${year}`);
                                    return (
                                      <button
                                        key={yearIndex}
                                        onClick={() => handleHoroscopeDateChange(new Date(year, 5, 1))}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                          horoscopeYear === year
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                        disabled={isRefreshingData}
                                      >
                                        {year}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                        } else {
                          // 如果没有命盘数据，使用硬编码的大限范围
                          const currentPeriod = [
                            { range: '5~14', year: 2003 },
                            { range: '15~24', year: 2013 },
                            { range: '25~34', year: 2023 },
                            { range: '35~44', year: 2033 },
                            { range: '45~54', year: 2043 },
                            { range: '55~64', year: 2053 },
                            { range: '65~74', year: 2063 },
                            { range: '75~84', year: 2073 },
                            { range: '85~94', year: 2083 },
                            { range: '95~104', year: 2093 },
                            { range: '105~114', year: 2103 },
                            { range: '115~124', year: 2113 }
                          ].find(period => {
                            const startYear = period.year;
                            const endYear = startYear + 9;
                            return horoscopeYear >= startYear && horoscopeYear <= endYear;
                          });
                          
                          if (currentPeriod) {
                            const startYear = currentPeriod.year;
                            return (
                              <div>
                                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{currentPeriod.range} 大限流年</div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: 10 }, (_, i) => startYear + i).map((year, yearIndex) => {
                                    return (
                                      <button
                                        key={yearIndex}
                                        onClick={() => handleHoroscopeDateChange(new Date(year, 5, 1))}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                          horoscopeYear === year
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                        disabled={isRefreshingData}
                                      >
                                        {year}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3 justify-center">
                    <button 
                      onClick={() => {
                        console.log('🔍 点击了调试按钮，ziweiData:', ziweiData);
                        if (ziweiData) {
                          const [sysPrompt, dataContext] = parseZiweiToPrompt(ziweiData);
                          setDebugPrompt(`=== 系统提示词 ===\n${sysPrompt}\n\n=== 数据上下文 ===\n${dataContext}`);
                          setShowDebug(true);
                        } else {
                          setDebugPrompt('❌ 命盘数据还没有加载完成，请稍等...');
                          setShowDebug(true);
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      🔍 查看喂给 AI 的 Prompts
                    </button>
                  </div>
                  
                  {showDebug && (
                    <div className="mt-6 bg-gray-900 rounded-2xl shadow-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-green-400">
                          📜 AI Prompts 调试输出
                        </h3>
                        <button 
                          onClick={() => setShowDebug(false)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                          关闭
                        </button>
                      </div>
                      <pre className="text-green-300 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                        {debugPrompt}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[600px]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                      请在左侧输入信息开始排盘
                    </p>
                    <p className="text-gray-400 dark:text-gray-500">
                      支持公历和农历，精确到时辰
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      💡 按 F11 全屏浏览效果最佳
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    🤖 AI 命理师 - {selectedModel}
                  </h2>
                </div>
                
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.filter(m => m.role !== 'system').map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 rounded-2xl">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={saveChatHistory}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      💾 保存对话
                    </button>
                    <label className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer">
                      📂 加载对话
                      <input
                        type="file"
                        accept=".json"
                        onChange={loadChatHistory}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入你的问题..."
                      className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      rows={2}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      发送
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

function IztrolabeWrapper({ 
  birthday, 
  birthTime, 
  birthdayType, 
  gender,
  horoscopeYear,
  onHoroscopeDateChange
}: { 
  birthday: string;
  birthTime: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  horoscopeYear: number;
  onHoroscopeDateChange: (date: Date) => void;
}) {
  const [Iztrolabe, setIztrolabe] = useState<any>(null);
  const iztroRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-iztro').then(module => {
        if (!Iztrolabe) {
          setIztrolabe(() => module.Iztrolabe);
        }
      });
    }
  }, []);

  // 🎯 终极杀手锏：基于 ComputedStyle 的颜色强制替换
  useEffect(() => {
    if (!Iztrolabe) return;

    const fixPurpleStars = () => {
      const isDark = document.documentElement.classList.contains('dark');
      // 找到命盘容器
      const container = document.querySelector('.iztro-container');
      if (!container) return;

      // 遍历里面所有的 span 标签
      const spans = container.querySelectorAll('span');
      spans.forEach((span) => {
        const htmlSpan = span as HTMLElement;
        
        // 获取浏览器最终渲染出来的真实颜色（必定是 rgb(r, g, b) 格式，无视原始代码写法）
        const computedColor = window.getComputedStyle(htmlSpan).color;

        // 匹配标准的紫色 rgb(128, 0, 128)
        if (computedColor === 'rgb(128, 0, 128)') {
          if (isDark) {
            // 深色模式：强制覆盖为亮黄色并加粗
            htmlSpan.style.setProperty('color', '#ffff6b', 'important');
            htmlSpan.style.setProperty('font-weight', 'bold', 'important');
            htmlSpan.style.setProperty('text-shadow', '0px 1px 2px rgba(0,0,0,0.8)', 'important');
          } else {
            // 浅色模式：恢复为紫色
            htmlSpan.style.setProperty('color', 'rgb(128, 0, 128)', 'important');
            htmlSpan.style.setProperty('font-weight', 'normal', 'important');
            htmlSpan.style.removeProperty('text-shadow');
          }
        }
      });
    };

    // 1. 组件加载或更新后，稍微延迟执行以确保 DOM 已渲染
    const timer = setTimeout(fixPurpleStars, 150);

    // 2. 监听命盘内部的 DOM 变化（完美解决：点击切换流年时颜色又变回紫色的问题）
    const container = document.querySelector('.iztro-container');
    let domObserver: MutationObserver | null = null;
    if (container) {
      domObserver = new MutationObserver(() => {
        // 当 React 重新渲染命盘内部时，再次触发替换
        fixPurpleStars();
      });
      domObserver.observe(container, { childList: true, subtree: true });
    }

    // 3. 监听深色/浅色模式切换按钮
    const darkObserver = new MutationObserver(fixPurpleStars);
    darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      clearTimeout(timer);
      if (domObserver) domObserver.disconnect();
      darkObserver.disconnect();
    };
  }, [Iztrolabe, horoscopeYear]); // 依赖项加上 horoscopeYear，确保流年切换时重新绑定

  // 监听命盘日期变化
  useEffect(() => {
    if (iztroRef.current) {
      const iztroInstance = iztroRef.current.getInstance();
      if (iztroInstance) {
        const originalSetHoroscopeDate = iztroInstance.setHoroscopeDate;
        iztroInstance.setHoroscopeDate = function(date: any) {
          const result = originalSetHoroscopeDate.call(this, date);
          if (onHoroscopeDateChange && date) {
            onHoroscopeDateChange(new Date(date));
          }
          return result;
        };
      }
    }
  }, [Iztrolabe, onHoroscopeDateChange]);

  if (!Iztrolabe) {
    return (
      <div className="w-[1024px] h-[800px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">加载命盘组件中...</div>
      </div>
    );
  }

  const IztroComponent = Iztrolabe;
  const shichenIndex = getShichenIndexFromHour(birthTime);
  const horoscopeDate = new Date(horoscopeYear, 5, 1);
  
  return (
    <div style={{ width: 1024, margin: '0 auto' }}>
      <div className="relative">
        <IztroComponent 
          ref={iztroRef}
          birthday={birthday}
          birthTime={shichenIndex}
          birthdayType={birthdayType}
          gender={gender}
          horoscopeDate={horoscopeDate}
          fixLeap={true}
          lang="zh-CN"
        />
        
        {/* 全局样式覆盖区：只处理背景和边框，文本颜色交由上方 JS 处理 */}
        <style jsx global>{`
          .iztro-container { background-color: transparent !important; }
          .iztro-palace { border: 2px solid #000 !important; background-color: #ffffff !important; }
          .iztro-palace-inner { border: none !important; background-color: transparent !important; color: #333 !important; }
          
          /* 深色模式基础盘面 */
          .dark .iztro-palace {
            border: 2px solid #555 !important;
            background-color: #2d2d2d !important;
          }
          
          .dark .iztro-palace-inner {
            color: #ffffff !important;
          }
          
          /* 深色模式下的轻微全局提亮 (移除，防止影响黄色的显色) */
          /* .dark .iztro-palace-inner span { filter: brightness(1.4) !important; } */
          
          /* 基础信息区颜色 */
          .dark .iztro-info {
            color: #e5e7eb !important;
          }
        `}</style>
      </div>
    </div>
  );
}
