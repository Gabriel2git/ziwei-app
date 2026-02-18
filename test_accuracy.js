const iztro = require('iztro');

// 测试我们的系统与文墨天机的对比
const testBirthday = '2000-05-23';
const testHour = 10;
const testMinute = 50;
const testGender = '男';
const testLongitude = 120.033;

console.log('=== 测试系统与文墨天机对比 ===');
console.log('测试数据:', {
  birthday: testBirthday,
  time: `${testHour}:${testMinute}`,
  gender: testGender,
  longitude: testLongitude
});

// 计算真太阳时
function calculateTrueSolarTime(year, month, day, hour, minute, longitude) {
  const timezoneOffset = longitude / 15;
  const meanSolarTime = hour + minute / 60 + timezoneOffset - 8;
  const trueSolarTime = meanSolarTime;
  const normalizedTime = trueSolarTime % 24;
  return normalizedTime < 0 ? normalizedTime + 24 : normalizedTime;
}

function getShichenIndexFromTrueSolarTime(trueSolarTime) {
  return Math.floor(trueSolarTime / 2);
}

// 解析生日字符串
const dateParts = testBirthday.split('-');
const year = parseInt(dateParts[0]);
const month = parseInt(dateParts[1]);
const day = parseInt(dateParts[2]);

// 计算真太阳时
const trueSolarTime = calculateTrueSolarTime(year, month, day, testHour, testMinute, testLongitude);
const trueHourIndex = getShichenIndexFromTrueSolarTime(trueSolarTime);

console.log('\n=== 真太阳时计算 ===');
console.log('真太阳时:', trueSolarTime.toFixed(2));
console.log('时辰索引:', trueHourIndex);

// 使用iztro库计算命盘
const astrolabe = iztro.astro.bySolar(testBirthday, trueHourIndex, testGender, true, 'zh-CN');

console.log('\n=== 系统输出 ===');
console.log('基本信息:', {
  gender: astrolabe.gender,
  solarDate: astrolabe.solarDate,
  lunarDate: astrolabe.lunarDate,
  time: astrolabe.time,
  chineseDate: astrolabe.chineseDate,
  body: astrolabe.body,
  soul: astrolabe.soul,
  earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace
});

console.log('\n=== 命盘十二宫对比 ===');
astrolabe.palaces.forEach((palace, index) => {
  console.log(`\n${index + 1}. ${palace.name}宫 [${palace.heavenlyStem}${palace.earthlyBranch}]`);
  console.log('  主星:', palace.majorStars.map(s => `${s.name}${s.brightness ? `[${s.brightness}]` : ''}${s.mutagen ? `[${s.mutagen}]` : ''}`).join('，') || '无');
  console.log('  辅星:', palace.minorStars.map(s => s.name).join('，') || '无');
  console.log('  小星:', palace.adjectiveStars.map(s => s.name).join('，') || '无');
  console.log('  神煞:');
  console.log('    岁前星:', palace.suiqian12);
  console.log('    将前星:', palace.jiangqian12);
  console.log('    十二长生:', palace.changsheng12);
  console.log('    太岁煞禄:', palace.boshi12);
  console.log('  大限:', palace.decadal?.range ? `${palace.decadal.range[0]}~${palace.decadal.range[1]}虚岁` : '无');
  console.log('  小限:', palace.ages.filter((_, i) => i % 2 === 0).slice(0, 5).join('，') + '虚岁');
  console.log('  流年:', palace.ages.filter((_, i) => i % 2 === 1).slice(0, 5).join('，') + '虚岁');
});

console.log('\n=== 与文墨天机对比 ===');
console.log('文墨天机信息:');
console.log('- 农历时间: 庚辰年四月二十日巳时');
console.log('- 节气四柱: 庚辰 辛巳 辛巳 癸巳');
console.log('- 身主:文昌; 命主:贪狼; 子年斗君:寅; 身宫:戌');
console.log('- 命宫: 天梁[庙][↑禄]');
console.log('- 父母宫: 廉贞[利],七杀[庙]');
console.log('- 福德宫: 无主星, 天马[旺]');
console.log('- 田宅宫: 无主星, 铃星[利]');
console.log('- 官禄宫: 天同[平][生年忌]');
console.log('- 交友宫: 武曲[平][生年权],破军[平]');
console.log('- 迁移宫: 太阳[旺][生年禄]');
console.log('- 疾厄宫: 天府[庙]');
console.log('- 财帛宫: 天机[得],太阴[利][生年科]');
console.log('- 子女宫: 紫微[旺],贪狼[利]');
console.log('- 夫妻宫: 巨门[陷]');
console.log('- 兄弟宫: 天相[得]');
