import { APIResponse, test } from '@playwright/test';

test('Post API method Handling using Playwright request', async ({ request }) => {
  const response: APIResponse = await request.post('https://api.restful-api.dev/login', {
    headers: {
      'x-api-key': process.env.X_API_KEY!,
      'Content-Type': 'application/json',
    },
    params: {
      'expires-in': 360,
      status: 200,
    },
    data: {
      email: 'antonio@example.com',
      password: 'securePassword123',
    },
  });

  const responseData = await response.json();
  console.log(responseData);
});

test('Using Playwright request for post request', async ({ request }): Promise<void> => {
  const response: APIResponse = await request.post('https://api.restful-api.dev/register', {
    headers: {
      'x-api-key': process.env.X_API_KEY!,
      'Content-Type': 'application/json',
    },
    params: {
      'expires-in': 360,
      status: 200,
    },
    data: {
      email: 'antonio@example.com',
      password: 'securePassword123',
      name: 'Antonio',
    },
  });

  const responseData = await response.json();
  console.log(responseData);
});
