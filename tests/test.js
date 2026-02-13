// 1. 像 Python 的 import 一样，引入 iztro 库
var iztro = require('iztro');

console.log("正在启动紫微斗数排盘...");

// 2. 排盘
// 参数解释：阳历日期字符串, 时辰索引(0-12), 性别(0女1男), 是否润月(一般false), 语言
// 这里我们排一个：2000年8月16日，寅时(3点-5点，索引为3)，女
try {
    var pan = iztro.astro.bySolar('2000-8-16', 3, '女', true, 'zh-CN');

    // 3. 提取核心信息（如果不提取，直接打印 pan 会是一大坨看不懂的代码）
    // 比如：我们要看命宫的主星
    var mingGong = pan.palace(1); // 1 代表命宫的索引

    console.log("====== 排盘成功 ======");
    console.log("阳历日期：", pan.solarDate);
    console.log("农历日期：", pan.lunarDate);
    console.log("五行局：", pan.fiveElementsClass);
    console.log("命宫主星：", mingGong.majorStars.map(star => star.name)); // 提取星星的名字
    console.log("======================");

    // 4. (关键) 把整个数据打印成 JSON 字符串，这一步是为了以后给 Python 看的
    // console.log(JSON.stringify(pan, null, 2));

} catch (err) {
    console.error("出错了：", err);
}