import { v4 as uuidv4 } from 'uuid';
import { 
  CodeFile, 
  AnalysisSession, 
  CodeAnalysis, 
  SecurityScan, 
  PerformanceAnalysis,
  DocumentationAnalysis,
  RepositoryAnalysis,
  AnalysisReport
} from './code-types';

class CodeStore {
  private files: Map<string, CodeFile>;
  private sessions: Map<string, AnalysisSession>;

  constructor() {
    this.files = new Map();
    this.sessions = new Map();
  }

  // File management
  addFile(fileData: Omit<CodeFile, 'id' | 'lastModified'>): CodeFile {
    const newFile: CodeFile = {
      id: uuidv4(),
      ...fileData,
      lastModified: new Date().toISOString(),
    };
    this.files.set(newFile.id, newFile);
    return newFile;
  }

  getFile(id: string): CodeFile | undefined {
    return this.files.get(id);
  }

  getAllFiles(): CodeFile[] {
    return Array.from(this.files.values());
  }

  updateFile(id: string, updates: Partial<CodeFile>): CodeFile | undefined {
    const file = this.files.get(id);
    if (file) {
      const updatedFile = { 
        ...file, 
        ...updates, 
        lastModified: new Date().toISOString() 
      };
      this.files.set(id, updatedFile);
      return updatedFile;
    }
    return undefined;
  }

  deleteFile(id: string): boolean {
    return this.files.delete(id);
  }

  // Session management
  createSession(sessionData: Omit<AnalysisSession, 'id' | 'createdAt' | 'updatedAt' | 'files' | 'status'>): AnalysisSession {
    const newSession: AnalysisSession = {
      id: uuidv4(),
      ...sessionData,
      files: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(newSession.id, newSession);
    return newSession;
  }

  getSession(id: string): AnalysisSession | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): AnalysisSession[] {
    return Array.from(this.sessions.values());
  }

  updateSession(id: string, updates: Partial<AnalysisSession>): AnalysisSession | undefined {
    const session = this.sessions.get(id);
    if (session) {
      const updatedSession = { 
        ...session, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.sessions.set(id, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  // Analysis methods
  analyzeCode(code: string, language: string): CodeAnalysis {
    // Simulate code analysis
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    const comments = (code.match(/\/\/|\/\*|\*\/|\#/g) || []).length;
    
    // Calculate complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    const cognitiveComplexity = this.calculateCognitiveComplexity(code);
    const maintainabilityIndex = Math.max(0, 100 - (cyclomaticComplexity * 2) - (cognitiveComplexity * 1.5));
    
    // Generate quality score
    const qualityScore = Math.max(0, Math.min(100, 
      maintainabilityIndex * 0.4 + 
      (comments / lines * 100) * 0.2 + 
      (functions > 0 ? Math.min(100, 100 - (functions / lines * 1000)) : 100) * 0.4
    ));
    
    // Detect issues
    const issues = this.detectCodeIssues(code, language);
    
    // Generate suggestions
    const suggestions = this.generateImprovementSuggestions(code, issues, qualityScore);
    
    return {
      qualityScore: Math.round(qualityScore),
      complexity: {
        cyclomatic: cyclomaticComplexity,
        cognitive: cognitiveComplexity,
        maintainability: Math.round(maintainabilityIndex),
      },
      issues,
      metrics: {
        linesOfCode: lines,
        functions,
        classes,
        comments,
      },
      suggestions,
    };
  }

  scanSecurity(code: string, language: string): SecurityScan {
    const vulnerabilities = this.detectVulnerabilities(code, language);
    const securityScore = this.calculateSecurityScore(vulnerabilities);
    const recommendations = this.generateSecurityRecommendations(vulnerabilities, language);
    
    return {
      securityScore,
      vulnerabilities,
      recommendations,
      compliance: {
        owasp: {
          score: Math.max(0, 100 - (vulnerabilities.filter(v => v.owasp).length * 10)),
          issues: vulnerabilities.filter(v => v.owasp).map(v => `${v.owasp}: ${v.title}`),
        },
        cwe: {
          score: Math.max(0, 100 - (vulnerabilities.filter(v => v.cwe).length * 8)),
          issues: vulnerabilities.filter(v => v.cwe).map(v => `${v.cwe}: ${v.title}`),
        },
      },
    };
  }

  analyzePerformance(code: string, language: string): PerformanceAnalysis {
    const bottlenecks = this.detectPerformanceBottlenecks(code, language);
    const performanceScore = this.calculatePerformanceScore(bottlenecks);
    const recommendations = this.generatePerformanceRecommendations(bottlenecks, language);
    const metrics = this.calculatePerformanceMetrics(code, bottlenecks);
    
    return {
      performanceScore,
      bottlenecks,
      recommendations,
      metrics,
    };
  }

  generateDocumentation(code: string, language: string, projectName?: string): DocumentationAnalysis {
    const structure = this.analyzeCodeStructure(code, language);
    const documentation = this.generateDocumentationContent(code, language, projectName, structure);
    const coverage = this.calculateDocumentationCoverage(code, structure);
    const suggestions = this.generateDocumentationSuggestions(structure, language);
    
    return {
      documentation,
      coverage,
      suggestions,
    };
  }

  // Helper methods
  private calculateCyclomaticComplexity(code: string): number {
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '\\?', ':', 'try'
    ];
    
    let complexity = 1;
    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  private calculateCognitiveComplexity(code: string): number {
    const nestedKeywords = ['if', 'else', 'while', 'for', 'switch', 'try', 'catch'];
    let complexity = 0;
    
    nestedKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  private detectCodeIssues(code: string, language: string): any[] {
    const issues: any[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      if (line.includes('console.log') && !line.includes('//')) {
        issues.push({
          type: 'warning',
          message: 'Console.log statement found',
          line: lineNumber,
          severity: 'low',
          suggestion: 'Remove or replace with proper logging',
        });
      }
      
      if (line.includes('var ') && language === 'javascript') {
        issues.push({
          type: 'warning',
          message: 'Use of var keyword',
          line: lineNumber,
          severity: 'medium',
          suggestion: 'Use let or const instead of var',
        });
      }
      
      if (line.includes('==') && !line.includes('===')) {
        issues.push({
          type: 'warning',
          message: 'Use of == instead of ===',
          line: lineNumber,
          severity: 'medium',
          suggestion: 'Use strict equality (===)',
        });
      }
    });
    
    return issues;
  }

  private generateImprovementSuggestions(code: string, issues: any[], qualityScore: number): string[] {
    const suggestions: string[] = [];
    
    if (qualityScore < 50) {
      suggestions.push('Consider refactoring to improve code quality');
    }
    
    if (issues.some(issue => issue.severity === 'high' || issue.severity === 'critical')) {
      suggestions.push('Address high-severity issues immediately');
    }
    
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    const lines = code.split('\n').length;
    
    if (functions > lines / 10) {
      suggestions.push('Consider breaking down large functions');
    }
    
    if (code.includes('any') && code.includes('typescript')) {
      suggestions.push('Avoid using "any" type in TypeScript');
    }
    
    if (!code.includes('test') && !code.includes('spec')) {
      suggestions.push('Add unit tests for better code coverage');
    }
    
    return suggestions;
  }

  private detectVulnerabilities(code: string, language: string): any[] {
    const vulnerabilities: any[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('query') && lowerLine.includes('+') && !lowerLine.includes('prepared')) {
        vulnerabilities.push({
          id: 'SQL_INJECTION',
          title: 'Potential SQL Injection',
          severity: 'high',
          description: 'String concatenation in SQL queries can lead to SQL injection',
          line: lineNumber,
          cwe: 'CWE-89',
          owasp: 'A03:2021 – Injection',
          fix: 'Use parameterized queries or prepared statements',
          impact: 'Data breach, unauthorized access to database',
        });
      }
      
      if (lowerLine.includes('innerhtml') || lowerLine.includes('outerhtml')) {
        vulnerabilities.push({
          id: 'XSS',
          title: 'Cross-Site Scripting (XSS)',
          severity: 'high',
          description: 'Direct DOM manipulation can lead to XSS attacks',
          line: lineNumber,
          cwe: 'CWE-79',
          owasp: 'A03:2021 – Injection',
          fix: 'Use textContent or sanitize HTML input',
          impact: 'Session hijacking, data theft, malicious script execution',
        });
      }
      
      if (lowerLine.includes('password') && lowerLine.includes('=') && !lowerLine.includes('process.env')) {
        vulnerabilities.push({
          id: 'HARDCODED_SECRET',
          title: 'Hardcoded Password or Secret',
          severity: 'critical',
          description: 'Hardcoded credentials or secrets in source code',
          line: lineNumber,
          cwe: 'CWE-798',
          owasp: 'A07:2021 – Identification and Authentication Failures',
          fix: 'Use environment variables or secure secret management',
          impact: 'Complete system compromise, credential exposure',
        });
      }
    });
    
    return vulnerabilities;
  }

  private calculateSecurityScore(vulnerabilities: any[]): number {
    if (vulnerabilities.length === 0) return 100;
    
    let score = 100;
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
      }
    });
    
    return Math.max(0, score);
  }

  private generateSecurityRecommendations(vulnerabilities: any[], language: string): string[] {
    const recommendations: string[] = [];
    
    if (vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.push('🚨 Address critical security vulnerabilities immediately');
    }
    
    if (vulnerabilities.some(v => v.id === 'HARDCODED_SECRET')) {
      recommendations.push('🔐 Implement proper secret management');
    }
    
    if (vulnerabilities.some(v => v.id === 'SQL_INJECTION')) {
      recommendations.push('🛡️ Use parameterized queries and input validation');
    }
    
    if (vulnerabilities.some(v => v.id === 'XSS')) {
      recommendations.push('🔒 Implement Content Security Policy (CSP) and input sanitization');
    }
    
    recommendations.push('🔄 Regular security audits and dependency updates');
    recommendations.push('📚 Follow OWASP Top 10 guidelines');
    
    return recommendations;
  }

  private detectPerformanceBottlenecks(code: string, language: string): any[] {
    const bottlenecks: any[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const lowerLine = line.toLowerCase();
      
      if ((lowerLine.includes('for') && lowerLine.includes('for')) || 
          (lowerLine.includes('while') && lowerLine.includes('while'))) {
        bottlenecks.push({
          type: 'cpu',
          severity: 'high',
          description: 'Nested loops detected - O(n²) or worse complexity',
          line: lineNumber,
          impact: 'Exponential time complexity, poor scalability',
          solution: 'Consider using hash maps, sorting, or divide-and-conquer algorithms',
          metrics: { estimatedImprovement: '50-90%', complexity: 'medium' },
        });
      }
      
      if (lowerLine.includes('addEventListener') && !lowerLine.includes('removeEventListener')) {
        bottlenecks.push({
          type: 'memory',
          severity: 'high',
          description: 'Potential memory leak - event listeners not removed',
          line: lineNumber,
          impact: 'Memory usage grows over time, eventual crash',
          solution: 'Remove event listeners in cleanup functions or use AbortController',
          metrics: { estimatedImprovement: 'Prevents memory leaks', complexity: 'low' },
        });
      }
    });
    
    return bottlenecks;
  }

  private calculatePerformanceScore(bottlenecks: any[]): number {
    if (bottlenecks.length === 0) return 100;
    
    let score = 100;
    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
      }
    });
    
    return Math.max(0, score);
  }

  private generatePerformanceRecommendations(bottlenecks: any[], language: string): string[] {
    const recommendations: string[] = [];
    
    if (bottlenecks.some(b => b.severity === 'critical')) {
      recommendations.push('🚨 Address critical performance bottlenecks immediately');
    }
    
    if (bottlenecks.some(b => b.type === 'cpu')) {
      recommendations.push('⚡ Optimize algorithms and reduce time complexity');
    }
    
    if (bottlenecks.some(b => b.type === 'memory')) {
      recommendations.push('🧠 Implement proper memory management and cleanup');
    }
    
    recommendations.push('📊 Use performance monitoring tools');
    recommendations.push('🔄 Regular performance audits and optimization');
    
    return recommendations;
  }

  private calculatePerformanceMetrics(code: string, bottlenecks: any[]): any {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    
    let loadTime = 'Fast';
    let memoryUsage = 'Low';
    let cpuIntensity = 'Low';
    
    if (bottlenecks.some(b => b.severity === 'critical')) {
      loadTime = 'Very Slow';
      memoryUsage = 'Very High';
      cpuIntensity = 'Very High';
    } else if (bottlenecks.some(b => b.severity === 'high')) {
      loadTime = 'Slow';
      memoryUsage = 'High';
      cpuIntensity = 'High';
    }
    
    return {
      estimatedLoadTime: loadTime,
      memoryUsage,
      cpuIntensity,
    };
  }

  private analyzeCodeStructure(code: string, language: string): any {
    // Simplified code structure analysis
    return {
      functions: (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      lines: code.split('\n').length,
    };
  }

  private generateDocumentationContent(code: string, language: string, projectName?: string, structure?: any): any {
    return {
      readme: `# ${projectName || 'CodeGuardian Project'}\n\nGenerated documentation...`,
      apiDocs: 'API documentation...',
      codeComments: code,
      examples: ['Usage examples...'],
    };
  }

  private calculateDocumentationCoverage(code: string, structure?: any): any {
    return {
      functions: Math.floor((structure?.functions || 0) * 0.7),
      classes: Math.floor((structure?.classes || 0) * 0.6),
      apis: 0,
      coverage: 70,
    };
  }

  private generateDocumentationSuggestions(structure?: any, language?: string): string[] {
    return [
      'Add JSDoc comments to functions',
      'Create comprehensive README',
      'Document API endpoints',
      'Add usage examples',
    ];
  }
}

export const codeStore = new CodeStore();
