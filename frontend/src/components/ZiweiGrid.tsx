'use client';

import type { ZiweiData, Palace, Star } from '@/types';
import { getMutagensByStem } from '@/constants';

interface PalaceCellProps {
  palace: Palace;
  decadalMap: Record<string, string>;
  yearlyMap: Record<string, string>;
  currentAge: number;
}

function PalaceCell({ palace, decadalMap, yearlyMap, currentAge }: PalaceCellProps) {
  const { name, heavenlyStem, earthlyBranch, majorStars, minorStars, adjectiveStars, decadal } = palace;
  const decadalRange = decadal?.range || [0, 0];
  const isCurrentDecadal = decadalRange[0] <= currentAge && currentAge <= decadalRange[1];

  const renderStars = (stars: Star[] | undefined, className: string) => {
    if (!stars || stars.length === 0) return null;
    
    return stars.map((star, idx) => {
      const name = star.name;
      const brightness = star.brightness ? `[${star.brightness}]` : '';
      const mBirth = star.mutagen ? (
        <span key={`birth-${idx}`} className="mut-birth">[↑{star.mutagen}]</span>
      ) : null;
      const mDec = name in decadalMap ? (
        <span key={`dec-${idx}`} className="mut-decadal">[限{decadalMap[name]}]</span>
      ) : null;
      const mYear = name in yearlyMap ? (
        <span key={`year-${idx}`} className="mut-yearly">[流{yearlyMap[name]}]</span>
      ) : null;
      
      return (
        <span key={idx} className={className}>
          {name}{brightness}{mBirth}{mDec}{mYear}
        </span>
      );
    });
  };

  return (
    <div className={`palace-cell relative flex flex-col justify-between p-1 bg-white border border-gray-300 overflow-hidden text-xs`}>
      {isCurrentDecadal && (
        <div className="luck-indicator bg-yellow-300 text-red-700 font-bold text-xs px-2 py-1 rounded text-center mb-1">
          当前大限
        </div>
      )}
      
      <div className="stars-box flex-1 flex flex-col justify-between">
        {majorStars && majorStars.length > 0 && (
          <div className="star-section mb-1">
            {renderStars(majorStars, 'star-major')}
          </div>
        )}
        
        {minorStars && minorStars.length > 0 && (
          <div className="star-section mb-1">
            {renderStars(minorStars, 'star-minor')}
          </div>
        )}
        
        {adjectiveStars && adjectiveStars.length > 0 && (
          <div className="star-section">
            {renderStars(adjectiveStars.slice(0, 8), 'star-adj')}
          </div>
        )}
      </div>
      
      <div className="palace-footer mt-1 pt-1 border-t border-dashed border-gray-300 text-center text-xs">
        <span className="palace-name font-bold text-red-700 mr-1">{name}</span>
        <span className="palace-dizhi font-bold text-blue-700">[{heavenlyStem}{earthlyBranch}]</span>
        <div className="palace-age text-xs text-gray-500 mt-1">
          大限:{decadalRange[0]}~{decadalRange[1]}
        </div>
      </div>
    </div>
  );
}

interface CenterCellProps {
  data: ZiweiData;
}

function CenterCell({ data }: CenterCellProps) {
  const pan = data.astrolabe;
  const clockTime = `${pan.solarDate || ''} ${pan.timeRange?.split('~')[0] || ''}`;
  const trueSolarTime = clockTime;
  const chineseHour = pan.time || '';
  const bazi = pan.chineseDate || '';

  return (
    <div className="center-cell bg-gray-50 flex flex-col items-center justify-center text-center p-5 border-2 border-black relative">
      <div className="center-title text-lg font-bold text-red-700 mb-2 font-serif">
        紫微斗数命盘
      </div>
      
      <div className="bazi-tag bg-yellow-100 px-3 py-1 rounded-full font-bold text-amber-700 mb-2 text-sm">
        {bazi}
      </div>
      
      <div className="center-info text-gray-700 text-sm leading-relaxed">
        <div>真太阳时: {trueSolarTime}</div>
        <div>钟表时间: {clockTime}</div>
        <div>农历: {pan.lunarDate || ''}{chineseHour}</div>
        <div>命主: {pan.soul || ''}; 身主: {pan.body || ''}</div>
        <div>子年斗君: 寅; 身宫: {pan.earthlyBranchOfBodyPalace || ''}</div>
      </div>
      
      <div className="sanfang-sizheng relative w-4/5 h-4/5 my-4">
        <div className="sanfang-line"></div>
        <div className="sizheng-line"></div>
      </div>
      
      <div className="mutagen-legend text-xs text-gray-600">
        <div>自化图示: →禄→权→科→忌</div>
        <div>运限指示: 当前大限高亮显示</div>
      </div>
    </div>
  );
}

interface ZiweiGridProps {
  data: ZiweiData;
}

export default function ZiweiGrid({ data }: ZiweiGridProps) {
  if (!data || !data.astrolabe) {
    return (
      <div className="ziwei-grid grid grid-cols-4 grid-rows-4 gap-0.5 bg-black border-3 border-black font-sans h-[550px] max-h-[550px] min-h-[550px]">
        <div className="center-cell col-span-2 row-span-2 bg-gray-50 flex flex-col items-center justify-center text-center p-5 border-2 border-black">
          <div className="center-title text-lg font-bold text-red-700 mb-2 font-serif">
            紫微斗数命盘
          </div>
          <div className="bazi-tag bg-yellow-100 px-3 py-1 rounded-full font-bold text-amber-700 mb-2 text-sm">
            请先开始排盘
          </div>
          <div className="center-info text-gray-700 text-sm">
            <div>请在左侧边栏输入出生信息</div>
            <div>然后点击"开始排盘"按钮</div>
          </div>
        </div>
      </div>
    );
  }

  const pan = data.astrolabe;
  const yun = data.horoscope || {};
  
  const decadalStem = yun.decadal?.heavenlyStem || '戊';
  const decadalMuts = getMutagensByStem(decadalStem);
  const decadalMap: Record<string, string> = {};
  Object.entries(decadalMuts).forEach(([k, v]) => {
    decadalMap[v] = k;
  });
  
  const yearlyStem = yun.yearly?.heavenlyStem || '戊';
  const yearlyMuts = getMutagensByStem(yearlyStem);
  const yearlyMap: Record<string, string> = {};
  Object.entries(yearlyMuts).forEach(([k, v]) => {
    yearlyMap[v] = k;
  });
  
  const palaceMap: Record<string, Palace> = {};
  (pan.palaces || []).forEach(p => {
    palaceMap[p.earthlyBranch] = p;
  });

  const currentAge = yun.age?.nominalAge || 0;

  const cellOrder = ['巳', '午', '未', '申', '辰', '酉', '卯', '戌', '寅', '丑', '子', '亥'];

  const makeCell = (dizhi: string) => {
    const palace = palaceMap[dizhi];
    if (!palace) return <div className="palace-cell"></div>;
    return (
      <PalaceCell
        key={dizhi}
        palace={palace}
        decadalMap={decadalMap}
        yearlyMap={yearlyMap}
        currentAge={currentAge}
      />
    );
  };

  return (
    <div className="ziwei-grid grid grid-cols-4 grid-rows-4 gap-0.5 bg-black border-3 border-black font-sans h-[550px] max-h-[550px] min-h-[550px]">
      {makeCell('巳')}
      {makeCell('午')}
      {makeCell('未')}
      {makeCell('申')}
      
      {makeCell('辰')}
      <CenterCell data={data} />
      {makeCell('酉')}
      
      {makeCell('卯')}
      {makeCell('戌')}
      <div></div>
      <div></div>
      
      {makeCell('寅')}
      {makeCell('丑')}
      {makeCell('子')}
      {makeCell('亥')}
      
      <style jsx>{`
        .ziwei-grid {
          margin-top: 20px;
          margin-bottom: 20px;
        }
        
        .star-major {
          color: #c62828;
          font-weight: bold;
          font-size: 1.3em;
          margin-right: 2px;
          display: inline-block;
        }
        
        .star-minor {
          color: #1565c0;
          font-weight: normal;
          font-size: 1.2em;
          margin-right: 2px;
          display: inline-block;
        }
        
        .star-adj {
          color: #6d4c41;
          font-size: 1.1em;
          margin-right: 2px;
          display: inline-block;
        }
        
        .mut-birth {
          background-color: #ffeb3b;
          color: #d81b60;
          border-radius: 2px;
          padding: 0 2px;
          font-size: 1.2em;
          margin-left: 2px;
          font-weight: bold;
          display: inline-block;
          white-space: nowrap;
        }
        
        .mut-decadal {
          background-color: #4fc3f7;
          color: #1565c0;
          border-radius: 2px;
          padding: 0 2px;
          font-size: 1.2em;
          margin-left: 2px;
          font-weight: bold;
          display: inline-block;
          white-space: nowrap;
        }
        
        .mut-yearly {
          background-color: #ce93d8;
          color: #6a1b9a;
          border-radius: 2px;
          padding: 0 2px;
          font-size: 1.2em;
          margin-left: 2px;
          font-weight: bold;
          display: inline-block;
          white-space: nowrap;
        }
        
        .center-cell {
          grid-column: span 2;
          grid-row: span 2;
        }
        
        .center-cell * {
          font-size: 0.8em !important;
          line-height: 1.3 !important;
        }
        
        .center-cell .center-title {
          font-size: 1.1em !important;
        }
      `}</style>
    </div>
  );
}
