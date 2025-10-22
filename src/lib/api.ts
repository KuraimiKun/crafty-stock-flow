import { AUTH_TOKEN_KEY } from '@/constants/auth';

const API_BASE_URL = 'https://localhost:7240/api';

export const api = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  get: <T>(endpoint: string): Promise<T> => {
    return api.request<T>(endpoint);
  },

  post: <T>(endpoint: string, data?: unknown): Promise<T> => {
    return api.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: <T>(endpoint: string, data?: unknown): Promise<T> => {
    return api.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return api.request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
