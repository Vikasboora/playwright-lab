import { APIResponse, test } from '@playwright/test';

test('Get API method Handling using Playwright request', async ({ request }) => {
  const response: APIResponse = await request.get('https://api.restful-api.dev/objects');

  const responseData = await response.json();
  console.log(responseData);
});

test('Get API (with Header & Params) method Handling using Playwright request', async ({ request }) => {
  const response: APIResponse = await request.get('https://api.restful-api.dev/collections', {
    headers: {
      'x-api-key': process.env.X_API_KEY!,
    },
    params: {
      status: 200,
    },
  });

  const responseData = await response.json();
  console.log(responseData);
});
