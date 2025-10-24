import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Security Scanner Tool - Detects vulnerabilities and security issues
export const securityScannerTool = createTool({
  id: 'scan_security',
  description: 'Scans code for security vulnerabilities, OWASP compliance, and security best practices.',
  inputSchema: z.object({
    code: z.string().describe('The source code to scan for security issues'),
    language: z.string().describe('Programming language'),
    framework: z.string().optional().describe('Framework being used (react, express, etc.)'),
  }),
  outputSchema: z.object({
    securityScore: z.number().min(0).max(100).describe('Overall security score'),
    vulnerabilities: z.array(z.object({
      id: z.string(),
      title: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      line: z.number().optional(),
      cwe: z.string().optional().describe('CWE identifier'),
      owasp: z.string().optional().describe('OWASP category'),
      fix: z.string().describe('How to fix the vulnerability'),
      impact: z.string().describe('Potential impact'),
    })),
    recommendations: z.array(z.string()).describe('Security recommendations'),
    compliance: z.object({
      owasp: z.object({
        score: z.number(),
        issues: z.array(z.string()),
      }),
      cwe: z.object({
        score: z.number(),
        issues: z.array(z.string()),
      }),
    }),
  }),
  execute: async ({ context }) => {
    try {
      const { code, language, framework } = context;
      
      // Scan for common security vulnerabilities
      const vulnerabilities = scanForVulnerabilities(code, language, framework);
      
      // Calculate security score
      const securityScore = calculateSecurityScore(vulnerabilities);
      
      // Generate recommendations
      const recommendations = generateSecurityRecommendations(vulnerabilities, language, framework);
      
      // Check compliance
      const compliance = checkCompliance(vulnerabilities);
      
      return {
        securityScore,
        vulnerabilities,
        recommendations,
        compliance,
      };
    } catch (error: any) {
      return {
        securityScore: 0,
        vulnerabilities: [{
          id: 'SCAN_ERROR',
          title: 'Security scan failed',
          severity: 'critical',
          description: `Security scan encountered an error: ${error.message}`,
          fix: 'Fix the analysis error and re-run the scan',
          impact: 'Unable to assess security posture',
        }],
        recommendations: ['Fix security scan errors before proceeding'],
        compliance: {
          owasp: { score: 0, issues: ['Scan failed'] },
          cwe: { score: 0, issues: ['Scan failed'] },
        },
      };
    }
  },
});

// Vulnerability scanning functions
function scanForVulnerabilities(code: string, language: string, framework?: string): Array<{
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line?: number;
  cwe?: string;
  owasp?: string;
  fix: string;
  impact: string;
}> {
  const vulnerabilities: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    line?: number;
    cwe?: string;
    owasp?: string;
    fix: string;
    impact: string;
  }> = [];
  
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const lowerLine = line.toLowerCase();
    
    // SQL Injection
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
    
    // XSS vulnerabilities
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
    
    // Hardcoded secrets
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
    
    // Insecure random number generation
    if (lowerLine.includes('math.random') && language === 'javascript') {
      vulnerabilities.push({
        id: 'WEAK_RANDOM',
        title: 'Weak Random Number Generation',
        severity: 'medium',
        description: 'Math.random() is not cryptographically secure',
        line: lineNumber,
        cwe: 'CWE-330',
        owasp: 'A02:2021 – Cryptographic Failures',
        fix: 'Use crypto.getRandomValues() for cryptographic purposes',
        impact: 'Predictable values, weak security',
      });
    }
    
    // Missing HTTPS
    if (lowerLine.includes('http://') && !lowerLine.includes('localhost')) {
      vulnerabilities.push({
        id: 'INSECURE_PROTOCOL',
        title: 'Insecure HTTP Protocol',
        severity: 'medium',
        description: 'HTTP traffic is not encrypted',
        line: lineNumber,
        cwe: 'CWE-319',
        owasp: 'A02:2021 – Cryptographic Failures',
        fix: 'Use HTTPS for all communications',
        impact: 'Data interception, man-in-the-middle attacks',
      });
    }
    
    // Missing input validation
    if (lowerLine.includes('req.') && !lowerLine.includes('validate') && !lowerLine.includes('sanitize')) {
      vulnerabilities.push({
        id: 'INPUT_VALIDATION',
        title: 'Missing Input Validation',
        severity: 'medium',
        description: 'User input not validated or sanitized',
        line: lineNumber,
        cwe: 'CWE-20',
        owasp: 'A03:2021 – Injection',
        fix: 'Implement proper input validation and sanitization',
        impact: 'Injection attacks, data corruption',
      });
    }
    
    // Weak authentication
    if (lowerLine.includes('auth') && lowerLine.includes('==') && !lowerLine.includes('bcrypt')) {
      vulnerabilities.push({
        id: 'WEAK_AUTH',
        title: 'Weak Authentication',
        severity: 'high',
        description: 'Simple string comparison for authentication',
        line: lineNumber,
        cwe: 'CWE-287',
        owasp: 'A07:2021 – Identification and Authentication Failures',
        fix: 'Use secure password hashing (bcrypt, scrypt)',
        impact: 'Account takeover, unauthorized access',
      });
    }
  });
  
  return vulnerabilities;
}

function calculateSecurityScore(vulnerabilities: any[]): number {
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

function generateSecurityRecommendations(vulnerabilities: any[], language: string, framework?: string): string[] {
  const recommendations: string[] = [];
  
  if (vulnerabilities.some(v => v.severity === 'critical')) {
    recommendations.push('🚨 Address critical security vulnerabilities immediately');
  }
  
  if (vulnerabilities.some(v => v.id === 'HARDCODED_SECRET')) {
    recommendations.push('🔐 Implement proper secret management (AWS Secrets Manager, Azure Key Vault)');
  }
  
  if (vulnerabilities.some(v => v.id === 'SQL_INJECTION')) {
    recommendations.push('🛡️ Use parameterized queries and input validation');
  }
  
  if (vulnerabilities.some(v => v.id === 'XSS')) {
    recommendations.push('🔒 Implement Content Security Policy (CSP) and input sanitization');
  }
  
  if (framework === 'express' || framework === 'node') {
    recommendations.push('🔧 Use helmet.js for security headers');
    recommendations.push('📊 Implement rate limiting and request validation');
  }
  
  if (language === 'javascript' || language === 'typescript') {
    recommendations.push('🔍 Use ESLint security plugin for automated security checks');
    recommendations.push('📝 Implement proper error handling to avoid information disclosure');
  }
  
  recommendations.push('🔄 Regular security audits and dependency updates');
  recommendations.push('📚 Follow OWASP Top 10 guidelines');
  
  return recommendations;
}

function checkCompliance(vulnerabilities: any[]): {
  owasp: { score: number; issues: string[] };
  cwe: { score: number; issues: string[] };
} {
  const owaspIssues = vulnerabilities
    .filter(v => v.owasp)
    .map(v => `${v.owasp}: ${v.title}`);
    
  const cweIssues = vulnerabilities
    .filter(v => v.cwe)
    .map(v => `${v.cwe}: ${v.title}`);
  
  const owaspScore = Math.max(0, 100 - (owaspIssues.length * 10));
  const cweScore = Math.max(0, 100 - (cweIssues.length * 8));
  
  return {
    owasp: { score: owaspScore, issues: owaspIssues },
    cwe: { score: cweScore, issues: cweIssues },
  };
}
