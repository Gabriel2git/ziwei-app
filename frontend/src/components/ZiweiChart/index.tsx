﻿﻿﻿﻿﻿﻿﻿import React from 'react';
import PalaceCell from './PalaceCell';
import CenterInfo from './CenterInfo';
import { EARTHLY_BRANCHES, GRID_MAPPING } from './constants';

interface ZiweiChartProps {
  ziweiData: {
    astrolabe: any;
    horoscope?: any;
  };
}

export default function ZiweiChart({ ziweiData }: ZiweiChartProps) {
  if (!ziweiData || !ziweiData.astrolabe) return <div>暂无命盘数据</div>;

  const { astrolabe, horoscope } = ziweiData;
  const palaces = astrolabe.palaces || [];

  const earthlyBranchOfBodyPalace = astrolabe.earthlyBranchOfBodyPalace;
  const birthYearStem = astrolabe.chineseDate ? astrolabe.chineseDate.charAt(0) : undefined;

  return (
    <div className="w-full h-full max-h-[500px] grid grid-cols-4 grid-rows-4 gap-0 bg-gray-800 dark:bg-gray-700 border-2 border-gray-800 dark:border-gray-700 mx-auto">
      {EARTHLY_BRANCHES.map((branch) => {
        const palaceData = palaces.find((palace: any) => palace.earthlyBranch === branch);
        return (
          <div key={branch} className={`${GRID_MAPPING[branch]} bg-white dark:bg-gray-800 relative`}>
            <PalaceCell
              palace={palaceData}
              horoscope={horoscope}
              earthlyBranchOfBodyPalace={earthlyBranchOfBodyPalace}
              birthYearStem={birthYearStem}
            />
          </div>
        );
      })}

      <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#f8f9fa] dark:bg-gray-800 relative z-10">
        <CenterInfo astrolabe={astrolabe} horoscope={horoscope} />
      </div>
    </div>
  );
}
