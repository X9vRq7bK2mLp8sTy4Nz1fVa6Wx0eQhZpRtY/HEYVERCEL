import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, FileCode, Activity, HardDrive, Plus, Copy, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Script, UploadScriptData } from "@shared/schema";

export default function UserDashboard() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [scriptName, setScriptName] = useState("");
  const [scriptCode, setScriptCode] = useState("");

  // Fetch user's scripts
  const { data: scripts = [], isLoading } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery<{
    totalScripts: number;
    totalExecutions: number;
    totalSize: number;
    executionsToday: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Upload script mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadScriptData) => {
      return await apiRequest("POST", "/api/scripts", data);
    },
    onSuccess: () => {
      toast({
        title: "Script protected",
        description: "Your script has been obfuscated and protected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setUploadDialogOpen(false);
      setScriptName("");
      setScriptCode("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to protect script",
      });
    },
  });

  // Delete script mutation
  const deleteMutation = useMutation({
    mutationFn: async (scriptId: string) => {
      return await apiRequest("DELETE", `/api/scripts/${scriptId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Script deleted",
        description: "Script has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete script",
      });
    },
  });

  const handleUpload = () => {
    if (!scriptName.trim() || !scriptCode.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please provide both script name and code",
      });
      return;
    }

    uploadMutation.mutate({
      name: scriptName,
      originalCode: scriptCode,
      userId: "", // Will be set by backend from session
      size: new Blob([scriptCode]).size,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your protected scripts</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-script">
              <Plus className="w-4 h-4 mr-2" />
              Protect New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Protect New Script</DialogTitle>
              <DialogDescription>
                Upload your Lua script to get it obfuscated with watermarking and executor protection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="script-name">Script Name</Label>
                <Input
                  id="script-name"
                  placeholder="MyAwesomeScript"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  disabled={uploadMutation.isPending}
                  data-testid="input-script-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="script-code">Lua Code (Max 1MB)</Label>
                <Textarea
                  id="script-code"
                  placeholder="-- Paste your Lua code here&#10;print('Hello, World!')"
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  className="font-mono text-sm min-h-[300px]"
                  disabled={uploadMutation.isPending}
                  data-testid="input-script-code"
                />
                <p className="text-xs text-muted-foreground">
                  Size: {formatBytes(new Blob([scriptCode]).size)} / 1 MB
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                data-testid="button-submit-script"
              >
                {uploadMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Protect Script
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
            <FileCode className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-scripts">
              {stats?.totalScripts || 0}
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
              {stats?.totalExecutions || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Executions (24h)</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-executions-today">
              {stats?.executionsToday || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Protected Size</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-size">
              {formatBytes(stats?.totalSize || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total code protected</p>
          </CardContent>
        </Card>
      </div>

      {/* Scripts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Protected Scripts</CardTitle>
          <CardDescription>Manage your obfuscated scripts and loader links</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : scripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No scripts yet</p>
              <p className="text-sm text-muted-foreground mb-4">Upload your first script to get started</p>
              <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload-first">
                <Plus className="w-4 h-4 mr-2" />
                Protect Your First Script
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Loader Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scripts.map((script) => (
                    <TableRow key={script.id} data-testid={`script-row-${script.id}`}>
                      <TableCell className="font-medium">{script.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{formatBytes(script.size)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(script.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {script.loaderLink.slice(0, 20)}...
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(
                              `${window.location.origin}/api/raw/${script.loaderLink}`,
                              "Loader link"
                            )}
                            data-testid={`button-copy-${script.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              toast({
                                title: "View Analytics",
                                description: "Analytics feature coming soon!",
                              });
                            }}
                            data-testid={`button-analytics-${script.id}`}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteMutation.mutate(script.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${script.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
