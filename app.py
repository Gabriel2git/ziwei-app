import streamlit as st
import calendar
import datetime
import json

from src.config import (
    CSS_STYLE, 
    ZODIAC_HOURS, 
    AI_MODELS,
    get_ganzhi_for_year
)
from src.calculations import (
    solar_time_to_chinese_hour,
    process_birth_input
)
from src.api_client import (
    get_ziwei_data,
    get_llm_response
)
from src.prompts import (
    parse_ziwei_to_prompt,
    generate_master_prompt,
    get_default_system_prompt
)
from src.ui_components import render_html_grid

st.set_page_config(
    page_title="AI 紫微斗数 Pro",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown(CSS_STYLE, unsafe_allow_html=True)

page = st.sidebar.radio(
    "选择页面",
    ["命盘显示", "AI 命理咨询师"],
    index=0
)

with st.sidebar:
    st.title("🟣 命理工作台")
    
    st.markdown("### AI模型选择")
    model_option = st.selectbox(
        "选择AI模型",
        AI_MODELS,
        index=0
    )
    st.session_state['selected_model'] = model_option
    
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
    process_birth_input(cal_type, sel_year, sel_month, sel_day, sel_hour, sel_minute, chinese_hour_index, date_str_input)
    st.session_state['gender'] = g
    st.session_state['is_leap'] = is_leap
    st.session_state['target_year'] = 2026
    
    st.session_state['messages'] = []
    st.session_state['need_refresh_chat'] = True
    
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
        st.session_state['need_refresh_chat'] = False
        
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
            
            decade_options = []
            selected_decade_idx = 0
            for i, dec in enumerate(decades):
                start, end = dec['range']
                ganzhi = dec['ganzhi']
                label = f"{start}-{end} {ganzhi}"
                decade_options.append(label)
                if start <= current_nominal_age <= end:
                    selected_decade_idx = i
            
            st.markdown('<div class="timeline-scroll-container">', unsafe_allow_html=True)
            selected_decade_label = st.radio(
                "",
                decade_options,
                index=selected_decade_idx,
                key="decade_radio",
                horizontal=True,
                label_visibility="collapsed"
            )
            st.markdown('</div>', unsafe_allow_html=True)
            
            selected_decade_index = decade_options.index(selected_decade_label)
            if selected_decade_index != selected_decade_idx:
                sel_dec = decades[selected_decade_index]
                new_target_year = calculated_birth_year + sel_dec['range'][0] - 1
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
                year_options = []
                for age in range(sel_start, sel_end + 1):
                    y = calculated_birth_year + (age - 1)
                    ganzhi = get_ganzhi_for_year(y)
                    years_in_decade.append({'year': y, 'age': age, 'ganzhi': ganzhi})
                    year_options.append(f"{y} {ganzhi}")
                
                current_year_index = 0
                for i, item in enumerate(years_in_decade):
                    if item['year'] == current_target_year:
                        current_year_index = i
                
                st.markdown('<div class="timeline-scroll-container">', unsafe_allow_html=True)
                selected_year_label = st.radio(
                    "",
                    year_options,
                    index=current_year_index,
                    key="year_radio",
                    horizontal=True,
                    label_visibility="collapsed"
                )
                st.markdown('</div>', unsafe_allow_html=True)
                
                selected_year_index = year_options.index(selected_year_label)
                if selected_year_index != current_year_index:
                    item = years_in_decade[selected_year_index]
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
        
        if st.button("📋 打印AI Prompt", key="print_prompt"):
            sys_prompt, data_context = parse_ziwei_to_prompt(data)
            master_prompt = generate_master_prompt("测试问题", data, current_target_year)
            
            st.subheader("📝 喂给AI的Prompt")
            st.markdown("### 系统提示词")
            st.text(sys_prompt)
            
            st.markdown("### 数据上下文")
            st.text(data_context)
            
            st.markdown("### 主提示词")
            st.text(master_prompt)

    elif page == "AI 命理咨询师":
        st.subheader(f"🤖 AI 命理咨询师")
        
        if "messages" not in st.session_state:
            st.session_state.messages = []
        
        if "need_refresh_chat" in st.session_state and st.session_state["need_refresh_chat"]:
            st.session_state.messages = []
            st.session_state["need_refresh_chat"] = False

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
                system_prompt = get_default_system_prompt()
            
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
        
        col1, col2 = st.columns([1, 1])
        with col1:
            if st.button("💾 保存对话", use_container_width=True):
                if st.session_state.get("messages"):
                    chat_data = {
                        "birth_date": st.session_state.get("birth_date_str", ""),
                        "gender": st.session_state.get("gender", ""),
                        "messages": [msg for msg in st.session_state.messages if msg["role"] != "system"],
                        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    chat_json = json.dumps(chat_data, ensure_ascii=False, indent=2)
                    st.download_button(
                        label="下载对话记录",
                        data=chat_json.encode('utf-8'),
                        file_name=f"ziwei_chat_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                        mime="application/json"
                    )
                else:
                    st.warning("没有对话记录可保存")
        
        with col2:
            uploaded_file = st.file_uploader("📂 加载对话", type=['json'], key="chat_uploader")
            if uploaded_file is not None:
                try:
                    file_content = uploaded_file.getvalue().decode('utf-8')
                    chat_data = json.loads(file_content)
                    st.session_state.messages = chat_data.get("messages", [])
                    st.success(f"成功加载 {len(st.session_state.messages)} 条对话记录")
                    st.rerun()
                except json.JSONDecodeError as e:
                    st.error(f"JSON 解析失败: {e}")
                except Exception as e:
                    st.error(f"加载失败: {e}")
                    import traceback
                    st.error(traceback.format_exc())
        
        st.info("💡 想要查看命盘？请在左侧边栏切换到 '命盘显示' 页面")

elif 'birth_date_str' not in st.session_state:
    for _ in range(10):
        st.markdown(" ")
    st.info("👈 请在左侧输入信息开始排盘")
