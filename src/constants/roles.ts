export const Roles = {
  Admin: 'Admin',
  InventoryManager: 'InventoryManager',
  Cashier: 'Cashier',
} as const;

export type RoleKey = keyof typeof Roles;
export type RoleValue = (typeof Roles)[RoleKey];
