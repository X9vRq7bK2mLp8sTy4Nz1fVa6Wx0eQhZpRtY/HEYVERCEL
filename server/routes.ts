import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { LuaObfuscator } from "./obfuscator";
import { verifyPassword } from "./password";
import { loginSchema, registerSchema, uploadScriptSchema } from "@shared/schema";
import type { User } from "@shared/schema";

// Extend Express Request to include session
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: User;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Middleware to check admin role
  const requireAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    
    next();
  };

  // ============================================================================
  // Authentication Routes
  // ============================================================================

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const passwordValid = await verifyPassword(data.password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser(data);

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        message: "Registration successful",
        user: userWithoutPassword
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // ============================================================================
  // Script Management Routes
  // ============================================================================

  // Get user's scripts
  app.get("/api/scripts", requireAuth, async (req: Request, res: Response) => {
    try {
      const scripts = await storage.getScriptsByUserId(req.session.userId!);
      res.json(scripts);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch scripts" });
    }
  });

  // Upload and obfuscate script
  app.post("/api/scripts", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = uploadScriptSchema.parse(req.body);
      
      // Get user info for watermark
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Generate loader link
      const loaderLink = LuaObfuscator.generateLoaderLink();

      // Create watermark
      const watermark = `Protected by LuaShield - ${user.email}`;

      // Obfuscate the script
      const obfuscatedCode = LuaObfuscator.obfuscate(data.originalCode, {
        watermark,
        userId: user.id,
        scriptName: data.name,
      });

      // Calculate size
      const size = new Blob([data.originalCode]).size;

      // Save script
      const script = await storage.createScript({
        userId: user.id,
        name: data.name,
        originalCode: data.originalCode,
        obfuscatedCode,
        loaderLink,
        watermark,
        size,
      });

      res.json({ 
        message: "Script protected successfully",
        script
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to protect script" });
    }
  });

  // Delete script
  app.delete("/api/scripts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }

      if (script.userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden: Not your script" });
      }

      await storage.deleteScript(id);
      res.json({ message: "Script deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete script" });
    }
  });

  // Get user stats
  app.get("/api/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getUserStats(req.session.userId!);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });

  // ============================================================================
  // Raw Script Access (Executor-Only)
  // ============================================================================

  // Get raw obfuscated script (executor-only with verification)
  app.get("/api/raw/:loaderLink", async (req: Request, res: Response) => {
    try {
      const { loaderLink } = req.params;
      
      // Get user agent and custom header
      const userAgent = req.headers['user-agent'] || '';
      const customHeader = req.headers['x-luashield-executor'] as string;
      
      // Verify this is an executor request (not a browser)
      const verification = LuaObfuscator.verifyExecutorRequest(userAgent, customHeader);
      
      if (!verification.isValid) {
        return res.status(403).json({ 
          error: "Access Denied",
          message: verification.reason 
        });
      }

      // Find script
      const script = await storage.getScriptByLoaderLink(loaderLink);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }

      // Generate HWID
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const hwid = LuaObfuscator.generateHWID(ip, userAgent);

      // Track execution
      await storage.createExecution({
        scriptId: script.id,
        hwid,
        userAgent,
        ipAddress: ip,
        executorType: verification.executorType,
        success: true,
      });

      // Return obfuscated script as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(script.obfuscatedCode);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch script" });
    }
  });

  // Track execution (called from obfuscated script)
  app.post("/api/executions", async (req: Request, res: Response) => {
    try {
      const { scriptId, hwid } = req.body;
      
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';

      await storage.createExecution({
        scriptId,
        hwid,
        userAgent,
        ipAddress: ip,
        executorType: 'Unknown',
        success: true,
      });

      res.json({ message: "Execution tracked" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to track execution" });
    }
  });

  // ============================================================================
  // Admin Routes
  // ============================================================================

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  });

  // Get all scripts (admin only)
  app.get("/api/admin/scripts", requireAdmin, async (req: Request, res: Response) => {
    try {
      const scripts = await storage.getAllScripts();
      res.json(scripts);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch scripts" });
    }
  });

  // Get all executions (admin only)
  app.get("/api/admin/executions", requireAdmin, async (req: Request, res: Response) => {
    try {
      const executions = await storage.getAllExecutions();
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch executions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
