const http = require('http');
const iztro = require('iztro');
const port = 3000;

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

      // 构建排盘函数调用
      let astrolabe;
      if (isLunar) {
        astrolabe = iztro.astro.byLunar(birthday, hourIndex, gender, isLeap, true, 'zh-CN');
      } else {
        astrolabe = iztro.astro.bySolar(birthday, hourIndex, gender, true, 'zh-CN');
      }

      // 计算目标年份的运势
      const targetDateStr = `${targetYear}-06-15`;
      const horoscope = astrolabe.horoscope(targetDateStr, hourIndex);

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

