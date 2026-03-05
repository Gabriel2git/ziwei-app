const path = require('path');
const DocumentProcessor = require('./documentProcessor');
const VectorStore = require('./vectorStore');

async function testVectorStore() {
  const documentsDir = path.join(__dirname, '../data/documents');
  const processor = new DocumentProcessor(documentsDir);
  const vectorStore = new VectorStore();

  console.log('开始测试向量存储模块...');

  try {
    // 1. 处理文档
    console.log('1. 处理文档...');
    const documents = await processor.processAllDocuments();
    console.log(`成功处理 ${documents.length} 个文档`);

    // 2. 向量化文档
    console.log('\n2. 向量化文档...');
    await vectorStore.embedDocuments(documents);
    console.log(`成功向量化 ${vectorStore.embeddings.length} 个文本块`);

    // 3. 测试搜索
    console.log('\n3. 测试搜索...');
    const query = '紫微斗数的基本概念';
    const searchResults = await vectorStore.search(query, 3);
    console.log(`搜索结果 (${searchResults.length} 条):`);
    searchResults.forEach((result, index) => {
      console.log(`\n结果 ${index + 1} (相似度: ${result.similarity.toFixed(4)}):`);
      console.log(`分类: ${result.document.category}`);
      console.log(`文档: ${result.document.fileName}`);
      console.log(`内容: ${result.chunk.substring(0, 150)}...`);
    });

    // 4. 测试重排序
    console.log('\n4. 测试重排序...');
    try {
      const rerankedResults = await vectorStore.rerank(query, searchResults);
      if (rerankedResults && Array.isArray(rerankedResults)) {
        console.log(`重排序结果 (${rerankedResults.length} 条):`);
        rerankedResults.forEach((result, index) => {
          console.log(`\n结果 ${index + 1}:`);
          console.log(`内容: ${result.text ? result.text.substring(0, 150) : result.chunk.substring(0, 150)}...`);
          if (result.relevance_score) {
            console.log(`相关度得分: ${result.relevance_score.toFixed(4)}`);
          }
        });
      } else {
        console.log('重排序 API 调用失败，使用原始搜索结果');
      }
    } catch (error) {
      console.log('重排序测试失败:', error.message);
    }

    // 5. 保存和加载测试
    console.log('\n5. 测试保存和加载...');
    const savePath = path.join(__dirname, '../data/vectorStore.json');
    vectorStore.save(savePath);
    console.log('向量存储保存成功');

    const newVectorStore = new VectorStore();
    newVectorStore.load(savePath);
    console.log(`加载后向量数量: ${newVectorStore.embeddings.length}`);

    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testVectorStore();