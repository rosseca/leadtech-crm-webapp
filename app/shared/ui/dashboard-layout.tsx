import { Outlet, Navigate, useLocation } from "react-router";
import { SidebarProvider, SidebarInset, SidebarFloatingTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { useAuthStore } from "~/modules/auth";
import { usePermissions } from "~/hooks/use-permissions";
import type { Permission } from "~/lib/permissions";

// Map routes to required permissions
const routePermissions: Record<string, Permission> = {
  "/invite": "invite_users",
};

export default function DashboardLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { can } = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if current route requires a permission
  const requiredPermission = routePermissions[location.pathname];
  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 mx-2 py-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
      <SidebarFloatingTrigger />
    </SidebarProvider>
  );
}
