import { 
  CodeAnalysis, 
  SecurityScan, 
  PerformanceAnalysis, 
  DocumentationAnalysis,
  RepositoryAnalysis,
  AnalysisReport,
  AgentResponse 
} from './code-types';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class CodeAgentClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/code/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`Code analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async scanSecurity(code: string, language: string, framework?: string): Promise<SecurityScan> {
    const response = await fetch(`${this.baseUrl}/api/code/security`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language, framework }),
    });

    if (!response.ok) {
      throw new Error(`Security scan failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzePerformance(code: string, language: string, framework?: string): Promise<PerformanceAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/code/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language, framework }),
    });

    if (!response.ok) {
      throw new Error(`Performance analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateDocumentation(code: string, language: string, projectName?: string, framework?: string): Promise<DocumentationAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/code/documentation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language, projectName, framework }),
    });

    if (!response.ok) {
      throw new Error(`Documentation generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async connectRepository(repositoryUrl: string, branch?: string, filePattern?: string): Promise<RepositoryAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/code/repository`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repositoryUrl, branch, filePattern }),
    });

    if (!response.ok) {
      throw new Error(`Repository connection failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateReport(analysisData: any, reportType: string = 'summary', includeCharts: boolean = true): Promise<AnalysisReport> {
    const response = await fetch(`${this.baseUrl}/api/code/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisData, reportType, includeCharts }),
    });

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async sendMessage(message: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Agent chat failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getStatus(): Promise<{
    status: 'ready' | 'unavailable' | 'error';
    agentName: string;
    capabilities: string[];
    lastChecked: string;
    message?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/agent/status`);

    if (!response.ok) {
      throw new Error(`Agent status check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const codeAgentClient = new CodeAgentClient();
