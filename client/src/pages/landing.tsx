import { Link } from "wouter";
import { Shield, Lock, BarChart3, Zap, Code2, Eye, Server, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">LuaShield</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" data-testid="button-nav-login">Login</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-nav-register">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Processing 10,000+ scripts daily</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Enterprise-Grade
              <br />
              <span className="text-primary">Lua Script Protection</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time obfuscation, executor-only access, and advanced analytics. 
              Protect your Roblox scripts with military-grade encryption and anti-dumping technology.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="px-8" data-testid="button-hero-start">
                  Get Started Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8" data-testid="button-hero-docs">
                View Documentation
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>1MB script support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Real-time analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Protection Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to protect your scripts from crackers and unauthorized access
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate transition-all">
              <CardHeader>
                <Lock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Real-Time Obfuscation</CardTitle>
                <CardDescription>
                  Advanced Prometheus-based obfuscation with watermarking. Handle scripts up to 1MB with blazing-fast processing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate transition-all">
              <CardHeader>
                <Eye className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Executor Verification</CardTitle>
                <CardDescription>
                  HWID, User-Agent, and custom header verification ensures only authorized executors can access your scripts.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate transition-all">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Track executions, monitor usage patterns, and gain insights with real-time analytics and detailed reporting.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate transition-all">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Watermarking</CardTitle>
                <CardDescription>
                  Embedded watermarks with custom comments help you track leaked scripts and identify unauthorized redistribution.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate transition-all">
              <CardHeader>
                <Server className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>
                  Comprehensive admin dashboard to monitor all users, scripts, and executions across your entire platform.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover-elevate transition-all">
              <CardHeader>
                <Code2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Anti-Dumping</CardTitle>
                <CardDescription>
                  Multi-layer protection prevents simple printing and dumping attempts with advanced security measures.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Protect your scripts in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Script</h3>
                <p className="text-muted-foreground">
                  Upload your Lua script or paste it directly into our editor. Supports files up to 1MB in size.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border"></div>
            </div>
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Automatic Protection</h3>
                <p className="text-muted-foreground">
                  Our system obfuscates your code, adds watermarks, and generates a secure loader link instantly.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border"></div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Distribution</h3>
              <p className="text-muted-foreground">
                Share your loader link. Only authorized executors can access your protected script with full tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to protect your scripts?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers securing their Lua scripts with LuaShield
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8" data-testid="button-cta-signup">
              Start Protecting Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold">LuaShield</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade Lua script protection for developers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 LuaShield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
