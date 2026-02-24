// 详细测试所有星曜的亮度显示情况
const http = require('http');

// 测试数据
const testData = {
  birthday: '1999-02-08',
  hourIndex: 10, // 巳时
  gender: '男',
  isLunar: false,
  isLeap: false,
  targetYear: 2026
};

// 发送请求到后端
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ziwei',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.astrolabe && result.astrolabe.palaces) {
      console.log('宫位数量:', result.astrolabe.palaces.length);
      
      // 统计所有星曜的亮度信息
      let totalStars = 0;
      let starsWithBrightness = 0;
      let starsWithoutBrightness = 0;
      
      // 检查每个宫位的星曜数据结构
      result.astrolabe.palaces.forEach((palace, index) => {
        console.log(`\n${index + 1}. 宫位: ${palace.name}`);
        
        // 检查主星
        if (palace.majorStars) {
          console.log(`  主星数量: ${palace.majorStars.length}`);
          palace.majorStars.forEach((star, starIndex) => {
            totalStars++;
            if (star.brightness) {
              starsWithBrightness++;
              console.log(`    ${starIndex + 1}. ${star.name} ${star.brightness}`);
            } else {
              starsWithoutBrightness++;
              console.log(`    ${starIndex + 1}. ${star.name} (无亮度)`);
            }
          });
        }
        
        // 检查辅星
        if (palace.minorStars) {
          console.log(`  辅星数量: ${palace.minorStars.length}`);
          palace.minorStars.forEach((star, starIndex) => {
            totalStars++;
            if (star.brightness) {
              starsWithBrightness++;
              console.log(`    ${starIndex + 1}. ${star.name} ${star.brightness}`);
            } else {
              starsWithoutBrightness++;
              console.log(`    ${starIndex + 1}. ${star.name} (无亮度)`);
            }
          });
        }
        
        // 检查杂曜
        if (palace.adjectiveStars) {
          console.log(`  杂曜数量: ${palace.adjectiveStars.length}`);
          palace.adjectiveStars.forEach((star, starIndex) => {
            totalStars++;
            if (star.brightness) {
              starsWithBrightness++;
              console.log(`    ${starIndex + 1}. ${star.name} ${star.brightness}`);
            } else {
              starsWithoutBrightness++;
              console.log(`    ${starIndex + 1}. ${star.name} (无亮度)`);
            }
          });
        }
      });
      
      console.log(`\n=== 统计结果 ===`);
      console.log(`总星曜数: ${totalStars}`);
      console.log(`有亮度的星曜数: ${starsWithBrightness}`);
      console.log(`无亮度的星曜数: ${starsWithoutBrightness}`);
      console.log(`亮度显示率: ${(starsWithBrightness / totalStars * 100).toFixed(2)}%`);
    }
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.write(JSON.stringify(testData));
req.end();
