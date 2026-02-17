'use client';

import { useState } from 'react';

interface BirthFormProps {
  onDataLoaded: (data: {
    birthday: string;
    birthTime: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
  }) => void;
}

export default function BirthForm({ onDataLoaded }: BirthFormProps) {
  const [isLunar, setIsLunar] = useState(false);
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(23);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(50);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLeap, setIsLeap] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const birthday = `${year}-${month}-${day}`;
      const birthdayType = isLunar ? 'lunar' : 'solar';
      
      onDataLoaded({
        birthday,
        birthTime: hour,
        birthdayType,
        gender,
      });
      
      setLoading(false);
    }, 300);
  };

  const years = Array.from({ length: 100 }, (_, i) => 2026 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">📅 选择历法</label>
        <div className="flex gap-3">
          <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border-2 border-transparent hover:border-purple-300 transition-all">
            <input
              type="radio"
              checked={!isLunar}
              onChange={() => setIsLunar(false)}
              className="mr-2 text-purple-600"
            />
            <span className="text-gray-900">阳历</span>
          </label>
          <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border-2 border-transparent hover:border-purple-300 transition-all">
            <input
              type="radio"
              checked={isLunar}
              onChange={() => setIsLunar(true)}
              className="mr-2 text-purple-600"
            />
            <span className="text-gray-900">农历</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">🎂 出生日期</label>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-gray-900"
          >
            {years.map((y) => (
              <option key={y} value={y} className="text-gray-900">{y}年</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-gray-900"
          >
            {months.map((m) => (
              <option key={m} value={m} className="text-gray-900">{m}月</option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-gray-900"
          >
            {days.map((d) => (
              <option key={d} value={d} className="text-gray-900">{d}日</option>
            ))}
          </select>
        </div>
      </div>

      {isLunar && (
        <div className="flex items-center bg-amber-50 p-3 rounded-xl">
          <input
            type="checkbox"
            checked={isLeap}
            onChange={(e) => setIsLeap(e.target.checked)}
            className="mr-3 w-5 h-5 text-purple-600"
          />
          <label className="text-sm text-amber-900 font-medium">是闰月? (例如闰四月)</label>
        </div>
      )}

      {!isLunar && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">⏰ 出生时间</label>
          <div className="flex items-center gap-2">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-gray-900"
            >
              {hours.map((h) => (
                <option key={h} value={h} className="text-gray-900">{h.toString().padStart(2, '0')}时</option>
              ))}
            </select>
            <span className="text-2xl text-gray-400 font-light">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all text-gray-900"
            >
              {minutes.map((m) => (
                <option key={m} value={m} className="text-gray-900">{m.toString().padStart(2, '0')}分</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">👤 性别</label>
        <div className="flex gap-3">
          <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border-2 border-transparent hover:border-pink-300 transition-all flex-1 justify-center">
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={() => setGender('female')}
              className="mr-2 text-pink-600"
            />
            <span className="text-gray-900">👩 女</span>
          </label>
          <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border-2 border-transparent hover:border-blue-300 transition-all flex-1 justify-center">
            <input
              type="radio"
              value="male"
              checked={gender === 'male'}
              onChange={() => setGender('male')}
              className="mr-2 text-blue-600"
            />
            <span className="text-gray-900">👨 男</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            排盘中...
          </div>
        ) : (
          '🚀 开始排盘'
        )}
      </button>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-700 text-center">
          💡 使用 react-iztro 专业组件，精准计算紫微斗数命盘
        </p>
      </div>
    </form>
  );
}
