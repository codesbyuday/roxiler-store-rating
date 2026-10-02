/**
 * Simple API client utility for backend communication
 */

const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  
  if (!response.ok) {
    throw new Error(data?.message || `HTTP error! status: ${response.status}`);
  }
  return data;
};

export async function get(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function post(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

export async function patch(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

export async function del(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getHealthStatus() {
  return get('/health');
}
