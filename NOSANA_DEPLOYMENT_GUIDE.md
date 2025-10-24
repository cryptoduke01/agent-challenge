# 🚀 Sentra - Nosana Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **1. Code Cleanup**
- [x] Remove unused agents from `src/mastra/index.ts`
- [x] Ensure only Sentra agent is active
- [x] Clean up any development code
- [x] Verify all features work correctly

### ✅ **2. Environment Variables**
Create `.env.production` with:
```bash
# Nosana LLM Endpoint (for production)
OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api
MODEL_NAME_AT_ENDPOINT=qwen3:8b

# Production URLs
NEXT_PUBLIC_MASTRA_URL=http://localhost:4111
NEXT_PUBLIC_APP_URL=https://sentra-ai.vercel.app
```

### ✅ **3. Docker Configuration**
The provided `Dockerfile` is already optimized for Nosana deployment:
- Multi-stage build for efficiency
- Includes both Mastra agent and Next.js frontend
- Optimized for production

## 🐳 **Step 1: Build Docker Image**

### **1.1 Build the Container**
```bash
# Build your Docker image (replace 'yourusername' with your Docker Hub username)
docker build -t yourusername/sentra-ai:latest .

# Example:
docker build -t dukesol/sentra-ai:latest .
```

### **1.2 Test Locally**
```bash
# Test the container locally first
docker run -p 3000:3000 yourusername/sentra-ai:latest

# Open http://localhost:3000 to verify everything works
```

### **1.3 Push to Docker Hub**
```bash
# Login to Docker Hub
docker login

# Push your image
docker push yourusername/sentra-ai:latest
```

## 🌐 **Step 2: Deploy to Nosana**

### **Option A: Using Nosana Dashboard (Recommended)**

1. **Open Nosana Dashboard**
   - Go to [Nosana Dashboard](https://dashboard.nosana.io/)
   - Connect your wallet

2. **Create New Job**
   - Click "Create Job" or "Deploy"
   - Select "Custom Job Definition"

3. **Edit Job Definition**
   ```json
   {
     "name": "sentra-ai-agent",
     "description": "Sentra AI Code Analysis Agent",
     "image": "yourusername/sentra-ai:latest",
     "ports": [
       {
         "containerPort": 3000,
         "protocol": "TCP"
       }
     ],
     "resources": {
       "requests": {
         "memory": "2Gi",
         "cpu": "1000m"
       },
       "limits": {
         "memory": "4Gi",
         "cpu": "2000m"
       }
     },
     "env": [
       {
         "name": "OLLAMA_API_URL",
         "value": "https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api"
       },
       {
         "name": "MODEL_NAME_AT_ENDPOINT",
         "value": "qwen3:8b"
       }
     ]
   }
   ```

4. **Deploy**
   - Select GPU: `nvidia-3090` or similar
   - Set timeout: `30 minutes`
   - Click "Deploy"

### **Option B: Using Nosana CLI**

1. **Install Nosana CLI**
   ```bash
   npm install -g @nosana/cli
   ```

2. **Create Job Definition File**
   Create `nosana-job.json`:
   ```json
   {
     "name": "sentra-ai-agent",
     "description": "Sentra AI Code Analysis Agent",
     "image": "yourusername/sentra-ai:latest",
     "ports": [
       {
         "containerPort": 3000,
         "protocol": "TCP"
       }
     ],
     "resources": {
       "requests": {
         "memory": "2Gi",
         "cpu": "1000m"
       },
       "limits": {
         "memory": "4Gi",
         "cpu": "2000m"
       }
     },
     "env": [
       {
         "name": "OLLAMA_API_URL",
         "value": "https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api"
       },
       {
         "name": "MODEL_NAME_AT_ENDPOINT",
         "value": "qwen3:8b"
       }
     ]
   }
   ```

3. **Deploy with CLI**
   ```bash
   nosana job post --file ./nosana-job.json --market nvidia-3090 --timeout 30
   ```

## 🎥 **Step 3: Create Video Demo**

### **Demo Requirements (1-3 minutes)**
1. **Show Deployed Agent**
   - Open the Nosana deployment URL
   - Demonstrate the live agent running

2. **Key Features Demo**
   - Theme toggle (dark/light mode)
   - Code analysis functionality
   - AI chat interaction
   - File upload and processing

3. **Real-World Use Case**
   - Upload a code file
   - Show analysis results
   - Demonstrate AI recommendations

### **Recording Tips**
- Use screen recording software (OBS, Loom, etc.)
- Show both the interface and the AI responses
- Keep it concise but comprehensive
- Upload to YouTube or Loom

## 📝 **Step 4: Update Documentation**

### **Update README.md**
```markdown
# Sentra - AI Code Analysis Agent

## 🚀 Overview
Sentra is an AI-powered code analysis and security assistant built for the Nosana Builders Challenge. It provides intelligent code review, security scanning, and performance optimization suggestions.

## ✨ Features
- **AI-Powered Code Analysis**: Real-time code review and suggestions
- **Security Scanning**: Vulnerability detection and recommendations
- **Performance Optimization**: Code efficiency improvements
- **Interactive Chat**: Natural language interaction with AI
- **Theme Support**: Dark/Light mode with smooth transitions
- **File Upload**: Support for various programming languages

## 🛠️ Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI Framework**: Mastra with MCP (Model Context Protocol)
- **LLM**: Qwen3:8b via Nosana Network
- **Deployment**: Docker, Nosana Network

## 🚀 Deployment
- **Docker Image**: `yourusername/sentra-ai:latest`
- **Nosana Deployment**: [Deployment URL]
- **Video Demo**: [YouTube/Loom Link]

## 📊 Agent Capabilities
- Code complexity analysis
- Security vulnerability detection
- Performance bottleneck identification
- Documentation generation
- Repository analysis
- Real-time AI chat

## 🎯 Use Cases
- Code review automation
- Security auditing
- Performance optimization
- Learning and education
- Code quality assurance
```

## 📱 **Step 5: Social Media Post**

### **Twitter/X Post Template**
```
🚀 Just deployed Sentra AI on @nosana_ai! 

An intelligent code analysis agent that:
✅ Reviews code in real-time
✅ Detects security vulnerabilities  
✅ Optimizes performance
✅ Supports 10+ programming languages

Built with Mastra framework and deployed on Nosana Network.

#NosanaAgentChallenge #AI #CodeAnalysis #Web3

[Demo Video Link]
[GitHub Repo Link]
```

## 🏆 **Step 6: Final Submission**

### **SuperTeam Submission Requirements**
1. **GitHub Repository**: Link to your forked repo
2. **Docker Image**: Link to Docker Hub
3. **Video Demo**: YouTube/Loom link
4. **Social Media Post**: Twitter/X link
5. **Nosana Deployment**: Screenshot or URL

### **Submission Checklist**
- [ ] All code committed to main branch
- [ ] README.md updated with documentation
- [ ] Docker image pushed to Docker Hub
- [ ] Deployed on Nosana Network
- [ ] Video demo recorded and uploaded
- [ ] Social media post published
- [ ] SuperTeam submission completed

## 🎉 **Success Metrics**

### **Judging Criteria (25% each)**
1. **Innovation**: Original AI agent concept
2. **Technical Implementation**: Code quality, Mastra usage
3. **Nosana Integration**: Successful deployment, performance
4. **Real-World Impact**: Practical use cases, value proposition

### **Expected Results**
- **Performance**: < 3s load time on Nosana
- **Stability**: 99% uptime
- **User Experience**: Smooth interactions
- **AI Quality**: Accurate code analysis

## 🚀 **Ready to Deploy!**

Your Sentra AI agent is now ready for Nosana deployment! Follow the steps above to:

1. ✅ Build and push Docker image
2. ✅ Deploy to Nosana Network
3. ✅ Create video demo
4. ✅ Update documentation
5. ✅ Submit to challenge

**Good luck with the Nosana Builders Challenge!** 🏆
