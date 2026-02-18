const iztro = require('iztro');

console.log('🚀 开始测试 iztro 排盘...');

try {
  const testData = {
    birthday: '2000-5-23',
    birthTime: 5, 
    birthdayType: 'solar',
    gender: 'male'
  };

  console.log('📋 测试数据:', testData);
  
  console.log('🔄 调用 astro.bySolar()...');
  const astrolabe = iztro.astro.bySolar(testData);
  
  console.log('\n✅ astrolabe 加载成功!');
  console.log('📍 palaces 数量:', astrolabe.palaces?.length);
  
  console.log('\n📊 十二宫数据:');
  for (const palace of astrolabe.palaces || []) {
    console.log(`\n  📍 ${palace.name}宫 [${palace.heavenlyStem}${palace.earthlyBranch}]`);
    console.log(`     主星: ${palace.majorStars?.map(s => s.name).join(', ') || '无'}`);
    console.log(`     大限: ${palace.stage?.range?.join('-') || '无'}`);
    console.log(`     小限/流年: ${palace.ages?.join(', ') || '无'}`);
  }
  
  console.log('\n🔄 调用 astro.getHoroscope()...');
  const horoscope = iztro.astro.getHoroscope({
    ...testData,
    horoscopeDate: new Date()
  });
  
  console.log('\n✅ horoscope 加载成功!');
  
  console.log('\n🎉 测试完成! iztro 库工作正常!');
  
} catch (error) {
  console.error('\n❌ 测试失败:', error);
  console.error('错误堆栈:', error.stack);
}
