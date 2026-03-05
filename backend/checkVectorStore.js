const fs = require('fs');

function checkVectorStore() {
  try {
    const data = JSON.parse(fs.readFileSync('data/vectorStore.json', 'utf8'));
    console.log('向量存储检查结果:');
    console.log('================================');
    console.log('文档数量:', data.documents?.length || 0);
    console.log('向量数量:', data.embeddings?.length || 0);
    
    if (data.documents) {
      console.log('\n包含的文档:');
      data.documents.forEach((doc, i) => {
        console.log(`文档 ${i+1}: ${doc.fileName}`);
        console.log(`  路径: ${doc.filePath}`);
        console.log(`  分块数量: ${doc.chunks?.length || 0}`);
      });
    }
    
    console.log('\n================================');
    console.log('检查完成！');
  } catch (error) {
    console.error('检查向量存储失败:', error.message);
  }
}

checkVectorStore();
