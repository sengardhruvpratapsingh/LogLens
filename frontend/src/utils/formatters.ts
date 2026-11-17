import { SeverityLevel } from '../types';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatPercentage(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function getSeverityBadgeConfig(severity: SeverityLevel | string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const norm = severity.toUpperCase();
  switch (norm) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-950/60',
        text: 'text-red-400',
        border: 'border-red-800/60',
        dot: 'bg-red-500',
      };
    case 'ERROR':
      return {
        bg: 'bg-rose-950/50',
        text: 'text-rose-400',
        border: 'border-rose-850/60',
        dot: 'bg-rose-500',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-950/50',
        text: 'text-amber-400',
        border: 'border-amber-800/60',
        dot: 'bg-amber-500',
      };
    case 'INFO':
      return {
        bg: 'bg-sky-950/50',
        text: 'text-sky-400',
        border: 'border-sky-800/60',
        dot: 'bg-sky-400',
      };
    case 'DEBUG':
      return {
        bg: 'bg-purple-950/50',
        text: 'text-purple-400',
        border: 'border-purple-800/60',
        dot: 'bg-purple-400',
      };
    default:
      return {
        bg: 'bg-slate-800/60',
        text: 'text-slate-400',
        border: 'border-slate-700/60',
        dot: 'bg-slate-500',
      };
  }
}
