const fs = require('fs');
const path = require('path');
const DocumentProcessor = require('./documentProcessor');

async function testDocumentProcessor() {
  const documentsDir = path.join(__dirname, '../data/documents');
  const processor = new DocumentProcessor(documentsDir);

  console.log('开始测试文档处理模块...');
  console.log(`文档目录: ${documentsDir}`);

  try {
    // 列出目录结构
    console.log('\n列出目录结构:');
    const categories = fs.readdirSync(documentsDir);
    console.log(`发现 ${categories.length} 个分类目录: ${categories.join(', ')}`);

    for (const category of categories) {
      const categoryPath = path.join(documentsDir, category);
      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath);
        console.log(`分类 ${category} 包含 ${files.length} 个文件: ${files.join(', ')}`);
      }
    }

    // 测试处理所有文档
    const documents = await processor.processAllDocuments();
    console.log(`\n成功处理 ${documents.length} 个文档`);

    // 打印处理结果
    documents.forEach((doc, index) => {
      console.log(`\n文档 ${index + 1}: ${doc.fileName}`);
      console.log(`分类: ${doc.category}`);
      console.log(`内容长度: ${doc.content.length} 字符`);
      console.log(`分块数量: ${doc.chunks.length}`);
      if (doc.chunks.length > 0) {
        console.log(`第一块内容: ${doc.chunks[0].substring(0, 200)}...`);
      }
    });

    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDocumentProcessor();