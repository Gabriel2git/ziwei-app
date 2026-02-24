// 测试后端返回的所有星曜数据结构
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
      
      // 检查每个宫位的星曜数据结构
      result.astrolabe.palaces.forEach((palace, index) => {
        console.log(`\n${index + 1}. 宫位: ${palace.name}`);
        
        // 检查主星
        if (palace.majorStars) {
          console.log(`  主星数量: ${palace.majorStars.length}`);
          palace.majorStars.forEach((star, starIndex) => {
            console.log(`    ${starIndex + 1}. ${star.name} ${star.brightness || ''}`);
          });
        }
        
        // 检查辅星
        if (palace.minorStars) {
          console.log(`  辅星数量: ${palace.minorStars.length}`);
          palace.minorStars.forEach((star, starIndex) => {
            console.log(`    ${starIndex + 1}. ${star.name} ${star.brightness || ''}`);
          });
        }
      });
    }
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.write(JSON.stringify(testData));
req.end();
