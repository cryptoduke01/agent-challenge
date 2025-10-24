'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeFile, AnalysisSession } from '@/lib/code-types';
import { codeAgentClient } from '@/lib/code-agent-client';
import { CodeCard } from './CodeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  RefreshCw,
  FileCode,
  GitBranch,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Database
} from 'lucide-react';

interface CodeListProps {
  sessions: AnalysisSession[];
  onSelectSession: (session: AnalysisSession) => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading?: boolean;
}

export function CodeList({ sessions, onSelectSession, onDeleteSession, isLoading = false }: CodeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleDownloadAll = async () => {
    try {
      const reportContent = `CodeGuardian Analysis Report\n\nGenerated: ${new Date().toLocaleDateString()}\n\nSessions:\n${sessions.map(s => `- ${s.fileName} (${s.status})`).join('\n')}`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codeguardian-report-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.filePath.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'score':
          comparison = (a.analysis?.qualityScore || 0) - (b.analysis?.qualityScore || 0);
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const pendingCount = sessions.filter(s => s.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-400" />
              <span>Analysis Sessions</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                {completedCount} Completed
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Clock className="h-3 w-3 mr-1" />
                {pendingCount} Pending
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-10 glass border-white/10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 rounded-lg glass border-white/10 bg-gray-800/50 text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as any);
                  setSortOrder(order as any);
                }}
                className="px-3 py-2 rounded-lg glass border-white/10 bg-gray-800/50 text-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="score-desc">Score High-Low</option>
                <option value="score-asc">Score Low-High</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-2 rounded-lg glass border-white/10 hover:bg-gray-600/50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadAll}
                className="px-3 py-2 rounded-lg glass border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-colors"
              >
                <Download className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center space-x-2 text-gray-400">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading sessions...</span>
              </div>
            </motion.div>
          ) : filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FileCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Analysis Sessions</h3>
              <p className="text-gray-400 mb-4">Start by analyzing some code to see results here.</p>
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="glass border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <FileCode className="h-4 w-4 mr-2" />
                Analyze Code
              </Button>
            </motion.div>
          ) : (
            filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CodeCard
                  session={session}
                  onViewDetails={onSelectSession}
                  onDelete={onDeleteSession}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{sessions.length}</div>
                  <div className="text-sm text-gray-400">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}