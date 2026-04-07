﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import PersonaSelector from '@/components/PersonaSelector';
import AIChat from '@/components/AIChat';
import { PersonaType } from '@/lib/ai';
import type { ContextStatus } from '@/types';

interface AIFortuneTellerProps {
  messages: any[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  loadingStage: 'context' | 'model';
  contextStatus: ContextStatus;
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
  selectedPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  ziweiData: any;
  initializeChat: (ziweiData: any, persona?: PersonaType) => void;
  stopGeneration: () => void;
}

function AIFortuneTellerContent({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  loadingStage,
  contextStatus,
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
  selectedPersona,
  onPersonaChange,
  ziweiData,
  initializeChat,
  stopGeneration,
}: AIFortuneTellerProps) {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'select-persona' | 'chat'>('select-persona');

  if (!isAuthenticated) {
    return <AuthGuard>{null}</AuthGuard>;
  }

  if (currentView === 'select-persona') {
    return (
      <div className="h-full min-h-0 flex flex-col overflow-y-auto show-scrollbar pb-20 md:pb-0">
        <PersonaSelector
          selectedPersona={selectedPersona}
          onPersonaChange={(persona) => {
            if (!hasBirthData) {
              alert('请先输入出生信息并排盘，然后再选择命理师');
              return;
            }

            onPersonaChange(persona);
            if (ziweiData) {
              initializeChat(ziweiData, persona);
            }
            setCurrentView('chat');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            当前命理师
            <span className="font-bold ml-2">
              {selectedPersona === 'companion' && '💬 大白话解盘伴侣'}
              {selectedPersona === 'mentor' && '📘 硬核紫微导师'}
              {selectedPersona === 'healer' && '🌱 人生导航与疗愈师'}
            </span>
          </span>
          <button
            onClick={() => {
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <AIChat
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
          onSendMessage={onSendMessage}
          onKeyPress={onKeyPress}
          onSaveHistory={onSaveHistory}
          onLoadHistory={onLoadHistory}
          stopGeneration={stopGeneration}
        />
      </div>
    </div>
  );
}

export default function AIFortuneTeller(props: AIFortuneTellerProps) {
  return (
    <AuthProvider>
      <AIFortuneTellerContent {...props} />
    </AuthProvider>
  );
}
