import requests
import json

# 测试数据：2000-5-23 10:50，男，巳时（5）
test_data = {
    "birthday": "2000-5-23",
    "hourIndex": 5,
    "gender": "男",
    "isLunar": False,
    "isLeap": False,
    "targetYear": 2026
}

# 发送请求
try:
    response = requests.post("http://localhost:3000/api/ziwei", json=test_data, timeout=10)
    if response.status_code == 200:
        data = response.json()
        # 保存数据到文件以便分析
        with open('ziwei_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("数据获取成功，已保存到 ziwei_data.json")
        
        # 打印基本结构
        print("\n数据结构:")
        print(f"astrolabe 包含字段: {list(data['astrolabe'].keys())}")
        print(f"horoscope 包含字段: {list(data['horoscope'].keys())}")
        print(f"targetYear: {data['targetYear']}")
        
        # 打印宫位数据结构
        if 'palaces' in data['astrolabe']:
            print(f"\n宫位数量: {len(data['astrolabe']['palaces'])}")
            print(f"第一个宫位字段: {list(data['astrolabe']['palaces'][0].keys())}")
    else:
        print(f"API错误: {response.status_code} - {response.json().get('error', 'Unknown error')}")
except Exception as e:
    print(f"错误: {e}")
