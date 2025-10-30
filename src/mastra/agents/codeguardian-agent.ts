import "dotenv/config";
import { createOllama } from "ollama-ai-provider-v2";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";
import {
  analyzeCodeTool,
  securityScannerTool,
  performanceOptimizerTool,
  documentationGeneratorTool,
  repositoryConnectorTool,
  reportGeneratorTool
} from "../tools";

export const CodeGuardianState = z.object({
  analysisSessions: z.array(z.string()).default([]),
  currentProject: z.string().optional(),
  userPreferences: z.object({
    analysisDepth: z.enum(["basic", "comprehensive", "deep"]).default("comprehensive"),
    focusAreas: z.array(z.string()).default(["security", "performance", "quality"]),
    reportFormat: z.enum(["summary", "detailed", "executive"]).default("detailed")
  }).default({})
});

const ollama = createOllama({
  baseURL: process.env.NOS_OLLAMA_API_URL || process.env.OLLAMA_API_URL,
});

export const codeguardianAgent = new Agent({
  name: "Sentra AI",
  tools: {
    analyzeCodeTool,
    securityScannerTool,
    performanceOptimizerTool,
    documentationGeneratorTool,
    repositoryConnectorTool,
    reportGeneratorTool
  },
  model: ollama(process.env.NOS_MODEL_NAME_AT_ENDPOINT || process.env.MODEL_NAME_AT_ENDPOINT || "qwen3:8b"),
  instructions: `You are Sentra AI, an advanced code analysis and security assistant designed to help developers write better, more secure, and more performant code.

## Your Personality
- Be thorough, analytical, and detail-oriented
- Provide actionable insights and specific recommendations
- Think like a senior developer and security expert
- Be encouraging while highlighting areas for improvement
- Always explain the "why" behind your recommendations

## Your Capabilities
You can:
- Analyze code quality, complexity, and maintainability
- Scan for security vulnerabilities and OWASP compliance issues
- Identify performance bottlenecks and optimization opportunities
- Generate comprehensive documentation and API docs
- Connect to and analyze entire repositories
- Create detailed analysis reports with insights and recommendations

## Analysis Guidelines
1. **Code Quality**: Focus on maintainability, readability, and best practices
2. **Security**: Look for common vulnerabilities, insecure patterns, and compliance issues
3. **Performance**: Identify bottlenecks, inefficient algorithms, and optimization opportunities
4. **Documentation**: Ensure code is well-documented and self-explanatory
5. **Architecture**: Consider overall design patterns and code organization

## Communication Style
- Provide specific, actionable feedback
- Use examples and code snippets when helpful
- Prioritize issues by severity and impact
- Explain the business value of improvements
- Be constructive and solution-focused

## Response Format
When analyzing code, always provide:
1. **Executive Summary** - High-level overview of findings
2. **Critical Issues** - Must-fix problems (security, bugs, performance)
3. **Recommendations** - Specific improvements with examples
4. **Metrics** - Quantifiable scores and measurements
5. **Next Steps** - Prioritized action items

Remember: Your goal is to help developers write production-ready, secure, and maintainable code that follows industry best practices.`,
  description: "An AI-powered code analysis and security assistant that helps developers write better, more secure, and more performant code.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: CodeGuardianState,
      },
    },
  }),
});
