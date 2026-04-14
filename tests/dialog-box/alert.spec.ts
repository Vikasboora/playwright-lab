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
  console.log(dialog.type());

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

  await page.waitForTimeout(2000); // explained why this is used on readme
});

test('Handling alert using route', async ({ page }) => {
  // Intercept POST requests using page.route()
  await page.route('**/*', async (route) => {
    const request = route.request();

    if (request.method() === 'POST') {
      const response = await route.fetch(); // Forward the request
      let body = await response.text();

      if (body.includes('alert')) {
        // Assert the body contains the expected message
        expect(body).toContain('User is not valid');
        // Strip alert() calls from the response body
        body = body.replace(/(window\.)?alert\([^)]*\);?/g, '');
      }

      // Fulfill with the (possibly modified) response
      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body,
      });
    } else {
      await route.continue(); // Let non-POST requests pass through
    }
  });

  await page.goto('https://demo.guru99.com/V1/index.php');
  await page.locator('input[name="uid"]').fill('mngr658458');
  await page.locator('input[name="password"]').fill('1236');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Wait for navigation or a network idle state after login
  await page.waitForLoadState('networkidle');
});

test('Second best method to handle alert using page.on event handler using the context fixture', async ({ page, context }) => {
  context.on('dialog', (dbox) => {
    console.log(dbox.message());
    dbox.accept();
  });

  await page.goto('https://demo.guru99.com/V1/index.php');
  await page.locator('input[name="uid"]').fill('mngr658458');
  await page.locator('input[name="password"]').fill('1236');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await page.waitForTimeout(3000);
});

test('Second best method to handle alert using page.on event handler using the browser fixture', async ({ browser }) => {
  const context = await browser.newContext();

  context.on('dialog', (dbox) => {
    console.log(dbox.message());
    dbox.accept();
  });

  const page = await context.newPage();

  await page.goto('https://demo.guru99.com/V1/index.php');
  await page.locator('input[name="uid"]').fill('mngr658458');
  await page.locator('input[name="password"]').fill('1236');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await page.waitForTimeout(3000);
});