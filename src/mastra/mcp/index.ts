import { MCPServer } from "@mastra/mcp"
import {
  // Sentra AI Code Analysis Tools
  analyzeCodeTool,
  securityScannerTool,
  performanceOptimizerTool,
  documentationGeneratorTool,
  repositoryConnectorTool,
  analyzeFileTool,
  reportGeneratorTool,
  // Weather tool
  weatherTool
} from "../tools";
import { weatherAgent, sentraAgent } from "../agents";

export const server = new MCPServer({
  name: "Sentra AI Code Analysis Server",
  version: "2.0.0",
  tools: {
    // Sentra AI Code Analysis Tools
    analyzeCodeTool,
    securityScannerTool,
    performanceOptimizerTool,
    documentationGeneratorTool,
    repositoryConnectorTool,
    analyzeFileTool,
    reportGeneratorTool,
    // Weather tool
    weatherTool
  },
  agents: { weatherAgent, sentraAgent }, // these agents will become tools "ask_weatherAgent" and "ask_sentraAgent"
  // workflows: {
  // dataProcessingWorkflow, // this workflow will become tool "run_dataProcessingWorkflow"
  // }
});
