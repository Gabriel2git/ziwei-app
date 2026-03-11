// frontend/src/components/ZiweiChart/PalaceCell.tsx
import React from 'react';
import { getDynamicSiHua } from '@/lib/sihua';

// 固定的顺时针地支数组
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 固定的逆时针十二宫顺序（标准名称）
const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];

interface PalaceCellProps {
  palace: any; // iztro: IFunctionalPalace
  horoscope?: any; // iztro: IFunctionalHoroscope
  earthlyBranchOfBodyPalace?: string; // 身宫所在地支
  birthYearStem?: string; // 出生年干
  decadalStem?: string; // 大限天干
  yearlyStem?: string; // 流年天干
}

// 推算动态宫名的方法
const getDynamicPalaceName = (currentBranch: string, targetLifeBranch?: string) => {
  if (!targetLifeBranch) return null;
  const currentIndex = EARTHLY_BRANCHES.indexOf(currentBranch);
  const lifeIndex = EARTHLY_BRANCHES.indexOf(targetLifeBranch);
  if (currentIndex === -1 || lifeIndex === -1) return null;

  // 计算顺时针距离
  const clockwiseDistance = (currentIndex - lifeIndex + 12) % 12;
  // 因为宫位是逆时针排布的，顺时针的距离需要反向映射到宫位数组
  const palaceIndex = (12 - clockwiseDistance) % 12;

  return PALACE_NAMES[palaceIndex];
};

export default function PalaceCell({ palace, horoscope, earthlyBranchOfBodyPalace, birthYearStem, decadalStem, yearlyStem }: PalaceCellProps) {
  if (!palace) return null;

  // Step 5: 时间维度的交互层 (判断是否为当前大限或流年所在宫位)
  const isCurrentDecadal = horoscope?.decadal?.earthlyBranch === palace.earthlyBranch;
  const isCurrentYearly = horoscope?.yearly?.earthlyBranch === palace.earthlyBranch;
  
  // 判断是否为身宫
  const isBodyPalace = palace.earthlyBranch === earthlyBranchOfBodyPalace;
  
  // 判断是否为来因宫
  const isOriginPalace = palace.heavenlyStem === birthYearStem;

  // 计算动态宫名
  const decadalPalace = getDynamicPalaceName(palace.earthlyBranch, horoscope?.decadal?.earthlyBranch);
  const yearlyPalace = getDynamicPalaceName(palace.earthlyBranch, horoscope?.yearly?.earthlyBranch);

  return (
    <div className={`w-full h-full p-0.5 sm:p-1.5 flex flex-col justify-between border border-gray-600 dark:border-gray-500 bg-white dark:bg-[#1a2a2a]
      ${isCurrentDecadal ? 'border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] bg-blue-50 dark:bg-blue-900/30' : ''}
      ${isCurrentYearly ? 'border-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] bg-red-50 dark:bg-red-900/30' : ''}
    `}>
      
      {/* 顶部：星曜区 (权重最高) */}
      <div className="flex flex-col gap-0.5">
        {/* 主星单独一行，即使没有主星也要空出位置 */}
        <div className="flex flex-wrap gap-0.5 content-start">
          {palace.majorStars?.map((star: any) => {
            // 1. 本命生年四化 (后端直接下发)
            const birthSiHua = star.mutagen; // 如 '禄'
            // 2. 动态大限四化 (前端推算)
            const decadalSiHua = getDynamicSiHua(star.name, decadalStem);
            // 3. 动态流年四化 (前端推算)
            const yearlySiHua = getDynamicSiHua(star.name, yearlyStem);
            
            return (
              <div key={star.name} className="flex items-center flex-wrap gap-0.5">
                <span className="text-red-700 dark:text-red-400 font-bold text-[9px] sm:text-base leading-tight">{star.name}</span>
                {/* 亮度 - 超小字体 */}
                {star.brightness && <span className="text-[7px] sm:text-xs text-gray-500">{star.brightness}</span>}

                {/* 视觉层：用不同的底色区分三代四化，形成视觉阶梯 */}

                {/* 生年四化：经典黄底红字 */}
                {birthSiHua && (
                  <span className="text-[7px] sm:text-xs font-bold bg-yellow-200 dark:bg-yellow-800 text-red-600 dark:text-red-300 px-0.5 rounded">
                    {birthSiHua}
                  </span>
                )}

                {/* 大限四化 */}
                {decadalSiHua && (
                  <span className="text-[7px] sm:text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-0.5 rounded">
                    限{decadalSiHua}
                  </span>
                )}

                {/* 流年四化 */}
                {yearlySiHua && (
                  <span className="text-[7px] sm:text-xs font-bold bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300 px-0.5 rounded">
                    流{yearlySiHua}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {/* 辅星放在主星下一行 - 超小字体 */}
        <div className="flex flex-wrap gap-0.5 content-start">
          {palace.minorStars?.map((star: any) => {
            // 1. 本命生年四化 (后端直接下发)
            const birthSiHua = star.mutagen; // 如 '禄'
            // 2. 动态大限四化 (前端推算)
            const decadalSiHua = getDynamicSiHua(star.name, decadalStem);
            // 3. 动态流年四化 (前端推算)
            const yearlySiHua = getDynamicSiHua(star.name, yearlyStem);

            return (
              <div key={star.name} className="flex items-center flex-wrap gap-0.5">
                <span className="text-blue-700 dark:text-blue-400 text-[8px] sm:text-sm leading-tight">{star.name}</span>
                {/* 亮度 */}
                {star.brightness && <span className="text-[7px] sm:text-xs text-gray-500">{star.brightness}</span>}

                {/* 视觉层：用不同的底色区分三代四化，形成视觉阶梯 */}

                {/* 生年四化：经典黄底红字 */}
                {birthSiHua && (
                  <span className="text-[7px] sm:text-xs font-bold bg-yellow-200 dark:bg-yellow-800 text-red-600 dark:text-red-300 px-0.5 rounded">
                    {birthSiHua}
                  </span>
                )}

                {/* 大限四化 */}
                {decadalSiHua && (
                  <span className="text-[7px] sm:text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-0.5 rounded">
                    限{decadalSiHua}
                  </span>
                )}

                {/* 流年四化 */}
                {yearlySiHua && (
                  <span className="text-[7px] sm:text-xs font-bold bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300 px-0.5 rounded">
                    流{yearlySiHua}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 中部：杂曜与神煞区 - 超小字体 */}
      <div className="flex flex-wrap gap-0.5 mt-0.5 opacity-70 text-[7px] sm:text-xs">
        {/* iztro data: adjectiveStars 杂曜 */}
        {palace.adjectiveStars?.map((star: any) => (
          <div key={star.name} className="flex items-center flex-wrap gap-0.5">
            <span className="text-gray-600 dark:text-gray-400">{star.name}</span>
            {/* 亮度 */}
            {star.brightness && <span className="text-[7px] sm:text-xs text-gray-500">{star.brightness}</span>}
          </div>
        ))}
        {/* iztro data: 长生十二神、岁前十二神等 */}
        {palace.changsheng12 && <span className="text-purple-600 dark:text-purple-400">{palace.changsheng12}</span>}
        {palace.boshi12 && <span className="text-teal-600 dark:text-teal-400">{palace.boshi12}</span>}
      </div>

      {/* 底部：基石区 (宫名、干支、大限) */}
      <div className="border-t border-dashed border-gray-300 pt-0.5 mt-auto flex justify-between items-end">
        <div className="flex flex-col">
          {/* iztro data: decadal.range 大限岁数 */}
          <span className="text-[7px] sm:text-[10px] text-gray-500">
            {palace.decadal?.range?.[0]}~{palace.decadal?.range?.[1]}
          </span>
          {/* iztro data: name 宫名 (如命宫、兄弟宫) */}
          <div className="flex items-baseline gap-0.5 flex-wrap">
            <span className="text-[10px] sm:text-sm font-bold text-red-700 dark:text-red-400">{palace.name}</span>
            {/* 大限宫名 - 手机端隐藏 */}
            {decadalPalace && (
              <span className="hidden sm:inline text-[8px] sm:text-xs text-green-600 dark:text-green-400">
                大{decadalPalace.substring(0, 2)}
              </span>
            )}
            {/* 流年宫名 - 手机端隐藏 */}
            {yearlyPalace && (
              <span className="hidden sm:inline text-[8px] sm:text-xs text-blue-500 dark:text-blue-400">
                年{yearlyPalace.substring(0, 2)}
              </span>
            )}
            {/* 身宫标识 */}
            {isBodyPalace && (
              <span className="text-[7px] sm:text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-0.5 rounded">
                身
              </span>
            )}
          </div>
        </div>
        {/* iztro data: heavenlyStem + earthlyBranch 干支 */}
        <div className="flex flex-col items-end">
          {/* 来因宫标识 */}
          {isOriginPalace && (
            <span className="text-[7px] sm:text-xs bg-red-600 text-white px-0.5 rounded mb-0.5">
              因
            </span>
          )}
          <span className="text-xs sm:text-lg font-bold text-blue-800 dark:text-blue-400">
            {palace.heavenlyStem}{palace.earthlyBranch}
          </span>
        </div>
      </div>
      
    </div>
  );
}
