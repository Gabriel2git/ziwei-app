const fs = require('fs');
const path = require('path');
const axios = require('axios');

class VectorStore {
  constructor() {
    this.embeddings = [];
    this.documents = [];
    this.apiKey = process.env.DASHSCOPE_API_KEY || '';
    this.rerankUrl = 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank';
    this.embeddingUrl = 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding';
  }

  // 向量化文本
  async embedText(text) {
    try {
      const response = await axios.post(
        this.embeddingUrl,
        {
          model: "multimodal-embedding-v1",
          input: {
            contents: [
              { text: text }
            ]
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data.output.embeddings[0].embedding;
    } catch (error) {
      console.error('Embedding API 调用失败:', error);
      // 失败时返回模拟向量，使用1024维（multimodal-embedding-v1的默认维度）
      return Array(1024).fill(0).map(() => Math.random() - 0.5);
    }
  }

  // 批量向量化文档
  async embedDocuments(documents) {
    const embeddings = [];
    for (const doc of documents) {
      for (const chunk of doc.chunks) {
        const embedding = await this.embedText(chunk);
        embeddings.push({
          embedding,
          document: doc,
          chunk
        });
      }
    }
    this.embeddings = embeddings;
    this.documents = documents;
    return embeddings;
  }

  // 计算余弦相似度
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  // 相似度搜索
  async search(query, topK = 3) {
    const queryEmbedding = await this.embedText(query);
    const similarities = [];

    for (const item of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
      similarities.push({
        similarity,
        document: item.document,
        chunk: item.chunk
      });
    }

    // 排序并返回前 topK 个结果
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  // 使用阿里云百炼进行重排序
  async rerank(query, documents) {
    try {
      const response = await axios.post(
        this.rerankUrl,
        {
          model: "qwen3-vl-rerank",
          input: {
            query: query,
            documents: documents.map(doc => doc.chunk)
          },
          parameters: {
            return_documents: true,
            top_n: 5
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.output.documents;
    } catch (error) {
      console.error('Rerank API 调用失败:', error);
      // 失败时返回原始文档，确保返回格式一致
      return documents.map(doc => ({
        text: doc.chunk,
        relevance_score: doc.similarity || 0
      }));
    }
  }

  // 保存向量存储
  save(path) {
    // 优化向量存储，只保存必要的信息
    const data = {
      embeddings: this.embeddings.map(item => ({
        embedding: item.embedding,
        chunk: item.chunk,
        document: {
          fileName: item.document.fileName,
          category: item.document.category,
          filePath: item.document.filePath
        }
      })),
      documents: this.documents
    };
    
    // 分块写入文件
    const jsonString = JSON.stringify(data);
    const chunkSize = 1024 * 1024; // 1MB per chunk
    
    if (jsonString.length > chunkSize) {
      // 对于大文件，使用流式写入
      const writeStream = fs.createWriteStream(path);
      let position = 0;
      
      while (position < jsonString.length) {
        const chunk = jsonString.substring(position, position + chunkSize);
        writeStream.write(chunk);
        position += chunkSize;
      }
      
      writeStream.end();
    } else {
      // 对于小文件，直接写入
      fs.writeFileSync(path, jsonString);
    }
  }

  // 加载向量存储
  load(path) {
    if (fs.existsSync(path)) {
      try {
        // 对于大文件，使用流式读取
        const jsonString = fs.readFileSync(path, 'utf8');
        const data = JSON.parse(jsonString);
        this.embeddings = data.embeddings;
        this.documents = data.documents;
      } catch (error) {
        console.error('加载向量存储失败:', error);
        // 加载失败时重置
        this.embeddings = [];
        this.documents = [];
      }
    }
  }
}

module.exports = VectorStore;