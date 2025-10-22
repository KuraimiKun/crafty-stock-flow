import { api } from '@/lib/api';
import { AUTH_TOKEN_KEY } from '@/constants/auth';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  accessToken: string;
  expiresAtUtc: string;
}

function persistAuthToken(token: string | undefined) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>('/Auth/login', data);
    if (!response.accessToken) {
      throw new Error('Missing access token in login response.');
    }
    persistAuthToken(response.accessToken);
    return response;
  },

  async register(data: RegisterRequest) {
    const response = await api.post<AuthResponse>('/Auth/register', data);
    // Registration happens from an authenticated admin context, so we avoid overwriting their session token.
    // Only return the created user response.
    return response;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};
