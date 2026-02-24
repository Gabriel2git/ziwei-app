// 测试干支计算逻辑
function testGanzhiCalculation() {
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 2024年是甲辰年，以此为基准计算
  const baseYear = 2024;
  
  // 测试2024-2035年的干支
  for (let year = 2024; year <= 2035; year++) {
    const yearDiff = year - baseYear;
    
    const stemIndex = (yearDiff + 0) % 10; // 2024年是甲（索引0）
    const branchIndex = (yearDiff + 4) % 12; // 2024年是辰（索引4）
    
    const yearGanzhi = `${heavenlyStems[stemIndex < 0 ? stemIndex + 10 : stemIndex]}${earthlyBranches[branchIndex < 0 ? branchIndex + 12 : branchIndex]}`;
    
    // 简化的命宫干支计算（基于流年地支的前一个地支）
    const palaceBranchIndex = (branchIndex - 1 + 12) % 12;
    const palaceStemIndex = (stemIndex - 1 + 10) % 10;
    const palaceGanzhi = `${heavenlyStems[palaceStemIndex]}${earthlyBranches[palaceBranchIndex]}`;
    
    console.log(`${year}年: 流年干支=${yearGanzhi}, 命宫干支=${palaceGanzhi}`);
  }
}

testGanzhiCalculation();
