import streamlit as st
import calendar
import datetime
import json
import os
import requests
from openai import OpenAI
from src.solar_time_calculator import solar_time_to_chinese_hour

# ==========================================
# 0. 全局配置与样式
# ==========================================
st.set_page_config(
    page_title="AI 紫微斗数 Pro",
    layout="wide",
    initial_sidebar_state="expanded"
)

CSS_STYLE = """
<style>
    /* 1. 强制侧边栏宽度 */
    [data-testid="stSidebar"] { min-width: 360px !important; max-width: 600px !important; }
    div[data-testid="stSidebarHeader"] { display: none !important; height: 0 !important; }
    [data-testid="collapsedControl"] { display: none !important; }
    [data-testid="stSidebarUserContent"] { padding-top: 2rem !important; }
    
    .block-container { 
        padding-top: 1rem; 
        padding-bottom: 5rem; 
        max-width: 100%; 
    }

    /* 2. 紫微网格 - 文墨天机样式 */
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

    /* 中宫样式 */
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

    /* --- 星星样式 --- */
    .stars-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .star-major {
        color: #c62828; /* 文墨天机主星红色 */
        font-weight: bold;
        font-size: 1.3em; /* 加大主星字体 */
        margin-right: 2px;
        display: inline-block;
    }
    
    .star-minor {
        color: #1565c0; /* 文墨天机辅星蓝色 */
        font-weight: normal;
        font-size: 1.2em; /* 加大辅星字体 */
        margin-right: 2px;
        display: inline-block;
    }
    
    .star-adj {
        color: #6d4c41; /* 文墨天机小星棕色 */
        font-size: 1.1em; /* 加大小星字体 */
        margin-right: 2px;
        display: inline-block;
    }
    
    .brightness-tag {
        color: #795548;
        font-size: 0.8em;
        font-weight: normal;
        margin-left: 2px;
    }

    /* --- 四化样式 --- */
    .mut-birth {
        background-color: #ffeb3b;
        color: #d81b60;
        border-radius: 2px;
        padding: 0 2px;
        font-size: 1.2em; /* 加大四化字体 */
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
        font-size: 1.2em; /* 加大四化字体 */
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
        font-size: 1.2em; /* 加大四化字体 */
        margin-left: 2px;
        font-weight: bold;
        display: inline-block;
        white-space: nowrap;
    }

    /* 宫位信息 */
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

    /* 中宫信息 */
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

    /* --- 底部控制条样式 --- */
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
    
    /* 方向标记 */
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

# ==========================================
# 1. 核心算法工具
# ==========================================
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
def get_mutagens_by_stem(stem): return SIHUA_TABLE.get(stem, {})

HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

def get_ganzhi_for_year(year):
    offset = year - 1984
    stem = HEAVENLY_STEMS[offset % 10]
    branch = EARTHLY_BRANCHES[offset % 12]
    return f"{stem}{branch}"

# ==========================================
# 2. 数据获取与Prompt生成 (Python原生版)
# ==========================================

def get_ziwei_data(birthday, hour_index, gender, target_year, is_lunar=False, is_leap=False):
    """
    使用 API 服务计算紫微斗数
    """
    try:
        # 构建 API 请求数据
        payload = {
            "birthday": birthday,
            "hourIndex": hour_index,
            "gender": gender,
            "isLunar": is_lunar,
            "isLeap": is_leap,
            "targetYear": target_year
        }
        
        # 发送 POST 请求到 API 服务
        response = requests.post("http://localhost:3000/api/ziwei", json=payload, timeout=10)
        
        # 检查响应状态码
        if response.status_code != 200:
            st.error(f"API Error: {response.status_code} - {response.json().get('error', 'Unknown error')}")
            return None
        
        # 返回解析后的 JSON 数据
        return response.json()
    except requests.RequestException as e:
        st.error(f"Request Error: {e}")
        return None
    except Exception as e:
        st.error(f"Error: {e}")
        return None

def parse_ziwei_to_prompt(full_data):
    """
    【泛化 Prompt】只生成一次，锁定本命结构
    """
    pan = full_data['astrolabe']
    
    # 获取真太阳时间信息
    solar_result = st.session_state.get('solar_result', {})
    clock_time = solar_result.get('clock_time', f"{pan['solarDate']} {pan['timeRange'].split('~')[0]}")
    true_solar_time = solar_result.get('true_solar_time', f"{pan['solarDate']} {pan['timeRange'].split('~')[0]}")
    chinese_hour = solar_result.get('chinese_hour', pan.get('time', ''))
    
    # 基本信息
    base_info = f"性别：{pan['gender']}\n"
    base_info += f"地理经度：120.033\n"
    base_info += f"钟表时间：{clock_time}\n"
    base_info += f"真太阳时：{true_solar_time}\n"
    base_info += f"农历时间：{pan['lunarDate']}{chinese_hour}\n"
    base_info += f"节气四柱：{pan['chineseDate']}\n"
    base_info += f"非节气四柱：{pan['chineseDate']}\n"
    base_info += f"身主:{pan['body']}; 命主:{pan['soul']}; 子年斗君:寅; 身宫:{pan['earthlyBranchOfBodyPalace']}\n"
    
    palace_text = ""
    for p in pan['palaces']:
        header = f"- {p['name']}宫 [{p['heavenlyStem']}{p['earthlyBranch']}]"
        
        # 1. 主星
        major_stars = []
        for s in p.get('majorStars', []):
            info = s['name']
            if s.get('brightness'): info += f"[{s['brightness']}]"
            if s.get('mutagen'): info += f"[↑{s['mutagen']}]"  # 向心自化标记
            major_stars.append(info)
        major_str = "，".join(major_stars) if major_stars else "无"
        
        # 2. 辅星
        minor_stars = []
        for s in p.get('minorStars', []):
            info = s['name']
            if s.get('brightness'): info += f"[{s['brightness']}]"
            minor_stars.append(info)
        minor_str = "，".join(minor_stars) if minor_stars else "无"
        
        # 3. 小星
        adj_stars = []
        important_adj = ['红鸾', '天喜', '天姚', '咸池', '天刑', '天虚', '天哭', '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '孤辰', '寡宿', '破碎', '天德', '解神', '天使', '封诰', '天伤', '天空', '孤辰', '劫煞', '凤阁', '天福', '截空', '蜚廉', '年解', '旬空', '阴煞', '月德', '天官', '台辅', '天巫', '大耗', '龙德']
        for s in p.get('adjectiveStars', []):
            if s['name'] in important_adj:
                info = s['name']
                if s.get('brightness'): info += f"[{s['brightness']}]"
                adj_stars.append(info)
        adj_str = "，".join(adj_stars) if adj_stars else "无"
        
        # 4. 神煞
        shensha_text = ""
        if p.get('suiqian12'):
            shensha_text += f"岁前星 : {p['suiqian12']}\n"
        if p.get('jiangqian12'):
            shensha_text += f"将前星 : {p['jiangqian12']}\n"
        if p.get('changsheng12'):
            shensha_text += f"十二长生 : {p['changsheng12']}\n"
        if p.get('boshi12'):
            shensha_text += f"太岁煞禄 : {p['boshi12']}\n"
        
        # 5. 大限
        decadal_range = p.get('decadal', {}).get('range', [0, 0])
        decadal_text = f"大限 : {decadal_range[0]}~{decadal_range[1]}虚岁\n"
        
        # 6. 小限
        ages = p.get('ages', [])
        minor_ages = ages[::2] if len(ages) > 5 else ages[:5]
        minor_ages_str = "，".join(map(str, minor_ages))
        minor_text = f"小限 : {minor_ages_str}虚岁\n"
        
        # 7. 流年
        yearly_ages = ages[1::2] if len(ages) > 5 else ages[1:6]
        yearly_ages_str = "，".join(map(str, yearly_ages))
        yearly_text = f"流年 : {yearly_ages_str}虚岁\n"
        
        # 组合宫位信息
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
    请以“体”为本，回答用户关于格局、性格、运势走向的问题。
    **注意：** 辅星（如文曲化忌）与杂曜（如红鸾）对格局影响巨大，请务必纳入分析。
    """
    
    data_context = f"【基本信息】\n{base_info}\n\n【命盘十二宫】\n{palace_text}"
    
    return system_prompt, data_context

def get_llm_response(messages):
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key: return None
    client = OpenAI(base_url="https://dashscope.aliyuncs.com/compatible-mode/v1", api_key=api_key)
    try:
        return client.chat.completions.create(model="qwen3-max", messages=messages, stream=True, temperature=0.7)
    except: return None

# ==========================================
# 3. 渲染逻辑
# ==========================================
def render_html_grid(full_data):
    pan = full_data['astrolabe']
    yun = full_data['horoscope']
    
    decadal_stem = yun['decadal']['heavenlyStem']
    decadal_muts = get_mutagens_by_stem(decadal_stem)
    decadal_map = {v: k for k, v in decadal_muts.items()} 
    
    yearly_stem = yun['yearly']['heavenlyStem']
    yearly_muts = get_mutagens_by_stem(yearly_stem)
    yearly_map = {v: k for k, v in yearly_muts.items()}
    
    palace_map = {p['earthlyBranch']: p for p in pan['palaces']}

    def make_cell(dizhi):
        p = palace_map.get(dizhi)
        if not p: return '<div class="palace-cell"></div>'
        
        # 星星信息 - 文墨天机样式
        stars_html = '<div class="stars-box">'
        
        # 主星
        major_stars = []
        for s in p.get('majorStars', []):
            name = s['name']
            brightness = f'[{s["brightness"]}]' if s.get('brightness') else ""
            m_birth = f'<span class="mut-birth">[↑{s["mutagen"]}]</span>' if s.get('mutagen') else ""
            m_dec = f'<span class="mut-decadal">[限{decadal_map[name]}]</span>' if name in decadal_map else ""
            m_year = f'<span class="mut-yearly">[流{yearly_map[name]}]</span>' if name in yearly_map else ""
            major_stars.append(f'<span class="star-major">{name}{brightness}</span>{m_birth}{m_dec}{m_year}')
        if major_stars:
            stars_html += ''.join(major_stars) + '<br>'
        
        # 辅星
        minor_stars = []
        for s in p.get('minorStars', []):
            name = s['name']
            brightness = f'[{s["brightness"]}]' if s.get('brightness') else ""
            m_dec = f'<span class="mut-decadal">[限{decadal_map[name]}]</span>' if name in decadal_map else ""
            m_year = f'<span class="mut-yearly">[流{yearly_map[name]}]</span>' if name in yearly_map else ""
            minor_stars.append(f'<span class="star-minor">{name}{brightness}</span>{m_dec}{m_year}')
        if minor_stars:
            stars_html += ''.join(minor_stars) + '<br>'
        
        # 小星
        adj_stars = []
        important_adj = ['红鸾', '天喜', '天姚', '咸池', '天刑', '天虚', '天哭', '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '孤辰', '寡宿', '破碎', '天德', '解神', '天使', '封诰', '天伤', '天空', '劫煞', '截空', '蜚廉', '年解', '旬空', '阴煞', '月德', '天官', '台辅', '天巫', '大耗', '龙德']
        for s in p.get('adjectiveStars', []):
            if s['name'] in important_adj:
                name = s['name']
                m_dec = f'<span class="mut-decadal">[限{decadal_map[name]}]</span>' if name in decadal_map else ""
                m_year = f'<span class="mut-yearly">[流{yearly_map[name]}]</span>' if name in yearly_map else ""
                adj_stars.append(f'<span class="star-adj">{name}</span>{m_dec}{m_year}')
        if adj_stars:
            stars_html += ''.join(adj_stars) + '<br>'
        
        # 年龄信息
        ages = p.get('ages', [])
        yearly_ages = ages[1::2] if len(ages) > 5 else ages[1:6]
        minor_ages = ages[::2] if len(ages) > 5 else ages[:5]
        yearly_ages_str = ",".join(map(str, yearly_ages))
        minor_ages_str = ",".join(map(str, minor_ages))
        
        stars_html += f'<div class="palace-age">'
        stars_html += f'流年: {yearly_ages_str}<br>'
        stars_html += f'小限: {minor_ages_str}<br>'
        stars_html += f'</div>'
        
        stars_html += '</div>'
        
        # 宫位信息
        decadal_range = p.get('decadal', {}).get('range', [0, 0])
        palace_info = f'<div class="palace-footer">'
        palace_info += f'<span class="palace-name">{p["name"]}</span>'
        palace_info += f'<span class="palace-dizhi">{dizhi}</span>'
        palace_info += f'<div class="palace-age">{decadal_range[0]}~{decadal_range[1]}虚岁</div>'
        palace_info += f'</div>'
        
        return f"""
        <div class="palace-cell">
            {stars_html}
            {palace_info}
        </div>
        """

    # 获取真太阳时间信息
    solar_result = st.session_state.get('solar_result', {})
    clock_time = solar_result.get('clock_time', f"{pan['solarDate']} {pan['timeRange'].split('~')[0]}")
    true_solar_time = solar_result.get('true_solar_time', f"{pan['solarDate']} {pan['timeRange'].split('~')[0]}")
    chinese_hour = solar_result.get('chinese_hour', pan.get('time', ''))
    
    # 中宫信息 - 文墨天机样式
    bazi = pan.get('chineseDate', '')
    center_html = f"""
    <div class="center-cell">
        <div class="center-title">紫微斗数命盘</div>
        
        <div class="bazi-tag">{bazi}</div>
        
        <div style="margin: 10px 0; text-align: center; color: #333;">
            <div>真太阳时: {true_solar_time}</div>
            <div>钟表时间: {clock_time}</div>
            <div>农历: {pan['lunarDate']}{chinese_hour}</div>
            <div>命主: {pan['soul']}; 身主: {pan['body']}</div>
            <div>子年斗君: 寅; 身宫: {pan['earthlyBranchOfBodyPalace']}</div>
        </div>
        
        <div style="margin-top:15px; text-align:center;">
            
            <div style="font-size:0.8em; color:#333;">自化图示: →禄→权→科→忌</div>
        </div>
    </div>
    """
    
    # 构建命盘网格
    row1 = make_cell('巳') + make_cell('午') + make_cell('未') + make_cell('申')
    row2 = make_cell('辰') + center_html + make_cell('酉')
    row3 = make_cell('卯') + make_cell('戌')
    row4 = make_cell('寅') + make_cell('丑') + make_cell('子') + make_cell('亥')
    
    return f"""<div class="ziwei-grid">{row1 + row2 + row3 + row4}</div>""".replace("\n", "")

# ==========================================
# 4. 侧边栏
# ==========================================
with st.sidebar:
    st.title("🟣 命理工作台")
    
    # 1. 历法选择
    cal_type = st.radio("历法", ["公历", "农历"], index=0, horizontal=True)
    
    col_y, col_m, col_d = st.columns([1.3, 0.9, 0.9])
    with col_y: sel_year = st.selectbox("年", list(range(2026, 1926, -1)), index=36)
    with col_m: sel_month = st.selectbox("月", list(range(1, 13)), index=0)
    with col_d:
        # 简单天数逻辑
        days = calendar.monthrange(sel_year, sel_month)[1] if cal_type == "公历" else 30
        sel_day = st.selectbox("日", list(range(1, days + 1)), index=0)
    
    # 农历闰月选项
    is_leap = False
    if cal_type == "农历":
        is_leap = st.checkbox("是闰月? (例如闰四月)", value=False)
        
    date_str_input = f"{sel_year}-{sel_month}-{sel_day}"
    
    # 定义时辰映射
    ZODIAC_HOURS = {
        0: "早子 (00:00 - 01:00)", 1: "丑 (01:00 - 03:00)", 2: "寅 (03:00 - 05:00)", 
        3: "卯 (05:00 - 07:00)", 4: "辰 (07:00 - 09:00)", 5: "巳 (09:00 - 11:00)", 
        6: "午 (11:00 - 13:00)", 7: "未 (13:00 - 15:00)", 8: "申 (15:00 - 17:00)", 
        9: "酉 (17:00 - 19:00)", 10: "戌 (19:00 - 21:00)", 11: "亥 (21:00 - 23:00)", 
        12: "晚子 (23:00 - 00:00)"
    }
    
    # 根据历法类型显示不同的时间输入选项
    if cal_type == "公历":
        # 公历：选择具体的小时和分钟
        st.markdown("### 具体时间")
        col_h, col_m = st.columns([1, 1])
        with col_h:
            sel_hour = st.selectbox("时", list(range(24)), index=10)
        with col_m:
            sel_minute = st.selectbox("分", list(range(0, 60, 5)), index=10)  # 每5分钟一个选项
        
        # 计算对应的时辰
        solar_result = solar_time_to_chinese_hour(sel_year, sel_month, sel_day, sel_hour, sel_minute, 120.033)
        chinese_hour_name = solar_result['chinese_hour']
        chinese_hour_index = solar_result['chinese_hour_index']
        st.info(f"对应的时辰：{chinese_hour_name} (索引：{chinese_hour_index})")
    else:
        # 农历：直接选择时辰
        st.markdown("### 选择时辰")
        chinese_hour_index = st.selectbox("时辰", options=range(13), format_func=lambda x: ZODIAC_HOURS[x])
        sel_hour = 0
        sel_minute = 0
    g = st.radio("性别", ["女", "男"], horizontal=True)
    
    st.markdown("---")
    btn = st.button("🚀 开始排盘", type="primary", use_container_width=True)

# ==========================================
# 5. 主逻辑
# ==========================================
# A. 初始化/重置逻辑
if btn:
    if cal_type == "公历":
        # 计算真太阳时间和对应的时辰
        solar_result = solar_time_to_chinese_hour(sel_year, sel_month, sel_day, sel_hour, sel_minute, 120.033)
        true_hour, true_minute = map(int, solar_result['true_solar_time'].split(' ')[1].split(':'))
        chinese_hour_name = solar_result['chinese_hour']
        
        # 存入 Session
        st.session_state['birth_date_str'] = date_str_input
        st.session_state['birth_time'] = chinese_hour_index
        st.session_state['gender'] = g
        st.session_state['is_lunar'] = (cal_type == "农历")
        st.session_state['is_leap'] = is_leap
        st.session_state['target_year'] = 2026 
        st.session_state['solar_result'] = solar_result
    else:
        # 农历直接使用选择的时辰
        solar_result = {
            'clock_time': f"{date_str_input} 00:00",
            'true_solar_time': f"{date_str_input} 00:00",
            'chinese_hour': ZODIAC_HOURS[chinese_hour_index].split(' ')[0],
            'chinese_hour_index': chinese_hour_index
        }
        
        # 存入 Session
        st.session_state['birth_date_str'] = date_str_input
        st.session_state['birth_time'] = chinese_hour_index
        st.session_state['gender'] = g
        st.session_state['is_lunar'] = (cal_type == "农历")
        st.session_state['is_leap'] = is_leap
        st.session_state['target_year'] = 2026 
        st.session_state['solar_result'] = solar_result
    
    st.session_state['messages'] = []
    
    data = get_ziwei_data(
        date_str_input, chinese_hour_index, g, 2026, 
        is_lunar=(cal_type == "农历"), is_leap=is_leap
    )
    
    if data:
        st.session_state['ziwei_data'] = data
        
        # 初始化 AI
        sys_prompt, data_context = parse_ziwei_to_prompt(data)
        st.session_state.messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "system", "content": data_context},
            {"role": "assistant", "content": "你好！我已经完整解析了这张命盘的本命结构。\n你可以问我：\n1. **格局性格**：例如“我适合创业还是上班？”\n2. **情感婚姻**：例如“我的正缘有什么特征？”\n3. **流年运势**：例如“今年要注意什么？”"}
        ]
        
        st.rerun()

# B. 持续渲染界面
if 'birth_date_str' in st.session_state and 'ziwei_data' in st.session_state:
    data = st.session_state['ziwei_data']
    current_target_year = st.session_state.get('target_year', 2026)
    
    # 1. 渲染命盘
    st.markdown(render_html_grid(data), unsafe_allow_html=True)
    
    # 2. 底部控制条
    st.markdown('<div class="timeline-container">', unsafe_allow_html=True)
    
    decades = []
    for p in data['astrolabe']['palaces']:
        decades.append({
            'range': p['decadal']['range'],
            'ganzhi': f"{p['decadal']['heavenlyStem']}{p['decadal']['earthlyBranch']}"
        })
    decades.sort(key=lambda x: x['range'][0])
    
    current_nominal_age = data['horoscope']['age']['nominalAge']
    
    st.markdown('<div class="timeline-label">1. 选择大限 (Decadal)</div>', unsafe_allow_html=True)
    cols = st.columns(len(decades))
    
    selected_decade_idx = 0
    for i, dec in enumerate(decades):
        start, end = dec['range']
        label = f"{start}-{end}\n{dec['ganzhi']}"
        is_active = (start <= current_nominal_age <= end)
        if is_active: selected_decade_idx = i
        
        if cols[i].button(label, key=f"dec_{i}", type="primary" if is_active else "secondary", use_container_width=True):
            # 反推农历生年
            calculated_birth_year = current_target_year - current_nominal_age + 1
            new_target_year = calculated_birth_year + start - 1
            st.session_state['target_year'] = new_target_year
            
            # 刷新数据
            new_data = get_ziwei_data(
                st.session_state['birth_date_str'], 
                st.session_state['birth_time'], 
                st.session_state['gender'], 
                new_target_year,
                is_lunar=st.session_state['is_lunar'],
                is_leap=st.session_state['is_leap']
            )
            st.session_state['ziwei_data'] = new_data
            st.rerun()

    st.markdown('<div class="timeline-label" style="margin-top:10px;">2. 选择流年 (Yearly)</div>', unsafe_allow_html=True)
    sel_start, sel_end = decades[selected_decade_idx]['range']
    
    calculated_birth_year = current_target_year - current_nominal_age + 1
    
    years_in_decade = []
    for age in range(sel_start, sel_end + 1):
        y = calculated_birth_year + (age - 1)
        years_in_decade.append({'year': y, 'age': age, 'ganzhi': get_ganzhi_for_year(y)})
        
    cols_y = st.columns(len(years_in_decade))
    for i, item in enumerate(years_in_decade):
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
            st.session_state['ziwei_data'] = new_data
            st.rerun()
            
    st.markdown('</div>', unsafe_allow_html=True)

    # --- 3. AI 对话 ---
    st.markdown("---")
    st.subheader(f"🤖 AI 命理咨询师")

    if "messages" not in st.session_state: st.session_state.messages = []

    for message in st.session_state.messages:
        if message["role"] != "system":
            with st.chat_message(message["role"]): st.markdown(message["content"])

    if prompt := st.chat_input("输入你的问题..."):
        with st.chat_message("user"): st.markdown(prompt)
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            stream = get_llm_response(st.session_state.messages)
            if stream:
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        full_response += chunk.choices[0].delta.content
                        message_placeholder.markdown(full_response + "▌")
                message_placeholder.markdown(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})

elif 'birth_date_str' not in st.session_state:
    # 添加空白行，使提示信息显示在页面下方
    for _ in range(10):
        st.markdown(" ")
    st.info("👈 请在左侧输入信息开始排盘")