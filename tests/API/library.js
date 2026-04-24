const { request } = require('playwright');

async function getMathod() {
  const apiRequestContext = await request.newContext();

  const response = await apiRequestContext.get('https://api.restful-api.dev/objects');
  const responseData = await response.json();

  console.log(responseData);
  console.log('----------------------------------------------------------------------------------');

  const responseWithParams = await apiRequestContext.get('https://api.restful-api.dev/collections', {
    headers: {
      'x-api-key': 'aa73d38e-9d5a-4674-a66f-00dd65f242cc',
    },
    params: {
      status: 200,
      'auth-type': 'none',
    },
  });

  const responseWithParamsData = await responseWithParams.json();
  console.log(responseWithParamsData);
}

async function postMathod() {
  const apiRequestContext = await request.newContext();

  const response = await apiRequestContext.post('https://api.restful-api.dev/objects', {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      status: 200,
      'auth-type': 'none',
    },
    data: {
      name: 'Apple MacBook Pro 16',
      data: {
        year: 2019,
        price: 1849.99,
        'CPU model': 'Intel Core i9',
        'Hard disk size': '1 TB',
      },
    },
  });

  const responseData = await response.json();
  console.log(responseData);
}

async function putMathod() {
  const apiRequestContext = await request.newContext();
  let id;

  const createObjectResponse = await apiRequestContext.post('https://api.restful-api.dev/objects', {
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

  const response = await apiRequestContext.put(`https://api.restful-api.dev/objects/${id}`, {
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
}

async function patchMethod() {
  const apiRequestContext = await request.newContext();

  const createObjectResponse = await apiRequestContext.post('https://api.restful-api.dev/objects', {
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

  const response = await apiRequestContext.patch(`https://api.restful-api.dev/objects/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name: 'Framework 13 pro (Assembled)',
    },
  });

  const responseData = await response.json();
  console.log(responseData);
}

async function deleteMethod() {
  const apiRequestContext = await request.newContext();

  const createObjectResponse = await apiRequestContext.post('https://api.restful-api.dev/objects', {
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

  const response = await apiRequestContext.delete(`https://api.restful-api.dev/objects/${id}`);

  const responseData = await response.json();
  console.log(responseData);
}

(async () => {
  await getMathod();
  await postMathod();
  await putMathod();
  await patchMethod();
  await deleteMethod();
})();
