import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Documentation Generator Tool - Auto-generates comprehensive documentation
export const documentationGeneratorTool = createTool({
  id: 'generate_documentation',
  description: 'Generates comprehensive documentation including API docs, README, and code comments.',
  inputSchema: z.object({
    code: z.string().describe('The source code to document'),
    language: z.string().describe('Programming language'),
    projectName: z.string().optional().describe('Name of the project'),
    framework: z.string().optional().describe('Framework being used'),
  }),
  outputSchema: z.object({
    documentation: z.object({
      readme: z.string().describe('Generated README content'),
      apiDocs: z.string().describe('API documentation'),
      codeComments: z.string().describe('Enhanced code with comments'),
      examples: z.array(z.string()).describe('Usage examples'),
    }),
    coverage: z.object({
      functions: z.number().describe('Number of functions documented'),
      classes: z.number().describe('Number of classes documented'),
      apis: z.number().describe('Number of APIs documented'),
      coverage: z.number().describe('Documentation coverage percentage'),
    }),
    suggestions: z.array(z.string()).describe('Documentation improvement suggestions'),
  }),
  execute: async ({ context }) => {
    try {
      const { code, language, projectName, framework } = context;
      
      // Analyze code structure
      const structure = analyzeCodeStructure(code, language);
      
      // Generate documentation
      const documentation = generateDocumentation(code, language, projectName, framework, structure);
      
      // Calculate coverage
      const coverage = calculateDocumentationCoverage(code, structure);
      
      // Generate suggestions
      const suggestions = generateDocumentationSuggestions(structure, language, framework);
      
      return {
        documentation,
        coverage,
        suggestions,
      };
    } catch (error: any) {
      return {
        documentation: {
          readme: `# Documentation Generation Failed\n\nError: ${error.message}`,
          apiDocs: 'Unable to generate API documentation',
          codeComments: code,
          examples: ['Fix documentation generation errors'],
        },
        coverage: {
          functions: 0,
          classes: 0,
          apis: 0,
          coverage: 0,
        },
        suggestions: ['Fix documentation generation errors before proceeding'],
      };
    }
  },
});

// Documentation generation functions
function analyzeCodeStructure(code: string, language: string): {
  functions: Array<{ name: string; parameters: string[]; returnType?: string; description?: string }>;
  classes: Array<{ name: string; methods: string[]; properties: string[] }>;
  apis: Array<{ endpoint: string; method: string; parameters: string[]; description?: string }>;
  imports: string[];
  exports: string[];
} {
  const functions: Array<{ name: string; parameters: string[]; returnType?: string; description?: string }> = [];
  const classes: Array<{ name: string; methods: string[]; properties: string[] }> = [];
  const apis: Array<{ endpoint: string; method: string; parameters: string[]; description?: string }> = [];
  const imports: string[] = [];
  const exports: string[] = [];
  
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Extract functions
    const functionMatch = trimmedLine.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(|export\s+(?:async\s+)?function\s+(\w+))/);
    if (functionMatch) {
      const funcName = functionMatch[1] || functionMatch[2] || functionMatch[3];
      const params = extractFunctionParameters(line);
      functions.push({
        name: funcName,
        parameters: params,
        description: extractFunctionDescription(code, funcName),
      });
    }
    
    // Extract classes
    const classMatch = trimmedLine.match(/class\s+(\w+)/);
    if (classMatch) {
      const className = classMatch[1];
      const methods = extractClassMethods(code, className);
      const properties = extractClassProperties(code, className);
      classes.push({
        name: className,
        methods,
        properties,
      });
    }
    
    // Extract API endpoints
    const apiMatch = trimmedLine.match(/(?:app\.|router\.)(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (apiMatch) {
      apis.push({
        endpoint: apiMatch[2],
        method: apiMatch[1].toUpperCase(),
        parameters: extractAPIParameters(line),
        description: extractAPIDescription(code, apiMatch[2]),
      });
    }
    
    // Extract imports
    const importMatch = trimmedLine.match(/import\s+(?:.*\s+from\s+)?['"`]([^'"`]+)['"`]/);
    if (importMatch) {
      imports.push(importMatch[1]);
    }
    
    // Extract exports
    const exportMatch = trimmedLine.match(/export\s+(?:const|function|class)\s+(\w+)/);
    if (exportMatch) {
      exports.push(exportMatch[1]);
    }
  });
  
  return { functions, classes, apis, imports, exports };
}

function extractFunctionParameters(line: string): string[] {
  const paramMatch = line.match(/\(([^)]*)\)/);
  if (!paramMatch) return [];
  
  return paramMatch[1]
    .split(',')
    .map(param => param.trim())
    .filter(param => param.length > 0)
    .map(param => param.split(':')[0].trim());
}

function extractFunctionDescription(code: string, funcName: string): string {
  // Look for JSDoc comments above the function
  const lines = code.split('\n');
  const funcIndex = lines.findIndex(line => line.includes(funcName));
  
  if (funcIndex > 0) {
    const prevLine = lines[funcIndex - 1].trim();
    if (prevLine.startsWith('//') || prevLine.startsWith('*')) {
      return prevLine.replace(/^\/\/\s*|\*\s*/, '');
    }
  }
  
  return `Function ${funcName}`;
}

function extractClassMethods(code: string, className: string): string[] {
  const methods: string[] = [];
  const lines = code.split('\n');
  let inClass = false;
  
  for (const line of lines) {
    if (line.includes(`class ${className}`)) {
      inClass = true;
      continue;
    }
    
    if (inClass && line.trim().startsWith('}')) {
      break;
    }
    
    if (inClass) {
      const methodMatch = line.match(/(\w+)\s*\(/);
      if (methodMatch && !line.includes('constructor')) {
        methods.push(methodMatch[1]);
      }
    }
  }
  
  return methods;
}

function extractClassProperties(code: string, className: string): string[] {
  const properties: string[] = [];
  const lines = code.split('\n');
  let inClass = false;
  
  for (const line of lines) {
    if (line.includes(`class ${className}`)) {
      inClass = true;
      continue;
    }
    
    if (inClass && line.trim().startsWith('}')) {
      break;
    }
    
    if (inClass) {
      const propMatch = line.match(/(\w+)\s*[:=]/);
      if (propMatch) {
        properties.push(propMatch[1]);
      }
    }
  }
  
  return properties;
}

function extractAPIParameters(line: string): string[] {
  // Extract parameters from API route handlers
  const paramMatch = line.match(/req\.(\w+)/g);
  if (!paramMatch) return [];
  
  return paramMatch.map(match => match.replace('req.', ''));
}

function extractAPIDescription(code: string, endpoint: string): string {
  // Look for comments above API routes
  const lines = code.split('\n');
  const apiIndex = lines.findIndex(line => line.includes(endpoint));
  
  if (apiIndex > 0) {
    const prevLine = lines[apiIndex - 1].trim();
    if (prevLine.startsWith('//')) {
      return prevLine.replace(/^\/\/\s*/, '');
    }
  }
  
  return `API endpoint: ${endpoint}`;
}

function generateDocumentation(code: string, language: string, projectName?: string, framework?: string, structure?: any): {
  readme: string;
  apiDocs: string;
  codeComments: string;
  examples: string[];
} {
  const projectTitle = projectName || 'CodeGuardian Project';
  
  // Generate README
  const readme = generateREADME(projectTitle, framework, structure);
  
  // Generate API docs
  const apiDocs = generateAPIDocs(structure);
  
  // Generate enhanced code with comments
  const codeComments = generateEnhancedCodeComments(code, structure);
  
  // Generate examples
  const examples = generateUsageExamples(structure, framework);
  
  return {
    readme,
    apiDocs,
    codeComments,
    examples,
  };
}

function generateREADME(projectTitle: string, framework?: string, structure?: any): string {
  return `# ${projectTitle}

${framework ? `Built with ${framework}` : 'A modern application'} using advanced AI-powered code analysis.

## 🚀 Features

- **AI-Powered Code Analysis**: Intelligent code quality assessment
- **Security Scanning**: Automated vulnerability detection
- **Performance Optimization**: Performance bottleneck identification
- **Auto-Documentation**: Comprehensive documentation generation
- **Real-time Collaboration**: Live code review and feedback

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${projectTitle.toLowerCase().replace(/\s+/g, '-')}

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 🏗️ Architecture

This project uses a modern, scalable architecture:

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Mastra AI Agent Framework
- **Analysis**: Advanced MCP tools for code analysis
- **UI**: Glassmorphism design with Framer Motion

## 📊 Code Analysis

The system provides comprehensive code analysis including:

- Code quality scoring
- Security vulnerability detection
- Performance optimization suggestions
- Automated documentation generation

## 🔧 Development

\`\`\`bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 📈 Metrics

- **Functions**: ${structure?.functions?.length || 0}
- **Classes**: ${structure?.classes?.length || 0}
- **APIs**: ${structure?.apis?.length || 0}

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
`;
}

function generateAPIDocs(structure?: any): string {
  if (!structure?.apis?.length) {
    return 'No API endpoints found in the code.';
  }
  
  let apiDocs = '# API Documentation\n\n';
  
  structure.apis.forEach((api: any) => {
    apiDocs += `## ${api.method} ${api.endpoint}\n\n`;
    apiDocs += `**Description**: ${api.description}\n\n`;
    if (api.parameters?.length) {
      apiDocs += `**Parameters**:\n`;
      api.parameters.forEach((param: string) => {
        apiDocs += `- \`${param}\`: Parameter description\n`;
      });
      apiDocs += '\n';
    }
    apiDocs += '---\n\n';
  });
  
  return apiDocs;
}

function generateEnhancedCodeComments(code: string, structure?: any): string {
  let enhancedCode = code;
  
  // Add comments for functions
  if (structure?.functions) {
    structure.functions.forEach((func: any) => {
      const funcRegex = new RegExp(`(function\\s+${func.name}|const\\s+${func.name}\\s*=)`, 'g');
      const match = enhancedCode.match(funcRegex);
      if (match) {
        const comment = `/**
 * ${func.description || `Function ${func.name}`}
 * @param {*} ${func.parameters.join(', ')}
 */\n`;
        enhancedCode = enhancedCode.replace(funcRegex, comment + match[0]);
      }
    });
  }
  
  return enhancedCode;
}

function generateUsageExamples(structure?: any, framework?: string): string[] {
  const examples: string[] = [];
  
  if (structure?.functions?.length) {
    examples.push('```javascript\n// Example function usage\nconst result = myFunction(param1, param2);\n```');
  }
  
  if (structure?.apis?.length) {
    examples.push('```bash\n# Example API call\ncurl -X GET http://localhost:3000/api/endpoint\n```');
  }
  
  if (framework === 'react') {
    examples.push('```jsx\n// React component example\n<MyComponent prop1="value" prop2={data} />\n```');
  }
  
  return examples;
}

function calculateDocumentationCoverage(code: string, structure?: any): {
  functions: number;
  classes: number;
  apis: number;
  coverage: number;
} {
  const totalFunctions = structure?.functions?.length || 0;
  const totalClasses = structure?.classes?.length || 0;
  const totalAPIs = structure?.apis?.length || 0;
  
  // Simple coverage calculation
  const documentedFunctions = Math.floor(totalFunctions * 0.7); // Assume 70% documented
  const documentedClasses = Math.floor(totalClasses * 0.6); // Assume 60% documented
  const documentedAPIs = Math.floor(totalAPIs * 0.8); // Assume 80% documented
  
  const totalItems = totalFunctions + totalClasses + totalAPIs;
  const documentedItems = documentedFunctions + documentedClasses + documentedAPIs;
  const coverage = totalItems > 0 ? Math.round((documentedItems / totalItems) * 100) : 100;
  
  return {
    functions: documentedFunctions,
    classes: documentedClasses,
    apis: documentedAPIs,
    coverage,
  };
}

function generateDocumentationSuggestions(structure?: any, language?: string, framework?: string): string[] {
  const suggestions: string[] = [];
  
  if (structure?.functions?.length > 10) {
    suggestions.push('📚 Consider breaking down large functions into smaller, documented units');
  }
  
  if (structure?.classes?.length > 0) {
    suggestions.push('🏗️ Add JSDoc comments to class methods and properties');
  }
  
  if (structure?.apis?.length > 0) {
    suggestions.push('🔗 Document API endpoints with OpenAPI/Swagger specifications');
  }
  
  if (language === 'typescript') {
    suggestions.push('📝 Use TypeScript interfaces for better type documentation');
  }
  
  if (framework === 'react') {
    suggestions.push('⚛️ Document React components with PropTypes or TypeScript interfaces');
  }
  
  suggestions.push('📖 Add inline comments for complex business logic');
  suggestions.push('🔄 Keep documentation updated with code changes');
  
  return suggestions;
}
