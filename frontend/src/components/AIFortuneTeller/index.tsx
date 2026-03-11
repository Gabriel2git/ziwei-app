'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import PersonaSelector from '@/components/PersonaSelector';
import AIChat from '@/components/AIChat';
import { PersonaType } from '@/lib/ai';

interface AIFortuneTellerProps {
  messages: any[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  debugPrompt: string;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  selectedModel: string;
  hasBirthData: boolean;
  birthData: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSaveHistory: () => void;
  onLoadHistory: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMessages: (msgs: any[]) => void;
}

// 内部组件，在 AuthProvider 内使用
function AIFortuneTellerContent({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  debugPrompt,
  showDebug,
  setShowDebug,
  selectedModel,
  hasBirthData,
  birthData,
  messagesEndRef,
  messagesContainerRef,
  onSendMessage,
  onKeyPress,
  onSaveHistory,
  onLoadHistory,
  setMessages,
}: AIFortuneTellerProps) {
  const { isAuthenticated } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('companion');
  const [currentView, setCurrentView] = useState<'select-persona' | 'chat'>('select-persona');

  // 如果未验证，显示 AuthGuard
  if (!isAuthenticated) {
    return <AuthGuard>{null}</AuthGuard>;
  }

  // 选择命理师界面
  if (currentView === 'select-persona') {
    return (
      <div className="h-full flex flex-col">
        <PersonaSelector
          selectedPersona={selectedPersona}
          onPersonaChange={(persona) => {
            setSelectedPersona(persona);
            setCurrentView('chat');
          }}
        />
      </div>
    );
  }

  // AI 聊天界面
  return (
    <div className="h-full flex flex-col">
      {/* 已选择 Persona 的提示 */}
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
                setCurrentView('select-persona');
              }
            }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            切换命理师
          </button>
        </div>
      </div>
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
          onSendMessage={onSendMessage}
          onKeyPress={onKeyPress}
          onSaveHistory={onSaveHistory}
          onLoadHistory={onLoadHistory}
        />
      </div>
    </div>
  );
}

// 主组件，提供 AuthProvider
export default function AIFortuneTeller(props: AIFortuneTellerProps) {
  return (
    <AuthProvider>
      <AIFortuneTellerContent {...props} />
    </AuthProvider>
  );
}
