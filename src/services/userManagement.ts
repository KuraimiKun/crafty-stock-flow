import { api } from '@/lib/api';
import { Roles } from '@/constants/roles';

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  role: typeof Roles.InventoryManager | typeof Roles.Cashier;
}

export interface UserSummary {
  id: string;
  userName: string;
  email: string;
  fullName?: string;
  roles: string[];
}

function validateRole(role: string) {
  if (role !== Roles.InventoryManager && role !== Roles.Cashier) {
    throw new Error('Only InventoryManager and Cashier roles are supported.');
  }
}

export const userManagementService = {
  async createUser(payload: CreateUserRequest) {
    validateRole(payload.role);
    return api.post<UserSummary>('/admin/users', payload);
  },

  getManagers() {
    return api.get<UserSummary[]>('/admin/users/managers');
  },

  getCashiers() {
    return api.get<UserSummary[]>('/admin/users/cashiers');
  },
};
