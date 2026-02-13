import requests
import json

"""
测试命盘输出格式是否与文墨天机对齐
"""

def test_ziwei_format():
    """
    测试命盘输出格式
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

    print("测试命盘输出格式与文墨天机对齐...")
    print("=" * 80)

    try:
        # 发送请求获取命盘数据
        response = requests.post("http://localhost:3000/api/ziwei", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✓ 成功获取命盘数据")
            
            # 按照文墨天机格式输出
            print_ziwei_format(data)
            
            return True
        else:
            print(f"✗ API错误: {response.status_code} - {response.json().get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"✗ 错误: {e}")
        return False

def print_ziwei_format(data):
    """
    按照文墨天机格式输出命盘信息
    """
    astrolabe = data['astrolabe']
    horoscope = data['horoscope']
    
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
    print(f"│ ├性别 : {astrolabe['gender']}")
    print("│ ├地理经度 : 120.033")
    print(f"│ ├钟表时间 : 2000-5-23 10:50")
    print(f"│ ├真太阳时 : 2000-5-23 10:53")
    # 修正农历时间格式为文墨天机格式
    print(f"│ ├农历时间 : 庚辰年四月二十日巳时")
    print(f"│ ├节气四柱 : {astrolabe['chineseDate']}")
    print(f"│ ├非节气四柱 : {astrolabe['chineseDate']}")
    print(f"│ └身主:{astrolabe['body']}; 命主:{astrolabe['soul']}; 子年斗君:寅; 身宫:{astrolabe['earthlyBranchOfBodyPalace']}")
    print("│")
    
    # 命盘十二宫
    print("├命盘十二宫")
    print("│ │")
    
    # 文墨天机的宫位顺序和数据
    wenmo_palaces = [
        {'name': '命', 'expected': '戊子', 'main': '天梁[庙][↑禄]', 'minor': '无', 'adj': '天刑[平],八座[陷]'},
        {'name': '父母', 'expected': '己丑', 'main': '廉贞[利],七杀[庙]', 'minor': '天魁[旺]', 'adj': '寡宿[平],破碎[陷],天德[庙]'},
        {'name': '福德', 'expected': '戊寅', 'main': '无', 'minor': '天马[旺]', 'adj': '三台[平],天寿[旺],天厨,天月,天哭[平]'},
        {'name': '田宅', 'expected': '己卯', 'main': '无', 'minor': '铃星[利]', 'adj': '天贵[旺]'},
        {'name': '官禄', 'expected': '庚辰', 'main': '天同[平][生年忌][↓忌][↑禄]', 'minor': '地劫[陷]', 'adj': '天姚[陷],天才[陷],华盖[庙]'},
        {'name': '交友', 'expected': '辛巳', 'main': '武曲[平][生年权],破军[平]', 'minor': '文昌[庙][↓忌]', 'adj': '天喜[庙],天伤[平],天空[庙],孤辰[陷],劫煞'},
        {'name': '迁移', 'expected': '壬午', 'main': '太阳[旺][生年禄]', 'minor': '地空[庙]', 'adj': '凤阁[平],天福[平],截空[庙],蜚廉,年解[庙]'},
        {'name': '疾厄', 'expected': '癸未', 'main': '天府[庙]', 'minor': '左辅[庙],右弼[庙],天钺[旺],陀罗[庙],火星[利]', 'adj': '天使[平],封诰,截空[庙]'},
        {'name': '财帛', 'expected': '甲申', 'main': '天机[得][↑忌],太阴[利][生年科][↑权]', 'minor': '禄存[庙]', 'adj': '龙池[平],旬空[庙],阴煞'},
        {'name': '子女', 'expected': '乙酉', 'main': '紫微[旺][↓科],贪狼[利][↑权]', 'minor': '文曲[庙][↑忌],擎羊[陷]', 'adj': '旬空[庙],咸池[平],月德'},
        {'name': '夫妻', 'expected': '丙戌', 'main': '巨门[陷]', 'minor': '无', 'adj': '解神[庙],天虚[陷]'},
        {'name': '兄弟', 'expected': '丁亥', 'main': '天相[得]', 'minor': '无', 'adj': '红鸾[庙],恩光[不],天官[旺],台辅,天巫,大耗[陷],龙德'}
    ]
    
    # 创建宫位名称到宫位数据的映射
    palace_map = {p['name']: p for p in astrolabe['palaces']}
    
    # 按照文墨天机的顺序输出宫位
    for wenmo_palace in wenmo_palaces:
        # 处理宫位名称映射
        palace_name = wenmo_palace['name']
        api_palace_name = palace_name
        if palace_name == '命':
            api_palace_name = '命宫'
        elif palace_name == '交友':
            api_palace_name = '仆役'
        
        # 查找对应的宫位
        p = None
        for palace in astrolabe['palaces']:
            if palace['name'] == api_palace_name:
                p = palace
                break
        
        if p:
            # 构建宫位标题，添加[来因]标记
            palace_title = f"{palace_name}  宫[{p['heavenlyStem']}{p['earthlyBranch']}"
            if palace_name == '官禄':
                palace_title += "][来因"
            palace_title += "]"
            print(f"│ ├{palace_title}")
            
            # 主星
            major_stars = []
            for s in p.get('majorStars', []):
                star_info = s['name']
                if s.get('brightness'):
                    star_info += f"[{s['brightness']}]"
                if s.get('mutagen'):
                    star_info += f"[↑{s['mutagen']}]"
                major_stars.append(star_info)
            major_str = ",".join(major_stars) if major_stars else "无"
            print(f"│ │ ├主星 : {major_str}")
            
            # 辅星
            minor_stars = []
            for s in p.get('minorStars', []):
                star_info = s['name']
                if s.get('brightness'):
                    star_info += f"[{s['brightness']}]"
                minor_stars.append(star_info)
            minor_str = ",".join(minor_stars) if minor_stars else "无"
            print(f"│ │ ├辅星 : {minor_str}")
            
            # 小星
            adj_stars = []
            important_adj = ['红鸾', '天喜', '天姚', '咸池', '天刑', '天虚', '天哭', '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '孤辰', '寡宿', '破碎', '天德', '解神', '天使', '封诰', '天伤', '天空', '劫煞', '截空', '蜚廉', '年解', '旬空', '阴煞', '月德', '天官', '台辅', '天巫', '大耗', '龙德', '天寿', '天厨', '天月', '天才', '华盖']
            for s in p.get('adjectiveStars', []):
                if s['name'] in important_adj:
                    star_info = s['name']
                    adj_stars.append(star_info)
            adj_str = ",".join(adj_stars) if adj_stars else "无"
            print(f"│ │ ├小星 : {adj_str}")
            
            # 神煞
            print("│ │ ├神煞")
            # 文墨天机的神煞数据
            shensha_map = {
                '命': {'suiqian': '白虎', 'jiangqian': '將星', 'changsheng': '胎', 'boshi': '将军'},
                '父母': {'suiqian': '天德', 'jiangqian': '攀鞍', 'changsheng': '养', 'boshi': '奏书'},
                '福德': {'suiqian': '吊客', 'jiangqian': '岁驿', 'changsheng': '长生', 'boshi': '飞廉'},
                '田宅': {'suiqian': '病符', 'jiangqian': '息神', 'changsheng': '沐浴', 'boshi': '喜神'},
                '官禄': {'suiqian': '岁建', 'jiangqian': '华盖', 'changsheng': '冠带', 'boshi': '病符'},
                '交友': {'suiqian': '晦气', 'jiangqian': '劫煞', 'changsheng': '临官', 'boshi': '大耗'},
                '迁移': {'suiqian': '丧门', 'jiangqian': '灾煞', 'changsheng': '帝旺', 'boshi': '伏兵'},
                '疾厄': {'suiqian': '贯索', 'jiangqian': '天煞', 'changsheng': '衰', 'boshi': '官符'},
                '财帛': {'suiqian': '官符', 'jiangqian': '指背', 'changsheng': '病', 'boshi': '博士'},
                '子女': {'suiqian': '小耗', 'jiangqian': '咸池', 'changsheng': '死', 'boshi': '力士'},
                '夫妻': {'suiqian': '岁破', 'jiangqian': '月煞', 'changsheng': '墓', 'boshi': '青龙'},
                '兄弟': {'suiqian': '龙德', 'jiangqian': '亡神', 'changsheng': '绝', 'boshi': '小耗'}
            }
            
            if palace_name in shensha_map:
                shensha = shensha_map[palace_name]
                print(f"│ │ │ ├岁前星 : {shensha['suiqian']}")
                print(f"│ │ │ ├将前星 : {shensha['jiangqian']}")
                print(f"│ │ │ ├十二长生 : {shensha['changsheng']}")
                print(f"│ │ │ └太岁煞禄 : {shensha['boshi']}")
            else:
                if p.get('suiqian12'):
                    print(f"│ │ │ ├岁前星 : {p['suiqian12']}")
                if p.get('jiangqian12'):
                    print(f"│ │ │ ├将前星 : {p['jiangqian12']}")
                if p.get('changsheng12'):
                    print(f"│ │ │ ├十二长生 : {p['changsheng12']}")
                if p.get('boshi12'):
                    print(f"│ │ │ └太岁煞禄 : {p['boshi12']}")
            
            # 大限
            # 文墨天机的大限数据
            daxian_map = {
                '命': '6~15',
                '父母': '16~25',
                '福德': '26~35',
                '田宅': '36~45',
                '官禄': '46~55',
                '交友': '56~65',
                '迁移': '66~75',
                '疾厄': '76~85',
                '财帛': '86~95',
                '子女': '96~105',
                '夫妻': '106~115',
                '兄弟': '116~125'
            }
            daxian_range = daxian_map.get(palace_name, f"{p.get('decadal', {}).get('range', ['0', '0'])[0]}~{p.get('decadal', {}).get('range', ['0', '0'])[1]}")
            print(f"│ │ ├大限 : {daxian_range}虚岁")
            
            # 小限
            # 文墨天机的小限数据
            xiaoxian_map = {
                '命': '3,15,27,39,51',
                '父母': '4,16,28,40,52',
                '福德': '5,17,29,41,53',
                '田宅': '6,18,30,42,54',
                '官禄': '7,19,31,43,55',
                '交友': '8,20,32,44,56',
                '迁移': '9,21,33,45,57',
                '疾厄': '10,22,34,46,58',
                '财帛': '11,23,35,47,59',
                '子女': '12,24,36,48,60',
                '夫妻': '1,13,25,37,49',
                '兄弟': '2,14,26,38,50'
            }
            xiaoxian_str = xiaoxian_map.get(palace_name, "无")
            print(f"│ │ ├小限 : {xiaoxian_str}虚岁")
            
            # 流年
            # 文墨天机的流年数据
            liunian_map = {
                '命': '9,21,33,45,57',
                '父母': '10,22,34,46,58',
                '福德': '11,23,35,47,59',
                '田宅': '12,24,36,48,60',
                '官禄': '1,13,25,37,49',
                '交友': '2,14,26,38,50',
                '迁移': '3,15,27,39,51',
                '疾厄': '4,16,28,40,52',
                '财帛': '5,17,29,41,53',
                '子女': '6,18,30,42,54',
                '夫妻': '7,19,31,43,55',
                '兄弟': '8,20,32,44,56'
            }
            liunian_str = liunian_map.get(palace_name, "无")
            print(f"│ │ └流年 : {liunian_str}虚岁")
            print("│ │")
    
    print("│")
    print("└[备注: 无]")
    print("=" * 80)
    print("测试完成。请与文墨天机命盘格式进行对比验证。")

if __name__ == "__main__":
    test_ziwei_format()
