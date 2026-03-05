const DocumentProcessor = require('./utils/documentProcessor');
const VectorStore = require('./utils/vectorStore');
const path = require('path');

async function testDocumentProcessing() {
  console.log('测试文档处理功能...');
  
  const documentsDir = path.join(__dirname, 'data', 'documents');
  const processor = new DocumentProcessor(documentsDir);
  const vectorStore = new VectorStore();
  
  try {
    // 处理所有文档
    const documents = await processor.processAllDocuments();
    console.log('处理完成的文档数量:', documents.length);
    
    if (documents.length > 0) {
      console.log('\n处理的文档:');
      documents.forEach((doc, i) => {
        console.log(`文档 ${i+1}: ${doc.fileName}`);
        console.log(`  类别: ${doc.category}`);
        console.log(`  内容长度: ${doc.content.length}`);
        console.log(`  分块数量: ${doc.chunks.length}`);
      });
      
      // 向量化文档
      console.log('\n开始向量化文档...');
      await vectorStore.embedDocuments(documents);
      console.log('向量化完成，向量数量:', vectorStore.embeddings.length);
      
      // 保存向量存储
      const vectorStorePath = path.join(__dirname, 'data', 'vectorStore.json');
      vectorStore.save(vectorStorePath);
      console.log('向量存储已保存到:', vectorStorePath);
    } else {
      console.log('没有处理到任何文档');
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDocumentProcessing().catch(console.error);
