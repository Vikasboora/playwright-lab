import { test, expect } from '@playwright/test';


test('Best Method to Handle alert in Playwright', async ({ page }) => {

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



test('Second best method to handle alert using page.on event handler', async ({ page }) => {

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



test.only('Suppress all dialogs with evaluate', async ({ page,context }) => {
  // Override browser dialogs BEFORE navigation
  await page.evaluate(() => {
    window.alert = (msg) => {
      console.log('Alert suppressed:', msg);
      window.lastAlertMessage = msg;
    };
    
    window.confirm = (msg) => {
      console.log('Confirm suppressed:', msg);
      return true; // Always returns OK
    };
    
    window.prompt = (msg, defaultValue) => {
      console.log('Prompt suppressed:', msg);
      return 'mocked value';
    };
  });
  
  await page.goto('https://demo.guru99.com/V1/index.php');
  await page.locator('input[name="uid"]').fill('mngr658458');
  await page.locator('input[name="password"]').fill('1236');
  
const debuggerInstance = context.debugger;
  
  // Request pause BEFORE the next action (login click)
  await debuggerInstance.requestPause();

  // Dialog won't appear - it's suppressed by our overrides
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Check suppressed message if needed
  const lastAlert = await page.evaluate(() => window.lastAlertMessage);
  console.log('Last alert was:', lastAlert);
});


