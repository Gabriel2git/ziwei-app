const { chromium } = require('playwright');

(async () => {
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

  // 点击 AI 命理师菜单
  console.log('正在切换到 AI 命理师页面...');
  const aiMenuButton = await page.$('text=AI 命理师');
  if (aiMenuButton) {
    await aiMenuButton.click();
    await page.waitForTimeout(2000);
  }

  // 截图鉴权界面
  console.log('正在截图鉴权界面...');
  await page.screenshot({ path: '../test-screenshots/12-auth-guard.png', fullPage: true });
  console.log('✅ 鉴权界面截图已保存');

  // 测试输入错误密码
  console.log('正在测试错误密码...');
  await page.fill('input[type="password"]', 'wrong-code');
  await page.click('button:has-text("进入 AI 命理师")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../test-screenshots/13-auth-error.png', fullPage: true });
  console.log('✅ 错误密码提示截图已保存');

  // 清空输入框
  await page.fill('input[type="password"]', '');

  // 测试输入正确密码
  console.log('正在测试正确密码...');
  await page.fill('input[type="password"]', 'gznb');
  await page.click('button:has-text("进入 AI 命理师")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '../test-screenshots/14-auth-success.png', fullPage: true });
  console.log('✅ 验证成功截图已保存');

  console.log('\n🎉 鉴权系统测试完成！');

  await browser.close();
})();
