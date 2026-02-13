import os
from openai import OpenAI

# 测试API调用
def test_api():
    print("测试AI API连接...")
    
    # 获取API密钥
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        print("错误: 未设置DASHSCOPE_API_KEY环境变量")
        return False
    
    print(f"API密钥: {api_key[:8]}...")
    
    try:
        # 创建OpenAI客户端
        client = OpenAI(
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            api_key=api_key
        )
        
        # 测试简单的对话
        response = client.chat.completions.create(
            model="qwen3-max",
            messages=[
                {"role": "system", "content": "你是一个测试助手"},
                {"role": "user", "content": "测试连接"}
            ],
            temperature=0.7
        )
        
        print("API调用成功!")
        print(f"响应: {response.choices[0].message.content}")
        return True
    
    except Exception as e:
        print(f"API调用失败: {e}")
        return False

if __name__ == "__main__":
    test_api()
