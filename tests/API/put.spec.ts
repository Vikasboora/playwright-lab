import { test } from '@playwright/test';

let id: string;

test.beforeEach(async ({ request }) => {
  const createObjectResponse = await request.post('https://api.restful-api.dev/objects', {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name: 'Framework 13 pro',
      data: {
        year: 2026,
        price: 1499,
        'CPU model': 'Intel Ultra Series 3',
        'Hard disk size': '1 TB',
      },
    },
  });

  const createObjectResponseData = await createObjectResponse.json();
  id = createObjectResponseData?.id;
});

test('Put API method Handling using Playwright request', async ({ request }) => {
  const response = await request.put(`https://api.restful-api.dev/objects/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name: 'Framework 13 pro',
      data: {
        year: 2026,
        price: 1199,
        'CPU model': 'Intel Ultra Series 3',
        'Hard disk size': '1 TB',
      },
    },
  });

  const responseData = await response.json();
  console.log(responseData);

  console.log('------------------------------------------------');

  const singleObjectResponse = await request.get(`https://api.restful-api.dev/objects/${id}`);
  const singleObjectResponseData = await singleObjectResponse.json();

  console.log(singleObjectResponseData);
});
