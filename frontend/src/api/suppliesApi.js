import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;

export class AuthSessionNotReadyError extends Error {
  constructor(message = 'Cognito auth session is not ready yet.') {
    super(message);
    this.name = 'AuthSessionNotReadyError';
  }
}

function logDevelopment(message, ...details) {
  if (isDevelopment) {
    console.info(`[api] ${message}`, ...details);
  }
}

async function getAuthToken() {
  let session;

  try {
    session = await fetchAuthSession();
  } catch (error) {
    logDevelopment('auth session not ready', error);
    throw new AuthSessionNotReadyError('Cognito auth session is still being restored.');
  }

  const token = session?.tokens?.idToken?.toString() ?? session?.tokens?.accessToken?.toString();

  if (!token) {
    logDevelopment('auth session not ready: no Cognito token was returned');
    throw new AuthSessionNotReadyError('Cognito auth token is not available yet.');
  }

  return token;
}

async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const method = options.method ?? 'GET';
  const token = await getAuthToken();
  const shouldLogRequest = method === 'GET' && ['/supplies', '/profile'].includes(path);

  if (shouldLogRequest) {
    logDevelopment(`${method} ${path} request started`);
  }

  try {
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

    if (shouldLogRequest) {
      logDevelopment(`${method} ${path} succeeded`, { status: response.status });
    }

    if (!responseText || response.status === 204) {
      return null;
    }

    return JSON.parse(responseText);
  } catch (error) {
    if (shouldLogRequest) {
      logDevelopment(`${method} ${path} failed`, error);
    }

    throw error;
  }
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

export async function getProfile() {
  return apiRequest('/profile', { method: 'GET' });
}

export async function updateProfile(profile) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}
