'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isVerifying, isLoading, error, login, clearError } = useAuth();
  const [inputCode, setInputCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    
    await login(inputCode.trim());
  };

  // 加载中，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 已验证，显示子组件
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 未验证，显示邀请码输入界面
  return (
    <div className="flex items-center justify-center h-full w-full p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* 图标和标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            请输入邀请码
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            请输入邀请码以使用 AI 命理师功能
          </p>
        </div>

        {/* 输入表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="auth-code" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              邀请码 / 功德码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="auth-code"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (error) clearError();
                }}
                placeholder="请输入您的邀请码"
                className={`
                  w-full px-4 py-3 pr-12 rounded-lg border-2 
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  transition-all duration-200
                  ${error 
                    ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                disabled={isVerifying}
              />
              {/* 显示/隐藏密码按钮 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                disabled={isVerifying}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* 错误提示 */}
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isVerifying || !inputCode.trim()}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white
              transition-all duration-200
              ${isVerifying || !inputCode.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                验证中...
              </span>
            ) : (
              '进入 AI 命理师'
            )}
          </button>
        </form>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 提示: 请联系管理员获取邀请码
          </p>
        </div>

        {/* 功能说明 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            此功能消耗 AI 大模型 Token，需要邀请码才能使用
          </p>
        </div>
      </div>
    </div>
  );
}
