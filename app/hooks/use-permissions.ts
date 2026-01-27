import { useAuthStore } from "~/modules/auth/store/auth-store";
import { hasPermission, type Permission } from "~/lib/permissions";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const can = (permission: Permission): boolean => {
    return hasPermission(role, permission);
  };

  const isAdmin = role === "admin";
  const isCustomerService = role === "customer_service";

  return {
    can,
    isAdmin,
    isCustomerService,
    role,
  };
}
