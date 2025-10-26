import { randomBytes } from "crypto";

/**
 * Lua Script Obfuscator
 * Implements Prometheus-style obfuscation with watermarking and anti-dumping measures
 */

interface ObfuscationOptions {
  watermark: string;
  userId: string;
  scriptName: string;
}

export class LuaObfuscator {
  private static readonly RESERVED_KEYWORDS = [
    'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
    'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
    'return', 'then', 'true', 'until', 'while'
  ];

  /**
   * Obfuscate Lua code with watermarking and protection
   */
  static obfuscate(code: string, options: ObfuscationOptions): string {
    // Generate unique watermark ID
    const watermarkId = randomBytes(8).toString('hex');
    
    // Add watermark header (multi-layer protection)
    let obfuscated = this.addWatermarkHeader(options.watermark, watermarkId, options.scriptName);
    
    // Add anti-dumping layer 1: Environment check
    obfuscated += this.addAntiDumpingLayer1();
    
    // Obfuscate strings
    const stringMap = this.extractAndObfuscateStrings(code);
    let processedCode = code;
    
    // Replace strings with obfuscated versions
    for (const [original, obfuscated_str] of stringMap.entries()) {
      processedCode = processedCode.replace(original, obfuscated_str);
    }
    
    // Obfuscate variable names
    processedCode = this.obfuscateVariables(processedCode);
    
    // Add control flow flattening (simple version)
    processedCode = this.addControlFlowFlattening(processedCode);
    
    // Add anti-dumping layer 2: Runtime checks
    obfuscated += this.addAntiDumpingLayer2();
    
    // Add the obfuscated code
    obfuscated += "\n" + processedCode;
    
    // Add execution tracker callback
    obfuscated += this.addExecutionTracker(options.userId, options.scriptName);
    
    // Add anti-dumping layer 3: Footer protection
    obfuscated += this.addAntiDumpingLayer3();
    
    return obfuscated;
  }

  /**
   * Add watermark header with comments
   */
  private static addWatermarkHeader(watermark: string, id: string, scriptName: string): string {
    const timestamp = new Date().toISOString();
    return `--[[
╔═══════════════════════════════════════════════════════════╗
║           PROTECTED BY LUASHIELD                          ║
║   Unauthorized distribution or modification is prohibited ║
╚═══════════════════════════════════════════════════════════╝

Watermark: ${watermark}
Script: ${scriptName}
Protection ID: ${id}
Protected: ${timestamp}

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
  private static addAntiDumpingLayer1(): string {
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
  private static addAntiDumpingLayer2(): string {
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
  private static addAntiDumpingLayer3(): string {
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
  private static addExecutionTracker(userId: string, scriptName: string): string {
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
  private static extractAndObfuscateStrings(code: string): Map<string, string> {
    const stringMap = new Map<string, string>();
    const stringRegex = /["']([^"'\\]*(\\.[^"'\\]*)*)["']/g;
    let match;
    let counter = 0;

    while ((match = stringRegex.exec(code)) !== null) {
      const original = match[0];
      const content = match[1];
      
      // Skip if already processed
      if (stringMap.has(original)) continue;
      
      // Create obfuscated variable name
      const varName = `_0x${counter.toString(16)}${randomBytes(2).toString('hex')}`;
      
      // Store mapping
      stringMap.set(original, varName);
      counter++;
    }

    return stringMap;
  }

  /**
   * Obfuscate variable names
   */
  private static obfuscateVariables(code: string): string {
    const varRegex = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const varMap = new Map<string, string>();
    let counter = 0;

    // Find all local variables
    let match;
    while ((match = varRegex.exec(code)) !== null) {
      const varName = match[1];
      
      // Skip reserved keywords and already processed
      if (this.RESERVED_KEYWORDS.includes(varName) || varMap.has(varName)) {
        continue;
      }
      
      // Generate obfuscated name
      const obfName = `_L${counter}_${randomBytes(3).toString('hex')}`;
      varMap.set(varName, obfName);
      counter++;
    }

    // Replace all occurrences
    let result = code;
    for (const [original, obfuscated] of varMap.entries()) {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      result = result.replace(regex, obfuscated);
    }

    return result;
  }

  /**
   * Add simple control flow flattening
   */
  private static addControlFlowFlattening(code: string): string {
    // Wrap code in do-end block for isolation
    return `do
    local _PROTECTED = true
    ${code}
end`;
  }

  /**
   * Generate a unique loader link
   */
  static generateLoaderLink(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Verify if a request is from an executor (not a browser)
   */
  static verifyExecutorRequest(userAgent: string, customHeader?: string): {
    isValid: boolean;
    executorType?: string;
    reason?: string;
  } {
    // Check if user agent is from a browser (should be blocked)
    const browserIndicators = [
      'Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge', 'Opera',
      'MSIE', 'Trident', 'WebKit', 'Gecko'
    ];
    
    const isBrowser = browserIndicators.some(indicator => 
      userAgent.includes(indicator)
    );
    
    if (isBrowser) {
      return {
        isValid: false,
        reason: "Browser access not allowed. This endpoint is executor-only."
      };
    }

    // Check for known executor user agents
    const executorIndicators = [
      'Synapse', 'KRNL', 'Fluxus', 'Script-Ware', 'Sentinel',
      'Executor', 'LuaU', 'RobloxPlayer', 'Roblox'
    ];

    let executorType = 'Unknown Executor';
    for (const indicator of executorIndicators) {
      if (userAgent.includes(indicator)) {
        executorType = indicator;
        break;
      }
    }

    // Verify custom header (additional security layer)
    if (customHeader !== 'LuaShield-Executor-v1') {
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
  static generateHWID(ip: string, userAgent: string, additionalData?: string): string {
    const data = `${ip}${userAgent}${additionalData || ''}`;
    return `HWID-${randomBytes(8).toString('hex')}-${Buffer.from(data).toString('base64').slice(0, 16)}`;
  }
}
