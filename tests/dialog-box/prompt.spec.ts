import { test, expect } from '@playwright/test';

test('Prompt', async ({ page }) => {
  await page.goto('https://www.selenium.dev/selenium/web/alerts.html#');

  const dialogPromise = page.waitForEvent('dialog');

  page.locator('#prompt').click();

  const dialog = await dialogPromise;

  console.log('Dialog Message :', dialog.message());
  expect(dialog.message()).toContain('Enter something');

  await dialog.accept('Hello from Playwright!');
});

test('Accept Prompt', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/js-dialogs');

  // Set up dialog handler BEFORE clicking
  page.on('dialog', async (dialog) => {
    console.log('Dialog message:', dialog.message());

    console.log('Default value:', dialog.defaultValue());

    console.log('Dailog type :', dialog.type());

    // Accept the prompt with a custom value
    await dialog.accept('Hello from Playwright!');
  });

  // Click the button that triggers the prompt
  await page.locator('#js-prompt').click();

  await page.waitForTimeout(3000);
});

test('Reject Prompt', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/js-dialogs');

  const dialogPromise = page.waitForEvent('dialog');

  // No await — fire and don't block
  page.locator('#js-prompt').click();

  // Await the dialog event, then immediately accept
  const dialog = await dialogPromise;

  // Click on Cancel for the prompt
  await dialog.dismiss();
});
