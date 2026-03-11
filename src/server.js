const http = require('http');
const iztro = require('iztro');
const RetrievalService = require('../backend/services/retrievalService');

// 加载环境变量
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const port = 3001;

// 初始化检索服务
const retrievalService = new RetrievalService();
retrievalService.initialize().catch(console.error);

// 鉴权中间件 - Bearer Token 标准格式
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  // 提取 Bearer 后面的实际 token
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token !== process.env.AUTH_CODE) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: '功德码无效或已过期' }));
    return;
  }
  next();
}

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

      // 构建排盘函数调用 - 使用 iztro 标准 API
      let astrolabe;
      if (isLunar) {
        astrolabe = iztro.astro.byLunar(birthday, hourIndex, gender, isLeap, true, 'zh-CN');
      } else {
        astrolabe = iztro.astro.bySolar(birthday, hourIndex, gender, true, 'zh-CN');
      }
      
      // 计算运势（包含大限和流年信息）
      const horoscope = iztro.astro.getHoroscope(astrolabe, targetYear || new Date().getFullYear());
      
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

  // RAG 检索 API 接口
  if (req.method === 'POST' && req.url === '/api/rag/search') {
    try {
      const body = await parseRequestBody(req);
      const { query, topK = 3 } = body;
      
      if (!query) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing query parameter' }));
        return;
      }

      // 执行检索
      const results = await retrievalService.search(query, topK);
      
      // 构建上下文
      const context = retrievalService.buildContext(results);

      // 返回结果
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        results: results,
        context: context
      }));

    } catch (error) {
      console.error('RAG search error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // RAG 测试 API 接口
  if (req.method === 'POST' && req.url === '/api/rag/test') {
    try {
      const body = await parseRequestBody(req);
      const { query, topK = 3 } = body;
      
      if (!query) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing query parameter' }));
        return;
      }

      // 执行检索
      const results = await retrievalService.search(query, topK);
      
      // 构建上下文
      const context = retrievalService.buildContext(results);

      // 生成模拟的LLM prompt
      const prompt = `你是一位专业的紫微斗数命理师，根据以下资料回答用户的问题：\n\n${context}\n\n用户问题：${query}\n\n请根据上述资料，提供详细、专业的回答。`;

      // 返回结果
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        results: results,
        context: context,
        prompt: prompt
      }));

    } catch (error) {
      console.error('RAG test error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // 验证邀请码接口
  if (req.method === 'POST' && req.url === '/api/verify-code') {
    try {
      const body = await parseRequestBody(req);
      const { code } = body;
      
      if (!code) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: '请输入邀请码' }));
        return;
      }

      // 验证邀请码
      if (code === process.env.AUTH_CODE) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: '验证成功' }));
      } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: '邀请码错误' }));
      }

    } catch (error) {
      console.error('Verify code error:', error);
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

