import { type User, type InsertUser, type Script, type InsertScript, type Execution, type InsertExecution } from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword } from "./password";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Scripts
  getScript(id: string): Promise<Script | undefined>;
  getScriptByLoaderLink(loaderLink: string): Promise<Script | undefined>;
  getScriptsByUserId(userId: string): Promise<Script[]>;
  getAllScripts(): Promise<Script[]>;
  createScript(script: Omit<Script, 'id' | 'createdAt'>): Promise<Script>;
  deleteScript(id: string): Promise<boolean>;

  // Executions
  getExecution(id: string): Promise<Execution | undefined>;
  getExecutionsByScriptId(scriptId: string): Promise<Execution[]>;
  getAllExecutions(): Promise<Execution[]>;
  createExecution(execution: InsertExecution): Promise<Execution>;

  // Stats
  getUserStats(userId: string): Promise<{
    totalScripts: number;
    totalExecutions: number;
    totalSize: number;
    executionsToday: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scripts: Map<string, Script>;
  private executions: Map<string, Execution>;

  constructor() {
    this.users = new Map();
    this.scripts = new Map();
    this.executions = new Map();
    // Seed data asynchronously
    this.seedData().catch(console.error);
  }

  private async seedData() {
    // Create demo user account
    const userId = randomUUID();
    const user: User = {
      id: userId,
      username: "user",
      password: await hashPassword("password123"),
      email: "user@example.com",
      role: "user",
      createdAt: new Date(),
    };
    this.users.set(userId, user);

    // Create demo admin account
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      password: await hashPassword("admin123"),
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create sample script for demo user
    const scriptId = randomUUID();
    const loaderLink = randomUUID().replace(/-/g, '');
    const sampleScript: Script = {
      id: scriptId,
      userId: userId,
      name: "DemoScript",
      originalCode: "print('Hello, World!')",
      obfuscatedCode: "--[[ Protected by LuaShield ]]\nlocal _0x1a2b3c='Hello, World!';print(_0x1a2b3c)",
      loaderLink: loaderLink,
      watermark: "Protected by LuaShield - user@example.com",
      size: 24,
      createdAt: new Date(),
    };
    this.scripts.set(scriptId, sampleScript);

    // Create sample execution
    const executionId = randomUUID();
    const execution: Execution = {
      id: executionId,
      scriptId: scriptId,
      hwid: "HWID-" + randomUUID().slice(0, 16),
      userAgent: "Synapse X",
      ipAddress: "192.168.1.100",
      executorType: "Synapse X",
      timestamp: new Date(),
      success: true,
    };
    this.executions.set(executionId, execution);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser,
      password: hashedPassword,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Scripts
  async getScript(id: string): Promise<Script | undefined> {
    return this.scripts.get(id);
  }

  async getScriptByLoaderLink(loaderLink: string): Promise<Script | undefined> {
    return Array.from(this.scripts.values()).find(
      (script) => script.loaderLink === loaderLink,
    );
  }

  async getScriptsByUserId(userId: string): Promise<Script[]> {
    return Array.from(this.scripts.values()).filter(
      (script) => script.userId === userId,
    );
  }

  async getAllScripts(): Promise<Script[]> {
    return Array.from(this.scripts.values());
  }

  async createScript(script: Omit<Script, 'id' | 'createdAt'>): Promise<Script> {
    const id = randomUUID();
    const newScript: Script = {
      ...script,
      id,
      createdAt: new Date(),
    };
    this.scripts.set(id, newScript);
    return newScript;
  }

  async deleteScript(id: string): Promise<boolean> {
    return this.scripts.delete(id);
  }

  // Executions
  async getExecution(id: string): Promise<Execution | undefined> {
    return this.executions.get(id);
  }

  async getExecutionsByScriptId(scriptId: string): Promise<Execution[]> {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.scriptId === scriptId,
    );
  }

  async getAllExecutions(): Promise<Execution[]> {
    return Array.from(this.executions.values());
  }

  async createExecution(insertExecution: InsertExecution): Promise<Execution> {
    const id = randomUUID();
    const execution: Execution = {
      ...insertExecution,
      id,
      timestamp: new Date(),
    };
    this.executions.set(id, execution);
    return execution;
  }

  // Stats
  async getUserStats(userId: string): Promise<{
    totalScripts: number;
    totalExecutions: number;
    totalSize: number;
    executionsToday: number;
  }> {
    const userScripts = await this.getScriptsByUserId(userId);
    const scriptIds = userScripts.map(s => s.id);
    const executions = Array.from(this.executions.values()).filter(
      e => scriptIds.includes(e.scriptId)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const executionsToday = executions.filter(
      e => new Date(e.timestamp) >= today
    ).length;

    return {
      totalScripts: userScripts.length,
      totalExecutions: executions.length,
      totalSize: userScripts.reduce((sum, s) => sum + s.size, 0),
      executionsToday,
    };
  }
}

export const storage = new MemStorage();
