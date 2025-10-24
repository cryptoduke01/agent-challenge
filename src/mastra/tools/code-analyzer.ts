import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Code Analysis Tool - Analyzes code quality, complexity, and patterns
export const analyzeCodeTool = createTool({
  id: 'analyze_code',
  description: 'Analyzes code for quality, complexity, maintainability, and best practices.',
  inputSchema: z.object({
    code: z.string().describe('The source code to analyze'),
    language: z.string().describe('Programming language (javascript, typescript, python, etc.)'),
    filePath: z.string().optional().describe('File path for context'),
  }),
  outputSchema: z.object({
    qualityScore: z.number().min(0).max(100).describe('Overall code quality score'),
    complexity: z.object({
      cyclomatic: z.number().describe('Cyclomatic complexity'),
      cognitive: z.number().describe('Cognitive complexity'),
      maintainability: z.number().describe('Maintainability index'),
    }),
    issues: z.array(z.object({
      type: z.enum(['error', 'warning', 'info']),
      message: z.string(),
      line: z.number().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      suggestion: z.string().optional(),
    })),
    metrics: z.object({
      linesOfCode: z.number(),
      functions: z.number(),
      classes: z.number(),
      comments: z.number(),
      testCoverage: z.number().optional(),
    }),
    suggestions: z.array(z.string()).describe('Improvement suggestions'),
  }),
  execute: async ({ context }) => {
    try {
      const { code, language, filePath } = context;
      
      // Simulate advanced code analysis
      const lines = code.split('\n').length;
      const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
      const classes = (code.match(/class\s+\w+/g) || []).length;
      const comments = (code.match(/\/\/|\/\*|\*\/|\#/g) || []).length;
      
      // Calculate complexity metrics
      const cyclomaticComplexity = calculateCyclomaticComplexity(code);
      const cognitiveComplexity = calculateCognitiveComplexity(code);
      const maintainabilityIndex = Math.max(0, 100 - (cyclomaticComplexity * 2) - (cognitiveComplexity * 1.5));
      
      // Generate quality score
      const qualityScore = Math.max(0, Math.min(100, 
        maintainabilityIndex * 0.4 + 
        (comments / lines * 100) * 0.2 + 
        (functions > 0 ? Math.min(100, 100 - (functions / lines * 1000)) : 100) * 0.4
      ));
      
      // Detect common issues
      const issues = detectCodeIssues(code, language);
      
      // Generate suggestions
      const suggestions = generateImprovementSuggestions(code, issues, qualityScore);
      
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
    } catch (error: any) {
      return {
        qualityScore: 0,
        complexity: { cyclomatic: 0, cognitive: 0, maintainability: 0 },
        issues: [{ type: 'error', message: `Analysis failed: ${error.message}`, severity: 'critical' }],
        metrics: { linesOfCode: 0, functions: 0, classes: 0, comments: 0 },
        suggestions: ['Fix analysis errors before proceeding'],
      };
    }
  },
});

// Helper functions for code analysis
function calculateCyclomaticComplexity(code: string): number {
  const complexityKeywords = [
    'if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?', ':', 'try'
  ];
  
  let complexity = 1; // Base complexity
  complexityKeywords.forEach(keyword => {
    const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
    if (matches) complexity += matches.length;
  });
  
  return complexity;
}

function calculateCognitiveComplexity(code: string): number {
  // Simplified cognitive complexity calculation
  const nestedKeywords = ['if', 'else', 'while', 'for', 'switch', 'try', 'catch'];
  let complexity = 0;
  
  nestedKeywords.forEach(keyword => {
    const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
    if (matches) complexity += matches.length;
  });
  
  return complexity;
}

function detectCodeIssues(code: string, language: string): Array<{
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion?: string;
}> {
  const issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestion?: string;
  }> = [];
  
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for common issues
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
    
    if (line.length > 120) {
      issues.push({
        type: 'info',
        message: 'Line too long',
        line: lineNumber,
        severity: 'low',
        suggestion: 'Consider breaking into multiple lines',
      });
    }
    
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        type: 'info',
        message: 'TODO or FIXME comment found',
        line: lineNumber,
        severity: 'low',
        suggestion: 'Address the TODO item',
      });
    }
  });
  
  return issues;
}

function generateImprovementSuggestions(code: string, issues: any[], qualityScore: number): string[] {
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
