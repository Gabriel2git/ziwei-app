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

  // 清除 localStorage
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());

  // 刷新页面
  await page.reload();
  await page.waitForLoadState('networkidle');

  // 点击 AI 命理师菜单
  console.log('正在切换到 AI 命理师页面...');
  const aiMenuButton = await page.$('text=AI 命理师');
  if (aiMenuButton) {
    await aiMenuButton.click();
    await page.waitForTimeout(3000);
  }

  // 截图鉴权界面
  console.log('正在截图鉴权界面...');
  await page.screenshot({ path: '../test-screenshots/15-auth-guard-fixed.png', fullPage: true });
  console.log('✅ 鉴权界面截图已保存');

  // 检查是否显示邀请码输入框
  const authInput = await page.$('input[type="password"]');
  if (authInput) {
    console.log('✅ 邀请码输入框已显示');
  } else {
    console.log('❌ 邀请码输入框未显示');
  }

  console.log('\n🎉 鉴权系统测试完成！');

  await browser.close();
})();
