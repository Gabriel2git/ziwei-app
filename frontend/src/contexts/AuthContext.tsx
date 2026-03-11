'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  authCode: string | null;
  isVerifying: boolean;
  isLoading: boolean;
  error: string | null;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API 基础 URL，从环境变量获取或使用默认值
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('auth_code');
      if (savedCode) {
        setAuthCode(savedCode);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, []);

  // 验证邀请码
  const login = async (code: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        // 验证成功
        localStorage.setItem('auth_code', code);
        setAuthCode(code);
        setIsAuthenticated(true);
        setIsVerifying(false);
        return true;
      } else {
        // 验证失败
        const data = await response.json();
        setError(data.error || '功德码无效或已过期');
        setIsVerifying(false);
        return false;
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      setIsVerifying(false);
      return false;
    }
  };

  // 退出登录
  const logout = () => {
    localStorage.removeItem('auth_code');
    setAuthCode(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authCode,
        isVerifying,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
