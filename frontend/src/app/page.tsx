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

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'命盘显示' | 'AI 命理师'>('命盘显示');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [darkMode, setDarkMode] = useState(false);

  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showSavedCases, setShowSavedCases] = useState(false);
  const [selectedDecadal, setSelectedDecadal] = useState<DecadalInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { ziweiData, isRefreshingData, horoscopeYear, loadZiweiData, updateHoroscopeYear } = useZiweiData();
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    debugPrompt,
    setDebugPrompt,
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
    
    try {
      const realZiweiData = await loadZiweiData(data);
      initializeChat(realZiweiData);
    } catch (error) {
      console.error('获取后端数据失败:', error);
    }
  };

  const handleHoroscopeDateChange = async (date: Date) => {
    if (!birthData || isRefreshingData) return;
    
    const newYear = date.getFullYear();
    if (newYear === horoscopeYear) return;
    
    try {
      const realZiweiData = await updateHoroscopeYear(birthData, newYear);
      updateChatForHoroscope(realZiweiData);
    } catch (error) {
      console.error('更新命盘数据失败:', error);
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
          ) : (
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
          )}
        </main>
      </div>
    </div>
  );
}
