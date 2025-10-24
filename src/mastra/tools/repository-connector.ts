import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Repository Connector Tool - Integrates with Git repositories
export const repositoryConnectorTool = createTool({
  id: 'connect_repository',
  description: 'Connects to and analyzes Git repositories for code review and analysis.',
  inputSchema: z.object({
    repositoryUrl: z.string().describe('Git repository URL (GitHub, GitLab, etc.)'),
    branch: z.string().optional().describe('Branch to analyze (default: main)'),
    filePattern: z.string().optional().describe('File pattern to include (e.g., "*.js", "*.ts")'),
  }),
  outputSchema: z.object({
    repository: z.object({
      name: z.string(),
      url: z.string(),
      branch: z.string(),
      lastCommit: z.string(),
      contributors: z.number(),
    }),
    files: z.array(z.object({
      path: z.string(),
      size: z.number(),
      language: z.string(),
      lastModified: z.string(),
      complexity: z.number(),
    })),
    statistics: z.object({
      totalFiles: z.number(),
      totalLines: z.number(),
      languages: z.record(z.number()),
      recentActivity: z.array(z.object({
        date: z.string(),
        commits: z.number(),
        contributors: z.number(),
      })),
    }),
    analysis: z.object({
      overallHealth: z.number(),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const { repositoryUrl, branch = 'main', filePattern } = context;
      
      // Simulate repository analysis
      const repository = await analyzeRepository(repositoryUrl, branch);
      const files = await analyzeRepositoryFiles(repositoryUrl, filePattern);
      const statistics = await calculateRepositoryStatistics(files);
      const analysis = await performRepositoryAnalysis(files, statistics);
      
      return {
        repository,
        files,
        statistics,
        analysis,
      };
    } catch (error: any) {
      return {
        repository: {
          name: 'Unknown',
          url: context.repositoryUrl,
          branch: context.branch || 'main',
          lastCommit: 'Unknown',
          contributors: 0,
        },
        files: [],
        statistics: {
          totalFiles: 0,
          totalLines: 0,
          languages: {},
          recentActivity: [],
        },
        analysis: {
          overallHealth: 0,
          issues: [`Repository analysis failed: ${error.message}`],
          recommendations: ['Fix repository connection and try again'],
        },
      };
    }
  },
});

// Repository analysis functions
async function analyzeRepository(url: string, branch: string): Promise<{
  name: string;
  url: string;
  branch: string;
  lastCommit: string;
  contributors: number;
}> {
  // Simulate repository metadata extraction
  const repoName = extractRepositoryName(url);
  
  return {
    name: repoName,
    url,
    branch,
    lastCommit: new Date().toISOString(),
    contributors: Math.floor(Math.random() * 20) + 1,
  };
}

async function analyzeRepositoryFiles(url: string, filePattern?: string): Promise<Array<{
  path: string;
  size: number;
  language: string;
  lastModified: string;
  complexity: number;
}>> {
  // Simulate file analysis
  const mockFiles = [
    { path: 'src/index.js', size: 1024, language: 'javascript', complexity: 3 },
    { path: 'src/components/Button.tsx', size: 2048, language: 'typescript', complexity: 5 },
    { path: 'src/utils/helpers.js', size: 512, language: 'javascript', complexity: 2 },
    { path: 'package.json', size: 256, language: 'json', complexity: 1 },
    { path: 'README.md', size: 1024, language: 'markdown', complexity: 1 },
    { path: 'src/api/routes.js', size: 1536, language: 'javascript', complexity: 4 },
    { path: 'src/styles/main.css', size: 768, language: 'css', complexity: 2 },
    { path: 'tests/unit.test.js', size: 896, language: 'javascript', complexity: 3 },
  ];
  
  // Filter by file pattern if provided
  if (filePattern) {
    const pattern = filePattern.replace('*', '.*');
    const regex = new RegExp(pattern);
    return mockFiles.filter(file => regex.test(file.path));
  }
  
  return mockFiles;
}

async function calculateRepositoryStatistics(files: Array<{
  path: string;
  size: number;
  language: string;
  lastModified: string;
  complexity: number;
}>): Promise<{
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  recentActivity: Array<{
    date: string;
    commits: number;
    contributors: number;
  }>;
}> {
  const totalFiles = files.length;
  const totalLines = files.reduce((sum, file) => sum + Math.floor(file.size / 50), 0);
  
  // Count languages
  const languages: Record<string, number> = {};
  files.forEach(file => {
    languages[file.language] = (languages[file.language] || 0) + 1;
  });
  
  // Generate recent activity (last 7 days)
  const recentActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    recentActivity.push({
      date: date.toISOString().split('T')[0],
      commits: Math.floor(Math.random() * 10),
      contributors: Math.floor(Math.random() * 5) + 1,
    });
  }
  
  return {
    totalFiles,
    totalLines,
    languages,
    recentActivity,
  };
}

async function performRepositoryAnalysis(files: any[], statistics: any): Promise<{
  overallHealth: number;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze repository health
  let healthScore = 100;
  
  // Check for test files
  const testFiles = files.filter(file => 
    file.path.includes('test') || file.path.includes('spec') || file.path.includes('__tests__')
  );
  
  if (testFiles.length === 0) {
    issues.push('No test files found');
    recommendations.push('Add unit tests for better code coverage');
    healthScore -= 20;
  }
  
  // Check for documentation
  const docFiles = files.filter(file => 
    file.path.includes('README') || file.path.includes('docs') || file.path.includes('DOCS')
  );
  
  if (docFiles.length === 0) {
    issues.push('No documentation found');
    recommendations.push('Add README.md and documentation');
    healthScore -= 15;
  }
  
  // Check for configuration files
  const configFiles = files.filter(file => 
    file.path.includes('package.json') || file.path.includes('tsconfig.json') || 
    file.path.includes('.eslintrc') || file.path.includes('.gitignore')
  );
  
  if (configFiles.length < 2) {
    issues.push('Missing configuration files');
    recommendations.push('Add proper configuration files (package.json, tsconfig.json, etc.)');
    healthScore -= 10;
  }
  
  // Check for large files
  const largeFiles = files.filter(file => file.size > 10000);
  if (largeFiles.length > 0) {
    issues.push(`${largeFiles.length} large files found (>10KB)`);
    recommendations.push('Consider breaking down large files');
    healthScore -= 5;
  }
  
  // Check for high complexity files
  const complexFiles = files.filter(file => file.complexity > 8);
  if (complexFiles.length > 0) {
    issues.push(`${complexFiles.length} high complexity files found`);
    recommendations.push('Refactor complex files for better maintainability');
    healthScore -= 10;
  }
  
  // Check for recent activity
  const totalCommits = statistics.recentActivity.reduce((sum: number, day: any) => sum + day.commits, 0);
  if (totalCommits < 5) {
    issues.push('Low recent activity');
    recommendations.push('Increase development activity and regular commits');
    healthScore -= 5;
  }
  
  // Language diversity
  const languageCount = Object.keys(statistics.languages).length;
  if (languageCount > 5) {
    issues.push('Too many programming languages in one repository');
    recommendations.push('Consider standardizing on fewer languages');
    healthScore -= 5;
  }
  
  // Add positive recommendations
  if (healthScore > 80) {
    recommendations.push('Repository is in good health!');
  }
  
  recommendations.push('Set up CI/CD pipeline for automated testing');
  recommendations.push('Implement code review process');
  recommendations.push('Add security scanning to the pipeline');
  
  return {
    overallHealth: Math.max(0, healthScore),
    issues,
    recommendations,
  };
}

function extractRepositoryName(url: string): string {
  // Extract repository name from URL
  const match = url.match(/\/([^\/]+)\.git$|\/([^\/]+)$/);
  if (match) {
    return match[1] || match[2];
  }
  return 'Unknown Repository';
}

// Additional tool for file analysis
export const analyzeFileTool = createTool({
  id: 'analyze_file',
  description: 'Analyzes a specific file from the repository for code quality and issues.',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file in the repository'),
    content: z.string().describe('File content to analyze'),
    language: z.string().describe('Programming language of the file'),
  }),
  outputSchema: z.object({
    file: z.object({
      path: z.string(),
      language: z.string(),
      size: z.number(),
      lines: z.number(),
    }),
    analysis: z.object({
      qualityScore: z.number(),
      complexity: z.number(),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const { filePath, content, language } = context;
      
      const lines = content.split('\n');
      const size = content.length;
      
      // Simple analysis
      const qualityScore = calculateFileQualityScore(content, language);
      const complexity = calculateFileComplexity(content);
      const issues = detectFileIssues(content, language);
      const suggestions = generateFileSuggestions(issues, language);
      
      return {
        file: {
          path: filePath,
          language,
          size,
          lines: lines.length,
        },
        analysis: {
          qualityScore,
          complexity,
          issues,
          suggestions,
        },
      };
    } catch (error: any) {
      return {
        file: {
          path: context.filePath,
          language: context.language,
          size: 0,
          lines: 0,
        },
        analysis: {
          qualityScore: 0,
          complexity: 0,
          issues: [`File analysis failed: ${error.message}`],
          suggestions: ['Fix file analysis errors'],
        },
      };
    }
  },
});

function calculateFileQualityScore(content: string, language: string): number {
  let score = 100;
  
  // Check for comments
  const commentLines = (content.match(/\/\/|\/\*|\*\/|\#/g) || []).length;
  const totalLines = content.split('\n').length;
  const commentRatio = commentLines / totalLines;
  
  if (commentRatio < 0.1) score -= 20;
  else if (commentRatio > 0.3) score += 10;
  
  // Check for long lines
  const longLines = content.split('\n').filter(line => line.length > 120).length;
  if (longLines > 0) score -= longLines * 2;
  
  // Check for TODO/FIXME
  const todos = (content.match(/TODO|FIXME/g) || []).length;
  if (todos > 0) score -= todos * 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateFileComplexity(content: string): number {
  const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||'];
  let complexity = 1;
  
  complexityKeywords.forEach(keyword => {
    const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
    if (matches) complexity += matches.length;
  });
  
  return complexity;
}

function detectFileIssues(content: string, language: string): string[] {
  const issues: string[] = [];
  
  if (content.includes('console.log') && !content.includes('//')) {
    issues.push('Console.log statements found');
  }
  
  if (content.includes('var ') && language === 'javascript') {
    issues.push('Use of var keyword');
  }
  
  if (content.includes('==') && !content.includes('===')) {
    issues.push('Use of == instead of ===');
  }
  
  if (content.length > 10000) {
    issues.push('File is very large (>10KB)');
  }
  
  return issues;
}

function generateFileSuggestions(issues: string[], language: string): string[] {
  const suggestions: string[] = [];
  
  if (issues.includes('Console.log statements found')) {
    suggestions.push('Remove or replace console.log with proper logging');
  }
  
  if (issues.includes('Use of var keyword')) {
    suggestions.push('Use let or const instead of var');
  }
  
  if (issues.includes('Use of == instead of ===')) {
    suggestions.push('Use strict equality (===)');
  }
  
  if (issues.includes('File is very large (>10KB)')) {
    suggestions.push('Consider breaking down into smaller files');
  }
  
  if (language === 'typescript') {
    suggestions.push('Add proper TypeScript types');
  }
  
  suggestions.push('Add unit tests for this file');
  suggestions.push('Add JSDoc comments for functions');
  
  return suggestions;
}
