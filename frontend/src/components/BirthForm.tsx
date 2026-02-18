'use client';

import { useState } from 'react';
import { getShichenFromHour } from '@/lib/shichen';

interface BirthFormProps {
  onDataLoaded: (data: {
    birthday: string;
    birthTime: number;
    birthMinute: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
    longitude: number;
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
  const [selectedCity, setSelectedCity] = useState('beijing');
  const [customLongitude, setCustomLongitude] = useState('');
  
  // 常见城市及其经度
  const cities = [
    { value: 'beijing', label: '北京', longitude: 116.41 },
    { value: 'shanghai', label: '上海', longitude: 121.48 },
    { value: 'guangzhou', label: '广州', longitude: 113.27 },
    { value: 'shenzhen', label: '深圳', longitude: 114.07 },
    { value: 'hangzhou', label: '杭州', longitude: 120.20 },
    { value: 'chengdu', label: '成都', longitude: 104.07 },
    { value: 'wuhan', label: '武汉', longitude: 114.31 },
    { value: 'xian', label: '西安', longitude: 108.95 },
    { value: 'custom', label: '自定义', longitude: 0 }
  ];
  
  // 获取当前选择的经度
  const getLongitude = (): number => {
    if (selectedCity === 'custom' && customLongitude) {
      return parseFloat(customLongitude) || 120.033; // 默认经度
    }
    const city = cities.find(c => c.value === selectedCity);
    return city ? city.longitude : 120.033; // 默认经度
  };

  const shichen = getShichenFromHour(hour);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const birthday = `${year}-${month}-${day}`;
      const birthdayType = isLunar ? 'lunar' : 'solar';
      const longitude = getLongitude();
      
      onDataLoaded({
        birthday,
        birthTime: hour,
        birthMinute: minute,
        birthdayType,
        gender,
        longitude,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">📅 选择历法</label>
        <div className="flex gap-2">
          <label className="flex items-center cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border-2 border-transparent hover:border-purple-300 transition-all text-sm">
            <input
              type="radio"
              checked={!isLunar}
              onChange={() => setIsLunar(false)}
              className="mr-2 text-purple-600"
            />
            <span className="text-gray-900">阳历</span>
          </label>
          <label className="flex items-center cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border-2 border-transparent hover:border-purple-300 transition-all text-sm">
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

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">🎂 出生日期</label>
        <div className="flex gap-1">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y} className="text-gray-900">{y}年</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m} className="text-gray-900">{m}月</option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
          >
            {days.map((d) => (
              <option key={d} value={d} className="text-gray-900">{d}日</option>
            ))}
          </select>
        </div>
      </div>

      {isLunar && (
        <div className="flex items-center bg-amber-50 p-2 rounded-lg">
          <input
            type="checkbox"
            checked={isLeap}
            onChange={(e) => setIsLeap(e.target.checked)}
            className="mr-2 w-4 h-4 text-purple-600"
          />
          <label className="text-xs text-amber-900 font-medium">是闰月? (例如闰四月)</label>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">⏰ 出生时间</label>
        <div className="flex items-center gap-1">
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
          >
            {hours.map((h) => (
              <option key={h} value={h} className="text-gray-900">{h.toString().padStart(2, '0')}时</option>
            ))}
          </select>
          <span className="text-xl text-gray-400 font-light">:</span>
          <select
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
          >
            {minutes.map((m) => (
              <option key={m} value={m} className="text-gray-900">{m.toString().padStart(2, '0')}分</option>
            ))}
          </select>
        </div>
        
        <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800">对应时辰</span>
            <span className="text-sm font-bold text-purple-700">{shichen}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">📍 出生地</label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
        >
          {cities.map((city) => (
            <option key={city.value} value={city.value} className="text-gray-900">
              {city.label}
            </option>
          ))}
        </select>
        
        {selectedCity === 'custom' && (
          <input
            type="text"
            value={customLongitude}
            onChange={(e) => setCustomLongitude(e.target.value)}
            placeholder="请输入经度值（例如：116.41）"
            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all text-gray-900 text-sm"
          />
        )}
        
        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">当前经度</span>
            <span className="text-sm font-bold text-blue-700">{getLongitude().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">👤 性别</label>
        <div className="flex gap-2">
          <label className="flex items-center cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border-2 border-transparent hover:border-pink-300 transition-all flex-1 justify-center text-sm">
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={() => setGender('female')}
              className="mr-2 text-pink-600"
            />
            <span className="text-gray-900">👩 女</span>
          </label>
          <label className="flex items-center cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border-2 border-transparent hover:border-blue-300 transition-all flex-1 justify-center text-sm">
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
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold text-base hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            排盘中...
          </div>
        ) : (
          '🚀 开始排盘'
        )}
      </button>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-700 text-center">
          💡 使用 react-iztro 专业组件，精准计算紫微斗数命盘
        </p>
      </div>
    </form>
  );
}
