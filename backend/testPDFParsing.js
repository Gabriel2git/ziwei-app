const DocumentProcessor = require('./utils/documentProcessor');
const path = require('path');

async function testPDFParsing() {
  console.log('测试PDF解析功能...');
  
  const documentsDir = path.join(__dirname, 'data', 'documents');
  const processor = new DocumentProcessor(documentsDir);
  
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
        console.log(`  文件类型: ${path.extname(doc.fileName)}`);
      });
    } else {
      console.log('没有处理到任何文档');
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testPDFParsing().catch(console.error);
