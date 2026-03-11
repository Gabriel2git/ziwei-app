import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/ai';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
}

interface AIChatProps {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isLoading: boolean;
  debugPrompt: string;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  selectedModel: string;
  hasBirthData: boolean;
  birthData: BirthData | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSaveHistory: () => void;
  onLoadHistory: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AIChat({
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
  onLoadHistory
}: AIChatProps) {
  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🤖 AI 命理师</h2>
        <div className="flex gap-2">
          <button
            onClick={onSaveHistory}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            💾 导出
          </button>
          <label className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors cursor-pointer">
            📂 导入
            <input
              type="file"
              accept=".json"
              onChange={onLoadHistory}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            🐛 调试
          </button>
        </div>
      </div>

      {/* 聊天区 */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-6 mb-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>请先在左侧输入出生信息，然后开始对话</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.filter(m => m.role !== 'system').map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-4">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="请输入您的问题..."
            disabled={isLoading || !hasBirthData}
            className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            rows={3}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !inputMessage.trim() || !hasBirthData}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
        {!hasBirthData && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            请先在左侧输入出生信息并排盘
          </p>
        )}
      </div>

      {/* 调试窗口 - 覆盖在对话窗口之上 */}
      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-bold">系统提示词</h3>
              <button
                onClick={() => setShowDebug(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre>{debugPrompt}</pre>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDebug(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
