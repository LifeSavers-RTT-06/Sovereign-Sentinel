import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getAuthToken() {
  const session = await fetchAuthSession();
  const token = session?.tokens?.idToken?.toString() ?? session?.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error('Unable to retrieve Cognito auth token.');
  }

  return token;
}

async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: token,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getSupplies() {
  return apiRequest('/supplies', { method: 'GET' });
}

export async function createSupply(supply) {
  return apiRequest('/supplies', {
    method: 'POST',
    body: JSON.stringify(supply),
  });
}

export async function updateSupply(itemID, updates) {
  return apiRequest(`/supplies/${itemID}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSupply(itemID) {
  return apiRequest(`/supplies/${itemID}`, { method: 'DELETE' });
}
