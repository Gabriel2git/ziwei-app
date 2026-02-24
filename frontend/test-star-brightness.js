// 测试后端返回的星曜数据结构
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
      
      // 检查第一个宫位的星曜数据结构
      const firstPalace = result.astrolabe.palaces[0];
      console.log('\n第一个宫位:', firstPalace.name);
      
      // 检查主星
      if (firstPalace.majorStars) {
        console.log('主星数量:', firstPalace.majorStars.length);
        console.log('第一个主星:', firstPalace.majorStars[0]);
      }
      
      // 检查辅星
      if (firstPalace.minorStars) {
        console.log('\n辅星数量:', firstPalace.minorStars.length);
        console.log('前5个辅星:', firstPalace.minorStars.slice(0, 5));
      }
      
      // 检查杂曜
      if (firstPalace.adjectiveStars) {
        console.log('\n杂曜数量:', firstPalace.adjectiveStars.length);
        console.log('前5个杂曜:', firstPalace.adjectiveStars.slice(0, 5));
      }
    }
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.write(JSON.stringify(testData));
req.end();
