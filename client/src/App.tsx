import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

// Dashboard Layout Component
function DashboardLayout({ isAdmin = false, children }: { isAdmin?: boolean; children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar isAdmin={isAdmin} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 z-10 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* User dashboard routes */}
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <UserDashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/:section">
        {() => (
          <DashboardLayout>
            <UserDashboard />
          </DashboardLayout>
        )}
      </Route>
      
      {/* Admin dashboard routes */}
      <Route path="/admin">
        {() => (
          <DashboardLayout isAdmin>
            <AdminDashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/:section">
        {() => (
          <DashboardLayout isAdmin>
            <AdminDashboard />
          </DashboardLayout>
        )}
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
