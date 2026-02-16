import os
import requests
import streamlit as st
from openai import OpenAI
from src.config import DASHSCOPE_BASE_URL, ZIWEI_API_URL_DEFAULT

@st.cache_data(ttl=3600)  # 缓存 1 小时
def get_ziwei_data(birthday, hour_index, gender, target_year, is_lunar=False, is_leap=False):
    api_url = os.getenv('ZIWEI_API_URL', ZIWEI_API_URL_DEFAULT)
    
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

def get_llm_response(messages):
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        st.warning("💡 提示：AI服务暂不可用，请先到'命盘显示'页面排盘，或刷新页面重试")
        return None
    
    model = st.session_state.get('selected_model', 'qwen3-max')
    base_url = DASHSCOPE_BASE_URL
    
    client = OpenAI(base_url=base_url, api_key=api_key)
    try:
        return client.chat.completions.create(model=model, messages=messages, stream=True, temperature=0.7)
    except Exception as e:
        st.error(f"AI调用失败: {e}")
        return None
