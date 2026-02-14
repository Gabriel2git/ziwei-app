from py_iztro import Astro

print("Testing py_iztro with pythonmonkey 1.3.0...")
try:
    a = Astro()
    print("Astro() created successfully!")
    
    result = a.by_solar('2000-5-23', 6, '男', True, 'zh-CN')
    print(f"Solar Date: {result.solar_date}")
    print(f"Lunar Date: {result.lunar_date}")
    print(f"Chinese Date: {result.chinese_date}")
    print(f"Zodiac: {result.zodiac}")
    print(f"Sign: {result.sign}")
    
    print("\nPalaces:")
    for i, palace in enumerate(result.palaces[:3]):
        print(f"  {i+1}. {palace.name}: {palace.major_stars}")
    
    print("\n=== SUCCESS! py_iztro works with pythonmonkey 1.3.0 ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
