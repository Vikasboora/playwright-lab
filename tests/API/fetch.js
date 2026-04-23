async function getMethod() {
  const objectResponse = await fetch('https://api.restful-api.dev/objects', { method: 'GET' });

  const objectResponseData = await objectResponse.json();
  console.log(objectResponseData);

  console.log('---------------------------------------------------------------------------------');

  const params = new URLSearchParams({
    status: 200,
    'auth-type': 'none',
  });

  const response = await fetch(`https://api.restful-api.dev/collections?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'aa73d38e-9d5a-4674-a66f-00dd65f242cc',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  const responseData = await response.json();
  console.log(responseData);
}

async function postMethod() {
  const data = {
    name: 'Apple MacBook Pro 16',
    data: {
      year: 2019,
      price: 1849.99,
      'CPU model': 'Intel Core i9',
      'Hard disk size': '1 TB',
    },
  };

  const response = await fetch(`https://api.restful-api.dev/objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  console.log(responseData);
}

async function putMethod() {
  const data = {
    name: 'Apple MacBook Pro 16',
    data: {
      year: 2019,
      price: 1849.99,
      'CPU model': 'Intel Core i9',
      'Hard disk size': '1 TB',
    },
  };

  const objectResponse = await fetch(`https://api.restful-api.dev/objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const objectResponseData = await objectResponse.json();
  const id = objectResponseData?.id;

  const dataForPut = {
    name: 'Apple MacBook Pro 16',
    data: {
      year: 2019,
      price: 2049.99,
      'CPU model': 'Intel Core i9',
      'Hard disk size': '1 TB',
      color: 'silver',
    },
  };

  const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataForPut),
  });

  const responseData = await response.json();
  console.log(responseData);
}

async function patchMethod() {
  const data = {
    name: 'Apple MacBook Pro 16',
    data: {
      year: 2019,
      price: 1849.99,
      'CPU model': 'Intel Core i9',
      'Hard disk size': '1 TB',
    },
  };

  const objectResponse = await fetch(`https://api.restful-api.dev/objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const objectResponseData = await objectResponse.json();
  const id = objectResponseData?.id;

  const dataForPatch = {
    name: 'Apple MacBook Pro 16 (Updated Name)',
  };

  const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataForPatch),
  });

  const responseData = await response.json();
  console.log(responseData);
}

async function deleteMethod() {
  const data = {
    name: 'Apple MacBook Pro 16',
    data: {
      year: 2019,
      price: 1849.99,
      'CPU model': 'Intel Core i9',
      'Hard disk size': '1 TB',
    },
  };

  const objectResponse = await fetch(`https://api.restful-api.dev/objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const objectResponseData = await objectResponse.json();
  const id = objectResponseData?.id;

  const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
    method: 'DELETE',
  });

  const responseData = await response.json();
  console.log(responseData);
}

getMethod();

postMethod();

putMethod();

patchMethod();

deleteMethod();
