'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeFile, AnalysisSession } from '@/lib/code-types';
import { codeAgentClient } from '@/lib/code-agent-client';
import { CodeInput } from '@/components/CodeInput';
import { CodeList } from '@/components/CodeList';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  Zap,
  FileCode,
  Bot,
  Plus,
  MessageSquare,
  Code,
  Search,
  BarChart3,
  GitBranch,
  Database,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Send,
  Loader2,
  X,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');

  useEffect(() => {
    loadSessions();
    // Initialize with a welcome message
    setChatMessages([{
      id: '1',
      role: 'assistant',
      content: 'Welcome to Sentra! I can help you analyze code, detect security vulnerabilities, optimize performance, and generate comprehensive reports. What would you like to analyze today?',
      timestamp: new Date()
    }]);
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      // Simulate loading sessions
      const mockSessions: AnalysisSession[] = [
        {
          id: '1',
          name: 'utils.js',
          files: [{
            id: 'file-1',
            name: 'utils.js',
            path: '/src/utils.js',
            language: 'javascript',
            content: 'function helper() { return true; }',
            size: 1024,
            lastModified: new Date().toISOString(),
            analysis: {
              qualityScore: 85,
              complexity: { cyclomatic: 3, cognitive: 2, maintainability: 80 },
              issues: [],
              metrics: { linesOfCode: 12, functions: 1, classes: 0, comments: 2 },
              suggestions: ['Consider adding error handling', 'Add unit tests']
            }
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'completed'
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = async (session: AnalysisSession) => {
    setSessions(prev => [session, ...prev]);
    setCurrentSession(session);
    
    // Add comprehensive analysis to chat
    const analysisMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: `🔍 **Analysis Complete for ${session.name}**\n\n**Quality Score:** ${session.files[0]?.analysis?.qualityScore || 'N/A'}/100\n**Complexity:** ${session.files[0]?.analysis?.complexity?.cyclomatic || 'N/A'}\n**Issues Found:** ${session.files[0]?.analysis?.issues?.length || 0}\n\n**Key Insights:**\n${session.files[0]?.analysis?.suggestions?.slice(0, 3).map(s => `• ${s}`).join('\n') || 'No specific issues detected.'}\n\n**Recommendations:**\n${session.files[0]?.analysis?.suggestions?.slice(3).map(s => `• ${s}`).join('\n') || 'Code looks good!'}`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, analysisMessage]);
  };

  const handleAgentResponse = (response: string) => {
    setAgentResponse(response);
  };

  const handleSelectSession = (session: AnalysisSession) => {
    setCurrentSession(session);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    const currentInput = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    // Add loading message
    const loadingMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: '🤔 Thinking...',
      timestamp: new Date(),
      isLoading: true
    };
    setChatMessages(prev => [...prev, loadingMessage]);

    try {
      // Call real AI chat API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          context: {
            sessions: sessions,
            currentSession: currentSession
          }
        }),
      });

      if (!response.ok) {
        throw new Error('AI chat failed');
      }

      const data = await response.json();
      
      // Remove loading message and add real response
      setChatMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const aiResponse = {
        id: (Date.now() + 2).toString(),
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);

      // If the response includes analysis, trigger analysis
      if (data.analysis && currentSession) {
        handleNewAnalysis(currentSession);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove loading message and add error
      setChatMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      
      const errorResponse = {
        id: (Date.now() + 2).toString(),
        role: 'assistant' as const,
        content: `❌ **Error**: I encountered an issue processing your request. Please try again or check if the Mastra agent is running on port 4111.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const downloadReport = async (sessionId: string) => {
    try {
      // Simulate report download
      const reportContent = `CodeGuardian Analysis Report\n\nSession: ${sessionId}\nDate: ${new Date().toLocaleDateString()}\n\nThis is a comprehensive analysis report generated by CodeGuardian AI.`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codeguardian-report-${sessionId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleViewDetails = (session: AnalysisSession) => {
    setCurrentSession(session);
    setActiveTab('dashboard');
  };

  const analyzedFiles = sessions.filter(s => s.status === 'completed');
  const pendingFiles = sessions.filter(s => s.status === 'pending');

  return (
    <div className="main-container">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-element-1 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-element-2 rounded-full mix-blend-multiply filter blur-xl opacity-15"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          className="glass-strong border-b border-white/10 p-6 sticky top-0 z-50 backdrop-blur-xl bg-black/90"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gradient-to-r from-white/20 to-white/10 rounded-lg border border-white/20"
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-300 light:from-black light:to-gray-700 bg-clip-text text-transparent">Sentra</h1>
                    <p className="text-gray-300 dark:text-gray-300 light:text-gray-600">AI-Powered Code Analysis & Security</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Badge className="glass border-white/30 text-white bg-white/10">
                <CheckCircle className="h-3 w-3 mr-1" />
                Powered by Mastra Kit
              </Badge>
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div 
          className="max-w-7xl mx-auto p-4 sm:p-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="glass border-white/20 bg-black/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <FileCode className="h-6 w-6 text-white" />
        </div>
                    <div>
                      <p className="text-2xl font-bold text-white dark:text-white light:text-black">{analyzedFiles.length}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Files Analyzed</p>
      </div>
    </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="glass border-white/20 bg-black/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white dark:text-white light:text-black">{analyzedFiles.length}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Completed</p>
        </div>
      </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="glass border-white/20 bg-black/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
          <div>
                      <p className="text-2xl font-bold text-white dark:text-white light:text-black">{pendingFiles.length}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Pending</p>
          </div>
        </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="glass border-white/20 bg-black/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <Database className="h-6 w-6 text-white" />
            </div>
            <div>
                      <p className="text-2xl font-bold text-white dark:text-white light:text-black">{sessions.length}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Sessions</p>
            </div>
            </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="glass border-white/10 p-1 flex-wrap sticky top-20 z-40 backdrop-blur-xl bg-black/80">
              <TabsTrigger 
                value="analyze" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Code className="h-4 w-4 mr-2" />
                Analyze
              </TabsTrigger>
              <TabsTrigger 
                value="files" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <FileCode className="h-4 w-4 mr-2" />
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CodeInput 
                  onNewAnalysis={handleNewAnalysis}
                  onAgentResponse={handleAgentResponse}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CodeList 
                  sessions={sessions}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                  isLoading={isLoading}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {currentSession ? (
                  <AnalysisDashboard 
                    files={currentSession.files} 
                    sessions={sessions} 
                    onSessionUpdate={setSessions} 
                  />
                ) : (
                  <Card className="glass">
                    <CardContent className="p-12 text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">No Analysis Selected</h3>
                      <p className="text-gray-400">Select a file from the Files tab to view detailed analysis</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {/* Chat Messages */}
                <div className="lg:col-span-2">
                  <Card className="glass h-96">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-blue-400" />
                        <span>AI Assistant</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 overflow-y-auto space-y-4">
                      <AnimatePresence>
                        {chatMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.role === 'user' 
                                ? 'bg-blue-500/20 text-blue-100' 
                                : 'bg-gray-700/50 text-gray-200'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full glass border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                        onClick={() => setChatInput("Generate a roadmap for my project")}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Generate Roadmap
                      </Button>
                      <Button 
                        className="w-full glass border-green-500/30 text-green-300 hover:bg-green-500/20"
                        onClick={() => setChatInput("Analyze my code for security issues")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Security Scan
                      </Button>
                      <Button 
                        className="w-full glass border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                        onClick={() => setChatInput("Optimize my code performance")}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Performance Check
                      </Button>
                      <Button 
                        className="w-full glass border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                        onClick={() => setChatInput("Generate documentation for my code")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Docs
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Chat Input */}
              <motion.form 
                onSubmit={handleChatSubmit}
                className="flex space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex-1 max-w-2xl">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about code analysis, security, performance..."
                    className="glass border-white/10 resize-none"
                    rows={2}
                    disabled={isChatLoading}
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    type="submit" 
                    className="glass border-blue-500/30 text-blue-300 hover:bg-blue-500/20 h-full px-6"
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    {isChatLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}