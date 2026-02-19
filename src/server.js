const http = require('http');
const iztro = require('iztro');

// 计算真太阳时的函数
function calculateTrueSolarTime(year, month, day, hour, minute, longitude) {
  // 计算时区修正（经度每15度为一个时区）
  const timezoneOffset = longitude / 15;
  
  // 计算平太阳时（考虑时区修正）
  const meanSolarTime = hour + minute / 60 + timezoneOffset - 8; // 减去8是因为北京时间是东八区
  
  // 简化的真太阳时修正（实际计算更复杂，这里使用简化版）
  // 真太阳时 = 平太阳时 + 时差（简化为0）
  const trueSolarTime = meanSolarTime;
  
  // 确保时间在0-24范围内
  const normalizedTime = trueSolarTime % 24;
  return normalizedTime < 0 ? normalizedTime + 24 : normalizedTime;
}

// 根据真太阳时计算时辰索引
function getShichenIndexFromTrueSolarTime(trueSolarTime) {
  // 每个时辰对应2小时
  return Math.floor(trueSolarTime / 2);
}
const port = 3001;

// 解析 JSON 请求体的函数
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 健康检查接口
  if (req.method === 'GET' && req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // 排盘 API 接口
  if (req.method === 'POST' && req.url === '/api/ziwei') {
    try {
      const body = await parseRequestBody(req);
      const { birthday, hourIndex, gender, isLunar, isLeap, targetYear } = body;
      
      if (!birthday || hourIndex === undefined || !gender) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing required parameters' }));
        return;
      }

      // 获取经度值，默认为120.033（北京时间）
      const longitude = body.longitude || 120.033;
      
      // 解析生日字符串，获取年、月、日
      const dateParts = birthday.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      
      // 解析出生时间，获取时、分
      const hour = Math.floor(hourIndex);
      const minute = body.minute || 0; // 使用前端传递的分钟数
      
      // 计算真太阳时
      const trueSolarTime = calculateTrueSolarTime(year, month, day, hour, minute, longitude);
      
      // 根据真太阳时计算时辰索引
      const trueHourIndex = getShichenIndexFromTrueSolarTime(trueSolarTime);

      // 构建排盘函数调用
      let astrolabe;
      if (isLunar) {
        astrolabe = iztro.astro.byLunar(birthday, trueHourIndex, gender, isLeap, true, 'zh-CN');
      } else {
        astrolabe = iztro.astro.bySolar(birthday, trueHourIndex, gender, true, 'zh-CN');
      }
      
      // 计算运势（包含大限和流年信息）
      const horoscope = iztro.astro.getHoroscope(astrolabe, targetYear || new Date().getFullYear());
      
      // 将真太阳时信息添加到返回数据中
      astrolabe.trueSolarTime = trueSolarTime;
      astrolabe.originalHourIndex = hourIndex;
      astrolabe.adjustedHourIndex = trueHourIndex;

      // 返回结果
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        astrolabe: astrolabe,
        horoscope: horoscope,
        targetYear: targetYear
      }));

    } catch (error) {
      console.error('Error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // 404 处理
  res.statusCode = 404;
  res.end();
});

// 启动服务器
server.listen(port, () => {
  console.log(`Ziwei server running at http://localhost:${port}`);
});

