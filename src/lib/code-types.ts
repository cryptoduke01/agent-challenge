// CodeGuardian AI Code Analysis Types

export interface CodeAnalysis {
  qualityScore: number;
  complexity: {
    cyclomatic: number;
    cognitive: number;
    maintainability: number;
  };
  issues: CodeIssue[];
  metrics: {
    linesOfCode: number;
    functions: number;
    classes: number;
    comments: number;
    testCoverage?: number;
  };
  suggestions: string[];
}

export interface SecurityScan {
  securityScore: number;
  vulnerabilities: Vulnerability[];
  recommendations: string[];
  compliance: {
    owasp: {
      score: number;
      issues: string[];
    };
    cwe: {
      score: number;
      issues: string[];
    };
  };
}

export interface PerformanceAnalysis {
  performanceScore: number;
  bottlenecks: Bottleneck[];
  recommendations: string[];
  metrics: {
    estimatedLoadTime: string;
    memoryUsage: string;
    cpuIntensity: string;
  };
}

export interface DocumentationAnalysis {
  documentation: {
    readme: string;
    apiDocs: string;
    codeComments: string;
    examples: string[];
  };
  coverage: {
    functions: number;
    classes: number;
    apis: number;
    coverage: number;
  };
  suggestions: string[];
}

export interface RepositoryAnalysis {
  repository: {
    name: string;
    url: string;
    branch: string;
    lastCommit: string;
    contributors: number;
  };
  files: RepositoryFile[];
  statistics: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>;
    recentActivity: ActivityData[];
  };
  analysis: {
    overallHealth: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion?: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line?: number;
  cwe?: string;
  owasp?: string;
  fix: string;
  impact: string;
}

export interface Bottleneck {
  type: 'cpu' | 'memory' | 'network' | 'database' | 'rendering';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line?: number;
  impact: string;
  solution: string;
  metrics: {
    estimatedImprovement: string;
    complexity: 'low' | 'medium' | 'high';
  };
}

export interface RepositoryFile {
  path: string;
  size: number;
  language: string;
  lastModified: string;
  complexity: number;
}

export interface ActivityData {
  date: string;
  commits: number;
  contributors: number;
}

export interface AnalysisReport {
  title: string;
  summary: string;
  executiveSummary: string;
  sections: ReportSection[];
  charts?: ChartData[];
}

export interface ReportSection {
  title: string;
  content: string;
  metrics?: any;
  recommendations?: string[];
}

export interface ChartData {
  type: string;
  title: string;
  data: any;
}

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: string;
  analysis?: CodeAnalysis;
  securityScan?: SecurityScan;
  performanceAnalysis?: PerformanceAnalysis;
}

export interface AnalysisSession {
  id: string;
  name: string;
  repositoryUrl?: string;
  files: CodeFile[];
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  report?: AnalysisReport;
}

export interface AgentResponse {
  response: string;
  analysis?: CodeAnalysis;
  securityScan?: SecurityScan;
  performanceAnalysis?: PerformanceAnalysis;
  documentationAnalysis?: DocumentationAnalysis;
  repositoryAnalysis?: RepositoryAnalysis;
  report?: AnalysisReport;
}
