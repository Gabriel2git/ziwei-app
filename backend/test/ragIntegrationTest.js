const axios = require('axios');

async function testRAGIntegration() {
  console.log('测试RAG集成功能...');
  
  const API_BASE_URL = 'http://localhost:3001';
  
  // 测试问题列表
  const testQuestions = [
    '紫微斗数中如何看婚姻运势？',
    '什么是紫微斗数的四化？',
    '如何通过紫微斗数看事业发展？',
    '紫微斗数中的命宫代表什么？',
    '如何分析紫微斗数中的格局？'
  ];
  
  for (const question of testQuestions) {
    console.log(`\n测试问题: ${question}`);
    
    try {
      // 调用RAG检索API
      const ragResponse = await axios.post(`${API_BASE_URL}/api/rag/search`, {
        query: question,
        topK: 3
      });
      
      console.log('RAG检索结果:');
      console.log('上下文长度:', ragResponse.data.context.length);
      console.log('检索到的资料数量:', ragResponse.data.results.length);
      
      if (ragResponse.data.context) {
        console.log('上下文预览:', ragResponse.data.context.substring(0, 200) + '...');
      } else {
        console.log('未检索到相关资料');
      }
      
    } catch (error) {
      console.error('测试失败:', error.message);
    }
  }
  
  console.log('\nRAG集成测试完成！');
}

testRAGIntegration().catch(console.error);
