import { test, expect } from '@playwright/test';


test('handling alert', async ({ page }) => {

  await page.goto('https://demo.guru99.com/V1/index.php');

  await page.locator('input[name="uid"]').fill('mngr658458');
  await page.locator('input[name="password"]').fill('1236');

  const dialogPromise = page.waitForEvent('dialog');

  await page.getByRole('button', { name: 'LOGIN' }).click();

  const dialog = await dialogPromise;

  // Accept the dialog (click OK)
  await dialog.accept();

  // .message() gives the alert message text
  console.log(dialog.message());
  expect(dialog.message()).toContain('User is not valid');

  // .type() gives the type of dialog box type : 'alert' / 'confirm' / 'prompt' / 'beforeunload'
  console.log(dialog.type())

  // returns '' for alert, confirm and beforeunload
  console.log(`Default value: ${dialog.defaultValue()}`);

});



test.skip('handling alert using page.on event handler', async ({ page }) => {

  await page.goto('https://demo.guru99.com/V1/index.php');

  await page.locator('input[name="uid"]').fill('mngr658458');
  await page.locator('input[name="password"]').fill('1236');

  page.on('dialog', async (dialog) => {
    console.log('ALERT:', dialog.message());
    expect(dialog.message()).toContain('User is not valid');
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'LOGIN' }).click();

  await page.waitForTimeout(2000);
  
});
