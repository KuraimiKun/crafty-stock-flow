import { api } from '@/lib/api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/constants/auth';
import { Roles } from '@/constants/roles';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  accessToken: string;
  expiresAtUtc: string;
}

export interface StoredAuthUser {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  expiresAtUtc: string;
}

const DASHBOARD_PRIORITY = [Roles.Admin, Roles.InventoryManager, Roles.Cashier];

function persistAuthToken(token: string | undefined) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function persistAuthUser(response: AuthResponse) {
  const payload: StoredAuthUser = {
    userId: response.userId,
    userName: response.userName,
    email: response.email,
    roles: response.roles,
    expiresAtUtc: response.expiresAtUtc,
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload));
}

function readStoredUser(): StoredAuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function isExpired(user: StoredAuthUser) {
  const expiry = Date.parse(user.expiresAtUtc);
  if (Number.isNaN(expiry)) {
    return true;
  }

  return expiry <= Date.now();
}

function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>('/Auth/login', data);
    if (!response.accessToken) {
      throw new Error('Missing access token in login response.');
    }

    persistAuthToken(response.accessToken);
    persistAuthUser(response);

    return response;
  },

  logout() {
    clearAuthStorage();
  },

  isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = readStoredUser();

    if (!token || !user) {
      clearAuthStorage();
      return false;
    }

    if (isExpired(user)) {
      clearAuthStorage();
      return false;
    }

    return true;
  },

  getCurrentUser(): StoredAuthUser | null {
    const user = readStoredUser();
    if (!user) {
      return null;
    }

    if (isExpired(user)) {
      clearAuthStorage();
      return null;
    }

    return user;
  },

  getRoles(): string[] {
    return this.getCurrentUser()?.roles ?? [];
  },

  hasRole(role: string) {
    return this.getRoles().includes(role);
  },

  hasAnyRole(roles: string[]) {
    const assigned = this.getRoles();
    return roles.some((role) => assigned.includes(role));
  },

  getDefaultDashboardPath() {
    const roles = this.getRoles();

    for (const role of DASHBOARD_PRIORITY) {
      if (roles.includes(role)) {
        switch (role) {
          case Roles.Admin:
            return '/dashboard/admin';
          case Roles.InventoryManager:
            return '/dashboard/manager';
          case Roles.Cashier:
            return '/dashboard/cashier';
        }
      }
    }

    return '/dashboard';
  },
};
