'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CodeFile, AnalysisSession, CodeAnalysis } from '@/lib/code-types';
import { codeAgentClient } from '@/lib/code-agent-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileCode,
  Shield,
  Zap,
  ScrollText,
  GitBranch,
  Trash2,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Code,
  Database
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CodeCardProps {
  session: AnalysisSession;
  onViewDetails: (session: AnalysisSession) => void;
  onDelete: (sessionId: string) => void;
}

export function CodeCard({ session, onViewDetails, onDelete }: CodeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return { color: 'green', text: 'Excellent' };
    if (score >= 60) return { color: 'yellow', text: 'Good' };
    if (score >= 40) return { color: 'orange', text: 'Fair' };
    return { color: 'red', text: 'Poor' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleDownload = async () => {
    try {
      const firstFile = session.files[0];
      const reportContent = `Sentra AI Analysis Report\n\nSession: ${session.name}\nStatus: ${session.status}\nCreated: ${new Date(session.createdAt).toLocaleString()}\n\nFiles Analyzed: ${session.files.length}\n\n${session.files.map(file => `File: ${file.name}\nPath: ${file.path}\nLanguage: ${file.language}\nSize: ${file.size} bytes\nLast Modified: ${new Date(file.lastModified).toLocaleString()}\n\nAnalysis Results:\nQuality Score: ${file.analysis?.qualityScore || 'N/A'}/100\nComplexity: ${file.analysis?.complexity?.cyclomatic || 'N/A'}\nIssues: ${file.analysis?.issues?.length || 0}\n\nSuggestions:\n${file.analysis?.suggestions?.map(s => `• ${s}`).join('\n') || 'No suggestions available.'}\n\n---\n`).join('\n')}`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentra-${session.name}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const qualityBadge = getQualityBadge(session.files[0]?.analysis?.qualityScore || 0);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      <Card className="glass border-white/10 hover:border-blue-500/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-2 bg-blue-500/20 rounded-lg"
              >
                <FileCode className="h-5 w-5 text-blue-400" />
              </motion.div>
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  {session.fileName}
                </CardTitle>
                <p className="text-sm text-gray-400">{session.filePath}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(session.status)}
              <Badge className={`bg-${qualityBadge.color}-500/20 text-${qualityBadge.color}-300 border-${qualityBadge.color}-500/30`}>
                {qualityBadge.text}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Analysis Summary */}
          {session.files[0]?.analysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getQualityColor(session.files[0].analysis.qualityScore)}`}>
                  {session.files[0].analysis.qualityScore}
                </div>
                <div className="text-xs text-gray-400">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {session.files[0].analysis.complexity?.cyclomatic || 0}
                </div>
                <div className="text-xs text-gray-400">Complexity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {session.files[0].analysis.issues?.length || 0}
                </div>
                <div className="text-xs text-gray-400">Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {session.files[0].analysis.suggestions?.length || 0}
                </div>
                <div className="text-xs text-gray-400">Suggestions</div>
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gray-700/50 text-gray-300">
              <Code className="h-3 w-3 mr-1" />
              {session.language}
            </Badge>
            <Badge className="bg-gray-700/50 text-gray-300">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </Badge>
            {session.files[0]?.analysis?.metrics && (
              <>
                <Badge className="bg-gray-700/50 text-gray-300">
                  <FileCode className="h-3 w-3 mr-1" />
                  {session.files[0].analysis.metrics.linesOfCode} lines
                </Badge>
                <Badge className="bg-gray-700/50 text-gray-300">
                  <Database className="h-3 w-3 mr-1" />
                  {session.files[0].analysis.metrics.functions} functions
                </Badge>
              </>
            )}
          </div>

          {/* Quick Insights */}
          {session.files[0]?.analysis?.suggestions && session.files[0].analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Quick Insights</h4>
              <div className="space-y-1">
                {session.files[0].analysis.suggestions.slice(0, 2).map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 text-sm text-gray-300"
                  >
                    <Star className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }}
            className="flex items-center justify-between pt-2 border-t border-white/10"
          >
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onViewDetails(session)}
                  size="sm"
                  className="glass border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="glass border-green-500/30 text-green-300 hover:bg-green-500/20"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onDelete(session.id)}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}