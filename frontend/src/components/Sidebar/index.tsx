import BirthForm from '@/components/BirthForm';
import { AI_MODELS } from '@/lib/ai';

interface SidebarProps {
  currentPage: '命盘显示' | 'AI 命理师';
  setCurrentPage: (page: '命盘显示' | 'AI 命理师') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onDataLoaded: (data: any) => void;
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  selectedModel,
  setSelectedModel,
  darkMode,
  toggleDarkMode,
  onDataLoaded
}: SidebarProps) {
  return (
    <aside className="w-84 bg-white dark:bg-[#1a2a2a] shadow-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
          🟣 AI 紫微斗数 Pro
        </h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className="mb-6 space-y-2">
        <button
          onClick={() => setCurrentPage('命盘显示')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
            currentPage === '命盘显示'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          📊 命盘显示
        </button>
        <button
          onClick={() => setCurrentPage('AI 命理师')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
            currentPage === 'AI 命理师'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          🤖 AI 命理师
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">AI 模型</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
        >
          {AI_MODELS.map((model) => (
            <option key={model} value={model} className="text-gray-900 dark:text-gray-100">{model}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        <BirthForm onDataLoaded={onDataLoaded} />
      </div>
    </aside>
  );
}
