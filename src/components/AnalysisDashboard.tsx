'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';                                                                                                                                                                                                                                                                                                                                                                                                                 
import { CodeFile, AnalysisSession } from '@/lib/code-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Zap, 
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalysisDashboardProps {
  files: CodeFile[];
  sessions: AnalysisSession[];
  onSessionUpdate: (sessions: AnalysisSession[]) => void;
}

export function AnalysisDashboard({ files, sessions, onSessionUpdate }: AnalysisDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  // Calculate metrics
  const totalFiles = files.length;
  const analyzedFiles = files.filter(f => f.analysis).length;
  const pendingFiles = totalFiles - analyzedFiles;
  
  const avgQualityScore = analyzedFiles > 0 
    ? Math.round(files.filter(f => f.analysis).reduce((sum, f) => sum + (f.analysis?.qualityScore || 0), 0) / analyzedFiles)
    : 0;
  
  const avgSecurityScore = analyzedFiles > 0 
    ? Math.round(files.filter(f => f.securityScan).reduce((sum, f) => sum + (f.securityScan?.securityScore || 0), 0) / analyzedFiles)
    : 0;
  
  const avgPerformanceScore = analyzedFiles > 0 
    ? Math.round(files.filter(f => f.performanceAnalysis).reduce((sum, f) => sum + (f.performanceAnalysis?.performanceScore || 0), 0) / analyzedFiles)
    : 0;

  const criticalIssues = files.reduce((sum, f) => {
    return sum + (f.analysis?.issues?.filter(i => i.severity === 'critical').length || 0);
  }, 0);

  const highVulnerabilities = files.reduce((sum, f) => {
    return sum + (f.securityScan?.vulnerabilities?.filter(v => v.severity === 'high' || v.severity === 'critical').length || 0);
  }, 0);

  const performanceBottlenecks = files.reduce((sum, f) => {
    return sum + (f.performanceAnalysis?.bottlenecks?.filter(b => b.severity === 'high' || b.severity === 'critical').length || 0);
  }, 0);

  const getOverallHealth = () => {
    if (analyzedFiles === 0) return { score: 0, status: 'No Data', color: 'text-gray-400' };
    
    const overallScore = Math.round((avgQualityScore + avgSecurityScore + avgPerformanceScore) / 3);
    
    if (overallScore >= 80) return { score: overallScore, status: 'Excellent', color: 'text-green-400' };
    if (overallScore >= 60) return { score: overallScore, status: 'Good', color: 'text-yellow-400' };
    if (overallScore >= 40) return { score: overallScore, status: 'Fair', color: 'text-orange-400' };
    return { score: overallScore, status: 'Poor', color: 'text-red-400' };
  };

  const overallHealth = getOverallHealth();

  const generateReport = async () => {
    try {
      // Simulate report generation
      const reportData = {
        codeAnalysis: { qualityScore: avgQualityScore },
        securityScan: { securityScore: avgSecurityScore },
        performanceAnalysis: { performanceScore: avgPerformanceScore },
      };
      
      // In a real implementation, this would call the report generation API
      console.log('Generating report with data:', reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Analysis Dashboard</h2>
          <p className="text-sm text-white/70">Overview of your code analysis results</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="backdrop-blur-xl bg-black/20 border border-blue-500/30 text-white rounded-md px-3 py-2 focus:bg-black/30 focus:border-blue-400/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button
            variant="outline"
            onClick={generateReport}
            className="backdrop-blur-xl bg-black/20 border-blue-500/30 text-white hover:bg-blue-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overall Health Score */}
      <motion.div 
        className="backdrop-blur-xl bg-black/20 rounded-2xl p-6 border border-blue-500/20 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">
            <span className={overallHealth.color}>{overallHealth.score}</span>
            <span className="text-white/60">/100</span>
          </div>
          <div className={`text-lg font-semibold ${overallHealth.color} mb-2`}>
            {overallHealth.status}
          </div>
          <p className="text-white/70">Overall Code Health Score</p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { 
            title: 'Quality Score', 
            value: avgQualityScore, 
            icon: FileCode, 
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
          },
          { 
            title: 'Security Score', 
            value: avgSecurityScore, 
            icon: Shield, 
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
          },
          { 
            title: 'Performance Score', 
            value: avgPerformanceScore, 
            icon: Zap, 
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
          },
          { 
            title: 'Files Analyzed', 
            value: analyzedFiles, 
            icon: BarChart3, 
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            className={`backdrop-blur-xl ${metric.bgColor} rounded-2xl p-6 border ${metric.borderColor} shadow-xl`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.1)"
            }}
          >
            <div className="text-center">
              <motion.div 
                className={`text-3xl font-bold ${metric.color} mb-2 flex items-center justify-center gap-2`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
              >
                <metric.icon className="h-6 w-6" />
                {metric.value}
              </motion.div>
              <div className="text-white/70">{metric.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Issues Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="backdrop-blur-xl bg-black/20 rounded-2xl p-6 border border-red-500/20 shadow-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Critical Issues</h3>
          </div>
          <div className="text-2xl font-bold text-red-400 mb-2">{criticalIssues}</div>
          <p className="text-sm text-white/70">Issues requiring immediate attention</p>
        </motion.div>

        <motion.div
          className="backdrop-blur-xl bg-black/20 rounded-2xl p-6 border border-orange-500/20 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Security Vulnerabilities</h3>
          </div>
          <div className="text-2xl font-bold text-orange-400 mb-2">{highVulnerabilities}</div>
          <p className="text-sm text-white/70">High and critical security issues</p>
        </motion.div>

        <motion.div
          className="backdrop-blur-xl bg-black/20 rounded-2xl p-6 border border-yellow-500/20 shadow-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Performance Bottlenecks</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-400 mb-2">{performanceBottlenecks}</div>
          <p className="text-sm text-white/70">High impact performance issues</p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        className="backdrop-blur-xl bg-black/20 rounded-2xl p-6 border border-blue-500/20 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        
        {files.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-white/60" />
            <p className="text-white/70">No recent activity</p>
            <p className="text-sm text-white/50">Start analyzing files to see activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.slice(0, 5).map((file, index) => (
              <motion.div
                key={file.id}
                className="flex items-center gap-3 p-3 backdrop-blur-xl bg-black/10 rounded-lg border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <FileCode className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{file.name}</div>
                  <div className="text-sm text-white/60">
                    {file.analysis ? 'Analysis completed' : 'Analysis pending'}
                  </div>
                </div>
                <Badge className={file.analysis ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
                  {file.analysis ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  {file.analysis ? 'Complete' : 'Pending'}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
