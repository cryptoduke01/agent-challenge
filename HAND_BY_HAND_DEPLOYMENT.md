# 🚀 Sentra - Hand-by-Hand Deployment Guide

## 📋 **Step 1: Push to GitHub (Forked Repo)**

### **1.1 Check Current Status**
```bash
# Check what files have changed
git status

# See what files are staged
git add .

# Check the changes
git diff --cached
```

### **1.2 Commit All Changes**
```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Complete Sentra AI agent with theme system and deployment ready

- ✅ Implemented light/dark mode toggle with smooth animations
- ✅ Fixed text colors for proper theme switching
- ✅ Cleaned up unused FlowSync files
- ✅ Added Nosana deployment configuration
- ✅ Created comprehensive deployment guides
- ✅ Ready for Nosana Builders Challenge submission"
```

### **1.3 Push to GitHub**
```bash
# Push to your forked repository
git push origin main
```

## 🐳 **Step 2: Build and Push Docker Image**

### **2.1 Set Your Docker Username**
```bash
# Replace 'yourusername' with your actual Docker Hub username
export DOCKER_USERNAME="yourusername"

# Verify it's set
echo $DOCKER_USERNAME
```

### **2.2 Build Docker Image**
```bash
# Build the Docker image
docker build -t $DOCKER_USERNAME/sentra-ai:latest .

# Verify the image was created
docker images | grep sentra-ai
```

### **2.3 Test Locally**
```bash
# Test the container locally
docker run -d -p 3000:3000 --name sentra-test $DOCKER_USERNAME/sentra-ai:latest

# Wait for it to start
sleep 10

# Test if it's working
curl http://localhost:3000

# Stop and remove test container
docker stop sentra-test
docker rm sentra-test
```

### **2.4 Push to Docker Hub**
```bash
# Login to Docker Hub
docker login

# Push the image
docker push $DOCKER_USERNAME/sentra-ai:latest
```

## 🌐 **Step 3: Deploy to Nosana Network**

### **Option A: Using Nosana Dashboard (Recommended)**

1. **Open Nosana Dashboard**
   - Go to [Nosana Dashboard](https://dashboard.nosana.io/)
   - Connect your wallet (MetaMask, Phantom, etc.)

2. **Create New Job**
   - Click "Create Job" or "Deploy"
   - Select "Custom Job Definition"

3. **Use Our Pre-configured Job Definition**
   ```json
   {
     "name": "sentra-ai-agent",
     "description": "Sentra AI Code Analysis Agent - Intelligent code review and security assistant",
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
       },
       {
         "name": "NODE_ENV",
         "value": "production"
       }
     ],
     "restartPolicy": "Always",
     "healthCheck": {
       "path": "/",
       "port": 3000,
       "interval": "30s",
       "timeout": "10s",
       "retries": 3
     }
   }
   ```

4. **Deploy**
   - Replace `yourusername` with your actual Docker Hub username
   - Select GPU: `nvidia-3090` or similar
   - Set timeout: `30 minutes`
   - Click "Deploy"

### **Option B: Using Nosana CLI**

1. **Install Nosana CLI**
   ```bash
   npm install -g @nosana/cli
   ```

2. **Update Job Definition**
   ```bash
   # Update the image name in nosana-job.json
   sed -i "s/yourusername\/sentra-ai:latest/$DOCKER_USERNAME\/sentra-ai:latest/g" nosana-job.json
   ```

3. **Deploy with CLI**
   ```bash
   nosana job post --file ./nosana-job.json --market nvidia-3090 --timeout 30
   ```

## 🎥 **Step 4: Create Video Demo**

### **4.1 Recording Requirements (1-3 minutes)**
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

### **4.2 Recording Tips**
- Use screen recording software (OBS, Loom, etc.)
- Show both the interface and the AI responses
- Keep it concise but comprehensive
- Upload to YouTube or Loom

## 📝 **Step 5: Update Documentation**

### **5.1 Update README.md**
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

### **5.2 Commit Documentation**
```bash
# Add updated README
git add README.md

# Commit documentation
git commit -m "docs: Update README with deployment info and features"

# Push to GitHub
git push origin main
```

## 📱 **Step 6: Social Media Post**

### **6.1 Twitter/X Post Template**
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

## 🏆 **Step 7: Final Submission**

### **7.1 SuperTeam Submission Requirements**
1. **GitHub Repository**: Link to your forked repo
2. **Docker Image**: Link to Docker Hub
3. **Video Demo**: YouTube/Loom link
4. **Social Media Post**: Twitter/X link
5. **Nosana Deployment**: Screenshot or URL

### **7.2 Submission Checklist**
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

1. ✅ Push to GitHub
2. ✅ Build and push Docker image
3. ✅ Deploy to Nosana Network
4. ✅ Create video demo
5. ✅ Update documentation
6. ✅ Submit to challenge

**Good luck with the Nosana Builders Challenge!** 🏆