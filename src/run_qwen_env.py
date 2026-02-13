import os
import sys
from openai import OpenAI


def test_qwen_v3():
    # 1. 自动读取环境变量
    api_key = os.getenv("DASHSCOPE_API_KEY")

    # 🚨 环境变量检查（新手最容易卡在这里）
    if not api_key:
        print("❌ 错误：未读取到环境变量 'DASHSCOPE_API_KEY'")
        print("------------------------------------------------")
        print("⚠️ 极大概率是【重启】问题：")
        print("1. Windows 的 setx 命令不会让当前打开的软件立刻生效。")
        print("2. 请务必【完全关闭】PyCharm (File -> Exit)，然后重新打开项目。")
        print("3. 如果还不行，尝试重启电脑。")
        return

    print(f"✅ 成功读取 Key: {api_key[:6]}******")
    print("🚀 正在呼叫阿里云百炼 (Model: qwen3-max)...")

    # 2. 配置客户端 (Qwen 3 依然兼容 OpenAI 协议)
    client = OpenAI(
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        api_key=api_key,
    )

    try:
        # 3. 发送请求 (指定 qwen3-max)
        completion = client.chat.completions.create(
            model="qwen3-max",  # <--- 这里改成了你指定的 Qwen 3
            messages=[
                {'role': 'system', 'content': '你是一位精通紫微斗数的AI大师。'},
                {'role': 'user', 'content': '简单一句话告诉我，紫微斗数里的“天机星”代表什么？'}
            ]
        )

        # 4. 打印结果
        response_content = completion.choices[0].message.content
        print("\n" + "=" * 40)
        print("🤖 Qwen3-Max 回复：")
        print(response_content)
        print("=" * 40 + "\n")
        print("🎉 恭喜！DeepSeek 和 Qwen3-Max 的双模引擎地基已打通！")

    except Exception as e:
        # 针对 Qwen 3 可能的特殊报错进行提示
        print(f"\n❌ 调用失败: {e}")
        if "InvalidParameter" in str(e):
            print("💡 提示：请检查模型名称是否拼写正确，或检查账号是否有 Qwen3 的权限。")
        elif "InvalidApiKey" in str(e):
            print("💡 提示：Key 可能无效，请去阿里云控制台重新复制。")


if __name__ == '__main__':
    test_qwen_v3()