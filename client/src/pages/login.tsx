import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      // Redirect based on role
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid username or password",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer hover-elevate rounded-lg p-2 transition-all">
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold tracking-tight">LuaShield</span>
          </div>
        </Link>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={loginMutation.isPending}
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          disabled={loginMutation.isPending}
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                >
                  {loginMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="p-3 rounded-md bg-muted/50">
                  <p className="font-medium text-foreground mb-1">User Account</p>
                  <p className="font-mono text-xs">user / password123</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50">
                  <p className="font-medium text-foreground mb-1">Admin Account</p>
                  <p className="font-mono text-xs">admin / admin123</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register">
                <span className="text-primary hover:underline font-medium cursor-pointer" data-testid="link-register">
                  Sign up
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-home">
              ← Back to home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
