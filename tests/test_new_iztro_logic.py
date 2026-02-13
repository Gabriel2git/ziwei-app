import subprocess
import json
import os


def test_wenmo_style_natal_only():
    print("🔍 正在模拟【文墨天机】风格（纯天盘）数据输出...\n")

    # 1. 构造 Node.js 脚本：只获取本命盘
    # 参数：2000-5-23, 10:50(巳时=5), 男
    js_script = """
    var iztro = require('iztro');
    try {
        // bySolar(dateStr, timeIndex, gender, fixLeap, language)
        var astrolabe = iztro.astro.bySolar('2000-5-23', 5, '男', true, 'zh-CN');

        console.log(JSON.stringify({
            astrolabe: astrolabe
        }));
    } catch (e) {
        console.error(e);
    }
    """

    temp_file = "debug_wenmo_natal.js"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(js_script)

    try:
        # 2. 执行 Node.js
        result = subprocess.run(["node", temp_file], capture_output=True, text=True, encoding='utf-8')
        if result.stderr:
            print("❌ JS 运行出错:", result.stderr)
            return

        data = json.loads(result.stdout)
        pan = data['astrolabe']

        # 3. === 开始复刻文墨天机格式 ===

        print(f"├基本信息")
        print(f"│ ├日期 : {pan['solarDate']} ({pan['lunarDate']})")
        print(f"│ ├局数 : {pan['fiveElementsClass']}")
        print(f"│ └命主 : {pan['soul']} | 身主 : {pan['body']}")
        print("│")
        print("├命盘十二宫 (本命盘)")

        for i, p in enumerate(pan['palaces']):
            # --- A. 宫位标题 (增加身宫/来因标记) ---
            special = ""
            if p.get('isBodyPalace'): special += " [身宫]"
            if p.get('isOriginalPalace'): special += " [来因]"

            print(f"│ ├{p['name']}宫{special} [{p['heavenlyStem']}{p['earthlyBranch']}]")

            # --- B. 主星 (带亮度、生年四化) ---
            major_str = "无"
            if p.get('majorStars'):
                stars = []
                for s in p['majorStars']:
                    name = s['name']
                    # 亮度
                    bright = f"[{s['brightness']}]" if s.get('brightness') else ""
                    # 生年四化 (iztro output: mutagen)
                    mut = f"[生年{s['mutagen']}]" if s.get('mutagen') else ""

                    stars.append(f"{name}{bright}{mut}")
                major_str = ",".join(stars)
            print(f"│ │ ├主星 : {major_str}")

            # --- C. 辅星 (Minor Stars) ---
            minor_str = "无"
            if p.get('minorStars'):
                m_stars = []
                for s in p['minorStars']:
                    info = f"{s['name']}"
                    if s.get('brightness'): info += f"[{s['brightness']}]"
                    if s.get('mutagen'): info += f"[生年{s['mutagen']}]"  # 文昌文曲可能有忌
                    m_stars.append(info)
                minor_str = ",".join(m_stars)
            print(f"│ │ ├辅星 : {minor_str}")

            # --- D. 杂曜 (包含红鸾天喜等) ---
            adj_str = "无"
            if p.get('adjectiveStars'):
                adj_names = [s['name'] for s in p['adjectiveStars']]
                # 打印前12个，看看有没有桃花星
                adj_str = ",".join(adj_names[:12]) + ("..." if len(adj_names) > 12 else "")
            print(f"│ │ ├小星 : {adj_str}")

            # --- E. 神煞 (博士、长生、岁前、将前) ---
            # 文墨天机把这些放在“神煞”分组里
            gods = []
            if p.get('boshi12'): gods.append(f"博士:{p['boshi12']}")
            if p.get('changsheng12'): gods.append(f"长生:{p['changsheng12']}")
            if p.get('suiqian12'): gods.append(f"岁前:{p['suiqian12']}")
            if p.get('jiangqian12'): gods.append(f"将前:{p['jiangqian12']}")
            gods_str = " | ".join(gods)
            print(f"│ │ ├神煞 : {gods_str}")

            # --- F. 大限/小限 ---
            # iztro 的 ages 数组就是小限
            ages = p.get('ages', [])
            ages_str = ",".join(map(str, ages[:6])) + "..."
            print(f"│ │ └运限 : 大限[{p['decadal']['range'][0]}~{p['decadal']['range'][1]}] 小限[{ages_str}]")
            print("│ │")

    except Exception as e:
        print(f"❌ 解析出错: {e}")
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


if __name__ == "__main__":
    test_wenmo_style_natal_only()