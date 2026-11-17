import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  FileText,
  UploadCloud,
  History,
  BookOpen,
  ArrowRight,
  TrendingUp,
  PieChart as PieChartIcon,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { DashboardOverview } from '../types';
import { Card } from '../components/common/Card';
import { KPICardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { formatDate, formatFileSize } from '../utils/formatters';

const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  DEBUG: '#8B5CF6',
  UNKNOWN: '#64748B',
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-800 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="p-6 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchOverview}
            className="px-4 py-1.5 rounded-lg bg-red-800/60 text-white font-medium text-xs hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !data || data.total_analyses === 0;

  // Pie chart data
  const pieData = data
    ? [
        { name: 'Critical', value: data.total_criticals, color: SEVERITY_COLORS.CRITICAL },
        { name: 'Error', value: data.total_errors, color: SEVERITY_COLORS.ERROR },
        { name: 'Warning', value: data.total_warnings, color: SEVERITY_COLORS.WARNING },
        { name: 'Info', value: data.total_info, color: SEVERITY_COLORS.INFO },
        { name: 'Debug', value: data.total_debug, color: SEVERITY_COLORS.DEBUG },
        { name: 'Unknown', value: data.total_unknown, color: SEVERITY_COLORS.UNKNOWN },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Main Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time aggregate diagnostics and telemetry from all processed log files.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Log</span>
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Activity}
          title="No Log Analyses Recorded Yet"
          description="LogLens computes real analytics from uploaded log files. Upload your first application log file or test with sample datasets."
          actionText="Upload Log File Now"
          onAction={() => (window.location.href = '/analyze')}
        />
      ) : (
        <>
          {/* KPI CARDS (Computed from real saved application data) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Analyses</span>
                <Layers className="w-4 h-4 text-[#22D3EE]" />
              </div>
              <div className="text-3xl font-extrabold text-slate-100 font-mono">
                {data.total_analyses.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Saved in local database</span>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-slate-100 font-mono">
                {data.total_logs.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Indexed log lines</span>
            </Card>

            <Card className="p-5 border-rose-900/30">
              <div className="flex items-center justify-between text-rose-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Errors</span>
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-extrabold text-rose-400 font-mono">
                {data.total_errors.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {data.total_logs > 0
                  ? `${((data.total_errors / data.total_logs) * 100).toFixed(1)}% error rate`
                  : '0%'}
              </span>
            </Card>

            <Card className="p-5 border-amber-900/30">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Warnings</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                {data.total_warnings.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Potential risks flagged</span>
            </Card>

            <Card className="p-5 border-red-900/40">
              <div className="flex items-center justify-between text-red-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Critical Events</span>
                <Activity className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-extrabold text-red-400 font-mono">
                {data.total_criticals.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Severe outages & panics</span>
            </Card>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution Donut */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#22D3EE]" />
                  <h3 className="font-bold text-slate-100 text-base">Severity Distribution</h3>
                </div>
                <span className="text-xs text-slate-400">All saved records</span>
              </div>
              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                  No severity entries to plot
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
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
              )}
            </Card>

            {/* Top Error Patterns Bar Chart */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-slate-100 text-base">Top Recurring Error Patterns</h3>
                </div>
                <span className="text-xs text-slate-400">By frequency</span>
              </div>
              {data.top_patterns.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                  No recurring error patterns detected
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.top_patterns.map((p) => ({
                        pattern: p.pattern.length > 25 ? p.pattern.slice(0, 25) + '...' : p.pattern,
                        count: p.count,
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                      <XAxis dataKey="pattern" stroke="#94A3B8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111B2E',
                          borderColor: '#1E2D4A',
                          borderRadius: '8px',
                          color: '#F1F5F9',
                        }}
                      />
                      <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Recent File Analyses</h3>
                <p className="text-xs text-slate-400 mt-0.5">Most recent application log files processed</p>
              </div>
              <Link
                to="/history"
                className="text-xs text-[#22D3EE] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1E2D4A] text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">File Name</th>
                    <th className="pb-3 px-3">Format</th>
                    <th className="pb-3 px-3">Records</th>
                    <th className="pb-3 px-3">Errors</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Processed</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D4A]/60">
                  {data.recent_analyses.map((a) => (
                    <tr key={a.id} className="hover:bg-[#111B2E]/60 transition-colors">
                      <td className="py-3.5 px-3 font-medium text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#22D3EE]" />
                        <span className="truncate max-w-[200px]" title={a.filename}>
                          {a.filename}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 text-xs font-mono rounded bg-[#0B1220] border border-[#1E2D4A] text-slate-300 uppercase">
                          {a.detected_format}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono text-xs">
                        {a.total_records.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs">
                        <span
                          className={
                            a.error_count > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                          }
                        >
                          {a.error_count.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 text-xs">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          to={`/analysis/${a.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#1E2D4A] hover:bg-[#22D3EE] text-slate-200 hover:text-[#0B1220] font-semibold text-xs rounded-md transition-colors"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* QUICK ACTIONS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/analyze"
              className="p-5 rounded-xl bg-[#172337] border border-[#1E2D4A] hover:border-[#22D3EE]/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-lg bg-[#0B1220] text-[#22D3EE]">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm group-hover:text-[#22D3EE] transition-colors">
                    Upload New Log
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Parse .log, .txt, or .jsonl files</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#22D3EE] transition-colors" />
            </Link>

            <Link
              to="/history"
              className="p-5 rounded-xl bg-[#172337] border border-[#1E2D4A] hover:border-[#22D3EE]/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-lg bg-[#0B1220] text-sky-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm group-hover:text-sky-400 transition-colors">
                    Analysis History
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Browse and manage past reports</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </Link>

            <Link
              to="/documentation"
              className="p-5 rounded-xl bg-[#172337] border border-[#1E2D4A] hover:border-[#22D3EE]/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-lg bg-[#0B1220] text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm group-hover:text-purple-400 transition-colors">
                    Technical Docs
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Engine specs, regex & API</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
