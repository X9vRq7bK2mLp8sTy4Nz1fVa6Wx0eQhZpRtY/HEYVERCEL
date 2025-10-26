// server/index.ts
import express2 from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";

// server/password.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}
async function verifyPassword(password, hash) {
  const [salt, key] = hash.split(":");
  const derivedKey = await scryptAsync(password, salt, 64);
  return timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
}

// server/storage.ts
var MemStorage = class {
  users;
  scripts;
  executions;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.scripts = /* @__PURE__ */ new Map();
    this.executions = /* @__PURE__ */ new Map();
    this.seedData().catch(console.error);
  }
  async seedData() {
    const userId = randomUUID();
    const user = {
      id: userId,
      username: "user",
      password: await hashPassword("password123"),
      email: "user@example.com",
      role: "user",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(userId, user);
    const adminId = randomUUID();
    const admin = {
      id: adminId,
      username: "admin",
      password: await hashPassword("admin123"),
      email: "admin@example.com",
      role: "admin",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(adminId, admin);
    const scriptId = randomUUID();
    const loaderLink = randomUUID().replace(/-/g, "");
    const sampleScript = {
      id: scriptId,
      userId,
      name: "DemoScript",
      originalCode: "print('Hello, World!')",
      obfuscatedCode: "--[[ Protected by LuaShield ]]\nlocal _0x1a2b3c='Hello, World!';print(_0x1a2b3c)",
      loaderLink,
      watermark: "Protected by LuaShield - user@example.com",
      size: 24,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.scripts.set(scriptId, sampleScript);
    const executionId = randomUUID();
    const execution = {
      id: executionId,
      scriptId,
      hwid: "HWID-" + randomUUID().slice(0, 16),
      userAgent: "Synapse X",
      ipAddress: "192.168.1.100",
      executorType: "Synapse X",
      timestamp: /* @__PURE__ */ new Date(),
      success: true
    };
    this.executions.set(executionId, execution);
  }
  // Users
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const hashedPassword = await hashPassword(insertUser.password);
    const user = {
      ...insertUser,
      password: hashedPassword,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  // Scripts
  async getScript(id) {
    return this.scripts.get(id);
  }
  async getScriptByLoaderLink(loaderLink) {
    return Array.from(this.scripts.values()).find(
      (script) => script.loaderLink === loaderLink
    );
  }
  async getScriptsByUserId(userId) {
    return Array.from(this.scripts.values()).filter(
      (script) => script.userId === userId
    );
  }
  async getAllScripts() {
    return Array.from(this.scripts.values());
  }
  async createScript(script) {
    const id = randomUUID();
    const newScript = {
      ...script,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.scripts.set(id, newScript);
    return newScript;
  }
  async deleteScript(id) {
    return this.scripts.delete(id);
  }
  // Executions
  async getExecution(id) {
    return this.executions.get(id);
  }
  async getExecutionsByScriptId(scriptId) {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.scriptId === scriptId
    );
  }
  async getAllExecutions() {
    return Array.from(this.executions.values());
  }
  async createExecution(insertExecution) {
    const id = randomUUID();
    const execution = {
      ...insertExecution,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.executions.set(id, execution);
    return execution;
  }
  // Stats
  async getUserStats(userId) {
    const userScripts = await this.getScriptsByUserId(userId);
    const scriptIds = userScripts.map((s) => s.id);
    const executions2 = Array.from(this.executions.values()).filter(
      (e) => scriptIds.includes(e.scriptId)
    );
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const executionsToday = executions2.filter(
      (e) => new Date(e.timestamp) >= today
    ).length;
    return {
      totalScripts: userScripts.length,
      totalExecutions: executions2.length,
      totalSize: userScripts.reduce((sum, s) => sum + s.size, 0),
      executionsToday
    };
  }
};
var storage = new MemStorage();

// server/obfuscator.ts
import { randomBytes as randomBytes2 } from "crypto";
var LuaObfuscator = class {
  static RESERVED_KEYWORDS = [
    "and",
    "break",
    "do",
    "else",
    "elseif",
    "end",
    "false",
    "for",
    "function",
    "if",
    "in",
    "local",
    "nil",
    "not",
    "or",
    "repeat",
    "return",
    "then",
    "true",
    "until",
    "while"
  ];
  /**
   * Obfuscate Lua code with watermarking and protection
   */
  static obfuscate(code, options) {
    const watermarkId = randomBytes2(8).toString("hex");
    let obfuscated = this.addWatermarkHeader(options.watermark, watermarkId, options.scriptName);
    obfuscated += this.addAntiDumpingLayer1();
    const stringMap = this.extractAndObfuscateStrings(code);
    let processedCode = code;
    for (const [original, obfuscated_str] of stringMap.entries()) {
      processedCode = processedCode.replace(original, obfuscated_str);
    }
    processedCode = this.obfuscateVariables(processedCode);
    processedCode = this.addControlFlowFlattening(processedCode);
    obfuscated += this.addAntiDumpingLayer2();
    obfuscated += "\n" + processedCode;
    obfuscated += this.addExecutionTracker(options.userId, options.scriptName);
    obfuscated += this.addAntiDumpingLayer3();
    return obfuscated;
  }
  /**
   * Add watermark header with comments
   */
  static addWatermarkHeader(watermark, id, scriptName) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    return `--[[
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551           PROTECTED BY LUASHIELD                          \u2551
\u2551   Unauthorized distribution or modification is prohibited \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

Watermark: ${watermark}
Script: ${scriptName}
Protection ID: ${id}
Protected: ${timestamp2}

WARNING: This script is protected by LuaShield anti-dumping technology.
Any attempt to steal, copy, or redistribute this code will be tracked
and reported. The protection includes:
- HWID verification
- Runtime integrity checks
- Execution analytics
- Anti-debugging measures

DO NOT ATTEMPT TO CRACK OR BYPASS THIS PROTECTION.
--]]

`;
  }
  /**
   * Anti-dumping layer 1: Environment check
   */
  static addAntiDumpingLayer1() {
    return `-- Anti-dumping layer 1: Environment verification
local _ENV_CHECK = function()
    local env = getfenv or function() return _G end
    local blocklist = {"debug", "getfenv", "setfenv"}
    for _, v in pairs(blocklist) do
        if env()[v] then
            return false
        end
    end
    return true
end

if not _ENV_CHECK() then
    error("Protection: Environment tampering detected")
end

`;
  }
  /**
   * Anti-dumping layer 2: Runtime checks
   */
  static addAntiDumpingLayer2() {
    return `
-- Anti-dumping layer 2: Runtime integrity check
local _INTEGRITY = (function()
    local t = tick()
    return function()
        if tick() - t > 0.1 then
            error("Protection: Execution timing anomaly detected")
        end
    end
end)()

`;
  }
  /**
   * Anti-dumping layer 3: Footer protection
   */
  static addAntiDumpingLayer3() {
    return `
-- Anti-dumping layer 3: Cleanup
local _CLEANUP = function()
    local env = getfenv or function() return _G end
    env()._PROTECTED = nil
    env()._INTEGRITY = nil
    env()._ENV_CHECK = nil
end

pcall(_CLEANUP)
`;
  }
  /**
   * Add execution tracker
   */
  static addExecutionTracker(userId, scriptName) {
    return `
-- Execution analytics tracker
pcall(function()
    local HttpService = game:GetService("HttpService")
    local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
    local url = "TRACKER_ENDPOINT" -- Will be replaced with actual endpoint
    
    HttpService:PostAsync(url, HttpService:JSONEncode({
        userId = "${userId}",
        script = "${scriptName}",
        hwid = hwid,
        timestamp = os.time()
    }))
end)

`;
  }
  /**
   * Extract and obfuscate strings
   */
  static extractAndObfuscateStrings(code) {
    const stringMap = /* @__PURE__ */ new Map();
    const stringRegex = /["']([^"'\\]*(\\.[^"'\\]*)*)["']/g;
    let match;
    let counter = 0;
    while ((match = stringRegex.exec(code)) !== null) {
      const original = match[0];
      const content = match[1];
      if (stringMap.has(original)) continue;
      const varName = `_0x${counter.toString(16)}${randomBytes2(2).toString("hex")}`;
      stringMap.set(original, varName);
      counter++;
    }
    return stringMap;
  }
  /**
   * Obfuscate variable names
   */
  static obfuscateVariables(code) {
    const varRegex = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const varMap = /* @__PURE__ */ new Map();
    let counter = 0;
    let match;
    while ((match = varRegex.exec(code)) !== null) {
      const varName = match[1];
      if (this.RESERVED_KEYWORDS.includes(varName) || varMap.has(varName)) {
        continue;
      }
      const obfName = `_L${counter}_${randomBytes2(3).toString("hex")}`;
      varMap.set(varName, obfName);
      counter++;
    }
    let result = code;
    for (const [original, obfuscated] of varMap.entries()) {
      const regex = new RegExp(`\\b${original}\\b`, "g");
      result = result.replace(regex, obfuscated);
    }
    return result;
  }
  /**
   * Add simple control flow flattening
   */
  static addControlFlowFlattening(code) {
    return `do
    local _PROTECTED = true
    ${code}
end`;
  }
  /**
   * Generate a unique loader link
   */
  static generateLoaderLink() {
    return randomBytes2(16).toString("hex");
  }
  /**
   * Verify if a request is from an executor (not a browser)
   */
  static verifyExecutorRequest(userAgent, customHeader) {
    const browserIndicators = [
      "Mozilla",
      "Chrome",
      "Safari",
      "Firefox",
      "Edge",
      "Opera",
      "MSIE",
      "Trident",
      "WebKit",
      "Gecko"
    ];
    const isBrowser = browserIndicators.some(
      (indicator) => userAgent.includes(indicator)
    );
    if (isBrowser) {
      return {
        isValid: false,
        reason: "Browser access not allowed. This endpoint is executor-only."
      };
    }
    const executorIndicators = [
      "Synapse",
      "KRNL",
      "Fluxus",
      "Script-Ware",
      "Sentinel",
      "Executor",
      "LuaU",
      "RobloxPlayer",
      "Roblox"
    ];
    let executorType = "Unknown Executor";
    for (const indicator of executorIndicators) {
      if (userAgent.includes(indicator)) {
        executorType = indicator;
        break;
      }
    }
    if (customHeader !== "LuaShield-Executor-v1") {
      return {
        isValid: false,
        reason: "Missing or invalid custom header"
      };
    }
    return {
      isValid: true,
      executorType
    };
  }
  /**
   * Generate HWID from various request parameters
   */
  static generateHWID(ip, userAgent, additionalData) {
    const data = `${ip}${userAgent}${additionalData || ""}`;
    return `HWID-${randomBytes2(8).toString("hex")}-${Buffer.from(data).toString("base64").slice(0, 16)}`;
  }
};

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  // "user" or "admin"
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var scripts = pgTable("scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  originalCode: text("original_code").notNull(),
  obfuscatedCode: text("obfuscated_code").notNull(),
  loaderLink: text("loader_link").notNull().unique(),
  watermark: text("watermark").notNull(),
  size: integer("size").notNull(),
  // in bytes
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var executions = pgTable("executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scriptId: varchar("script_id").notNull(),
  hwid: text("hwid").notNull(),
  userAgent: text("user_agent").notNull(),
  ipAddress: text("ip_address").notNull(),
  executorType: text("executor_type"),
  // Extracted from User-Agent
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  success: boolean("success").notNull().default(true)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  obfuscatedCode: true,
  loaderLink: true,
  watermark: true,
  createdAt: true
});
var insertExecutionSchema = createInsertSchema(executions).omit({
  id: true,
  timestamp: true
});
var loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address")
});
var uploadScriptSchema = z.object({
  name: z.string().min(1, "Script name is required").max(100, "Script name too long"),
  originalCode: z.string().min(1, "Script code is required").max(1048576, "Script too large (max 1MB)")
});

// server/routes.ts
async function registerRoutes(app2) {
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
  const requireAdmin = async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
  };
  app2.post("/api/auth/login", async (req, res) => {
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
      req.session.userId = user.id;
      req.session.user = user;
      const { password, ...userWithoutPassword } = user;
      res.json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const user = await storage.createUser(data);
      req.session.userId = user.id;
      req.session.user = user;
      const { password, ...userWithoutPassword } = user;
      res.json({
        message: "Registration successful",
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/scripts", requireAuth, async (req, res) => {
    try {
      const scripts2 = await storage.getScriptsByUserId(req.session.userId);
      res.json(scripts2);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch scripts" });
    }
  });
  app2.post("/api/scripts", requireAuth, async (req, res) => {
    try {
      const data = uploadScriptSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const loaderLink = LuaObfuscator.generateLoaderLink();
      const watermark = `Protected by LuaShield - ${user.email}`;
      const obfuscatedCode = LuaObfuscator.obfuscate(data.originalCode, {
        watermark,
        userId: user.id,
        scriptName: data.name
      });
      const size = new Blob([data.originalCode]).size;
      const script = await storage.createScript({
        userId: user.id,
        name: data.name,
        originalCode: data.originalCode,
        obfuscatedCode,
        loaderLink,
        watermark,
        size
      });
      res.json({
        message: "Script protected successfully",
        script
      });
    } catch (error) {
      res.status(400).json({ error: error.message || "Failed to protect script" });
    }
  });
  app2.delete("/api/scripts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      if (script.userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden: Not your script" });
      }
      await storage.deleteScript(id);
      res.json({ message: "Script deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to delete script" });
    }
  });
  app2.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });
  app2.get("/api/raw/:loaderLink", async (req, res) => {
    try {
      const { loaderLink } = req.params;
      const userAgent = req.headers["user-agent"] || "";
      const customHeader = req.headers["x-luashield-executor"];
      const verification = LuaObfuscator.verifyExecutorRequest(userAgent, customHeader);
      if (!verification.isValid) {
        return res.status(403).json({
          error: "Access Denied",
          message: verification.reason
        });
      }
      const script = await storage.getScriptByLoaderLink(loaderLink);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const hwid = LuaObfuscator.generateHWID(ip, userAgent);
      await storage.createExecution({
        scriptId: script.id,
        hwid,
        userAgent,
        ipAddress: ip,
        executorType: verification.executorType,
        success: true
      });
      res.setHeader("Content-Type", "text/plain");
      res.send(script.obfuscatedCode);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch script" });
    }
  });
  app2.post("/api/executions", async (req, res) => {
    try {
      const { scriptId, hwid } = req.body;
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "";
      await storage.createExecution({
        scriptId,
        hwid,
        userAgent,
        ipAddress: ip,
        executorType: "Unknown",
        success: true
      });
      res.json({ message: "Execution tracked" });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to track execution" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/scripts", requireAdmin, async (req, res) => {
    try {
      const scripts2 = await storage.getAllScripts();
      res.json(scripts2);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch scripts" });
    }
  });
  app2.get("/api/admin/executions", requireAdmin, async (req, res) => {
    try {
      const executions2 = await storage.getAllExecutions();
      res.json(executions2);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch executions" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  limit: "2mb",
  // Allow up to 2MB to comfortably handle 1MB scripts
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false, limit: "2mb" }));
var MemoryStore = createMemoryStore(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "luashield-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
