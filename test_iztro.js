const iztro = require('iztro');

// 测试iztro库的输出结构
const astrolabe = iztro.astro.bySolar('2000-05-23', 5, '男', true, 'zh-CN');

console.log('=== iztro库输出结构 ===');
console.log('基本信息:', {
  gender: astrolabe.gender,
  solarDate: astrolabe.solarDate,
  lunarDate: astrolabe.lunarDate,
  chineseDate: astrolabe.chineseDate,
  time: astrolabe.time,
  body: astrolabe.body,
  soul: astrolabe.soul,
  earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace
});

console.log('\n=== 命盘十二宫信息 ===');
astrolabe.palaces.forEach((palace, index) => {
  console.log(`\n${index + 1}. ${palace.name}宫 [${palace.heavenlyStem}${palace.earthlyBranch}]`);
  console.log('  主星:', palace.majorStars.map(s => `${s.name}[${s.brightness}]${s.mutagen ? `[↑${s.mutagen}]` : ''}`).join('，') || '无');
  console.log('  辅星:', palace.minorStars.map(s => `${s.name}[${s.brightness}]`).join('，') || '无');
  console.log('  小星:', palace.adjectiveStars.map(s => `${s.name}[${s.brightness}]`).join('，') || '无');
  console.log('  大限:', palace.stage?.range ? `${palace.stage.range[0]}~${palace.stage.range[1]}虚岁` : '无');
  console.log('  小限年龄:', palace.ages ? palace.ages.slice(0, 5).join('，') + '虚岁' : '无');
});

console.log('\n=== 完整数据结构键名 ===');
console.log(Object.keys(astrolabe));
