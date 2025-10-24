import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Performance Optimizer Tool - Analyzes and suggests performance improvements
export const performanceOptimizerTool = createTool({
  id: 'optimize_performance',
  description: 'Analyzes code for performance bottlenecks and suggests optimizations.',
  inputSchema: z.object({
    code: z.string().describe('The source code to analyze for performance'),
    language: z.string().describe('Programming language'),
    framework: z.string().optional().describe('Framework being used'),
  }),
  outputSchema: z.object({
    performanceScore: z.number().min(0).max(100).describe('Overall performance score'),
    bottlenecks: z.array(z.object({
      type: z.enum(['cpu', 'memory', 'network', 'database', 'rendering']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      line: z.number().optional(),
      impact: z.string(),
      solution: z.string(),
      metrics: z.object({
        estimatedImprovement: z.string(),
        complexity: z.enum(['low', 'medium', 'high']),
      }),
    })),
    recommendations: z.array(z.string()).describe ('Performance optimization recommendations'),
    metrics: z.object({
      estimatedLoadTime: z.string(),
      memoryUsage: z.string(),
      cpuIntensity: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const { code, language, framework } = context;
      
      // Analyze performance bottlenecks
      const bottlenecks = analyzePerformanceBottlenecks(code, language, framework);
      
      // Calculate performance score
      const performanceScore = calculatePerformanceScore(bottlenecks);
      
      // Generate recommendations
      const recommendations = generatePerformanceRecommendations(bottlenecks, language, framework);
      
      // Calculate metrics
      const metrics = calculatePerformanceMetrics(code, bottlenecks);
      
      return {
        performanceScore,
        bottlenecks,
        recommendations,
        metrics,
      };
    } catch (error: any) {
      return {
        performanceScore: 0,
        bottlenecks: [{
          type: 'cpu',
          severity: 'critical',
          description: `Performance analysis failed: ${error.message}`,
          impact: 'Unable to assess performance',
          solution: 'Fix analysis errors and re-run',
          metrics: { estimatedImprovement: 'Unknown', complexity: 'high' },
        }],
        recommendations: ['Fix performance analysis errors before proceeding'],
        metrics: {
          estimatedLoadTime: 'Unknown',
          memoryUsage: 'Unknown',
          cpuIntensity: 'Unknown',
        },
      };
    }
  },
});

// Performance analysis functions
function analyzePerformanceBottlenecks(code: string, language: string, framework?: string): Array<{
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
}> {
  const bottlenecks: Array<{
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
  }> = [];
  
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const lowerLine = line.toLowerCase();
    
    // Nested loops
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
    
    // Inefficient array operations
    if (lowerLine.includes('.filter') && lowerLine.includes('.map') && lowerLine.includes('.reduce')) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'medium',
        description: 'Multiple array iterations in sequence',
        line: lineNumber,
        impact: 'Multiple passes over data, increased CPU usage',
        solution: 'Combine operations into single reduce() or use for...of loop',
        metrics: { estimatedImprovement: '20-40%', complexity: 'low' },
      });
    }
    
    // Memory leaks
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
    
    // Large object creation
    if (lowerLine.includes('new Array(') && lowerLine.includes('1000')) {
      bottlenecks.push({
        type: 'memory',
        severity: 'medium',
        description: 'Large array allocation',
        line: lineNumber,
        impact: 'High memory usage, potential garbage collection pressure',
        solution: 'Use streaming, pagination, or lazy loading for large datasets',
        metrics: { estimatedImprovement: '30-60%', complexity: 'medium' },
      });
    }
    
    // Synchronous operations
    if (lowerLine.includes('fs.readFileSync') || lowerLine.includes('require(')) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'medium',
        description: 'Synchronous file operations blocking event loop',
        line: lineNumber,
        impact: 'Blocks other operations, poor user experience',
        solution: 'Use async/await with fs.promises or streams',
        metrics: { estimatedImprovement: 'Non-blocking execution', complexity: 'low' },
      });
    }
    
    // Inefficient DOM queries
    if (lowerLine.includes('document.getElementById') && lowerLine.includes('for')) {
      bottlenecks.push({
        type: 'rendering',
        severity: 'medium',
        description: 'Repeated DOM queries in loop',
        line: lineNumber,
        impact: 'Multiple DOM traversals, slow rendering',
        solution: 'Cache DOM elements or use querySelectorAll with single query',
        metrics: { estimatedImprovement: '40-70%', complexity: 'low' },
      });
    }
    
    // Database N+1 queries
    if (lowerLine.includes('await') && lowerLine.includes('for') && lowerLine.includes('find')) {
      bottlenecks.push({
        type: 'database',
        severity: 'high',
        description: 'Potential N+1 query problem',
        line: lineNumber,
        impact: 'Multiple database calls, poor performance',
        solution: 'Use eager loading, joins, or batch operations',
        metrics: { estimatedImprovement: '80-95%', complexity: 'high' },
      });
    }
    
    // Unoptimized images
    if (lowerLine.includes('img') && !lowerLine.includes('loading="lazy"')) {
      bottlenecks.push({
        type: 'network',
        severity: 'low',
        description: 'Images without lazy loading',
        line: lineNumber,
        impact: 'Unnecessary network requests, slow initial load',
        solution: 'Add loading="lazy" and optimize image formats (WebP, AVIF)',
        metrics: { estimatedImprovement: '20-50%', complexity: 'low' },
      });
    }
    
    // Missing caching
    if (lowerLine.includes('fetch') && !lowerLine.includes('cache')) {
      bottlenecks.push({
        type: 'network',
        severity: 'medium',
        description: 'API calls without caching',
        line: lineNumber,
        impact: 'Repeated network requests, increased latency',
        solution: 'Implement caching strategy (Redis, memory cache, or HTTP cache)',
        metrics: { estimatedImprovement: '60-90%', complexity: 'medium' },
      });
    }
  });
  
  return bottlenecks;
}

function calculatePerformanceScore(bottlenecks: any[]): number {
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

function generatePerformanceRecommendations(bottlenecks: any[], language: string, framework?: string): string[] {
  const recommendations: string[] = [];
  
  if (bottlenecks.some(b => b.severity === 'critical')) {
    recommendations.push('🚨 Address critical performance bottlenecks immediately');
  }
  
  if (bottlenecks.some(b => b.type === 'cpu')) {
    recommendations.push('⚡ Optimize algorithms and reduce time complexity');
    recommendations.push('🔄 Use Web Workers for CPU-intensive tasks');
  }
  
  if (bottlenecks.some(b => b.type === 'memory')) {
    recommendations.push('🧠 Implement proper memory management and cleanup');
    recommendations.push('📊 Use memory profiling tools to identify leaks');
  }
  
  if (bottlenecks.some(b => b.type === 'database')) {
    recommendations.push('🗄️ Optimize database queries and add proper indexing');
    recommendations.push('📈 Use database query profiling and monitoring');
  }                                                 
  
  if (bottlenecks.some(b => b.type === 'network')) {
    recommendations.push('🌐 Implement caching and CDN strategies');
    recommendations.push('📦 Use code splitting and lazy loading');
  }
  
  if (framework === 'react') {
    recommendations.push('⚛️ Use React.memo, useMemo, and useCallback for optimization');
    recommendations.push('🔧 Implement virtual scrolling for large lists');
  }
  
  if (framework === 'vue') {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            recommendations.push('💚 Use Vue built-in performance optimizations');
    recommendations.push('🔄 Implement proper key attributes for lists');
  }
  
  if (language === 'javascript' || language === 'typescript') {
    recommendations.push('📊 Use performance monitoring tools (Lighthouse, Web Vitals)');
    recommendations.push('🔍 Implement bundle analysis and tree shaking');
  }
  
  recommendations.push('📈 Set up performance budgets and monitoring');
  recommendations.push('🔄 Regular performance audits and optimization');
  
  return recommendations;
}

function calculatePerformanceMetrics(code: string, bottlenecks: any[]): {
  estimatedLoadTime: string;
  memoryUsage: string;
  cpuIntensity: string;
} {
  const lines = code.split('\n').length;
  const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
  
  // Estimate based on code complexity and bottlenecks
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
  } else if (bottlenecks.some(b => b.severity === 'medium')) {
    loadTime = 'Moderate';
    memoryUsage = 'Medium';
    cpuIntensity = 'Medium';
  }
  
  // Adjust based on code size
  if (lines > 1000) {
    if (loadTime === 'Fast') loadTime = 'Moderate';
    if (memoryUsage === 'Low') memoryUsage = 'Medium';
  }
  
  return {
    estimatedLoadTime: loadTime,
    memoryUsage,
    cpuIntensity,
  };
}
