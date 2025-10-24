'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { codeAgentClient } from '@/lib/code-agent-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Send, 
  Bot, 
  Github, 
  Gitlab, 
  FileCode, 
  Upload, 
  FileText,
  Sparkles,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  Code,
  Database,
  Target
} from 'lucide-react';
import { CodeFile, AnalysisSession } from '@/lib/code-types';

interface CodeInputProps {
  onNewAnalysis: (session: AnalysisSession) => void;
  onAgentResponse: (response: string) => void;
}

export function CodeInput({ onNewAnalysis, onAgentResponse }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysisType, setAnalysisType] = useState('full');
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<'code' | 'repo' | 'file'>('code');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() && !repoUrl.trim()) return;

    setIsLoading(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let analysisResult;
      
      if (inputType === 'code' || inputType === 'file') {
        // Call real analysis API
        const response = await fetch('/api/code/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            language: language,
            fileName: fileName || `code.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}`
          }),
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        analysisResult = await response.json();
      } else {
        // Call repository connection API
        const response = await fetch('/api/code/repository', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoUrl: repoUrl
          }),
        });

        if (!response.ok) {
          throw new Error('Repository connection failed');
        }

        analysisResult = await response.json();
      }

      setAnalysisProgress(100);
      
      // Create analysis session
      const session: AnalysisSession = {
        id: Date.now().toString(),
        fileName: fileName || 'code.js',
        filePath: inputType === 'repo' ? repoUrl : `/${fileName}`,
        language: language,
        analysis: analysisResult,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      onNewAnalysis(session);
      onAgentResponse(`Analysis completed for ${session.fileName}. Quality score: ${analysisResult.qualityScore}/100`);

      // Reset form
      setCode('');
      setRepoUrl('');
      setFileName('');
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      onAgentResponse('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
      setAnalysisProgress(0);
    }
  };

  const analysisTypes = [
    { value: 'full', label: 'Full Analysis', icon: Target, color: 'blue' },
    { value: 'security', label: 'Security Scan', icon: Shield, color: 'red' },
    { value: 'performance', label: 'Performance', icon: Zap, color: 'yellow' },
    { value: 'quality', label: 'Code Quality', icon: Code, color: 'green' }
  ];

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust', 'php', 'ruby'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Input Type Selector */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span>Code Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Type Tabs */}
          <div className="flex space-x-2">
            {[
              { value: 'code', label: 'Paste Code', icon: Code },
              { value: 'file', label: 'Upload File', icon: Upload },
              { value: 'repo', label: 'Repository', icon: Github }
            ].map((type) => (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInputType(type.value as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  inputType === type.value
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <type.icon className="h-4 w-4" />
                <span>{type.label}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 rounded-lg glass border-white/10 bg-gray-800/50 text-white"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-gray-800">
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Analysis Type</label>
              <div className="grid grid-cols-2 gap-3">
                {analysisTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAnalysisType(type.value)}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                      analysisType === type.value
                        ? `bg-${type.color}-500/20 text-${type.color}-300 border border-${type.color}-500/30`
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-sm">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Code Input */}
            <AnimatePresence mode="wait">
              {inputType === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300">Code</label>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    className="glass border-white/10 code-font min-h-[200px]"
                    required
                  />
                </motion.div>
              )}

              {inputType === 'file' && (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300">Upload File</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb"
                      className="hidden"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Upload className="h-8 w-8" />
                      <span>Click to upload or drag and drop</span>
                      <span className="text-xs">Supports: JS, TS, Python, Java, C++, Go, Rust, PHP, Ruby</span>
                    </motion.button>
                  </div>
                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-green-400" />
                      <span className="text-green-300 text-sm">{uploadedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setCode('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {inputType === 'repo' && (
                <motion.div
                  key="repo"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-300">Repository URL</label>
                  <Input
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="glass border-white/10 opacity-50 cursor-not-allowed"
                    disabled
                  />
                  <div className="flex space-x-2">
                    <Badge className="bg-gray-700/50 text-gray-300">
                      <Github className="h-3 w-3 mr-1" />
                      GitHub
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      Coming Soon
                    </Badge>
                    <Badge className="bg-gray-700/50 text-gray-300">
                      <Gitlab className="h-3 w-3 mr-1" />
                      GitLab
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis Progress */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Analyzing code...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading || (!code.trim() && !repoUrl.trim())}
                className="w-full glass border-blue-500/30 text-blue-300 hover:bg-blue-500/20 h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Code
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}