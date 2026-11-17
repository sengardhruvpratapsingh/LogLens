import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Layers,
  Clock,
  Calendar,
  AlertTriangle,
  AlertOctagon,
  Info,
  Bug,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode2,
  FileText,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { AnalysisDetail, LogEntry, PaginatedResponse, SeverityLevel } from '../types';
import { Card } from '../components/common/Card';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { KPICardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate, formatFileSize } from '../utils/formatters';

const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  DEBUG: '#8B5CF6',
  UNKNOWN: '#64748B',
};

export const AnalysisResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log Explorer State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(false);

  // Load Analysis Details
  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);
        const data = await api.getAnalysisDetail(id);
        setAnalysis(data);
      } catch (err: any) {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || 'Failed to load analysis details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Load Logs
  const fetchLogs = async () => {
    if (!id) return;
    try {
      setLogsLoading(true);
      const res: PaginatedResponse<LogEntry> = await api.getAnalysisLogs(
        id,
        currentPage,
        50,
        searchQuery,
        selectedSeverity,
        sortOrder
      );
      setLogs(res.items);
      setTotalPages(res.total_pages);
      setTotalLogsCount(res.total);
    } catch {
      // Keep previous or empty
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id, currentPage, selectedSeverity, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const copyAnalysisId = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Highlight search keyword in message
  const highlightMatch = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#22D3EE]/30 text-[#22D3EE] font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-slate-800 animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div className="p-6 md:p-12 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#172337] border border-red-800/40 flex items-center justify-center text-red-400 mx-auto">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Analysis Record Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The requested analysis ID does not exist or has been deleted from the database.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/history"
            className="px-4 py-2 bg-[#172337] text-slate-200 border border-[#1E2D4A] rounded-lg text-sm font-semibold hover:bg-[#1D2D47]"
          >
            Go to History
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2 bg-[#22D3EE] text-[#0B1220] rounded-lg text-sm font-bold hover:bg-[#38BDF8]"
          >
            Upload New File
          </Link>
        </div>
      </div>
    );
  }

  // Severity Distribution Pie data
  const pieData = [
    { name: 'Critical', value: analysis.critical_count, color: SEVERITY_COLORS.CRITICAL },
    { name: 'Error', value: analysis.error_count, color: SEVERITY_COLORS.ERROR },
    { name: 'Warning', value: analysis.warning_count, color: SEVERITY_COLORS.WARNING },
    { name: 'Info', value: analysis.info_count, color: SEVERITY_COLORS.INFO },
    { name: 'Debug', value: analysis.debug_count, color: SEVERITY_COLORS.DEBUG },
    { name: 'Unknown', value: analysis.unknown_count, color: SEVERITY_COLORS.UNKNOWN },
  ].filter((item) => item.value > 0);

  const severityFilters = ['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG', 'UNKNOWN'];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg bg-[#172337] border border-[#1E2D4A] text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                {analysis.filename}
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-[#172337] border border-[#1E2D4A] text-[#22D3EE] uppercase font-bold">
                {analysis.detected_format}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                ID: {analysis.id.slice(0, 8)}...
                <button
                  onClick={copyAnalysisId}
                  className="hover:text-slate-200 text-slate-500 transition-colors"
                  title="Copy Analysis ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
              <span>•</span>
              <span>{formatFileSize(analysis.file_size)}</span>
              <span>•</span>
              <span>Processed {formatDate(analysis.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={api.getExportCsvUrl(analysis.id)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172337] border border-[#1E2D4A] text-slate-200 hover:border-[#22D3EE]/50 hover:text-[#22D3EE] text-xs font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </a>
          <a
            href={api.getExportJsonUrl(analysis.id)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172337] border border-[#1E2D4A] text-slate-200 hover:border-[#22D3EE]/50 hover:text-[#22D3EE] text-xs font-semibold transition-all shadow-sm"
          >
            <FileCode2 className="w-4 h-4 text-purple-400" />
            <span>Export JSON</span>
          </a>
          <a
            href={api.getExportTxtUrl(analysis.id)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172337] border border-[#1E2D4A] text-slate-200 hover:border-[#22D3EE]/50 hover:text-[#22D3EE] text-xs font-semibold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#22D3EE]" />
            <span>Text Report</span>
          </a>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="p-4 bg-[#172337]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Logs
          </span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            {analysis.total_records.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {analysis.parsed_records} parsed ({((analysis.parsed_records / (analysis.total_records || 1)) * 100).toFixed(0)}%)
          </span>
        </Card>

        <Card className="p-4 border-red-900/40">
          <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider block">
            Critical
          </span>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {analysis.critical_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-red-400/80 mt-1 block">Fatal system events</span>
        </Card>

        <Card className="p-4 border-rose-900/40">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
            Errors
          </span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            {analysis.error_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">
            {analysis.error_percentage}% failure rate
          </span>
        </Card>

        <Card className="p-4 border-amber-900/40">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
            Warnings
          </span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {analysis.warning_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Anomalies & retries</span>
        </Card>

        <Card className="p-4 border-sky-900/40">
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
            Info
          </span>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
            {analysis.info_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Standard operational</span>
        </Card>

        <Card className="p-4 border-purple-900/40">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
            Debug
          </span>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
            {analysis.debug_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Diagnostic traces</span>
        </Card>
      </div>

      {/* CHARTS: TIMELINE & SEVERITY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#22D3EE]" />
              <h3 className="font-bold text-slate-100 text-base">Activity Timeline & Error Spikes</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {analysis.first_timestamp ? formatDate(analysis.first_timestamp) : 'No timestamp'} →{' '}
              {analysis.last_timestamp ? formatDate(analysis.last_timestamp) : 'N/A'}
            </span>
          </div>

          {analysis.timeline.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Insufficient timestamps found in file to plot a timeline
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analysis.timeline}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                  <XAxis dataKey="timestamp" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111B2E',
                      borderColor: '#1E2D4A',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Logs"
                    stroke="#38BDF8"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="error"
                    name="Errors"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorError)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Severity Distribution (1 col) */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100 text-base">Severity Breakdown</h3>
            <span className="text-xs text-slate-400">{analysis.total_records} records</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111B2E',
                    borderColor: '#1E2D4A',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* RECURRING ERROR PATTERNS SECTION */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-slate-100">Recurring Error Patterns</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {analysis.top_patterns.length} Identified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Normalized templates grouping repeated error messages by stripping dynamic parameters (UUIDs, IPs, IDs, timestamps).
            </p>
          </div>
        </div>

        {analysis.top_patterns.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 border border-dashed border-[#1E2D4A] rounded-xl bg-[#111B2E]/40">
            No repeated error or critical patterns detected in this log dataset.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1E2D4A] text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Rank</th>
                  <th className="pb-3 px-3">Severity</th>
                  <th className="pb-3 px-3">Occurrences</th>
                  <th className="pb-3 px-3">Normalized Error Pattern</th>
                  <th className="pb-3 px-3">First Seen</th>
                  <th className="pb-3 px-3">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4A]/60">
                {analysis.top_patterns.map((pattern, idx) => (
                  <tr key={pattern.id} className="hover:bg-[#111B2E]/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={pattern.severity} />
                    </td>
                    <td className="py-3 px-3 font-mono text-sm font-bold text-rose-400">
                      {pattern.occurrence_count}x
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-200">
                      <div className="max-w-xl break-words">{pattern.normalized_message}</div>
                      {pattern.original_message !== pattern.normalized_message && (
                        <div className="text-[11px] text-slate-500 mt-1 truncate max-w-lg">
                          Example: {pattern.original_message}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(pattern.first_occurrence)}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(pattern.last_occurrence)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* LOG EXPLORER TABLE */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">Log Explorer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect, search, and filter individual log records ({totalLogsCount.toLocaleString()} matching)
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search messages, sources, IPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#0B1220] border border-[#1E2D4A] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#1E2D4A] hover:bg-[#22D3EE] text-slate-200 hover:text-[#0B1220] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Severity Filter Pills & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#1E2D4A]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            {severityFilters.map((sev) => (
              <button
                key={sev}
                onClick={() => {
                  setSelectedSeverity(sev);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-[#22D3EE] text-[#0B1220] shadow-sm shadow-cyan-500/20'
                    : 'bg-[#111B2E] text-slate-400 hover:text-slate-200 hover:bg-[#1E2D4A]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Sort Order:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 bg-[#111B2E] border border-[#1E2D4A] rounded text-slate-200 hover:border-slate-500 cursor-pointer"
            >
              {sortOrder === 'asc' ? 'Chronological (Asc)' : 'Reverse (Desc)'}
            </button>
          </div>
        </div>

        {/* Log Table */}
        {logsLoading ? (
          <TableSkeleton rows={8} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-300">No log entries matched your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting severity filters or search query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('ALL');
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-1.5 bg-[#172337] border border-[#1E2D4A] rounded-lg text-xs font-semibold text-[#22D3EE] hover:bg-[#1E2D4A]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E2D4A] text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-3 w-10"></th>
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Severity</th>
                  <th className="pb-3 px-3">Source</th>
                  <th className="pb-3 px-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4A]/50 font-mono">
                {logs.map((log) => {
                  const isExpanded = expandedRowId === log.id;
                  const hasMultiline = log.message.includes('\n');
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                        className="hover:bg-[#111B2E]/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-3 text-slate-500">
                          {hasMultiline && (
                            <button className="text-slate-500 group-hover:text-slate-300">
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <SeverityBadge severity={log.severity} />
                        </td>
                        <td className="py-2.5 px-3 text-sky-400/90 whitespace-nowrap max-w-[140px] truncate">
                          {log.source}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">
                          <div className={isExpanded ? '' : 'truncate max-w-2xl'}>
                            {highlightMatch(
                              isExpanded ? log.message : log.message.split('\n')[0],
                              searchQuery
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#0B1220]/70">
                          <td colSpan={5} className="p-4 border-t border-b border-[#1E2D4A]">
                            <div className="space-y-2 font-mono text-xs">
                              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                Full Record Details & Stack Trace:
                              </div>
                              <pre className="p-3 rounded-lg bg-[#0B1220] border border-[#1E2D4A] text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {log.message}
                              </pre>
                              {log.metadata_json && (
                                <div className="text-[11px] text-slate-400 mt-2">
                                  <span className="font-semibold text-slate-300">Metadata: </span>
                                  <code className="text-[#22D3EE]">{log.metadata_json}</code>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#1E2D4A] mt-4 text-xs text-slate-400">
            <div>
              Showing page <span className="font-bold text-slate-200">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-200">{totalPages}</span> ({totalLogsCount.toLocaleString()} total entries)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#111B2E] border border-[#1E2D4A] text-slate-300 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-[#111B2E] border border-[#1E2D4A] text-slate-300 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
