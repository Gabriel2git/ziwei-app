const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

class DocumentProcessor {
  constructor(documentsDir) {
    this.documentsDir = documentsDir;
  }

  // 读取目录下所有文档
  async processAllDocuments() {
    const documents = [];
    const categories = fs.readdirSync(this.documentsDir);

    for (const category of categories) {
      const categoryPath = path.join(this.documentsDir, category);
      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath);
        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          if (fs.statSync(filePath).isFile()) {
            try {
              const document = await this.processDocument(filePath, category);
              if (document) {
                documents.push(document);
              }
            } catch (error) {
              console.error(`处理文档失败: ${filePath}`, error);
            }
          }
        }
      }
    }

    return documents;
  }

  // 处理单个文档
  async processDocument(filePath, category) {
    const ext = path.extname(filePath).toLowerCase();
    let content = '';

    switch (ext) {
      case '.pdf':
        content = await this.parsePDF(filePath);
        break;
      case '.txt':
        content = this.parseTXT(filePath);
        break;
      default:
        console.warn(`不支持的文件类型: ${filePath}`);
        return null;
    }

    if (!content) {
      return null;
    }

    const chunks = this.splitText(content);
    return {
      filePath,
      category,
      fileName: path.basename(filePath),
      content,
      chunks
    };
  }

  // 解析 PDF 文档
  async parsePDF(filePath) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (error) => {
        console.error('PDF解析失败:', error);
        resolve('');
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        let text = '';
        
        try {
          // 提取文本内容
          if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
            pdfData.formImage.Pages.forEach(page => {
              if (page.Texts) {
                page.Texts.forEach(textItem => {
                  if (textItem.R) {
                    textItem.R.forEach(r => {
                      if (r.T) {
                        text += decodeURIComponent(r.T);
                      }
                    });
                    text += ' ';
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('提取PDF文本失败:', error);
        }
        
        resolve(text);
      });
      
      // 加载 PDF 文件
      pdfParser.loadPDF(filePath);
    });
  }

  // 解析 TXT 文档
  parseTXT(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  // 文本分割
  splitText(text, chunkSize = 800, overlap = 100) {
    const chunks = [];
    let start = 0;
    const textLength = text.length;

    while (start < textLength) {
      const end = Math.min(start + chunkSize, textLength);
      const chunk = text.substring(start, end);
      chunks.push(chunk);
      start += chunkSize - overlap;
    }

    return chunks;
  }

  // 文本预处理
  preprocessText(text) {
    // 移除多余的空白字符
    return text
      .replace(/\s+/g, ' ') // 替换多个空白字符为单个空格
      .trim() // 移除首尾空白
      .replace(/\n/g, ' '); // 替换换行符为空格
  }
}

module.exports = DocumentProcessor;