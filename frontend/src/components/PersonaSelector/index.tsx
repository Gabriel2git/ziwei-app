'use client';

import React from 'react';
import { PersonaType, PERSONA_CONFIGS } from '@/lib/ai';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
}

export default function PersonaSelector({ selectedPersona, onPersonaChange }: PersonaSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          选择你的 AI 命理师
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          不同的命理师有不同的解读风格，选择最适合你的方式
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PERSONA_CONFIGS.map((config) => {
          const isSelected = selectedPersona === config.id;
          
          return (
            <button
              key={config.id}
              onClick={() => onPersonaChange(config.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                hover:shadow-lg hover:scale-105
                ${isSelected 
                  ? `border-transparent bg-gradient-to-br ${config.color} text-white shadow-xl scale-105` 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* 图标 */}
              <div className={`
                text-5xl mb-4
                ${isSelected ? '' : 'grayscale hover:grayscale-0 transition-all'}
              `}>
                {config.icon}
              </div>

              {/* 标题 */}
              <h3 className={`
                text-lg font-bold mb-1
                ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}
              `}>
                {config.name}
              </h3>

              {/* 英文标题 */}
              <p className={`
                text-xs mb-3 font-medium
                ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {config.title}
              </p>

              {/* 描述 */}
              <p className={`
                text-sm leading-relaxed
                ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}
              `}>
                {config.description}
              </p>

              {/* 选中提示 */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <span className="text-sm font-medium text-white/90">
                    ✓ 当前选择
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 当前选择提示 */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-gray-600 dark:text-gray-400">当前命理师:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {PERSONA_CONFIGS.find(p => p.id === selectedPersona)?.icon} {' '}
            {PERSONA_CONFIGS.find(p => p.id === selectedPersona)?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
