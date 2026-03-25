﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AI_MODELS } from '@/lib/ai';
import { useZiweiData } from '@/hooks/useZiweiData';
import { useAIChat } from '@/hooks/useAIChat';
import { useSavedCases } from '@/hooks/useSavedCases';
import Sidebar, { type PageType } from '@/components/Sidebar';
import ChartView from '@/components/ChartView';
import RagTest from '@/components/RagTest';
import AIFortuneTeller from '@/components/AIFortuneTeller';
import ModelLatencyTest from '@/components/ModelLatencyTest';

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
  const [currentPage, setCurrentPage] = useState<PageType | 'model-test'>('chart');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [darkMode, setDarkMode] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartWidth.current = sidebarWidth;
      e.preventDefault();
    },
    [sidebarWidth],
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.max(200, Math.min(420, dragStartWidth.current + delta));
      setSidebarWidth(newWidth);
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showSavedCases, setShowSavedCases] = useState(false);
  const [selectedDecadal, setSelectedDecadal] = useState<DecadalInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const {
    ziweiData,
    isRefreshingData,
    contextStatus,
    horoscopeYear,
    error,
    loadZiweiData,
    updateHoroscopeYear,
    ensureZiweiContext,
    setError,
  } = useZiweiData();
  const resolveCompleteZiweiData = useCallback(async () => {
    if (!birthData) return ziweiData;
    return ensureZiweiContext(birthData, horoscopeYear);
  }, [birthData, ensureZiweiContext, horoscopeYear, ziweiData]);
  const {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    loadingStage,
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
    loadChatHistory,
    stopGeneration,
  } = useAIChat(ziweiData, horoscopeYear, resolveCompleteZiweiData, contextStatus);
  const { savedCases, saveCase, deleteCase } = useSavedCases();

  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.toggle('dark');
    setDarkMode(isDark);
  };

  const handleDataLoaded = async (data: BirthData) => {
    setBirthData(data);
    setHasBirthData(true);
    setError(null);

    try {
      const realZiweiData = await loadZiweiData(data);
      initializeChat(realZiweiData);
    } catch (err) {
      console.error('获取后端数据失败:', err);
    }
  };

  const handleHoroscopeYearChange = async (year: number) => {
    if (!birthData || isRefreshingData) return;
    if (year === horoscopeYear) return;

    setError(null);
    try {
      const realZiweiData = await updateHoroscopeYear(birthData, year);
      updateChatForHoroscope(realZiweiData);
    } catch (err) {
      console.error('更新命盘数据失败:', err);
    }
  };

  const handleSaveCurrentCase = () => {
    if (!birthData || !ziweiData) {
      alert('请先排盘后再保存命例');
      return;
    }

    const caseName = prompt('请输入命例名称');
    if (!caseName) return;

    saveCase({
      id: Date.now().toString(),
      name: caseName,
      birthData,
      ziweiData,
      savedAt: new Date().toISOString(),
    });
    alert('命例保存成功');
  };

  const handleLoadSavedCase = async (caseData: any) => {
    setBirthData(caseData.birthData);
    setShowSavedCases(false);

    try {
      const realZiweiData = await loadZiweiData(caseData.birthData);
      initializeChat(realZiweiData);
      setHasBirthData(true);
      alert('命例加载成功');
    } catch (err) {
      console.error('加载命例失败:', err);
      alert('加载命例失败，请重试');
    }
  };

  const handleDeleteSavedCase = (caseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除这个命例吗？')) {
      deleteCase(caseId);
      alert('命例删除成功');
    }
  };

  const handleTestAIPrompt = (savedCase: any) => {
    setCurrentPage('ai');
    initializeChat(savedCase.ziweiData);
    setDebugPrompt('已载入命例并同步 Prompt，可直接提问。');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(selectedModel);
    }
  };

  // 导航项配置
  const navItems = [
    { id: 'chart', label: '命盘显示', icon: '📊' },
    { id: 'ai', label: 'AI 命理师', icon: '🤖' },
    { id: 'rag', label: 'RAG 测试', icon: '🔍' },
  ] as const;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#0f1a1a] dark:to-[#0a1414]">
      {/* 顶部二级导航栏 */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white dark:bg-[#1a2a2a] border-b border-gray-200 dark:border-gray-700 shadow-sm z-20">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-purple-700 dark:text-purple-400">FatePilot</h1>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
          >
            快速上手
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        <div ref={sidebarRef} className="hidden md:block relative flex-shrink-0" style={{ width: sidebarWidth }}>
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onDataLoaded={handleDataLoaded}
          />

          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-purple-500/30 transition-colors z-50"
            onMouseDown={handleDragStart}
            style={{ cursor: isDragging ? 'col-resize' : 'ew-resize' }}
          >
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-12 bg-gray-400 dark:bg-gray-600 rounded-full opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {mobileSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-80 z-50 bg-white dark:bg-[#1a2a2a] shadow-2xl md:hidden overflow-y-auto">
              <div className="p-4">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="mb-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center gap-2"
                >
                  <span>✕</span>
                  <span>关闭</span>
                </button>
                <Sidebar
                  currentPage={currentPage}
                  setCurrentPage={(page) => {
                    setCurrentPage(page);
                    setMobileSidebarOpen(false);
                  }}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  onDataLoaded={handleDataLoaded}
                />
              </div>
            </div>
          </>
        )}

        <main className="flex-1 p-1 md:p-6 overflow-hidden pb-16 md:pb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              <div className="flex items-center">
                <div className="mr-2 text-red-500">⚠️</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          <div className="md:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow flex items-center gap-2"
            >
              <span>☰</span>
              <span className="text-sm font-bold">菜单</span>
            </button>
            <h1 className="text-lg font-bold text-purple-700 dark:text-purple-400">FatePilot</h1>
            <div className="w-16" />
          </div>

          {currentPage === 'chart' ? (
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
              onYearChange={handleHoroscopeYearChange}
              onTestAIPrompt={handleTestAIPrompt}
            />
          ) : currentPage === 'ai' ? (
            <div className="h-full">
              <AIFortuneTeller
                messages={messages}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                isLoading={isLoading}
                loadingStage={loadingStage}
                contextStatus={contextStatus}
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
                setMessages={setMessages}
                selectedPersona={selectedPersona}
                onPersonaChange={setSelectedPersona}
                ziweiData={ziweiData}
                initializeChat={initializeChat}
                stopGeneration={stopGeneration}
              />
            </div>
          ) : currentPage === 'rag' ? (
            <RagTest onBack={() => setCurrentPage('ai')} />
          ) : (
            <ModelLatencyTest />
          )}
        </main>
      </div>

      {!isMobile ? null : (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2a2a] border-t border-gray-200 dark:border-gray-700 z-30">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setCurrentPage('chart')}
              className={`flex flex-col items-center p-2 ${currentPage === 'chart' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              <span className="text-lg">📊</span>
              <span className="text-xs">命盘</span>
            </button>
            <button
              onClick={() => setCurrentPage('ai')}
              className={`flex flex-col items-center p-2 ${currentPage === 'ai' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              <span className="text-lg">🤖</span>
              <span className="text-xs">AI</span>
            </button>
            <button
              onClick={() => setCurrentPage('rag')}
              className={`flex flex-col items-center p-2 ${currentPage === 'rag' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              <span className="text-lg">🔍</span>
              <span className="text-xs">RAG</span>
            </button>
            <button
              onClick={() => setCurrentPage('model-test')}
              className={`flex flex-col items-center p-2 ${currentPage === 'model-test' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              <span className="text-lg">⚡</span>
              <span className="text-xs">测速</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
