import subprocess
import json
import os


def inspect_iztro_density():
    print("🔍 正在启动 iztro 数据深度体检...")

    # 1. 构造一个测试用的 Node.js 脚本
    # 我们特意开启 fixLeap=true (处理闰月), language='zh-CN'
    js_script = """
    var iztro = require('iztro');

    try {
        // 模拟一个 1990-01-01 出生的女命
        var pan = iztro.astro.bySolar('1990-01-01', 0, '女', true, 'zh-CN');
        console.log(JSON.stringify(pan, null, 2)); // 格式化输出方便查看
    } catch (e) {
        console.error("iztro 运行失败:", e);
    }
    """

    temp_file = "debug_iztro.js"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(js_script)

    try:
        # 2. 调用 Node.js
        result = subprocess.run(["node", temp_file], capture_output=True, text=True, encoding='utf-8')

        if result.stderr:
            print("❌ JS 报错:", result.stderr)
            return

        # 3. 解析 JSON
        data = json.loads(result.stdout)

        # 4. === 核心检查环节 ===
        print("\n✅ 数据获取成功！开始分析密度...")

        # [检查 1]：基本盘面信息
        print(f"\n1.【基本信息】")
        print(f"   - 局数: {data.get('fiveElementsClass', '❌缺失')}")
        print(f"   - 命主: {data.get('soul', '❌缺失')}")
        print(f"   - 身主: {data.get('body', '❌缺失')}")

        # [检查 2]：寻找关键桃花星 (红鸾、天喜、天姚、咸池)
        # 这些星星通常藏在 'minorStars' (辅星) 或杂曜里
        target_stars = ['红鸾', '天喜', '天姚', '咸池']
        found_stars = {s: False for s in target_stars}

        print(f"\n2.【关键桃花星检查】(用于恋爱预测)")

        # 遍历所有宫位去搜星
        sample_palace = None
        for p in data['palaces']:
            if p['name'] == '命宫': sample_palace = p

            # 把这个宫位里所有的星星名字拼起来
            all_star_names = [s['name'] for s in p.get('majorStars', [])] + \
                             [s['name'] for s in p.get('minorStars', [])]

            for t in target_stars:
                if t in all_star_names:
                    found_stars[t] = True
                    print(f"   - ✅ 发现【{t}】在 {p['name']}")

        # 总结桃花星
        missing = [k for k, v in found_stars.items() if not v]
        if missing:
            print(f"   ⚠️ 警告：未找到 {missing}，这会影响恋爱Prompt的准确性！")
        else:
            print("   🎉 完美！核心桃花星全齐！")

        # [检查 3]：星曜亮度 (庙旺平陷)
        print(f"\n3.【星曜亮度检查】")
        if sample_palace and sample_palace.get('majorStars'):
            star = sample_palace['majorStars'][0]
            print(f"   - 抽查命宫主星: {star['name']}")
            print(f"   - 亮度状态: {star.get('brightness', '❌缺失')}")
            if star.get('brightness'):
                print("   ✅ 亮度数据存在，可以判断吉凶力度。")
            else:
                print("   ❌ 亮度缺失，无法判断星曜强弱。")

        # [检查 4]：四化 (禄权科忌)
        print(f"\n4.【四化检查】")
        # 检查宫位里的星星有没有四化标记
        found_sihua = False
        for p in data['palaces']:
            for s in p.get('majorStars', []):
                if s.get('mutagen'):  # mutagen 是四化的字段名
                    print(f"   - ✅ 发现四化: {p['name']}的{s['name']}化【{s['mutagen']}】")
                    found_sihua = True
                    break
            if found_sihua: break

        if not found_sihua:
            print("   ⚠️ 未发现生年四化信息！")

        # [检查 5]：大限与流年
        print(f"\n5.【时间维度检查】")
        if sample_palace:
            # 检查大限
            decadal = sample_palace.get('decadal', {})
            print(f"   - 大限数据: {decadal} (如 range: [6, 15])")

            # 检查流年 (iztro 通常会给出一个 yearly 数组，或者 ages 数组)
            ages = sample_palace.get('ages', [])
            print(f"   - 流年/小限索引: {ages[:5]}... (这些数字代表岁数)")

            if decadal and ages:
                print("   ✅ 时间维度数据具备，可以通过逻辑推算2026流年。")
            else:
                print("   ❌ 时间维度缺失，无法推算应期。")

    except Exception as e:
        print(f"运行出错: {e}")
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


if __name__ == "__main__":
    inspect_iztro_density()