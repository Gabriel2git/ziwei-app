import requests
import json

"""
分析API返回的星星数据结构
"""

def analyze_star_data():
    """
    分析API返回的星星数据结构
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

    print("分析API返回的星星数据结构...")
    print("=" * 80)

    try:
        # 发送请求获取命盘数据
        response = requests.post("http://localhost:3000/api/ziwei", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✓ 成功获取命盘数据")
            
            # 分析星星数据结构
            analyze_stars(data)
            
            return True
        else:
            print(f"✗ API错误: {response.status_code} - {response.json().get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"✗ 错误: {e}")
        return False

def analyze_stars(data):
    """
    分析星星数据结构
    """
    print("\n=== 分析星星数据结构 ===")
    
    # 宫位顺序：命宫、父母宫、福德宫、田宅宫、官禄宫、交友宫、迁移宫、疾厄宫、财帛宫、子女宫、夫妻宫、兄弟宫
    palace_order = ['命宫', '父母', '福德', '田宅', '官禄', '仆役', '迁移', '疾厄', '财帛', '子女', '夫妻', '兄弟']
    
    for palace_name in palace_order:
        # 查找对应的宫位
        palace = None
        for p in data['astrolabe'].get('palaces', []):
            if p['name'] == palace_name:
                palace = p
                break
        
        if palace:
            print(f"\n=== {palace['name']}[{palace['heavenlyStem']}{palace['earthlyBranch']}] ===")
            
            # 分析主星
            print("\n主星:")
            for star in palace.get('majorStars', []):
                print(f"  - {star['name']}")
                print(f"    亮度: {star.get('brightness')}")
                print(f"    四化: {star.get('mutagen')}")
                print(f"    生年四化: {star.get('yearMutagen')}")
                print(f"    自化: {star.get('selfMutagen')}")
                print(f"    所有属性: {list(star.keys())}")
            
            # 分析辅星
            print("\n辅星:")
            for star in palace.get('minorStars', []):
                print(f"  - {star['name']}")
                print(f"    亮度: {star.get('brightness')}")
                print(f"    四化: {star.get('mutagen')}")
                print(f"    所有属性: {list(star.keys())}")
            
            # 分析小星
            print("\n小星:")
            for star in palace.get('adjectiveStars', [])[:10]:
                print(f"  - {star['name']}")
                print(f"    亮度: {star.get('brightness')}")
                print(f"    所有属性: {list(star.keys())}")

if __name__ == "__main__":
    analyze_star_data()
