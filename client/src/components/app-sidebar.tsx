import { LayoutDashboard, FileCode, BarChart3, Settings, LogOut, Users, Database } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppSidebarProps {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setLocation("/login");
  };

  const userItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Scripts",
      url: "/dashboard/scripts",
      icon: FileCode,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminItems = [
    {
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "All Scripts",
      url: "/admin/scripts",
      icon: Database,
    },
    {
      title: "System Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate p-2 rounded-lg transition-all">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">LuaShield</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Admin Panel" : "Dashboard"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <a data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
