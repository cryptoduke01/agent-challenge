import { MCPServer } from "@mastra/mcp"
import {
  // CodeGuardian AI Code Analysis Tools
  analyzeCodeTool,
  securityScannerTool,
  performanceOptimizerTool,
  documentationGeneratorTool,
  repositoryConnectorTool,
  analyzeFileTool,
  reportGeneratorTool,
  // Legacy FlowSync Task Management Tools
  createTaskTool,
  getTaskTool,
  getAllTasksTool,
  updateTaskTool,
  deleteTaskTool,
  toggleTaskStatusTool,
  calculatePriorityTool,
  recalculateAllPrioritiesTool,
  parseDeadlineTool,
  detectOverdueTasksTool,
  getUpcomingDeadlinesTool,
  categorizeTaskTool,
  extractTagsTool,
  suggestCategoryTool,
  // Legacy weather tool
  weatherTool
} from "../tools";
import { weatherAgent, codeguardianAgent } from "../agents";

export const server = new MCPServer({
  name: "Sentra AI Code Analysis Server",
  version: "2.0.0",
  tools: {
    // CodeGuardian AI Code Analysis Tools
    analyzeCodeTool,
    securityScannerTool,
    performanceOptimizerTool,
    documentationGeneratorTool,
    repositoryConnectorTool,
    analyzeFileTool,
    reportGeneratorTool,
    // Legacy FlowSync Task Management Tools
    createTaskTool,
    getTaskTool,
    getAllTasksTool,
    updateTaskTool,
    deleteTaskTool,
    toggleTaskStatusTool,
    calculatePriorityTool,
    recalculateAllPrioritiesTool,
    parseDeadlineTool,
    detectOverdueTasksTool,
    getUpcomingDeadlinesTool,
    categorizeTaskTool,
    extractTagsTool,
    suggestCategoryTool,
    // Legacy weather tool
    weatherTool
  },
  agents: { weatherAgent, codeguardianAgent }, // these agents will become tools "ask_weatherAgent" and "ask_codeguardianAgent"
  // workflows: {
  // dataProcessingWorkflow, // this workflow will become tool "run_dataProcessingWorkflow"
  // }
});
