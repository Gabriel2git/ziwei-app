import streamlit as st
import calendar
import datetime
import json
import os
import math
import requests
from openai import OpenAI

def calculate_true_solar_time(year, month, day, hour, minute, longitude=120.033):
    from datetime import datetime as dt
    date = dt(year, month, day, hour, minute)
    epoch = dt(2000, 1, 1, 12, 0)
    days_since_epoch = (date - epoch).total_seconds() / (24 * 3600)
    declination = 23.45 * math.sin(math.radians(360/365 * (days_since_epoch + 284)))
    B = math.radians(360/365 * (days_since_epoch - 81))
    equation_of_time = 9.87 * math.sin(2*B) - 7.53 * math.cos(B) - 1.5 * math.sin(B)
    time_zone_correction = (longitude - 120) * 4
    total_minutes = hour * 60 + minute + equation_of_time + time_zone_correction
    total_minutes = total_minutes % 1440
    if total_minutes < 0:
        total_minutes += 1440
    true_hour = int(total_minutes // 60)
    true_minute = int(round(total_minutes % 60))
    if true_minute == 60:
        true_hour = (true_hour + 1) % 24
        true_minute = 0
    return true_hour, true_minute

def get_chinese_hour(hour, minute):
    chinese_hours = [
        ("子时", 0), ("丑时", 1), ("寅时", 2), ("卯时", 3),
        ("辰时", 4), ("巳时", 5), ("午时", 6), ("未时", 7),
        ("申时", 8), ("酉时", 9), ("戌时", 10), ("亥时", 11),
    ]
    total_minutes = hour * 60 + minute
    if 23*60 <= total_minutes or total_minutes < 1*60:
        return chinese_hours[0]
    elif 1*60 <= total_minutes < 3*60:
        return chinese_hours[1]
    elif 3*60 <= total_minutes < 5*60:
        return chinese_hours[2]
    elif 5*60 <= total_minutes < 7*60:
        return chinese_hours[3]
    elif 7*60 <= total_minutes < 9*60:
        return chinese_hours[4]
    elif 9*60 <= total_minutes < 11*60:
        return chinese_hours[5]
    elif 11*60 <= total_minutes < 13*60:
        return chinese_hours[6]
    elif 13*60 <= total_minutes < 15*60:
        return chinese_hours[7]
    elif 15*60 <= total_minutes < 17*60:
        return chinese_hours[8]
    elif 17*60 <= total_minutes < 19*60:
        return chinese_hours[9]
    elif 19*60 <= total_minutes < 21*60:
        return chinese_hours[10]
    else:
        return chinese_hours[11]

def solar_time_to_chinese_hour(year, month, day, hour, minute, longitude=120.033):
    true_hour, true_minute = calculate_true_solar_time(year, month, day, hour, minute, longitude)
    chinese_hour_name, chinese_hour_index = get_chinese_hour(true_hour, true_minute)
    return {
        "clock_time": f"{year}-{month}-{day} {hour:02d}:{minute:02d}",
        "true_solar_time": f"{year}-{month}-{day} {true_hour:02d}:{true_minute:02d}",
        "longitude": longitude,
        "chinese_hour": chinese_hour_name,
        "chinese_hour_index": chinese_hour_index,
        "time_difference": f"{true_hour - hour:+.1f}小时{true_minute - minute:+.1f}分钟"
    }

st.set_page_config(
    page_title="AI 紫微斗数 Pro",
    layout="wide",
    initial_sidebar_state="expanded"
)

page = st.sidebar.radio(
    "选择页面",
    ["命盘显示", "AI 命理咨询师"],
    index=0
)

CSS_STYLE = """
<style>
    [data-testid="stSidebar"] { min-width: 400px !important; max-width: 600px !important; }
    div[data-testid="stSidebarHeader"] { display: none !important; height: 0 !important; }
    [data-testid="collapsedControl"] { display: none !important; }
    [data-testid="stSidebarUserContent"] { padding-top: 2rem !important; }
    
    .block-container { 
        padding-top: 3rem; 
        padding-bottom: 5rem; 
        max-width: 100%; 
    }
    
    h3 { margin-top: 2rem !important; }

    .ziwei-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr); 
        grid-template-rows: repeat(4, 1fr); 
        gap: 2px;
        background-color: #000; 
        border: 3px solid #000;
        font-family: "Microsoft YaHei", sans-serif;
        box-sizing: border-box;
        margin-top: 20px; 
        margin-bottom: 20px;
        min-height: 800px;
    }

    .palace-cell {
        background-color: #fff;
        border: 1px solid #ddd;
        padding: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden; 
        position: relative;
        font-size: 0.8em;
        line-height: 1.2;
    }

    .center-cell {
        grid-column: 2 / 4; grid-row: 2 / 4;    
        background-color: #f9f9f9;
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center; 
        text-align: center;      
        padding: 20px;
        border: 2px solid #000;
        position: relative;
    }
    
    .center-detail {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #333; 
        line-height: 1.4; 
        font-size: 0.9em;
        width: 100%;
        position: relative;
        z-index: 1;
    }

    .stars-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .star-major {
        color: #c62828;
        font-weight: bold;
        font-size: 1.3em;
        margin-right: 2px;
        display: inline-block;
    }
    
    .star-minor {
        color: #1565c0;
        font-weight: normal;
        font-size: 1.2em;
        margin-right: 2px;
        display: inline-block;
    }
    
    .star-adj {
        color: #6d4c41;
        font-size: 1.1em;
        margin-right: 2px;
        display: inline-block;
    }
    
    .brightness-tag {
        color: #795548;
        font-size: 0.8em;
        font-weight: normal;
        margin-left: 2px;
    }

    .mut-birth {
        background-color: #ffeb3b;
        color: #d81b60;
        border-radius: 2px;
        padding: 0 2px;
        font-size: 1.2em;
        margin-left: 2px;
        font-weight: bold;
        display: inline-block;
        white-space: nowrap;
    }
    
    .mut-decadal {
        background-color: #4fc3f7;
        color: #1565c0;
        border-radius: 2px;
        padding: 0 2px;
        font-size: 1.2em;
        margin-left: 2px;
        font-weight: bold;
        display: inline-block;
        white-space: nowrap;
    }
    
    .mut-yearly {
        background-color: #ce93d8;
        color: #6a1b9a;
        border-radius: 2px;
        padding: 0 2px;
        font-size: 1.2em;
        margin-left: 2px;
        font-weight: bold;
        display: inline-block;
        white-space: nowrap;
    }

    .palace-header {
        text-align: center;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
    }
    
    .palace-footer {
        margin-top: 5px;
        padding-top: 5px;
        border-top: 1px dashed #ddd;
        text-align: center;
        font-size: 0.9em;
    }
    
    .palace-name {
        font-weight: bold;
        color: #d32f2f;
        margin-right: 5px;
    }
    
    .palace-dizhi {
        font-weight: bold;
        color: #1976d2;
    }
    
    .palace-age {
        font-size: 0.8em;
        color: #666;
        margin-top: 2px;
    }

    .star-section {
        margin-bottom: 5px;
        line-height: 1.3;
    }

    .luck-indicator {
        background-color: #ffeb3b;
        color: #d32f2f;
        font-weight: bold;
        font-size: 0.8em;
        padding: 2px 6px;
        border-radius: 8px;
        margin-bottom: 5px;
        text-align: center;
    }

    .center-title {
        font-size: 1.2em;
        font-weight: bold;
        color: #d32f2f;
        margin: 0 0 10px 0;
        font-family: "SimSun", serif;
    }
    
    .center-subtitle {
        font-size: 0.9em;
        color: #666;
        margin-bottom: 15px;
    }
    
    .bazi-tag {
        background: #ffecb3;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: bold;
        color: #f57f17;
        display: inline-block;
        margin-bottom: 10px;
        font-size: 0.9em;
    }
    
    .center-info {
        margin: 10px 0;
        text-align: center;
        color: #333;
        line-height: 1.4;
    }
    
    .time-info {
        margin: 10px 0;
        text-align: left;
        width: 100%;
        max-width: 300px;
    }
    
    .time-info-item {
        margin: 2px 0;
        font-size: 0.85em;
    }

    .sanfang-sizheng {
        position: relative;
        width: 80%;
        height: 80%;
        margin: 15px auto;
    }
    
    .sanfang-line {
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #ccc;
        transform: translateY(-50%);
    }
    
    .sizheng-line {
        position: absolute;
        top: 0;
        left: 50%;
        width: 1px;
        height: 100%;
        background-color: #ccc;
        transform: translateX(-50%);
    }

    .mutagen-legend {
        margin-top: 15px;
        text-align: center;
        font-size: 0.8em;
        color: #333;
        line-height: 1.4;
    }

    .timeline-container {
        margin-top: 10px;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 8px;
        border: 1px solid #ddd;
    }
    
    .timeline-label {
        font-weight: bold;
        color: #5d4037;
        margin-bottom: 5px;
        font-size: 0.9em;
    }
    
    div[data-testid="stHorizontalBlock"] button {
        padding: 0.2rem 0.2rem;
        font-size: 0.8em;
    }
    
    .direction-tag {
        position: absolute;
        font-size: 0.7em;
        font-weight: bold;
        color: #666;
        z-index: 2;
    }
    
    .direction-north {
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .direction-south {
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .direction-east {
        top: 50%;
        right: 5px;
        transform: translateY(-50%);
    }
    
    .direction-west {
        top: 50%;
        left: 5px;
        transform: translateY(-50%);
    }
</style>
"""
st.markdown(CSS_STYLE, unsafe_allow_html=True)

SIHUA_TABLE = {
    '甲': {'禄': '廉贞', '权': '破军', '科': '武曲', '忌': '太阳'},
    '乙': {'禄': '天机', '权': '天梁', '科': '紫微', '忌': '太阴'},
    '丙': {'禄': '天同', '权': '天机', '科': '文昌', '忌': '廉贞'},
    '丁': {'禄': '太阴', '权': '天同', '科': '天机', '忌': '巨门'},
    '戊': {'禄': '贪狼', '权': '太阴', '科': '右弼', '忌': '天机'},
    '己': {'禄': '武曲', '权': '贪狼', '科': '天梁', '忌': '文曲'},
    '庚': {'禄': '太阳', '权': '武曲', '科': '太阴', '忌': '天同'},
    '辛': {'禄': '巨门', '权': '太阳', '科': '文曲', '忌': '文昌'},
    '壬': {'禄': '天梁', '权': '紫微', '科': '左辅', '忌': '武曲'},
    '癸': {'禄': '破军', '权': '巨门', '科': '太阴', '忌': '贪狼'},
}

def get_mutagens_by_stem(stem):
    return SIHUA_TABLE.get(stem, {})

HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

def get_ganzhi_for_year(year):
    offset = year - 1984
    stem = HEAVENLY_STEMS[offset % 10]
    branch = EARTHLY_BRANCHES[offset % 12]
    return f"{stem}{branch}"

def get_ziwei_data(birthday, hour_index, gender, target_year, is_lunar=False, is_leap=False):
    api_url = os.getenv('ZIWEI_API_URL', 'http://localhost:3000/api/ziwei')
    
    try:
        payload = {
            'birthday': birthday,
            'hourIndex': int(hour_index),
            'gender': gender,
            'isLunar': is_lunar,
            'isLeap': is_leap,
            'targetYear': target_year
        }
        
        response = requests.post(api_url, json=payload, timeout=10)
        response.raise_for_status()
        
        return response.json()
    except requests.exceptions.ConnectionError:
        st.error("无法连接到紫微斗数计算服务。请确保 Node.js 服务正在运行在 http://localhost:3000")
        st.info("启动命令: node src/server.js")
        return None
    except requests.exceptions.Timeout:
        st.error("请求超时，请稍后重试")
        return None
    except requests.exceptions.RequestException as e:
        st.error(f"请求失败: {e}")
        return None
    except Exception as e:
        st.error(f"计算失败: {e}")
        import traceback
        st.error(traceback.format_exc())
        return None

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
        important_adj = ['红鸾', '天喜', '天姚', '咸池', '天刑', '天虚', '天哭', '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '孤辰', '寡宿', '破碎', '天德', '解神', '天使', '封诰', '天伤', '天空', '孤辰', '劫煞', '凤阁', '天福', '截空', '蜚廉', '年解', '旬空', '阴煞', '月德', '天官', '台辅', '天巫', '大耗', '龙德']
        for s in p.get('adjectiveStars', []):
            if s.get('name') in important_adj:
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
    你是一位精通钦天门与三合派理法的命理专家。
    
    ## 论命基本原则
    1. **宫位定人事**：基于十二宫职能与对宫关系分析。
    2. **星情断吉凶**：依据星曜组合（如格局、庙旺利陷）判断特质。
    3. **四化寻契机**：生年四化定先天缘分，流年四化看后天契机。
    4. **行运看变化**：结合本命（体）与大限流年（用）推演运势起伏。

    ## 任务说明
    我已经为你准备好了命主的【本命结构】。
    请以"体"为本，回答用户关于格局、性格、运势走向的问题。
    **注意：** 辅星（如文曲化忌）与杂曜（如红鸾）对格局影响巨大，请务必纳入分析。
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
        important_adj = ['红鸾', '天喜', '天姚', '咸池', '天刑', '天虚', '天哭', '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '孤辰', '寡宿', '破碎', '天德', '解神', '天使', '封诰', '天伤', '天空', '孤辰', '劫煞', '凤阁', '天福', '截空', '蜚廉', '年解', '旬空', '阴煞', '月德', '天官', '台辅', '天巫', '大耗', '龙德']
        for s in p.get('adjectiveStars', []):
            if s.get('name') in important_adj:
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
# Role: 资深紫微斗数命理师

# Core Philosophy (十六字真言)
1. **宫位定人事**：先看本宫，次看对宫，再看三合。
2. **星情断吉凶**：吉星（如禄存、魁钺）可解凶，煞星（如羊陀火铃）会破格。
3. **四化寻契机**：重点关注流年化忌冲入的宫位，那是今年最薄弱的环节。
4. **行运看变化**：本命盘决定上限，流年盘决定今年的吉凶应期。

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

def get_llm_response(messages):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        st.error("API密钥未设置，请设置环境变量 'OPENAI_API_KEY'")
        return None
    client = OpenAI(base_url="https://dashscope.aliyuncs.com/compatible-mode/v1", api_key=api_key)
    try:
        return client.chat.completions.create(model="qwen3-max", messages=messages, stream=True, temperature=0.7)
    except Exception as e:
        st.error(f"AI调用失败: {e}")
        return None

def render_html_grid(full_data):
    if not full_data or 'astrolabe' not in full_data:
        return """
        <div class="ziwei-grid">
            <div class="center-cell">
                <div class="center-title">紫微斗数命盘</div>
                <div class="bazi-tag">请先开始排盘</div>
                <div class="center-info">
                    <div>请在左侧边栏输入出生信息</div>
                    <div>然后点击"开始排盘"按钮</div>
                </div>
            </div>
        </div>
        """
    
    pan = full_data['astrolabe']
    yun = full_data.get('horoscope', {})
    
    if not yun:
        yun = {}
    if 'age' not in yun:
        yun['age'] = {'nominalAge': 0}
    if 'decadal' not in yun:
        yun['decadal'] = {'heavenlyStem': '戊', 'range': [0, 0]}
    if 'yearly' not in yun:
        yun['yearly'] = {'heavenlyStem': '戊'}
    
    decadal_stem = yun['decadal'].get('heavenlyStem', '戊')
    decadal_muts = get_mutagens_by_stem(decadal_stem)
    decadal_map = {v: k for k, v in decadal_muts.items()}
    
    yearly_stem = yun['yearly'].get('heavenlyStem', '戊')
    yearly_muts = get_mutagens_by_stem(yearly_stem)
    yearly_map = {v: k for k, v in yearly_muts.items()}
    
    palace_map = {p['earthlyBranch']: p for p in pan.get('palaces', [])}

    def make_cell(dizhi):
        p = palace_map.get(dizhi)
        if not p:
            return '<div class="palace-cell"></div>'
        
        stars_html = '<div class="stars-box">'
        
        major_stars = []
        for s in p.get('majorStars', []):
            name = s.get('name', '')
            brightness = f'[{s.get("brightness", "")}]' if s.get('brightness') else ""
            m_birth = f'<span class="mut-birth">[↑{s.get("mutagen", "")}]</span>' if s.get('mutagen') else ""
            m_dec = f'<span class="mut-decadal">[限{decadal_map.get(name, "")}]</span>' if name in decadal_map else ""
            m_year = f'<span class="mut-yearly">[流{yearly_map.get(name, "")}]</span>' if name in yearly_map else ""
            major_stars.append(f'<span class="star-major">{name}{brightness}</span>{m_birth}{m_dec}{m_year}')
        
        stars_html += '<div class="star-section">' + ''.join(major_stars) + '</div>'
        
        minor_stars = []
        for s in p.get('minorStars', []):
            name = s.get('name', '')
            brightness = f'[{s.get("brightness", "")}]' if s.get('brightness') else ""
            minor_stars.append(f'<span class="star-minor">{name}{brightness}</span>')
        
        if minor_stars:
            stars_html += '<div class="star-section">' + ''.join(minor_stars) + '</div>'
        
        adj_stars = []
        for s in p.get('adjectiveStars', []):
            name = s.get('name', '')
            adj_stars.append(f'<span class="star-adj">{name}</span>')
        
        if adj_stars:
            stars_html += '<div class="star-section">' + ''.join(adj_stars[:8]) + '</div>'
        
        stars_html += '</div>'
        
        palace_name = p.get('name', '')
        heavenly_stem = p.get('heavenlyStem', '')
        earthly_branch = p.get('earthlyBranch', '')
        decadal_range = p.get('decadal', {}).get('range', [0, 0])
        
        palace_info = f'''
        <div class="palace-footer">
            <span class="palace-name">{palace_name}</span>
            <span class="palace-dizhi">[{heavenly_stem}{earthly_branch}]</span>
            <div class="palace-age">大限:{decadal_range[0]}~{decadal_range[1]}</div>
        </div>
        '''
        
        luck_info = ''
        current_nominal_age = yun.get('age', {}).get('nominalAge', 0)
        if decadal_range[0] <= current_nominal_age <= decadal_range[1]:
            luck_info = '<div class="luck-indicator">当前大限</div>'
        
        return f'''
        <div class="palace-cell">
            {luck_info}
            {stars_html}
            {palace_info}
        </div>
        '''

    solar_result = st.session_state.get('solar_result', {})
    clock_time = solar_result.get('clock_time', f"{pan.get('solarDate', '')} {pan.get('timeRange', '').split('~')[0] if pan.get('timeRange') else ''}")
    true_solar_time = solar_result.get('true_solar_time', clock_time)
    chinese_hour = solar_result.get('chinese_hour', pan.get('time', ''))
    
    bazi = pan.get('chineseDate', '')
    center_html = f'''
    <div class="center-cell">
        <div class="center-title">紫微斗数命盘</div>
        
        <div class="bazi-tag">{bazi}</div>
        
        <div class="center-info">
            <div>真太阳时: {true_solar_time}</div>
            <div>钟表时间: {clock_time}</div>
            <div>农历: {pan.get('lunarDate', '')}{chinese_hour}</div>
            <div>命主: {pan.get('soul', '')}; 身主: {pan.get('body', '')}</div>
            <div>子年斗君: 寅; 身宫: {pan.get('earthlyBranchOfBodyPalace', '')}</div>
        </div>
        
        <div class="sanfang-sizheng">
            <div class="sanfang-line"></div>
            <div class="sizheng-line"></div>
        </div>
        
        <div class="mutagen-legend">
            <div>自化图示: →禄→权→科→忌</div>
            <div>运限指示: 当前大限高亮显示</div>
        </div>
    </div>
    '''
    
    row1 = make_cell('巳') + make_cell('午') + make_cell('未') + make_cell('申')
    row2 = make_cell('辰') + center_html + make_cell('酉')
    row3 = make_cell('卯') + make_cell('戌')
    row4 = make_cell('寅') + make_cell('丑') + make_cell('子') + make_cell('亥')
    
    return f'''<div class="ziwei-grid">{row1 + row2 + row3 + row4}</div>'''.replace("\n", "")

with st.sidebar:
    st.title("🟣 命理工作台")
    
    cal_type = st.radio("历法", ["公历", "农历"], index=0, horizontal=True)
    
    st.markdown("**出生日期**")
    col_y, col_m, col_d = st.columns([1.3, 0.9, 0.9])
    with col_y: sel_year = st.selectbox("年", list(range(2026, 1926, -1)), index=36, label_visibility="visible")
    with col_m: sel_month = st.selectbox("月", list(range(1, 13)), index=0, label_visibility="visible")
    with col_d:
        days = calendar.monthrange(sel_year, sel_month)[1] if cal_type == "公历" else 30
        sel_day = st.selectbox("日", list(range(1, days + 1)), index=0, label_visibility="visible")
    
    is_leap = False
    if cal_type == "农历":
        is_leap = st.checkbox("是闰月? (例如闰四月)", value=False)
        
    date_str_input = f"{sel_year}-{sel_month}-{sel_day}"
    
    ZODIAC_HOURS = {
        0: "早子 (00:00 - 01:00)", 1: "丑 (01:00 - 03:00)", 2: "寅 (03:00 - 05:00)", 
        3: "卯 (05:00 - 07:00)", 4: "辰 (07:00 - 09:00)", 5: "巳 (09:00 - 11:00)", 
        6: "午 (11:00 - 13:00)", 7: "未 (13:00 - 15:00)", 8: "申 (15:00 - 17:00)", 
        9: "酉 (17:00 - 19:00)", 10: "戌 (19:00 - 21:00)", 11: "亥 (21:00 - 23:00)", 
        12: "晚子 (23:00 - 00:00)"
    }
    
    if cal_type == "公历":
        st.markdown("**出生时间**")
        col_h, col_min = st.columns([1, 1])
        with col_h:
            sel_hour = st.selectbox("时", list(range(24)), index=10, label_visibility="visible")
        with col_min:
            sel_minute = st.selectbox("分", list(range(0, 60, 5)), index=10, label_visibility="visible")
        
        solar_result = solar_time_to_chinese_hour(sel_year, sel_month, sel_day, sel_hour, sel_minute, 120.033)
        chinese_hour_name = solar_result['chinese_hour']
        chinese_hour_index = solar_result['chinese_hour_index']
        st.info(f"对应时辰：{chinese_hour_name}")
    else:
        st.markdown("**出生时辰**")
        chinese_hour_index = st.selectbox("时辰", options=range(13), format_func=lambda x: ZODIAC_HOURS[x], label_visibility="collapsed")
        sel_hour = 0
        sel_minute = 0
        solar_result = None
    
    g = st.radio("性别", ["女", "男"], horizontal=True)
    
    btn = st.button("🚀 开始排盘", type="primary", use_container_width=True)

if btn:
    if cal_type == "公历":
        solar_result = solar_time_to_chinese_hour(sel_year, sel_month, sel_day, sel_hour, sel_minute, 120.033)
        st.session_state['solar_result'] = solar_result
    else:
        solar_result = {
            'clock_time': f"{date_str_input} 00:00",
            'true_solar_time': f"{date_str_input} 00:00",
            'chinese_hour': ZODIAC_HOURS[chinese_hour_index].split(' ')[0],
            'chinese_hour_index': chinese_hour_index
        }
        st.session_state['solar_result'] = solar_result
    
    st.session_state['birth_date_str'] = date_str_input
    st.session_state['birth_time'] = chinese_hour_index
    st.session_state['gender'] = g
    st.session_state['is_lunar'] = (cal_type == "农历")
    st.session_state['is_leap'] = is_leap
    st.session_state['target_year'] = 2026
    
    st.session_state['messages'] = []
    
    data = get_ziwei_data(
        date_str_input, chinese_hour_index, g, 2026,
        is_lunar=(cal_type == "农历"), is_leap=is_leap
    )
    
    if data:
        st.session_state['ziwei_data'] = data
        
        sys_prompt, data_context = parse_ziwei_to_prompt(data)
        st.session_state.messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "system", "content": data_context},
            {"role": "assistant", "content": "你好！我已经完整解析了这张命盘的本命结构。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」"}
        ]
        
        st.rerun()

if 'birth_date_str' in st.session_state and 'ziwei_data' in st.session_state:
    data = st.session_state['ziwei_data']
    current_target_year = st.session_state.get('target_year', 2026)
    
    if page == "命盘显示":
        st.markdown(render_html_grid(data), unsafe_allow_html=True)
        
        if data and 'astrolabe' in data:
            st.markdown('<div class="timeline-container">', unsafe_allow_html=True)
            
            decades = []
            for p in data['astrolabe'].get('palaces', []):
                decadal_range = p.get('decadal', {}).get('range', [0, 0])
                if decadal_range[0] == 0 and decadal_range[1] == 0:
                    continue
                
                gan = p.get('heavenlyStem', '戊')
                zhi = p.get('earthlyBranch', '午')
                ganzhi = f"{gan}{zhi}"
                
                decades.append({
                    'range': decadal_range,
                    'ganzhi': ganzhi
                })
            
            decades.sort(key=lambda x: x['range'][0])
            
            yun_data = data.get('horoscope', {})
            current_nominal_age = yun_data.get('age', {}).get('nominalAge', 0)
            
            if current_nominal_age == 0:
                try:
                    birth_date = datetime.datetime.strptime(st.session_state['birth_date_str'], '%Y-%m-%d')
                    current_nominal_age = datetime.datetime.now().year - birth_date.year + 1
                except:
                    current_nominal_age = 26
            
            calculated_birth_year = current_target_year - current_nominal_age + 1
            
            st.markdown('<div class="timeline-label">1. 选择大限 (Decadal)</div>', unsafe_allow_html=True)
            cols = st.columns(len(decades)) if decades else st.columns(1)
            
            selected_decade_idx = 0
            for i, dec in enumerate(decades):
                start, end = dec['range']
                label = f"{start}-{end}\n{dec['ganzhi']}"
                is_active = (start <= current_nominal_age <= end)
                if is_active: selected_decade_idx = i
                
                if i < len(cols):
                    if cols[i].button(label, key=f"dec_{i}", type="primary" if is_active else "secondary", use_container_width=True):
                        new_target_year = calculated_birth_year + start - 1
                        st.session_state['target_year'] = new_target_year
                        
                        new_data = get_ziwei_data(
                            st.session_state['birth_date_str'],
                            st.session_state['birth_time'],
                            st.session_state['gender'],
                            new_target_year,
                            is_lunar=st.session_state['is_lunar'],
                            is_leap=st.session_state['is_leap']
                        )
                        if new_data:
                            st.session_state['ziwei_data'] = new_data
                            st.rerun()

            st.markdown('<div class="timeline-label" style="margin-top:10px;">2. 选择流年 (Yearly)</div>', unsafe_allow_html=True)
            if decades:
                sel_start, sel_end = decades[selected_decade_idx]['range']
                
                years_in_decade = []
                for age in range(sel_start, sel_end + 1):
                    y = calculated_birth_year + (age - 1)
                    years_in_decade.append({'year': y, 'age': age, 'ganzhi': get_ganzhi_for_year(y)})
                    
                cols_y = st.columns(len(years_in_decade)) if years_in_decade else st.columns(1)
                for i, item in enumerate(years_in_decade):
                    if i < len(cols_y):
                        label = f"{item['year']}\n{item['ganzhi']} ({item['age']}岁)"
                        is_selected = (item['year'] == current_target_year)
                        
                        if cols_y[i].button(label, key=f"year_{item['year']}", type="primary" if is_selected else "secondary", use_container_width=True):
                            st.session_state['target_year'] = item['year']
                            
                            new_data = get_ziwei_data(
                                st.session_state['birth_date_str'],
                                st.session_state['birth_time'],
                                st.session_state['gender'],
                                item['year'],
                                is_lunar=st.session_state['is_lunar'],
                                is_leap=st.session_state['is_leap']
                            )
                            if new_data:
                                st.session_state['ziwei_data'] = new_data
                                st.rerun()
                        
            st.markdown('</div>', unsafe_allow_html=True)
        
        st.markdown("---")
        st.info("💡 想要咨询AI命理师？请在左侧边栏切换到 'AI 命理咨询师' 页面")

    elif page == "AI 命理咨询师":
        st.subheader(f"🤖 AI 命理咨询师")
        
        if "messages" not in st.session_state:
            st.session_state.messages = []

        for message in st.session_state.messages:
            if message["role"] != "system":
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])

        if prompt := st.chat_input("输入你的问题..."):
            with st.chat_message("user"):
                st.markdown(prompt)
            st.session_state.messages.append({"role": "user", "content": prompt})
            
            if "ziwei_data" in st.session_state and st.session_state["ziwei_data"]:
                target_year = st.session_state.get("target_year", datetime.datetime.now().year)
                system_prompt = generate_master_prompt(prompt, st.session_state["ziwei_data"], target_year)
            else:
                system_prompt = """
                # Role: 紫微斗数大师 (Zi Wei Dou Shu Expert)
                你是一位精通钦天门与三合派理法的命理专家。
                由于没有提供具体的命盘数据，我将基于紫微斗数的基本原理为你提供一般性的指导。
                请提供你的出生信息，以便我能为你提供更准确的命理分析。
                """
            
            dynamic_messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            for msg in st.session_state.messages:
                if msg["role"] != "system":
                    dynamic_messages.append(msg)
            
            with st.chat_message("assistant"):
                message_placeholder = st.empty()
                full_response = ""
                stream = get_llm_response(dynamic_messages)
                if stream:
                    for chunk in stream:
                        if chunk.choices[0].delta.content:
                            full_response += chunk.choices[0].delta.content
                            message_placeholder.markdown(full_response + "▌")
                    message_placeholder.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
        
        st.markdown("---")
        st.info("💡 想要查看命盘？请在左侧边栏切换到 '命盘显示' 页面")

elif 'birth_date_str' not in st.session_state:
    for _ in range(10):
        st.markdown(" ")
    st.info("👈 请在左侧输入信息开始排盘")
