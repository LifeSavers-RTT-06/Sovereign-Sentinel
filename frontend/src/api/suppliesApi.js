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

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = responseText;

    try {
      const errorBody = responseText ? JSON.parse(responseText) : null;
      errorMessage = errorBody?.error ?? errorBody?.message ?? responseText;
    } catch {
      // Keep the original response text when the API does not return JSON.
    }

    throw new Error(errorMessage || `Request failed with status ${response.status}`);
  }

  if (!responseText || response.status === 204) {
    return null;
  }

  return JSON.parse(responseText);
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
