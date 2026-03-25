﻿﻿﻿﻿﻿﻿﻿import React from 'react';

interface CenterInfoProps {
  astrolabe: any;
  horoscope?: any;
}

export default function CenterInfo({ astrolabe, horoscope }: CenterInfoProps) {
  return (
    <div className="w-full h-full p-1 sm:p-4 flex flex-col items-center justify-center border-2 border-double border-gray-300 dark:border-gray-600">
      <h2
        className="text-[8px] sm:text-base font-bold text-purple-800 dark:text-purple-400 tracking-widest mb-1 sm:mb-4"
        style={{ fontFamily: 'SimSun, serif' }}
      >
        紫微斗数
      </h2>

      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-1 py-0.5 rounded-full text-[8px] sm:text-sm font-bold mb-1 sm:mb-4">
        {astrolabe.chineseDate}
      </div>

      <div className="space-y-0.5 sm:space-y-2 text-[8px] sm:text-sm text-gray-700 dark:text-gray-300 text-center">
        <p>
          公历：{astrolabe.solarDate} {astrolabe.timeRange}
        </p>
        <p>
          农历：{astrolabe.lunarDate} {astrolabe.time}
        </p>

        <div className="w-8 sm:w-16 h-px bg-gray-300 dark:bg-gray-600 mx-auto my-1 sm:my-2" />

        <div className="flex gap-2 justify-center">
          <span>
            命主：<span className="font-bold text-red-600 dark:text-red-400">{astrolabe.soul}</span>
          </span>
          <span>
            身主：<span className="font-bold text-blue-600 dark:text-blue-400">{astrolabe.body}</span>
          </span>
        </div>
        <p>五行局：{astrolabe.fiveElementsClass}</p>

        {horoscope?.age && (
          <p className="mt-4 text-purple-600 dark:text-purple-400 font-bold">当前推演虚岁：{horoscope.age.nominalAge} 岁</p>
        )}
      </div>
    </div>
  );
}
