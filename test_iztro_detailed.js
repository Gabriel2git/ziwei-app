const iztro = require('iztro');

// 测试iztro库的详细输出结构
const astrolabe = iztro.astro.bySolar('2000-05-23', 5, '男', true, 'zh-CN');

console.log('=== 五行局数 ===');
console.log('fiveElementsClass:', astrolabe.fiveElementsClass);

console.log('\n=== plugins字段 ===');
console.log('plugins:', astrolabe.plugins);

console.log('\n=== 原始日期数据 ===');
console.log('rawDates:', astrolabe.rawDates);

console.log('\n=== 时间范围 ===');
console.log('timeRange:', astrolabe.timeRange);

console.log('\n=== 星座和生肖 ===');
console.log('sign:', astrolabe.sign);
console.log('zodiac:', astrolabe.zodiac);

console.log('\n=== 身宫和命宫地支 ===');
console.log('earthlyBranchOfBodyPalace:', astrolabe.earthlyBranchOfBodyPalace);
console.log('earthlyBranchOfSoulPalace:', astrolabe.earthlyBranchOfSoulPalace);

console.log('\n=== 命盘十二宫详细信息 ===');
astrolabe.palaces.forEach((palace, index) => {
  console.log(`\n${index + 1}. ${palace.name}宫 [${palace.heavenlyStem}${palace.earthlyBranch}]`);
  console.log('  主星:', palace.majorStars.map(s => `${s.name}[${s.brightness}]${s.mutagen ? `[↑${s.mutagen}]` : ''}`).join('，') || '无');
  console.log('  辅星:', palace.minorStars.map(s => `${s.name}[${s.brightness}]`).join('，') || '无');
  console.log('  小星:', palace.adjectiveStars.map(s => `${s.name}`).join('，') || '无');
  console.log('  大限:', palace.stage ? JSON.stringify(palace.stage) : '无');
  console.log('  小限年龄:', palace.ages ? palace.ages.join('，') + '虚岁' : '无');
  console.log('  宫位其他属性:', Object.keys(palace));
});

// 检查是否有流年信息
console.log('\n=== 流年信息 ===');
console.log('horoscope:', astrolabe.horoscope ? Object.keys(astrolabe.horoscope) : '无');
