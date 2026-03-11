'use client';

import { useState, useEffect } from 'react';
import { getLunarBaseYear } from '@/lib/shichen';
import { AI_MODELS } from '@/lib/ai';
import { useZiweiData } from '@/hooks/useZiweiData';
import { useAIChat } from '@/hooks/useAIChat';
import { useSavedCases } from '@/hooks/useSavedCases';
import Sidebar from '@/components/Sidebar';
import ChartView from '@/components/ChartView';
import AIChat from '@/components/AIChat';
import RagTest from '@/components/RagTest';
import PersonaSelector from '@/components/PersonaSelector';

// 扩展页面类型
type PageType = '命盘显示' | 'AI 命理师' | 'RAG 测试';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
  isLeap: boolean;
}

interface DecadalInfo {
  start: number;
  end: number;
  stem: string;
  branch: string;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('命盘显示');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [darkMode, setDarkMode] = useState(false);

  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showSavedCases, setShowSavedCases] = useState(false);
  const [selectedDecadal, setSelectedDecadal] = useState<DecadalInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { ziweiData, isRefreshingData, horoscopeYear, error, loadZiweiData, updateHoroscopeYear, setError } = useZiweiData();
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    debugPrompt,
    setDebugPrompt,
    selectedPersona,
    setSelectedPersona,
    messagesEndRef,
    messagesContainerRef,
    initializeChat,
    updateChatForHoroscope,
    sendMessage,
    saveChatHistory,
    loadChatHistory
  } = useAIChat(ziweiData, horoscopeYear);
  const { savedCases, saveCase, deleteCase } = useSavedCases();

  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.toggle('dark');
    setDarkMode(isDark);
  };

  const handleDataLoaded = async (data: BirthData) => {
    setBirthData(data);
    setHasBirthData(true);
    setError(null); // 清除之前的错误
    
    try {
      const realZiweiData = await loadZiweiData(data);
      initializeChat(realZiweiData);
    } catch (error) {
      console.error('获取后端数据失败:', error);
      // 错误已经在 useZiweiData 中设置
    }
  };

  const handleHoroscopeDateChange = async (date: Date) => {
    if (!birthData || isRefreshingData) return;
    
    const newYear = date.getFullYear();
    if (newYear === horoscopeYear) return;
    
    setError(null); // 清除之前的错误
    try {
      const realZiweiData = await updateHoroscopeYear(birthData, newYear);
      updateChatForHoroscope(realZiweiData);
    } catch (error) {
      console.error('更新命盘数据失败:', error);
      // 错误已经在 useZiweiData 中设置
    }
  };

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

  const handleLoadSavedCase = async (caseData: any) => {
    setBirthData(caseData.birthData);
    setShowSavedCases(false);
    
    try {
      const realZiweiData = await loadZiweiData(caseData.birthData);
      initializeChat(realZiweiData);
      setHasBirthData(true);
      alert('命例加载成功！');
    } catch (error) {
      console.error('加载命例失败:', error);
      alert('加载命例失败，请重试');
    }
  };

  const handleDeleteSavedCase = (caseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除这个命例吗？')) {
      deleteCase(caseId);
      alert('命例删除成功！');
    }
  };

  const handleTestAIPrompt = (savedCase: any) => {
    // 将当前页面切换到AI命理师页面
    setCurrentPage('AI 命理师');
    
    // 使用保存的命例数据初始化聊天
    initializeChat(savedCase.ziweiData);
    
    // 可以在这里生成一个基于命例的测试prompt
    const testPrompt = `请分析以下命盘：\n姓名信息：${savedCase.name}\n出生日期：${savedCase.birthData.birthday}\n性别：${savedCase.birthData.gender}\n命盘数据：${JSON.stringify(savedCase.ziweiData, null, 2)}`;
    
    // 将测试prompt设置为调试信息
    setDebugPrompt(testPrompt);
    
    // 可以自动发送这个prompt到AI
    setInputMessage(testPrompt);
    setTimeout(() => {
      sendMessage(selectedModel);
    }, 500); // 延迟发送，确保页面已切换
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(selectedModel);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#0f1a1a] dark:to-[#0a1414]">
      <div className="flex h-full">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onDataLoaded={handleDataLoaded}
        />

        <main className="flex-1 p-6 overflow-hidden">
          {/* 错误信息显示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              <div className="flex items-center">
                <div className="mr-2 text-red-500">⚠️</div>
                <div>{error}</div>
              </div>
            </div>
          )}
          
          {currentPage === '命盘显示' ? (
            <ChartView
              ziweiData={ziweiData}
              birthData={birthData}
              selectedDecadal={selectedDecadal}
              setSelectedDecadal={setSelectedDecadal}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              savedCases={savedCases}
              showSavedCases={showSavedCases}
              setShowSavedCases={setShowSavedCases}
              onSaveCase={handleSaveCurrentCase}
              onLoadCase={handleLoadSavedCase}
              onDeleteCase={handleDeleteSavedCase}
              onTestAIPrompt={handleTestAIPrompt}
            />
          ) : currentPage === 'AI 命理师' ? (
            <div className="h-full flex flex-col">
              {/* Persona 选择器 - 仅在开始对话前显示 */}
              {messages.length === 0 && (
                <div className="flex-shrink-0 mb-4">
                  <PersonaSelector
                    selectedPersona={selectedPersona}
                    onPersonaChange={setSelectedPersona}
                  />
                </div>
              )}
              {/* 已选择 Persona 的提示 */}
              {messages.length > 0 && (
                <div className="flex-shrink-0 mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      当前命理师:
                      <span className="font-bold ml-2">
                        {selectedPersona === 'companion' && '🤗 大白话解盘伴侣'}
                        {selectedPersona === 'mentor' && '🎓 硬核紫微导师'}
                        {selectedPersona === 'healer' && '🌿 人生导航与疗愈师'}
                      </span>
                    </span>
                    <button
                      onClick={() => {
                        // 重置聊天以允许重新选择 persona
                        if (confirm('切换命理师将重新开始对话，是否继续？')) {
                          setMessages([]);
                        }
                      }}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      切换命理师
                    </button>
                  </div>
                </div>
              )}
              <div className="flex-1 min-h-0">
                <AIChat
                  messages={messages}
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  isLoading={isLoading}
                  debugPrompt={debugPrompt}
                  showDebug={showDebug}
                  setShowDebug={setShowDebug}
                  selectedModel={selectedModel}
                  hasBirthData={hasBirthData}
                  birthData={birthData}
                  messagesEndRef={messagesEndRef}
                  messagesContainerRef={messagesContainerRef}
                  onSendMessage={() => sendMessage(selectedModel)}
                  onKeyPress={handleKeyPress}
                  onSaveHistory={() => saveChatHistory(birthData?.birthday || '', birthData?.gender || '')}
                  onLoadHistory={loadChatHistory}
                />
              </div>
            </div>
          ) : (
            <RagTest onBack={() => setCurrentPage('AI 命理师')} />
          )}
        </main>
      </div>
    </div>
  );
}
