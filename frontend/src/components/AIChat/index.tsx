import { useEffect, useMemo, useState } from 'react';
import { Message } from '@/lib/ai';
import type { ContextStatus } from '@/types';

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
  loadingStage: 'context' | 'model';
  contextStatus: ContextStatus;
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
  stopGeneration: () => void;
}

const LOADING_TEXTS = ['正在排布宫位星曜', '正在推演大限流年', '正在整合命盘建议', '正在润色可执行结论'];

export default function AIChat({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  loadingStage,
  contextStatus,
  debugPrompt,
  showDebug,
  setShowDebug,
  hasBirthData,
  messagesEndRef,
  messagesContainerRef,
  onSendMessage,
  onKeyPress,
  onSaveHistory,
  onLoadHistory,
  stopGeneration,
}: AIChatProps) {
  const [autoFollow, setAutoFollow] = useState(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);

  const loadingText = useMemo(() => {
    if (loadingStage === 'context') {
      return '正在准备完整命盘上下文';
    }
    return LOADING_TEXTS[waitingSeconds % LOADING_TEXTS.length];
  }, [loadingStage, waitingSeconds]);

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight;
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;

    if (nearBottom) {
      setAutoFollow(true);
      setShowJumpToBottom(false);
    } else {
      setAutoFollow(false);
      setShowJumpToBottom(true);
    }
  };

  useEffect(() => {
    if (autoFollow) {
      scrollToBottom();
    }
  }, [messages, autoFollow]);

  useEffect(() => {
    if (!isLoading) {
      setWaitingSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setWaitingSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  return (
    <div className="h-full min-h-0 flex flex-col relative pb-20 md:pb-0">
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100">AI 命理师</h2>
        <div className="flex gap-2 items-center">
          <span
            className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
              contextStatus === 'ready'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : contextStatus === 'loading'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : contextStatus === 'error'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {contextStatus === 'ready'
              ? 'AI上下文已就绪'
              : contextStatus === 'loading'
                ? 'AI上下文预热中'
                : contextStatus === 'error'
                  ? 'AI上下文加载失败'
                  : '等待命盘数据'}
          </span>

          {isLoading ? (
            <button
              onClick={stopGeneration}
              className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <span>⏹️</span>
              <span>终止</span>
            </button>
          ) : (
            <>
              <button
                onClick={onSaveHistory}
                className="px-2 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                导出
              </button>
              <label className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors cursor-pointer">
                导入
                <input type="file" accept=".json" onChange={onLoadHistory} className="hidden" />
              </label>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                调试
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain show-scrollbar bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-2 sm:p-6 mb-2 sm:mb-4 relative"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>请先在左侧输入出生信息并排盘，然后开始对话。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages
              .filter((message) => message.role !== 'system')
              .map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-base ${
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
                <div className="bg-gray-100 dark:bg-gray-700 p-3 sm:p-4 rounded-2xl min-w-[180px] border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="relative w-6 h-6">
                      <div className="absolute inset-0 rounded-full border-2 border-purple-200 dark:border-purple-900" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      <div className="absolute inset-1 rounded-full bg-purple-500/30 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">{loadingText}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">已等待 {waitingSeconds}s</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {showJumpToBottom && (
          <button
            onClick={() => {
              setAutoFollow(true);
              setShowJumpToBottom(false);
              scrollToBottom();
            }}
            className="absolute bottom-3 right-3 px-3 py-1.5 text-xs rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
          >
            回到底部
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-2 sm:p-4">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="请输入您的问题..."
            disabled={isLoading || !hasBirthData}
            className="flex-1 p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !inputMessage.trim() || !hasBirthData}
            className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '生成中...' : '发送'}
          </button>
        </div>
        {!hasBirthData && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">请先在左侧输入出生信息并排盘</p>
        )}
      </div>

      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-bold">系统提示词</h3>
              <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
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
