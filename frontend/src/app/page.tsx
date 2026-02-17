'use client';

import { useState, useRef, useEffect } from 'react';
import BirthForm from '@/components/BirthForm';
import {
  Message,
  AI_MODELS,
  getDefaultSystemPrompt,
  parseZiweiToPrompt,
  generateMasterPrompt,
  getLLMResponse
} from '@/lib/ai';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'命盘显示' | 'AI 命理师'>('命盘显示');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<{
    birthday: string;
    birthTime: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
  } | null>(null);
  const [ziweiData, setZiweiData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [needRefreshChat, setNeedRefreshChat] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleDataLoaded = (data: {
    birthday: string;
    birthTime: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
  }) => {
    setBirthData(data);
    setHasBirthData(true);
    setNeedRefreshChat(true);
    
    const mockZiweiData = {
      astrolabe: {
        gender: data.gender === 'male' ? '男' : '女',
        solarDate: data.birthday,
        lunarDate: data.birthday,
        chineseDate: '庚子年 庚辰月 辛酉日 癸巳时',
        soul: '贪狼',
        body: '文昌',
        earthlyBranchOfBodyPalace: '午',
        palaces: [
          {
            name: '命宫',
            heavenlyStem: '戊',
            earthlyBranch: '午',
            majorStars: [{ name: '紫微', brightness: '庙' }, { name: '天府', brightness: '庙' }],
            minorStars: [{ name: '文昌', brightness: '旺' }],
            adjectiveStars: [],
            decadal: { range: [6, 15] },
            ages: [6, 18, 30, 42, 54]
          }
        ]
      },
      horoscope: {
        age: { nominalAge: 26 },
        yearly: { heavenlyStem: '庚' }
      }
    };
    setZiweiData(mockZiweiData);
    
    const [sysPrompt, dataContext] = parseZiweiToPrompt(mockZiweiData);
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
        const targetYear = 2026;
        systemPrompt = generateMasterPrompt(inputMessage, ziweiData, targetYear);
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex h-full">
        <aside className="w-84 bg-white shadow-xl p-6 flex flex-col h-full">
          <h1 className="text-2xl font-bold text-purple-700 mb-6">
            🟣 AI 紫微斗数 Pro
          </h1>
          
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">导航</h2>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage('命盘显示')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  currentPage === '命盘显示'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📊 命盘显示
              </button>
              <button
                onClick={() => setCurrentPage('AI 命理师')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  currentPage === 'AI 命理师'
                    ? 'bg-purple-100 text-purple-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🤖 AI 命理师
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">AI 模型</h2>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
            >
              {AI_MODELS.map((model) => (
                <option key={model} value={model} className="text-gray-900">{model}</option>
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
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    📊 紫微斗数命盘
                  </h2>
                  <div className="flex justify-center">
                    <IztrolabeWrapper 
                      birthday={birthData.birthday}
                      birthTime={birthData.birthTime}
                      birthdayType={birthData.birthdayType}
                      gender={birthData.gender}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[600px]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-xl text-gray-500 mb-2">
                      请在左侧输入信息开始排盘
                    </p>
                    <p className="text-gray-400">
                      支持公历和农历，精确到时辰
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      💡 按 F11 全屏浏览效果最佳
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="bg-white rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-200 shrink-0">
                  <h2 className="text-xl font-bold text-gray-800">
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
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl">
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
                
                <div className="p-4 border-t border-gray-200 shrink-0">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={saveChatHistory}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      💾 保存对话
                    </button>
                    <label className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
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
                      className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-900"
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
  gender 
}: {
  birthday: string;
  birthTime: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
}) {
  const [Iztrolabe, setIztrolabe] = useState<any>(null);
  
  if (typeof window !== 'undefined') {
    import('react-iztro').then(module => {
      if (!Iztrolabe) {
        setIztrolabe(() => module.Iztrolabe);
      }
    });
  }

  if (!Iztrolabe) {
    return (
      <div className="w-[1024px] h-[800px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-gray-500">加载命盘组件中...</div>
      </div>
    );
  }

  const IztroComponent = Iztrolabe;
  
  return (
    <div style={{ width: 1024, margin: '0 auto' }}>
      <IztroComponent 
        birthday={birthday}
        birthTime={birthTime}
        birthdayType={birthdayType}
        gender={gender}
        horoscopeDate={new Date()}
      />
    </div>
  );
}
