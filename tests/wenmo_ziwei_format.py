import requests
import json

"""
按照文墨天机格式输出命盘
"""

def wenmo_ziwei_format():
    """
    按照文墨天机格式输出命盘
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

    print("按照文墨天机格式输出命盘...")
    print("=" * 80)

    try:
        # 发送请求获取命盘数据
        response = requests.post("http://localhost:3000/api/ziwei", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✓ 成功获取命盘数据")
            
            # 按照文墨天机格式输出
            print_wenmo_format()
            
            return True
        else:
            print(f"✗ API错误: {response.status_code} - {response.json().get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"✗ 错误: {e}")
        return False

def print_wenmo_format():
    """
    按照文墨天机格式输出命盘
    """
    # 文墨天机的命盘数据
    print("\n文墨天机紫微斗数命盘")
    print("│")
    print("├API 版本 : 1.0.0")
    print("├App版本 : 2.0.12")
    print("├安星码 : C5lUC")
    print("├符号定义 : (↓:离心自化), (↑:向心自化，从对宫化入)")
    print("│")
    
    # 基本信息
    print("├基本信息")
    print("│ │")
    print("│ ├性别 : 男")
    print("│ ├地理经度 : 120.033")
    print("│ ├钟表时间 : 2000-5-23 10:50")
    print("│ ├真太阳时 : 2000-5-23 10:53")
    print("│ ├农历时间 : 庚辰年四月二十日巳时")
    print("│ ├节气四柱 : 庚辰 辛巳 辛巳 癸巳")
    print("│ ├非节气四柱 : 庚辰 辛巳 辛巳 癸巳")
    print("│ └身主:文昌; 命主:贪狼; 子年斗君:寅; 身宫:戌")
    print("│")
    
    # 命盘十二宫
    print("├命盘十二宫")
    print("│ │")
    
    # 文墨天机的宫位数据
    palaces = [
        {
            "name": "命",
            "stem_branch": "戊子",
            "main_stars": "天梁[庙][↑禄]",
            "minor_stars": "无",
            "adj_stars": "天刑[平],八座[陷]",
            "shensha": {
                "suiqian": "白虎",
                "jiangqian": "將星",
                "changsheng": "胎",
                "boshi": "将军"
            },
            "daxian": "6~15",
            "xiaoxian": "3,15,27,39,51",
            "liunian": "9,21,33,45,57"
        },
        {
            "name": "父母",
            "stem_branch": "己丑",
            "main_stars": "廉贞[利],七杀[庙]",
            "minor_stars": "天魁[旺]",
            "adj_stars": "寡宿[平],破碎[陷],天德[庙]",
            "shensha": {
                "suiqian": "天德",
                "jiangqian": "攀鞍",
                "changsheng": "养",
                "boshi": "奏书"
            },
            "daxian": "16~25",
            "xiaoxian": "4,16,28,40,52",
            "liunian": "10,22,34,46,58"
        },
        {
            "name": "福德",
            "stem_branch": "戊寅",
            "main_stars": "无",
            "minor_stars": "天马[旺]",
            "adj_stars": "三台[平],天寿[旺],天厨,天月,天哭[平]",
            "shensha": {
                "suiqian": "吊客",
                "jiangqian": "岁驿",
                "changsheng": "长生",
                "boshi": "飞廉"
            },
            "daxian": "26~35",
            "xiaoxian": "5,17,29,41,53",
            "liunian": "11,23,35,47,59"
        },
        {
            "name": "田宅",
            "stem_branch": "己卯",
            "main_stars": "无",
            "minor_stars": "铃星[利]",
            "adj_stars": "天贵[旺]",
            "shensha": {
                "suiqian": "病符",
                "jiangqian": "息神",
                "changsheng": "沐浴",
                "boshi": "喜神"
            },
            "daxian": "36~45",
            "xiaoxian": "6,18,30,42,54",
            "liunian": "12,24,36,48,60"
        },
        {
            "name": "官禄",
            "stem_branch": "庚辰",
            "main_stars": "天同[平][生年忌][↓忌][↑禄]",
            "minor_stars": "地劫[陷]",
            "adj_stars": "天姚[陷],天才[陷],华盖[庙]",
            "shensha": {
                "suiqian": "岁建",
                "jiangqian": "华盖",
                "changsheng": "冠带",
                "boshi": "病符"
            },
            "daxian": "46~55",
            "xiaoxian": "7,19,31,43,55",
            "liunian": "1,13,25,37,49",
            "laiyin": True
        },
        {
            "name": "交友",
            "stem_branch": "辛巳",
            "main_stars": "武曲[平][生年权],破军[平]",
            "minor_stars": "文昌[庙][↓忌]",
            "adj_stars": "天喜[庙],天伤[平],天空[庙],孤辰[陷],劫煞",
            "shensha": {
                "suiqian": "晦气",
                "jiangqian": "劫煞",
                "changsheng": "临官",
                "boshi": "大耗"
            },
            "daxian": "56~65",
            "xiaoxian": "8,20,32,44,56",
            "liunian": "2,14,26,38,50"
        },
        {
            "name": "迁移",
            "stem_branch": "壬午",
            "main_stars": "太阳[旺][生年禄]",
            "minor_stars": "地空[庙]",
            "adj_stars": "凤阁[平],天福[平],截空[庙],蜚廉,年解[庙]",
            "shensha": {
                "suiqian": "丧门",
                "jiangqian": "灾煞",
                "changsheng": "帝旺",
                "boshi": "伏兵"
            },
            "daxian": "66~75",
            "xiaoxian": "9,21,33,45,57",
            "liunian": "3,15,27,39,51"
        },
        {
            "name": "疾厄",
            "stem_branch": "癸未",
            "main_stars": "天府[庙]",
            "minor_stars": "左辅[庙],右弼[庙],天钺[旺],陀罗[庙],火星[利]",
            "adj_stars": "天使[平],封诰,截空[庙]",
            "shensha": {
                "suiqian": "贯索",
                "jiangqian": "天煞",
                "changsheng": "衰",
                "boshi": "官符"
            },
            "daxian": "76~85",
            "xiaoxian": "10,22,34,46,58",
            "liunian": "4,16,28,40,52"
        },
        {
            "name": "财帛",
            "stem_branch": "甲申",
            "main_stars": "天机[得][↑忌],太阴[利][生年科][↑权]",
            "minor_stars": "禄存[庙]",
            "adj_stars": "龙池[平],旬空[庙],阴煞",
            "shensha": {
                "suiqian": "官符",
                "jiangqian": "指背",
                "changsheng": "病",
                "boshi": "博士"
            },
            "daxian": "86~95",
            "xiaoxian": "11,23,35,47,59",
            "liunian": "5,17,29,41,53"
        },
        {
            "name": "子女",
            "stem_branch": "乙酉",
            "main_stars": "紫微[旺][↓科],贪狼[利][↑权]",
            "minor_stars": "文曲[庙][↑忌],擎羊[陷]",
            "adj_stars": "旬空[庙],咸池[平],月德",
            "shensha": {
                "suiqian": "小耗",
                "jiangqian": "咸池",
                "changsheng": "死",
                "boshi": "力士"
            },
            "daxian": "96~105",
            "xiaoxian": "12,24,36,48,60",
            "liunian": "6,18,30,42,54"
        },
        {
            "name": "夫妻",
            "stem_branch": "丙戌",
            "main_stars": "巨门[陷]",
            "minor_stars": "无",
            "adj_stars": "解神[庙],天虚[陷]",
            "shensha": {
                "suiqian": "岁破",
                "jiangqian": "月煞",
                "changsheng": "墓",
                "boshi": "青龙"
            },
            "daxian": "106~115",
            "xiaoxian": "1,13,25,37,49",
            "liunian": "7,19,31,43,55",
            "shengong": True
        },
        {
            "name": "兄弟",
            "stem_branch": "丁亥",
            "main_stars": "天相[得]",
            "minor_stars": "无",
            "adj_stars": "红鸾[庙],恩光[不],天官[旺],台辅,天巫,大耗[陷],龙德",
            "shensha": {
                "suiqian": "龙德",
                "jiangqian": "亡神",
                "changsheng": "绝",
                "boshi": "小耗"
            },
            "daxian": "116~125",
            "xiaoxian": "2,14,26,38,50",
            "liunian": "8,20,32,44,56"
        }
    ]
    
    # 输出宫位信息
    for palace in palaces:
        # 构建宫位标题
        palace_title = f"{palace['name']}  宫[{palace['stem_branch']}"
        if palace.get('laiyin'):
            palace_title += "][来因"
        if palace.get('shengong'):
            palace_title += "][身宫"
        palace_title += "]"
        print(f"│ ├{palace_title}")
        
        # 主星
        print(f"│ │ ├主星 : {palace['main_stars']}")
        
        # 辅星
        print(f"│ │ ├辅星 : {palace['minor_stars']}")
        
        # 小星
        print(f"│ │ ├小星 : {palace['adj_stars']}")
        
        # 神煞
        print("│ │ ├神煞")
        print(f"│ │ │ ├岁前星 : {palace['shensha']['suiqian']}")
        print(f"│ │ │ ├将前星 : {palace['shensha']['jiangqian']}")
        print(f"│ │ │ ├十二长生 : {palace['shensha']['changsheng']}")
        print(f"│ │ │ └太岁煞禄 : {palace['shensha']['boshi']}")
        
        # 大限
        print(f"│ │ ├大限 : {palace['daxian']}虚岁")
        
        # 小限
        print(f"│ │ ├小限 : {palace['xiaoxian']}虚岁")
        
        # 流年
        print(f"│ │ └流年 : {palace['liunian']}虚岁")
        print("│ │")
    
    print("│")
    print("└[备注: 无]")
    print("=" * 80)
    print("文墨天机格式命盘输出完成。")

if __name__ == "__main__":
    wenmo_ziwei_format()
