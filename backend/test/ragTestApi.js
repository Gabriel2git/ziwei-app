const axios = require('axios');

async function testRagTestApi() {
  console.log('测试RAG测试API端点...');
  
  const API_BASE_URL = 'http://localhost:3001';
  
  // 测试问题
  const testQuery = '紫微斗数中如何看婚姻运势？';
  
  try {
    // 调用RAG测试API
    const response = await axios.post(`${API_BASE_URL}/api/rag/test`, {
      query: testQuery,
      topK: 3
    });
    
    console.log('API调用成功！');
    console.log('返回结果:');
    console.log('检索到的资料数量:', response.data.results.length);
    console.log('上下文长度:', response.data.context.length);
    console.log('生成的prompt长度:', response.data.prompt.length);
    
    if (response.data.context) {
      console.log('上下文预览:', response.data.context.substring(0, 200) + '...');
    }
    
    if (response.data.prompt) {
      console.log('prompt预览:', response.data.prompt.substring(0, 200) + '...');
    }
    
    console.log('测试完成！');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testRagTestApi().catch(console.error);
