import type { UserRole } from "./api";

export type Permission =
  | "invite_users"
  | "view_customers"
  | "view_transactions"
  | "view_dashboard";

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "invite_users",
    "view_customers",
    "view_transactions",
    "view_dashboard",
  ],
  customer_service: [
    "view_customers",
    "view_transactions",
    "view_dashboard",
  ],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return rolePermissions[role] ?? [];
}
