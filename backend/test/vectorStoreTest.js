const VectorStore = require('../utils/vectorStore');

async function testVectorStore() {
  console.log('测试向量存储功能...');
  
  // 创建向量存储实例
  const vectorStore = new VectorStore();
  
  // 测试文本向量化
  console.log('测试文本向量化...');
  const testText = "衣服的质量杠杠的，很漂亮，不枉我等了这么久啊，喜欢，以后还来这里买";
  const embedding = await vectorStore.embedText(testText);
  console.log('文本向量长度:', embedding.length);
  console.log('向量前5个值:', embedding.slice(0, 5));
  
  // 测试文档向量化
  console.log('\n测试文档向量化...');
  const testDocuments = [
    {
      id: '1',
      title: '测试文档1',
      content: '这是第一个测试文档，包含一些测试内容。',
      chunks: ['这是第一个测试文档', '包含一些测试内容']
    },
    {
      id: '2',
      title: '测试文档2',
      content: '这是第二个测试文档，包含更多测试内容。',
      chunks: ['这是第二个测试文档', '包含更多测试内容']
    }
  ];
  
  await vectorStore.embedDocuments(testDocuments);
  console.log('文档向量数量:', vectorStore.embeddings.length);
  
  // 测试相似度搜索
  console.log('\n测试相似度搜索...');
  const searchResults = await vectorStore.search('测试文档');
  console.log('搜索结果数量:', searchResults.length);
  searchResults.forEach((result, index) => {
    console.log(`结果 ${index + 1}: 相似度 ${result.similarity.toFixed(4)}, 内容: ${result.chunk}`);
  });
  
  // 测试重排序
  console.log('\n测试重排序...');
  try {
    const rerankResults = await vectorStore.rerank('测试文档', searchResults);
    if (Array.isArray(rerankResults)) {
      console.log('重排序结果数量:', rerankResults.length);
      rerankResults.forEach((result, index) => {
        console.log(`结果 ${index + 1}: 相关性 ${result.relevance_score?.toFixed(4) || 'N/A'}, 内容: ${result.text || result.chunk}`);
      });
    } else {
      console.log('重排序结果不是数组，使用原始搜索结果');
      searchResults.forEach((result, index) => {
        console.log(`结果 ${index + 1}: 相似度 ${result.similarity.toFixed(4)}, 内容: ${result.chunk}`);
      });
    }
  } catch (error) {
    console.error('重排序测试失败:', error);
    console.log('使用原始搜索结果作为替代');
    searchResults.forEach((result, index) => {
      console.log(`结果 ${index + 1}: 相似度 ${result.similarity.toFixed(4)}, 内容: ${result.chunk}`);
    });
  }
  
  console.log('\n测试完成！');
}

testVectorStore().catch(console.error);
