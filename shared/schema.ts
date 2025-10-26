import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), // "user" or "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scripts = pgTable("scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  originalCode: text("original_code").notNull(),
  obfuscatedCode: text("obfuscated_code").notNull(),
  loaderLink: text("loader_link").notNull().unique(),
  watermark: text("watermark").notNull(),
  size: integer("size").notNull(), // in bytes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const executions = pgTable("executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scriptId: varchar("script_id").notNull(),
  hwid: text("hwid").notNull(),
  userAgent: text("user_agent").notNull(),
  ipAddress: text("ip_address").notNull(),
  executorType: text("executor_type"), // Extracted from User-Agent
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  success: boolean("success").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  obfuscatedCode: true,
  loaderLink: true,
  watermark: true,
  createdAt: true,
});

export const insertExecutionSchema = createInsertSchema(executions).omit({
  id: true,
  timestamp: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register schema
export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

// Script upload schema
export const uploadScriptSchema = z.object({
  name: z.string().min(1, "Script name is required").max(100, "Script name too long"),
  originalCode: z.string().min(1, "Script code is required").max(1048576, "Script too large (max 1MB)"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;
export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type Execution = typeof executions.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type UploadScriptData = z.infer<typeof uploadScriptSchema>;
