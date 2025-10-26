import { useQuery } from "@tanstack/react-query";
import { Users, FileCode, Activity, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User, Script, Execution } from "@shared/schema";

export default function AdminDashboard() {
  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch all scripts
  const { data: scripts = [], isLoading: scriptsLoading } = useQuery<Script[]>({
    queryKey: ["/api/admin/scripts"],
  });

  // Fetch recent executions
  const { data: executions = [], isLoading: executionsLoading } = useQuery<Execution[]>({
    queryKey: ["/api/admin/executions"],
  });

  // Calculate stats
  const totalUsers = users.length;
  const totalScripts = scripts.length;
  const totalExecutions = executions.length;
  const executionsToday = executions.filter(
    (e) => new Date(e.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System-wide overview and user management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users">
              {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
            <FileCode className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-scripts">
              {totalScripts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Protected scripts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-executions">
              {totalExecutions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Executions (24h)</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-executions-today">
              {executionsToday}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All registered users and their activity</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Scripts</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scripts.filter((s) => s.userId === user.id).length}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scripts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scripts</CardTitle>
          <CardDescription>Latest protected scripts across all users</CardDescription>
        </CardHeader>
        <CardContent>
          {scriptsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Loader Link</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scripts.slice(0, 10).map((script) => {
                    const user = users.find((u) => u.id === script.userId);
                    return (
                      <TableRow key={script.id} data-testid={`script-row-${script.id}`}>
                        <TableCell className="font-medium">{script.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {user?.username || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{formatBytes(script.size)}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {script.loaderLink.slice(0, 16)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(script.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest script executions with tracking data</CardDescription>
        </CardHeader>
        <CardContent>
          {executionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Script</TableHead>
                    <TableHead>Executor</TableHead>
                    <TableHead>HWID</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.slice(0, 10).map((execution) => {
                    const script = scripts.find((s) => s.id === execution.scriptId);
                    return (
                      <TableRow key={execution.id} data-testid={`execution-row-${execution.id}`}>
                        <TableCell className="text-muted-foreground">
                          {new Date(execution.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {script?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {execution.executorType || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {execution.hwid.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {execution.ipAddress}
                        </TableCell>
                        <TableCell>
                          <Badge variant={execution.success ? "default" : "destructive"}>
                            {execution.success ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
