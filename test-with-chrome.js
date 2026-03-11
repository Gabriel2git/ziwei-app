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

  // 访问首页
  console.log('正在访问首页...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // 截图保存首页
  await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
  console.log('✅ 首页截图已保存');

  // 填写出生信息表单
  console.log('正在填写出生信息...');
  await page.fill('input[type="date"]', '1990-01-01');
  await page.fill('input[type="time"]', '12:00');
  await page.selectOption('select[name="gender"]', 'male');

  // 截图保存表单填写状态
  await page.screenshot({ path: 'test-screenshots/02-form-filled.png', fullPage: true });
  console.log('✅ 表单填写截图已保存');

  // 点击生成命盘按钮
  console.log('正在生成命盘...');
  await page.click('button:has-text("生成命盘")');
  await page.waitForTimeout(3000);

  // 截图保存命盘结果
  await page.screenshot({ path: 'test-screenshots/03-chart-generated.png', fullPage: true });
  console.log('✅ 命盘生成截图已保存');

  // 检查模型选择器
  console.log('正在检查模型选择...');
  const modelSelect = await page.$('select[name="model"]');
  if (modelSelect) {
    const options = await modelSelect.$$eval('option', opts => opts.map(o => o.value));
    console.log('可用模型:', options);

    // 验证 deepseek-v3.2 已被移除
    if (options.includes('deepseek-v3.2')) {
      console.log('❌ 警告: deepseek-v3.2 仍在模型列表中');
    } else {
      console.log('✅ deepseek-v3.2 已成功移除');
    }
  }

  // 截图保存模型选择
  await page.screenshot({ path: 'test-screenshots/04-model-select.png', fullPage: true });
  console.log('✅ 模型选择截图已保存');

  // 测试深色模式
  console.log('正在测试深色模式...');
  const darkModeButton = await page.$('button[aria-label="切换深色模式"], button:has-text("🌙"), button:has-text("☀️")');
  if (darkModeButton) {
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/05-dark-mode.png', fullPage: true });
    console.log('✅ 深色模式截图已保存');
  } else {
    console.log('⚠️ 未找到深色模式切换按钮');
  }

  // 测试响应式布局 - 平板尺寸
  console.log('正在测试平板尺寸...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-screenshots/06-tablet-view.png', fullPage: true });
  console.log('✅ 平板尺寸截图已保存');

  // 测试响应式布局 - 移动尺寸
  console.log('正在测试移动尺寸...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-screenshots/07-mobile-view.png', fullPage: true });
  console.log('✅ 移动尺寸截图已保存');

  // 检查控制台错误
  console.log('正在检查控制台错误...');
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });

  await page.waitForTimeout(2000);

  if (logs.length > 0) {
    console.log('❌ 发现控制台错误:');
    logs.forEach(log => console.log('  -', log));
  } else {
    console.log('✅ 控制台无错误');
  }

  // 检查网络请求
  console.log('正在检查网络请求...');
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('/api/rag/')) {
      requests.push(request.url());
    }
  });

  await page.waitForTimeout(2000);

  if (requests.length > 0) {
    console.log('❌ 发现 RAG API 调用:');
    requests.forEach(req => console.log('  -', req));
  } else {
    console.log('✅ 未发现 RAG API 调用');
  }

  console.log('\n🎉 测试完成！所有截图已保存到 test-screenshots/ 目录');

  await browser.close();
})();
