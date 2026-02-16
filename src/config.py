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
        height: 550px !important;
        max-height: 550px !important;
        min-height: 550px !important;
    }

    .palace-cell {
        background-color: #fff;
        border: 1px solid #ddd;
        padding: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden; 
        position: relative;
        font-size: 0.75em;
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
    
    .center-cell * {
        font-size: 0.8em !important;
        line-height: 1.3 !important;
    }
    
    .center-cell .center-title {
        font-size: 1.1em !important;
    }
    
    .center-detail {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #333; 
        line-height: 1.4; 
        font-size: 0.64em;
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
    
    .timeline-scroll-container {
        display: flex;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        gap: 8px;
        padding: 5px 0;
        -webkit-overflow-scrolling: touch;
    }
    
    .timeline-scroll-container div[data-testid="stVerticalBlock"] {
        display: flex !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
    }
    
    .timeline-scroll-container label {
        font-size: 0.8em !important;
        white-space: nowrap !important;
    }
    
    .timeline-label {
        font-weight: bold;
        color: #5d4037;
        margin-bottom: 5px;
        font-size: 0.9em;
    }
    
    .timeline-container > div[data-testid="stHorizontalBlock"] {
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
    }
    
    .timeline-container > div[data-testid="stHorizontalBlock"] > div {
        flex: 0 0 auto !important;
        min-width: 60px !important;
    }
    
    div[data-testid="stHorizontalBlock"] button {
        padding: 0.2rem 0.2rem;
        font-size: 0.8em;
    }
    
    .timeline-row {
        display: flex;
        flex-wrap: nowrap !important;
        overflow-x: auto;
        gap: 5px;
    }
    
    .timeline-row > div {
        flex: 0 0 auto;
        min-width: 60px;
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

    /* 手机端响应式适配 */
    @media (max-width: 768px) {
        [data-testid="stSidebar"] { min-width: 300px !important; max-width: 400px !important; }
        
        .ziwei-grid {
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(4, 1fr);
            height: 400px !important;
            max-height: 400px !important;
            min-height: 400px !important;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        
        .center-cell {
            grid-column: 2 / 4;
            grid-row: 2 / 4;
            padding: 8px;
        }
        
        .palace-cell {
            padding: 2px;
            font-size: 0.55em;
        }
        
        .star-major {
            font-size: 0.9em;
        }
        
        .star-minor {
            font-size: 0.8em;
        }
        
        .star-adj {
            font-size: 0.7em;
        }
        
        .center-detail {
            font-size: 0.44em !important;
        }
        
        .center-title {
            font-size: 0.56em !important;
        }
        
        .bazi-tag {
            font-size: 0.56em !important;
            padding: 1px 4px !important;
        }
        
        .center-info {
            font-size: 0.56em !important;
            line-height: 1.2 !important;
            margin: 5px 0 !important;
        }
        
        .mutagen-legend {
            font-size: 0.48em !important;
            margin-top: 5px !important;
        }
        
        .mut-birth, .mut-decadal, .mut-yearly {
            font-size: 0.8em;
        }
        
        .timeline-container {
            padding: 5px !important;
        }
        
        .timeline-label {
            font-size: 0.7em !important;
            margin-bottom: 3px !important;
        }
        
        div[data-testid="stHorizontalBlock"] button {
            padding: 0.1rem 0.1rem !important;
            font-size: 0.65em !important;
        }
    }

    /* 超小屏幕适配 */
    @media (max-width: 480px) {
        [data-testid="stSidebar"] { min-width: 250px !important; max-width: 300px !important; }
        
        .ziwei-grid {
            gap: 1px;
            border: 2px solid #000;
            height: 350px !important;
            max-height: 350px !important;
            min-height: 350px !important;
        }
        
        .palace-cell {
            padding: 1px;
            font-size: 0.5em;
        }
        
        .center-cell {
            padding: 5px;
        }
        
        .center-detail {
            font-size: 0.4em !important;
        }
        
        .star-major {
            font-size: 0.8em;
        }
        
        .star-minor {
            font-size: 0.7em;
        }
        
        div[data-testid="stHorizontalBlock"] button {
            padding: 0.05rem 0.05rem !important;
            font-size: 0.6em !important;
        }
    }
</style>"""

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

HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

IMPORTANT_ADJ_STARS = [
    '红鸾', '天喜', '天姚', '咸池', '天刑', '天虚', '天哭', 
    '三台', '八座', '恩光', '天贵', '龙池', '凤阁', '孤辰', 
    '寡宿', '破碎', '天德', '解神', '天使', '封诰', '天伤', 
    '天空', '孤辰', '劫煞', '凤阁', '天福', '截空', '蜚廉', 
    '年解', '旬空', '阴煞', '月德', '天官', '台辅', '天巫', 
    '大耗', '龙德'
]

DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
ZIWEI_API_URL_DEFAULT = "http://localhost:3000/api/ziwei"

ZODIAC_HOURS = {
    0: "早子 (00:00 - 01:00)", 1: "丑 (01:00 - 03:00)", 2: "寅 (03:00 - 05:00)", 
    3: "卯 (05:00 - 07:00)", 4: "辰 (07:00 - 09:00)", 5: "巳 (09:00 - 11:00)", 
    6: "午 (11:00 - 13:00)", 7: "未 (13:00 - 15:00)", 8: "申 (15:00 - 17:00)", 
    9: "酉 (17:00 - 19:00)", 10: "戌 (19:00 - 21:00)", 11: "亥 (21:00 - 23:00)", 
    12: "晚子 (23:00 - 00:00)"
}

AI_MODELS = ["qwen3-max", "deepseek-v3.2", "glm-4.7", "kimi-k2.5"]

def get_mutagens_by_stem(stem):
    return SIHUA_TABLE.get(stem, {})

def get_ganzhi_for_year(year):
    offset = year - 1984
    stem = HEAVENLY_STEMS[offset % 10]
    branch = EARTHLY_BRANCHES[offset % 12]
    return f"{stem}{branch}"
