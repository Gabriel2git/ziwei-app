import requests
import json

"""
调试API响应，查看原始数据结构
"""

def debug_api_response():
    """
    调试API响应，查看原始数据结构
    """
    # 测试数据：2000-5-23 10:50，男，巳时（9-11点，对应hourIndex=5）
    test_data = {
        "birthday": "2000-5-23",
        "hourIndex": 5,  # 巳时
        "gender": "男",
        "isLunar": False,
        "isLeap": False,
        "targetYear": 2026
    }

    print("调试API响应，查看原始数据结构...")
    print("=" * 80)

    try:
        # 发送请求获取命盘数据
        response = requests.post("http://localhost:3000/api/ziwei", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✓ 成功获取命盘数据")
            
            # 打印原始数据结构
            print("\n=== 原始数据结构 ===")
            print(f"性别: {data['astrolabe'].get('gender')}")
            print(f"生日: {data['astrolabe'].get('solarDate')}")
            print(f"时辰: {data['astrolabe'].get('time')}")
            print(f"农历: {data['astrolabe'].get('lunarDate')}")
            print(f"四柱: {data['astrolabe'].get('chineseDate')}")
            print(f"身主: {data['astrolabe'].get('body')}")
            print(f"命主: {data['astrolabe'].get('soul')}")
            print(f"身宫: {data['astrolabe'].get('earthlyBranchOfBodyPalace')}")
            
            # 打印宫位信息
            print("\n=== 宫位信息 ===")
            palaces = data['astrolabe'].get('palaces', [])
            print(f"宫位数: {len(palaces)}")
            
            for i, palace in enumerate(palaces):
                print(f"\n宫位{i+1}: {palace.get('name')}[{palace.get('heavenlyStem')}{palace.get('earthlyBranch')}]")
                print(f"  主星: {[s.get('name') for s in palace.get('majorStars', [])]}")
                print(f"  辅星: {[s.get('name') for s in palace.get('minorStars', [])]}")
                print(f"  小星: {[s.get('name') for s in palace.get('adjectiveStars', [])][:10]}")
                print(f"  神煞: {palace.get('suiqian12')}, {palace.get('jiangqian12')}")
                print(f"  大限: {palace.get('decadal', {}).get('range')}")
                print(f"  小限: {palace.get('ages', [])[:10]}")
            
            return True
        else:
            print(f"✗ API错误: {response.status_code} - {response.json().get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"✗ 错误: {e}")
        return False

if __name__ == "__main__":
    debug_api_response()
