import React from 'react';
import PalaceCell from './PalaceCell';
import CenterInfo from './CenterInfo';
import { EARTHLY_BRANCHES, GRID_MAPPING } from './constants';

interface ZiweiChartProps {
  ziweiData: {
    astrolabe: any;
    horoscope?: any;
  };
}

export default function ZiweiChart(props: ZiweiChartProps) {
  const { ziweiData } = props;
  if (!ziweiData || !ziweiData.astrolabe) return <div>暂无命盘数据</div>;

  const { astrolabe, horoscope } = ziweiData;
  const palaces = astrolabe.palaces || [];

  // 提取身宫地支
  const earthlyBranchOfBodyPalace = astrolabe.earthlyBranchOfBodyPalace;
  
  // 提取出生年干（从chineseDate中取第一个字符，如"戊寅年"的"戊"）
  const birthYearStem = astrolabe.chineseDate ? astrolabe.chineseDate.charAt(0) : undefined;
  
  // 提取大限天干
  const decadalStem = horoscope?.decadal?.heavenlyStem;
  
  // 提取流年天干（这里需要根据实际数据结构调整，暂时使用一个示例值）
  const yearlyStem = horoscope?.yearly?.heavenlyStem;

  return React.createElement(
    'div',
    {
      className: 'w-[90%] aspect-square md:aspect-auto md:h-[640px] grid grid-cols-4 grid-rows-4 gap-[1px] bg-gray-800 border-2 border-gray-800 mx-auto'
    },
    EARTHLY_BRANCHES.map((branch) => {
      const palaceData = palaces.find((p: any) => p.earthlyBranch === branch);
      return React.createElement(
        'div',
        {
          key: branch,
          className: `${GRID_MAPPING[branch]} bg-white relative`
        },
        React.createElement(PalaceCell, {
          palace: palaceData,
          horoscope: horoscope,
          earthlyBranchOfBodyPalace: earthlyBranchOfBodyPalace,
          birthYearStem: birthYearStem,
          decadalStem: decadalStem,
          yearlyStem: yearlyStem
        })
      );
    }),
    React.createElement(
      'div',
      {
        className: 'col-start-2 col-span-2 row-start-2 row-span-2 bg-[#f8f9fa] relative z-10'
      },
      React.createElement(CenterInfo, {
        astrolabe: astrolabe,
        horoscope: horoscope
      })
    )
  );
}
