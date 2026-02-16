import math
from datetime import datetime as dt
import streamlit as st
from src.config import ZODIAC_HOURS

def calculate_true_solar_time(year, month, day, hour, minute, longitude=120.033):
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

def process_birth_input(cal_type, sel_year, sel_month, sel_day, sel_hour, sel_minute, chinese_hour_index, date_str_input):
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
    st.session_state['is_lunar'] = (cal_type == "农历")
    
    return solar_result
