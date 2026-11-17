import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  FileText,
  AlertOctagon,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisSummary, PaginatedResponse } from '../types';
import { Card } from '../components/common/Card';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast, ToastType } from '../components/common/Toast';
import { formatDate, formatFileSize } from '../utils/formatters';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AnalysisSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res: PaginatedResponse<AnalysisSummary> = await api.getAnalyses(
        page,
        10,
        searchQuery
      );
      setAnalyses(res.items);
      setTotalPages(res.total_pages);
      setTotalCount(res.total);
    } catch {
      // Offline or error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnalyses();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.deleteAnalysis(deleteTarget.id);
      setToast({
        isOpen: true,
        message: `Analysis for '${deleteTarget.filename}' deleted successfully.`,
        type: 'success',
      });
      setDeleteTarget(null);
      fetchAnalyses();
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || 'Failed to delete analysis record.',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Delete Analysis Record?"
        message={`This will permanently remove the analysis for '${deleteTarget?.filename}' and cascade-delete all associated indexed log lines and error patterns.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Analysis History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Persisted diagnostic telemetry and previous log parsing sessions.
          </p>
        </div>

        <Link
          to="/analyze"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>New Upload</span>
        </Link>
      </div>

      <Card>
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <form onSubmit={handleSearch} className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0B1220] border border-[#1E2D4A] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]"
            />
          </form>

          <div className="text-xs text-slate-400">
            Total records saved:{' '}
            <span className="font-bold text-slate-200">{totalCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <TableSkeleton rows={6} />
        ) : analyses.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title={searchQuery ? 'No matching analyses found' : 'No Analysis History Yet'}
            description={
              searchQuery
                ? `No past log files matched '${searchQuery}'. Try another query.`
                : 'Analyses you create will appear here and persist across sessions.'
            }
            actionText={searchQuery ? 'Clear Search' : 'Analyze First Log'}
            onAction={
              searchQuery
                ? () => {
                    setSearchQuery('');
                    setPage(1);
                    fetchAnalyses();
                  }
                : () => (window.location.href = '/analyze')
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1E2D4A] text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">File Name</th>
                  <th className="pb-3 px-3">Format</th>
                  <th className="pb-3 px-3">Date Processed</th>
                  <th className="pb-3 px-3">Total Lines</th>
                  <th className="pb-3 px-3">Errors</th>
                  <th className="pb-3 px-3">Warnings</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4A]/60">
                {analyses.map((item) => (
                  <tr key={item.id} className="hover:bg-[#111B2E]/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#22D3EE] shrink-0" />
                        <div>
                          <Link
                            to={`/analysis/${item.id}`}
                            className="font-semibold text-slate-200 hover:text-[#22D3EE] transition-colors line-clamp-1"
                            title={item.filename}
                          >
                            {item.filename}
                          </Link>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {formatFileSize(item.file_size)} • {item.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-[#0B1220] border border-[#1E2D4A] text-slate-300 uppercase">
                        {item.detected_format}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-xs text-slate-300">
                      {item.total_records.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-xs">
                      <span
                        className={
                          item.error_count > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                        }
                      >
                        {item.error_count.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-xs">
                      <span
                        className={
                          item.warning_count > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'
                        }
                      >
                        {item.warning_count.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/analysis/${item.id}`}
                          className="px-2.5 py-1 rounded bg-[#1E2D4A] hover:bg-[#22D3EE] text-slate-200 hover:text-[#0B1220] font-semibold text-xs transition-colors"
                        >
                          Open
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Analysis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#1E2D4A] mt-4 text-xs text-slate-400">
            <div>
              Page <span className="font-bold text-slate-200">{page}</span> of{' '}
              <span className="font-bold text-slate-200">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-[#111B2E] border border-[#1E2D4A] text-slate-300 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono text-slate-200">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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
