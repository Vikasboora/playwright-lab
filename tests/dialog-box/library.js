const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://practice.expandtesting.com/js-dialogs');
  const dialogPromise = page.waitForEvent('dialog');
  page.locator('#js-confirm').click();
  const dialog = await dialogPromise;
  console.log(dialog.message());
  await dialog.accept();

  await page.close();
  await context.close();
  await browser.close();
})();
