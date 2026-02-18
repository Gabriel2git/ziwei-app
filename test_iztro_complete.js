const iztro = require('iztro');

// 测试iztro库的完整输出结构，重点检查限流叠宫、自化等信息
const astrolabe = iztro.astro.bySolar('2000-05-23', 5, '男', true, 'zh-CN');

console.log('=== 基本信息 ===');
console.log('五行局数:', astrolabe.fiveElementsClass);
console.log('命主:', astrolabe.soul);
console.log('身主:', astrolabe.body);
console.log('身宫地支:', astrolabe.earthlyBranchOfBodyPalace);
console.log('命宫地支:', astrolabe.earthlyBranchOfSoulPalace);

console.log('\n=== 命盘十二宫完整信息 ===');
astrolabe.palaces.forEach((palace, index) => {
  console.log(`\n${index + 1}. ${palace.name}宫 [${palace.heavenlyStem}${palace.earthlyBranch}]`);
  console.log('  主星:', palace.majorStars.map(s => `${s.name}${s.mutagen ? `[${s.mutagen}]` : ''}`).join('，') || '无');
  console.log('  辅星:', palace.minorStars.map(s => s.name).join('，') || '无');
  console.log('  小星:', palace.adjectiveStars.map(s => s.name).join('，') || '无');
  
  // 检查神煞信息
  console.log('  神煞相关属性:');
  console.log('    changsheng12:', palace.changsheng12);
  console.log('    boshi12:', palace.boshi12);
  console.log('    jiangqian12:', palace.jiangqian12);
  console.log('    suiqian12:', palace.suiqian12);
  
  // 检查大限信息
  console.log('  大限信息:');
  console.log('    stage:', palace.stage);
  console.log('    decadal:', palace.decadal);
  
  // 检查小限和流年信息
  console.log('  年龄信息:');
  console.log('    ages:', palace.ages);
  
  // 检查自化信息
  console.log('  自化信息:');
  console.log('    selfMutaged:', palace.selfMutaged());
  console.log('    selfMutagedOneOf:', palace.selfMutagedOneOf(['禄', '权', '科', '忌']));
  console.log('    mutagen:', palace.majorStars.map(s => s.mutagen).filter(Boolean).join('，') || '无');
  
  // 检查其他可能的属性
  console.log('  其他属性:');
  console.log('    isBodyPalace:', palace.isBodyPalace);
  console.log('    isOriginalPalace:', palace.isOriginalPalace);
  console.log('    index:', palace.index);
});

// 检查是否有其他可能的限流叠宫相关信息
console.log('\n=== 全局属性检查 ===');
console.log('astrolabe属性:', Object.keys(astrolabe));
console.log('horoscope:', astrolabe.horoscope);
console.log('plugins:', astrolabe.plugins);
