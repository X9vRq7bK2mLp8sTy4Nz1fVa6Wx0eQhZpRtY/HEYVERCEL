import { Link, useLocation } from "wouter";
import { Shield, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { registerSchema, type RegisterData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. Redirecting to dashboard...",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Unable to create account. Please try again.",
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
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

        {/* Register Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Start protecting your Lua scripts in minutes
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
                          placeholder="Choose a username"
                          {...field}
                          disabled={registerMutation.isPending}
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          disabled={registerMutation.isPending}
                          data-testid="input-email"
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
                          placeholder="Create a strong password"
                          {...field}
                          disabled={registerMutation.isPending}
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
                  disabled={registerMutation.isPending}
                  data-testid="button-submit"
                >
                  {registerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login">
                <span className="text-primary hover:underline font-medium cursor-pointer" data-testid="link-login">
                  Sign in
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
