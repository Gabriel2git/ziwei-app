import streamlit as st
from src.config import get_mutagens_by_stem

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
            m_birth = f'<span class="mut-birth">[↑{s.get("mutagen", "")}]</span>' if s.get('mutagen') else ""
            m_dec = f'<span class="mut-decadal">[限{decadal_map.get(name, "")}]</span>' if name in decadal_map else ""
            m_year = f'<span class="mut-yearly">[流{yearly_map.get(name, "")}]</span>' if name in yearly_map else ""
            minor_stars.append(f'<span class="star-minor">{name}{brightness}</span>{m_birth}{m_dec}{m_year}')
        
        if minor_stars:
            stars_html += '<div class="star-section">' + ''.join(minor_stars) + '</div>'
        
        adj_stars = []
        for s in p.get('adjectiveStars', []):
            name = s.get('name', '')
            m_birth = f'<span class="mut-birth">[↑{s.get("mutagen", "")}]</span>' if s.get('mutagen') else ""
            m_dec = f'<span class="mut-decadal">[限{decadal_map.get(name, "")}]</span>' if name in decadal_map else ""
            m_year = f'<span class="mut-yearly">[流{yearly_map.get(name, "")}]</span>' if name in yearly_map else ""
            adj_stars.append(f'<span class="star-adj">{name}</span>{m_birth}{m_dec}{m_year}')
        
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
