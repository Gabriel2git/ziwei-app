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

  // 截图 Persona 选择界面
  console.log('正在截图 Persona 选择界面...');
  await page.screenshot({ path: '../test-screenshots/09-persona-selector.png', fullPage: true });
  console.log('✅ Persona 选择界面截图已保存');

  // 测试选择不同 Persona
  console.log('正在测试选择 Mentor 人格...');
  const mentorCard = await page.$('text=硬核紫微导师');
  if (mentorCard) {
    await mentorCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '../test-screenshots/10-persona-mentor-selected.png', fullPage: true });
    console.log('✅ Mentor 人格选择截图已保存');
  }

  console.log('正在测试选择 Healer 人格...');
  const healerCard = await page.$('text=人生导航与疗愈师');
  if (healerCard) {
    await healerCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '../test-screenshots/11-persona-healer-selected.png', fullPage: true });
    console.log('✅ Healer 人格选择截图已保存');
  }

  console.log('\n🎉 Persona 功能测试完成！');

  await browser.close();
})();
