﻿﻿﻿﻿﻿﻿﻿﻿﻿import React from 'react';

const MUTAGEN_LABELS = ['禄', '权', '科', '忌'];
const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

interface PalaceCellProps {
  palace: any;
  horoscope?: any;
  earthlyBranchOfBodyPalace?: string;
  birthYearStem?: string;
}

function getDynamicPalaceName(currentBranch: string, targetLifeBranch?: string) {
  if (!targetLifeBranch) return null;
  const currentIndex = EARTHLY_BRANCHES.indexOf(currentBranch);
  const lifeIndex = EARTHLY_BRANCHES.indexOf(targetLifeBranch);
  if (currentIndex === -1 || lifeIndex === -1) return null;

  const clockwiseDistance = (currentIndex - lifeIndex + 12) % 12;
  const palaceIndex = (12 - clockwiseDistance) % 12;
  return PALACE_NAMES[palaceIndex];
}

function getMutagenTag(starName: string, mutagen: string[] | undefined): string | null {
  if (!Array.isArray(mutagen) || mutagen.length === 0) return null;
  const index = mutagen.findIndex((name) => name === starName);
  if (index < 0 || index > 3) return null;
  return MUTAGEN_LABELS[index];
}

function renderStar(star: any, decadalMutagen: string[] | undefined, yearlyMutagen: string[] | undefined, className: string) {
  const birthMutagen = star?.mutagen;
  const decadalTag = getMutagenTag(star?.name, decadalMutagen);
  const yearlyTag = getMutagenTag(star?.name, yearlyMutagen);

  return (
    <div key={star?.name} className="flex items-center flex-wrap gap-0.5">
      <span className={className}>{star?.name}</span>
      {star?.brightness && <span className="text-[7px] sm:text-xs text-gray-500">{star.brightness}</span>}

      {birthMutagen && (
        <span className="text-[7px] sm:text-xs font-bold bg-yellow-200 dark:bg-yellow-800 text-red-600 dark:text-red-300 px-0.5 rounded">
          {birthMutagen}
        </span>
      )}
      {decadalTag && (
        <span className="text-[7px] sm:text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-0.5 rounded">
          限{decadalTag}
        </span>
      )}
      {yearlyTag && (
        <span className="text-[7px] sm:text-xs font-bold bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300 px-0.5 rounded">
          流{yearlyTag}
        </span>
      )}
    </div>
  );
}

export default function PalaceCell({ palace, horoscope, earthlyBranchOfBodyPalace, birthYearStem }: PalaceCellProps) {
  if (!palace) return null;

  const isCurrentDecadal = horoscope?.decadal?.earthlyBranch === palace.earthlyBranch;
  const isCurrentYearly = horoscope?.yearly?.earthlyBranch === palace.earthlyBranch;
  const isBodyPalace = palace.earthlyBranch === earthlyBranchOfBodyPalace;
  const isOriginPalace = palace.heavenlyStem === birthYearStem;

  const decadalPalace = getDynamicPalaceName(palace.earthlyBranch, horoscope?.decadal?.earthlyBranch);
  const yearlyPalace = getDynamicPalaceName(palace.earthlyBranch, horoscope?.yearly?.earthlyBranch);

  const decadalMutagen = horoscope?.decadal?.mutagen;
  const yearlyMutagen = horoscope?.yearly?.mutagen;

  return (
    <div
      className={`w-full h-full p-0.5 sm:p-1.5 flex flex-col justify-between ${
        isCurrentYearly
          ? 'border-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] bg-red-50 dark:bg-red-900/30'
          : isCurrentDecadal
            ? 'border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] bg-blue-50 dark:bg-blue-900/30'
            : 'border border-gray-600 dark:border-gray-500 bg-white dark:bg-[#1a2a2a]'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap gap-0.5 content-start">
          {(palace.majorStars || []).map((star: any) =>
            renderStar(star, decadalMutagen, yearlyMutagen, 'text-red-700 dark:text-red-400 font-bold text-[9px] sm:text-base leading-tight'),
          )}
        </div>
        <div className="flex flex-wrap gap-0.5 content-start">
          {(palace.minorStars || []).map((star: any) =>
            renderStar(star, decadalMutagen, yearlyMutagen, 'text-blue-700 dark:text-blue-400 text-[8px] sm:text-sm leading-tight'),
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-0.5 mt-0.5 opacity-70 text-[7px] sm:text-xs">
        {palace.adjectiveStars?.map((star: any) => (
          <div key={star.name} className="flex items-center flex-wrap gap-0.5">
            <span className="text-gray-600 dark:text-gray-400">{star.name}</span>
            {star.brightness && <span className="text-[7px] sm:text-xs text-gray-500">{star.brightness}</span>}
          </div>
        ))}
        {palace.changsheng12 && <span className="text-purple-600 dark:text-purple-400">{palace.changsheng12}</span>}
        {palace.boshi12 && <span className="text-teal-600 dark:text-teal-400">{palace.boshi12}</span>}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-0.5 mt-auto flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[7px] sm:text-[10px] text-gray-500">
            {palace.decadal?.range?.[0]}~{palace.decadal?.range?.[1]}
          </span>
          <div className="flex items-baseline gap-0.5 flex-wrap">
            <span className="text-[10px] sm:text-sm font-bold text-red-700 dark:text-red-400">{palace.name}</span>
            {decadalPalace && (
              <span className="hidden sm:inline text-[8px] sm:text-xs text-green-600 dark:text-green-400">
                大{decadalPalace.substring(0, 2)}
              </span>
            )}
            {yearlyPalace && (
              <span className="hidden sm:inline text-[8px] sm:text-xs text-blue-500 dark:text-blue-400">
                年{yearlyPalace.substring(0, 2)}
              </span>
            )}
            {isBodyPalace && (
              <span className="text-[7px] sm:text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-0.5 rounded">
                身
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          {isOriginPalace && (
            <span className="text-[7px] sm:text-xs bg-red-600 text-white px-0.5 rounded mb-0.5">
              因
            </span>
          )}
          <span className="text-xs sm:text-lg font-bold text-blue-800 dark:text-blue-400">
            {palace.heavenlyStem}
            {palace.earthlyBranch}
          </span>
        </div>
      </div>
    </div>
  );
}
