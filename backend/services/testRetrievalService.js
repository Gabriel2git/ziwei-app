const RetrievalService = require('./retrievalService');

async function testRetrievalService() {
  const service = new RetrievalService();

  console.log('开始测试检索服务...');

  try {
    // 1. 初始化服务
    console.log('1. 初始化检索服务...');
    await service.initialize();

    // 2. 获取文档统计信息
    console.log('\n2. 获取文档统计信息...');
    const stats = await service.getDocumentStats();
    console.log(`文档统计: 总向量数 ${stats.totalEmbeddings}, 总文档数 ${stats.totalDocuments}`);

    // 3. 测试搜索
    console.log('\n3. 测试搜索...');
    const queries = [
      '紫微斗数的基本概念',
      '紫微斗数的排盘方法',
      '紫微斗数的分析方法'
    ];

    for (const query of queries) {
      console.log(`\n搜索查询: ${query}`);
      const results = await service.search(query, 3);
      console.log(`搜索结果 (${results.length} 条):`);
      
      results.forEach((result, index) => {
        console.log(`\n结果 ${index + 1}:`);
        console.log(`内容: ${(result.text || result.chunk).substring(0, 150)}...`);
        if (result.relevance_score) {
          console.log(`相关度得分: ${result.relevance_score.toFixed(4)}`);
        }
      });

      // 4. 测试上下文构建
      console.log('\n4. 测试上下文构建...');
      const context = service.buildContext(results);
      console.log(`构建的上下文 (${context.length} 字符):`);
      console.log(context.substring(0, 300) + '...');
    }

    // 5. 测试刷新向量存储
    console.log('\n5. 测试刷新向量存储...');
    await service.refreshVectorStore();
    console.log('向量存储刷新成功');

    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testRetrievalService();