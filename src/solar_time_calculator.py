import math
from datetime import datetime, timedelta

"""
真太阳时间计算器
"""

def calculate_true_solar_time(year, month, day, hour, minute, longitude=120.033):
    """
    计算真太阳时间
    
    参数:
        year: 年份
        month: 月份
        day: 日期
        hour: 小时
        minute: 分钟
        longitude: 地理经度，默认120.033（上海）
    
    返回:
        tuple: (真太阳时小时, 真太阳时分钟)
    """
    # 1. 计算从2000年1月1日起的天数
    date = datetime(year, month, day, hour, minute)
    epoch = datetime(2000, 1, 1, 12, 0)  # 2000年1月1日12:00 UTC
    days_since_epoch = (date - epoch).total_seconds() / (24 * 3600)
    
    # 2. 计算太阳赤纬（简化计算）
    # 太阳赤纬 = 23.45 * sin(360/365 * (days_since_epoch + 284))
    declination = 23.45 * math.sin(math.radians(360/365 * (days_since_epoch + 284)))
    
    # 3. 计算时差（Equation of Time，简化计算）
    # 时差 = 9.87 * sin(2*B) - 7.53 * cos(B) - 1.5 * sin(B)
    B = math.radians(360/365 * (days_since_epoch - 81))
    equation_of_time = 9.87 * math.sin(2*B) - 7.53 * math.cos(B) - 1.5 * math.sin(B)
    
    # 4. 计算时区修正
    # 时区修正 = (经度 - 120) * 4 分钟/度（假设使用东八区作为标准时）
    time_zone_correction = (longitude - 120) * 4
    
    # 5. 计算真太阳时间
    # 真太阳时间 = 标准时间 + 时差 + 时区修正
    total_minutes = hour * 60 + minute + equation_of_time + time_zone_correction
    
    # 6. 调整到0-1440分钟范围内
    total_minutes = total_minutes % 1440
    if total_minutes < 0:
        total_minutes += 1440
    
    # 7. 转换为小时和分钟
    true_hour = int(total_minutes // 60)
    true_minute = int(round(total_minutes % 60))
    
    # 处理分钟进位
    if true_minute == 60:
        true_hour = (true_hour + 1) % 24
        true_minute = 0
    
    return true_hour, true_minute

def get_chinese_hour(hour, minute):
    """
    根据时间获取对应的时辰
    
    参数:
        hour: 小时
        minute: 分钟
    
    返回:
        tuple: (时辰名称, 时辰索引)
    """
    # 时辰对应表
    chinese_hours = [
        ("子时", 11),  # 23:00-01:00
        ("丑时", 1),   # 01:00-03:00
        ("寅时", 2),   # 03:00-05:00
        ("卯时", 3),   # 05:00-07:00
        ("辰时", 4),   # 07:00-09:00
        ("巳时", 5),   # 09:00-11:00
        ("午时", 6),   # 11:00-13:00
        ("未时", 7),   # 13:00-15:00
        ("申时", 8),   # 15:00-17:00
        ("酉时", 9),   # 17:00-19:00
        ("戌时", 10),  # 19:00-21:00
        ("亥时", 11),  # 21:00-23:00
    ]
    
    # 计算当前时间的分钟数
    total_minutes = hour * 60 + minute
    
    # 确定对应的时辰
    if 23*60 <= total_minutes or total_minutes < 1*60:
        return chinese_hours[0]  # 子时
    elif 1*60 <= total_minutes < 3*60:
        return chinese_hours[1]  # 丑时
    elif 3*60 <= total_minutes < 5*60:
        return chinese_hours[2]  # 寅时
    elif 5*60 <= total_minutes < 7*60:
        return chinese_hours[3]  # 卯时
    elif 7*60 <= total_minutes < 9*60:
        return chinese_hours[4]  # 辰时
    elif 9*60 <= total_minutes < 11*60:
        return chinese_hours[5]  # 巳时
    elif 11*60 <= total_minutes < 13*60:
        return chinese_hours[6]  # 午时
    elif 13*60 <= total_minutes < 15*60:
        return chinese_hours[7]  # 未时
    elif 15*60 <= total_minutes < 17*60:
        return chinese_hours[8]  # 申时
    elif 17*60 <= total_minutes < 19*60:
        return chinese_hours[9]  # 酉时
    elif 19*60 <= total_minutes < 21*60:
        return chinese_hours[10]  # 戌时
    else:  # 21*60 <= total_minutes < 23*60
        return chinese_hours[11]  # 亥时

def solar_time_to_chinese_hour(year, month, day, hour, minute, longitude=120.033):
    """
    从钟表时间到真太阳时间，再到时辰的完整转换
    
    参数:
        year: 年份
        month: 月份
        day: 日期
        hour: 小时
        minute: 分钟
        longitude: 地理经度，默认120.033（上海）
    
    返回:
        dict: 包含所有计算结果的字典
    """
    # 计算真太阳时间
    true_hour, true_minute = calculate_true_solar_time(year, month, day, hour, minute, longitude)
    
    # 获取对应的时辰
    chinese_hour_name, chinese_hour_index = get_chinese_hour(true_hour, true_minute)
    
    # 构建结果字典
    result = {
        "clock_time": f"{year}-{month}-{day} {hour:02d}:{minute:02d}",
        "true_solar_time": f"{year}-{month}-{day} {true_hour:02d}:{true_minute:02d}",
        "longitude": longitude,
        "chinese_hour": chinese_hour_name,
        "chinese_hour_index": chinese_hour_index,
        "time_difference": f"{true_hour - hour:+.1f}小时{true_minute - minute:+.1f}分钟"
    }
    
    return result

if __name__ == "__main__":
    # 测试：2000-5-23 10:50，经度120.033
    result = solar_time_to_chinese_hour(2000, 5, 23, 10, 50, 120.033)
    print("测试结果:")
    print(f"钟表时间: {result['clock_time']}")
    print(f"真太阳时: {result['true_solar_time']}")
    print(f"地理经度: {result['longitude']}")
    print(f"对应时辰: {result['chinese_hour']} (索引: {result['chinese_hour_index']})")
    print(f"时差: {result['time_difference']}")
