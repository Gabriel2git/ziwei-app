import streamlit as st
from src.config import IMPORTANT_ADJ_STARS, get_mutagens_by_stem

def parse_ziwei_to_prompt(full_data):
    pan = full_data['astrolabe']
    
    solar_result = st.session_state.get('solar_result', {})
    clock_time = solar_result.get('clock_time', f"{pan.get('solarDate', '')} {pan.get('timeRange', '').split('~')[0] if pan.get('timeRange') else ''}")
    true_solar_time = solar_result.get('true_solar_time', clock_time)
    chinese_hour = solar_result.get('chinese_hour', pan.get('time', ''))
    
    base_info = f"性别：{pan.get('gender', '未知')}\n"
    base_info += f"地理经度：120.033\n"
    base_info += f"钟表时间：{clock_time}\n"
    base_info += f"真太阳时：{true_solar_time}\n"
    base_info += f"农历时间：{pan.get('lunarDate', '未知')}{chinese_hour}\n"
    base_info += f"节气四柱：{pan.get('chineseDate', '未知')}\n"
    base_info += f"身主:{pan.get('body', '未知')}; 命主:{pan.get('soul', '未知')}; 子年斗君:寅; 身宫:{pan.get('earthlyBranchOfBodyPalace', '未知')}\n"
    
    palace_text = ""
    for p in pan.get('palaces', []):
        header = f"- {p.get('name', '未知')}宫 [{p.get('heavenlyStem', '')}{p.get('earthlyBranch', '')}]"
        
        major_stars = []
        for s in p.get('majorStars', []):
            info = s.get('name', '')
            if s.get('brightness'): info += f"[{s['brightness']}]"
            if s.get('mutagen'): info += f"[↑{s['mutagen']}]"
            major_stars.append(info)
        major_str = "，".join(major_stars) if major_stars else "无"
        
        minor_stars = []
        for s in p.get('minorStars', []):
            info = s.get('name', '')
            if s.get('brightness'): info += f"[{s['brightness']}]"
            minor_stars.append(info)
        minor_str = "，".join(minor_stars) if minor_stars else "无"
        
        adj_stars = []
        for s in p.get('adjectiveStars', []):
            if s.get('name') in IMPORTANT_ADJ_STARS:
                info = s.get('name', '')
                if s.get('brightness'): info += f"[{s['brightness']}]"
                adj_stars.append(info)
        adj_str = "，".join(adj_stars) if adj_stars else "无"
        
        shensha_text = ""
        if p.get('suiqian12'):
            shensha_text += f"岁前星 : {p['suiqian12']}\n"
        if p.get('jiangqian12'):
            shensha_text += f"将前星 : {p['jiangqian12']}\n"
        if p.get('changsheng12'):
            shensha_text += f"十二长生 : {p['changsheng12']}\n"
        if p.get('boshi12'):
            shensha_text += f"太岁煞禄 : {p['boshi12']}\n"
        
        decadal_range = p.get('decadal', {}).get('range', [0, 0])
        decadal_text = f"大限 : {decadal_range[0]}~{decadal_range[1]}虚岁\n"
        
        ages = p.get('ages', [])
        minor_ages = ages[::2] if len(ages) > 5 else ages[:5]
        minor_ages_str = "，".join(map(str, minor_ages))
        minor_text = f"小限 : {minor_ages_str}虚岁\n"
        
        yearly_ages = ages[1::2] if len(ages) > 5 else ages[1:6]
        yearly_ages_str = "，".join(map(str, yearly_ages))
        yearly_text = f"流年 : {yearly_ages_str}虚岁\n"
        
        palace_text += f"{header}\n"
        palace_text += f"  ├主星 : {major_str}\n"
        palace_text += f"  ├辅星 : {minor_str}\n"
        palace_text += f"  ├小星 : {adj_str}\n"
        if shensha_text:
            palace_text += f"  ├神煞\n"
            for line in shensha_text.strip().split('\n'):
                palace_text += f"  │ ├{line}\n"
        palace_text += f"  ├{decadal_text.strip()}\n"
        palace_text += f"  ├{minor_text.strip()}\n"
        palace_text += f"  └{yearly_text.strip()}\n\n"

    system_prompt = f"""
    # Role: 紫微斗数大师 (Zi Wei Dou Shu Expert)
    
    你现在是资深的国学易经术数领域专家，熟练使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，能对命盘十二宫星曜分布和各宫位间的飞宫四化进行细致分析
    
    ## 论命基本原则
    1. **宫位定人事**：基于十二宫职能与对宫关系分析。
    2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
    3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
    4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。
    
    ## 任务说明
    我已经为你准备好了命主的【本命结构】。
    请以"体"为本，回答用户关于格局、性格、运势走向的问题。
    **注意：** 辅星（如文曲化忌）与杂曜（如红鸾）对格局影响大，请务必纳入分析。
    """
    
    data_context = f"【基本信息】\n{base_info}\n\n【命盘十二宫】\n{palace_text}"
    
    return system_prompt, data_context

def generate_master_prompt(user_question, full_data, target_year):
    pan = full_data['astrolabe']
    yun = full_data.get('horoscope', {})
    
    yearly_mutagen = []
    if yun.get('yearly') and yun['yearly'].get('heavenlyStem'):
        yearly_stem = yun['yearly']['heavenlyStem']
        yearly_muts = get_mutagens_by_stem(yearly_stem)
        yearly_mutagen = [yearly_muts.get('禄', ''), yearly_muts.get('权', ''), yearly_muts.get('科', ''), yearly_muts.get('忌', '')]
    
    chart_context = f"""
【命盘核心参数】
命主：{pan.get('soul', '未知')} | 身主：{pan.get('body', '未知')}
当前流年：{target_year}年 | 流年四化：{yearly_mutagen} (禄权科忌)
"""
    
    palace_text = ""
    for p in pan.get('palaces', []):
        header = f"- {p.get('name', '未知')}宫[{p.get('heavenlyStem', '')}{p.get('earthlyBranch', '')}]"
        
        major_stars = []
        for s in p.get('majorStars', []):
            info = s.get('name', '')
            if s.get('brightness'): info += f"[{s['brightness']}]"
            if s.get('mutagen'): info += f"[↑{s['mutagen']}]"
            major_stars.append(info)
        major_str = "，".join(major_stars) if major_stars else "无"
        
        minor_stars = []
        for s in p.get('minorStars', []):
            info = s.get('name', '')
            if s.get('brightness'): info += f"[{s['brightness']}]"
            minor_stars.append(info)
        minor_str = "，".join(minor_stars) if minor_stars else "无"
        
        adj_stars = []
        for s in p.get('adjectiveStars', []):
            if s.get('name') in IMPORTANT_ADJ_STARS:
                info = s.get('name', '')
                if s.get('brightness'): info += f"[{s['brightness']}]"
                adj_stars.append(info)
        adj_str = "，".join(adj_stars) if adj_stars else "无"
        
        shensha_text = ""
        if p.get('suiqian12'):
            shensha_text += f"│ │ ├岁前星 : {p['suiqian12']}\n"
        if p.get('jiangqian12'):
            shensha_text += f"│ │ ├将前星 : {p['jiangqian12']}\n"
        if p.get('changsheng12'):
            shensha_text += f"│ │ ├十二长生 : {p['changsheng12']}\n"
        if p.get('boshi12'):
            shensha_text += f"│ │ └太岁煞禄 : {p['boshi12']}\n"
        
        decadal_range = p.get('decadal', {}).get('range', [0, 0])
        decadal_text = f"│ │ ├大限 : {decadal_range[0]}~{decadal_range[1]}虚岁\n"
        
        ages = p.get('ages', [])
        minor_ages = ages[::2] if len(ages) > 5 else ages[:5]
        minor_ages_str = "，".join(map(str, minor_ages))
        minor_text = f"│ │ ├小限 : {minor_ages_str}虚岁\n"
        
        yearly_ages = ages[1::2] if len(ages) > 5 else ages[1:6]
        yearly_ages_str = "，".join(map(str, yearly_ages))
        yearly_text = f"│ │ └流年 : {yearly_ages_str}虚岁\n"
        
        palace_text += f"{header}\n"
        palace_text += f"│ │ ├主星 : {major_str}\n"
        palace_text += f"│ │ ├辅星 : {minor_str}\n"
        palace_text += f"│ │ ├小星 : {adj_str}\n"
        if shensha_text:
            palace_text += f"│ │ ├神煞\n"
            palace_text += shensha_text
        palace_text += decadal_text
        palace_text += minor_text
        palace_text += yearly_text
        palace_text += f"│ │\n"
    
    full_chart_context = f"{chart_context}\n\n【命盘十二宫】\n│ │\n{palace_text}"
    
    system_prompt = f"""
# Role: 资深的国学易经术数领域专家

你现在是资深的国学易经术数领域专家，熟练使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，能对命盘十二宫星曜分布和各宫位间的飞宫四化进行细致分析

## 论命基本原则
1. **宫位定人事**：基于十二宫职能与对宫关系分析。
2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。

# User Data
{full_chart_context}

# Task
用户问题："{user_question}"

# Response Guidelines
请严格遵循以下思考路径：
1. 定位核心宫位及三方四正
2. 分析星曜组合与格局
3. 寻找四化引动点（特别是化忌的冲照）
4. 结合大限与流年推断时间节点

请用温暖、客观、建设性的语言输出建议。
遇到凶象（如化忌、空劫），不要只说不好，要给出"趋避建议"。
"""
    
    return system_prompt

def get_default_system_prompt():
    return """
                # Role: 资深的国学易经术数领域专家
                
                你现在是资深的国学易经术数领域专家，熟练使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，能对命盘十二宫星曜分布和各宫位间的飞宫四化进行细致分析
                
                ## 论命基本原则
                1. **宫位定人事**：基于十二宫职能与对宫关系分析。
                2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
                3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
                4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。
                
                由于没有提供具体的命盘数据，我将基于紫微斗数的基本原理为你提供一般性的指导。
                请提供你的出生信息，以便我能为你提供更准确的命理分析。
                """
