import { test, expect } from '@playwright/test';

test('Accept Confirm Dialog Box', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/js-dialogs');

  const dialogPromise = page.waitForEvent('dialog');

  page.locator('#js-confirm').click();

  const dialog = await dialogPromise;

  console.log('Dialog message :', dialog.message());
  expect(dialog.message()).toContain('I am a Js Confirm');

  await dialog.accept();
  await expect(page.locator('#dialog-response')).toHaveText('Ok');
});

test('Dismiss Confirm Dialog Box', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/js-dialogs');

  page.on('dialog', async (dialog) => {
    console.log('Dailog-box type :', dialog.type());

    await dialog.dismiss();
    await expect(page.locator('#dialog-response')).toHaveText('Cancel');
  });

  await page.locator('#js-confirm').click();

  await page.waitForTimeout(3000);
});
