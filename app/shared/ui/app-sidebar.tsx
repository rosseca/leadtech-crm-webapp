import { Link, useLocation } from "react-router";
import { Users, CreditCard, LayoutDashboard, UserPlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { usePermissions } from "~/hooks/use-permissions";
import type { Permission } from "~/lib/permissions";

interface MenuItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    permission: "view_customers",
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
    permission: "view_transactions",
  },
  {
    title: "Invite Users",
    url: "/invite",
    icon: UserPlus,
    permission: "invite_users",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const { can } = usePermissions();

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(
    (item) => !item.permission || can(item.permission)
  );

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            L
          </div>
          <span className="font-semibold text-lg">
            LeadtechCRM
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    onClick={handleItemClick}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
