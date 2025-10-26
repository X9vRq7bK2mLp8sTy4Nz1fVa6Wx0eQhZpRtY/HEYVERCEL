import { Link } from "wouter";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/">
          <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer hover-elevate rounded-lg p-2 transition-all">
            <Shield className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold tracking-tight">LuaShield</span>
          </div>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">404</CardTitle>
            <CardDescription className="text-lg">Page not found</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button className="w-full" data-testid="button-home">
                  Go to Homepage
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full" data-testid="button-dashboard">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
