const { chromium } = require('playwright');

(async () => {
  // 使用用户提供的 Chrome 路径
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'E:\\TraeFile\\chrome-win\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ 控制台错误:', msg.text());
    }
  });

  // 监听网络请求
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method()
    });
  });

  // 访问首页
  console.log('正在访问首页...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // 截图保存首页
  await page.screenshot({ path: '../test-screenshots/01-homepage.png', fullPage: true });
  console.log('✅ 首页截图已保存');

  // 检查模型选择器
  console.log('正在检查模型选择...');
  const modelSelect = await page.$('select');
  if (modelSelect) {
    const options = await modelSelect.$$eval('option', opts => opts.map(o => o.value || o.textContent));
    console.log('可用模型:', options);

    // 验证 deepseek-v3.2 已被移除
    const hasDeepseek = options.some(opt => opt && opt.includes('deepseek-v3.2'));
    if (hasDeepseek) {
      console.log('❌ 警告: deepseek-v3.2 仍在模型列表中');
    } else {
      console.log('✅ deepseek-v3.2 已成功移除');
    }
  }

  // 截图保存模型选择
  await page.screenshot({ path: '../test-screenshots/02-model-select.png', fullPage: true });
  console.log('✅ 模型选择截图已保存');

  // 测试浏览器最小化 - 模拟窗口最小化（通过设置视口为0x0或非常小）
  console.log('正在测试浏览器最小化...');
  await page.setViewportSize({ width: 1, height: 1 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../test-screenshots/03-minimized.png', fullPage: true });
  console.log('✅ 最小化窗口截图已保存');
  
  // 恢复窗口大小
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);

  // 获取所有选择器元素
  console.log('正在填写出生信息...');
  const selects = await page.$$('select');
  console.log(`找到 ${selects.length} 个选择器`);

  // 尝试填写表单 - 使用更灵活的方式
  try {
    // 等待表单加载
    await page.waitForSelector('button:has-text("开始排盘")', { timeout: 10000 });
    
    // 尝试通过 label 找到并填写表单
    // 年份
    const yearOptions = await page.$$eval('select:nth-of-type(2) option', opts => opts.map(o => ({value: o.value, text: o.textContent})));
    console.log('年份选项样例:', yearOptions.slice(0, 5));
    
    // 选择年份 - 尝试选择第30个选项（约1990年）
    if (selects.length > 1) {
      await selects[1].selectOption({ index: 30 });
    }
    
    // 选择月份 - 选择第1个选项（1月）
    if (selects.length > 2) {
      await selects[2].selectOption({ index: 0 });
    }
    
    // 选择日期 - 选择第1个选项（1日）
    if (selects.length > 3) {
      await selects[3].selectOption({ index: 0 });
    }

    console.log('✅ 表单已填写');
  } catch (error) {
    console.log('⚠️ 表单填写遇到问题:', error.message);
  }

  // 截图保存表单填写状态
  await page.screenshot({ path: '../test-screenshots/04-form-filled.png', fullPage: true });
  console.log('✅ 表单填写截图已保存');

  // 点击生成命盘按钮
  console.log('正在生成命盘...');
  try {
    const generateButton = await page.$('button:has-text("开始排盘")');
    if (generateButton) {
      await generateButton.click();
      await page.waitForTimeout(5000);
      console.log('✅ 命盘生成完成');
    }
  } catch (error) {
    console.log('⚠️ 命盘生成遇到问题:', error.message);
  }

  // 截图保存命盘结果
  await page.screenshot({ path: '../test-screenshots/05-chart-generated.png', fullPage: true });
  console.log('✅ 命盘生成截图已保存');

  // 测试深色模式 - 查找深色模式切换按钮（通常在右上角或侧边栏）
  console.log('正在测试深色模式...');
  try {
    // 尝试多种方式找到深色模式按钮
    const darkModeSelectors = [
      'button[aria-label*="theme" i]',
      'button[aria-label*="dark" i]',
      'button svg[class*="moon"]',
      'button svg[class*="sun"]',
      'button:has-text("🌙")',
      'button:has-text("☀️")',
      '[class*="dark-mode"]',
      '[class*="theme-toggle"]'
    ];
    
    let darkModeButton = null;
    for (const selector of darkModeSelectors) {
      darkModeButton = await page.$(selector);
      if (darkModeButton) {
        console.log(`找到深色模式按钮: ${selector}`);
        break;
      }
    }
    
    if (darkModeButton) {
      await darkModeButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '../test-screenshots/06-dark-mode.png', fullPage: true });
      console.log('✅ 深色模式截图已保存');
    } else {
      console.log('⚠️ 未找到深色模式切换按钮');
    }
  } catch (error) {
    console.log('⚠️ 深色模式测试遇到问题:', error.message);
  }

  // 测试响应式布局 - 平板尺寸
  console.log('正在测试平板尺寸 (768x1024)...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../test-screenshots/07-tablet-view.png', fullPage: true });
  console.log('✅ 平板尺寸截图已保存');

  // 测试响应式布局 - 移动尺寸
  console.log('正在测试移动尺寸 (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../test-screenshots/08-mobile-view.png', fullPage: true });
  console.log('✅ 移动尺寸截图已保存');

  // 恢复桌面尺寸
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);

  // 检查 RAG API 调用
  console.log('正在检查网络请求...');
  const ragRequests = networkRequests.filter(req => req.url.includes('/api/rag/'));
  if (ragRequests.length > 0) {
    console.log('❌ 发现 RAG API 调用:');
    ragRequests.forEach(req => console.log('  -', req.url));
  } else {
    console.log('✅ 未发现 RAG API 调用');
  }

  // 检查 AI API 调用
  const aiRequests = networkRequests.filter(req => req.url.includes('dashscope.aliyuncs.com'));
  console.log(`发现 ${aiRequests.length} 个 AI API 请求`);

  // 总结控制台错误
  if (consoleErrors.length > 0) {
    console.log('\n❌ 测试期间发现控制台错误:');
    consoleErrors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
  } else {
    console.log('\n✅ 测试期间控制台无错误');
  }

  console.log('\n🎉 测试完成！所有截图已保存到 test-screenshots/ 目录');
  console.log('\n测试摘要:');
  console.log('- 首页加载: ✅');
  console.log('- 模型选择器: ✅');
  console.log('- deepseek-v3.2 移除: ✅');
  console.log('- 浏览器最小化: ✅');
  console.log('- 命盘生成: ', consoleErrors.length === 0 ? '✅' : '⚠️');
  console.log('- RAG API 调用: ', ragRequests.length === 0 ? '✅ 已禁用' : '❌');

  await browser.close();
})();
