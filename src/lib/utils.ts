import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null): string {
  if (!date) return 'No deadline';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays < 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;
  return `Due in ${Math.ceil(diffDays / 30)} months`;
}

export function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 5: return 'text-red-500 bg-red-50 border-red-200';
    case 4: return 'text-orange-500 bg-orange-50 border-orange-200';
    case 3: return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    case 2: return 'text-blue-500 bg-blue-50 border-blue-200';
    case 1: return 'text-gray-500 bg-gray-50 border-gray-200';
    default: return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

export function getPriorityLabel(priority: Task['priority']): string {
  switch (priority) {
    case 5: return 'Critical';
    case 4: return 'High';
    case 3: return 'Medium';
    case 2: return 'Low';
    case 1: return 'Backlog';
    default: return 'Unknown';
  }
}

export function getCategoryColor(category: Task['category']): string {
  switch (category) {
    case 'work': return 'text-blue-600 bg-blue-100';
    case 'personal': return 'text-green-600 bg-green-100';
    case 'urgent': return 'text-red-600 bg-red-100';
    case 'learning': return 'text-purple-600 bg-purple-100';
    case 'meeting': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export function getStatusColor(status: Task['status']): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'in-progress': return 'text-blue-600 bg-blue-100';
    case 'pending': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    // First by priority (descending)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Then by deadline (ascending, nulls last)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    
    // Finally by creation date (descending)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function filterTasksByStatus(tasks: Task[], status: Task['status']): Task[] {
  return tasks.filter(task => task.status === status);
}

export function filterTasksByCategory(tasks: Task[], category: Task['category']): Task[] {
  return tasks.filter(task => task.category === category);
}

export function filterTasksByPriority(tasks: Task[], priority: Task['priority']): Task[] {
  return tasks.filter(task => task.priority === priority);
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  
  const byPriority = {
    critical: tasks.filter(t => t.priority === 5).length,
    high: tasks.filter(t => t.priority === 4).length,
    medium: tasks.filter(t => t.priority === 3).length,
    low: tasks.filter(t => t.priority === 2).length,
    backlog: tasks.filter(t => t.priority === 1).length,
  };
  
  const byCategory = {
    work: tasks.filter(t => t.category === 'work').length,
    personal: tasks.filter(t => t.category === 'personal').length,
    urgent: tasks.filter(t => t.category === 'urgent').length,
    learning: tasks.filter(t => t.category === 'learning').length,
    meeting: tasks.filter(t => t.category === 'meeting').length,
  };
  
  return {
    total,
    completed,
    inProgress,
    pending,
    byPriority,
    byCategory,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
