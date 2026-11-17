import {
  AnalysisDetail,
  AnalysisSummary,
  DashboardOverview,
  ErrorPattern,
  LogEntry,
  PaginatedResponse,
  SampleFileItem,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errorMsg = errData.detail;
      }
    } catch {
      // Non-json error
    }
    throw new ApiError(errorMsg, res.status);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; app_name: string; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getDashboardOverview(): Promise<DashboardOverview> {
    const res = await fetch(`${API_BASE}/analyses/stats/overview`);
    return handleResponse(res);
  },

  async getAnalyses(
    page = 1,
    pageSize = 10,
    search?: string
  ): Promise<PaginatedResponse<AnalysisSummary>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    const res = await fetch(`${API_BASE}/analyses?${params.toString()}`);
    return handleResponse(res);
  },

  async getAnalysisDetail(id: string): Promise<AnalysisDetail> {
    const res = await fetch(`${API_BASE}/analyses/${id}`);
    return handleResponse(res);
  },

  async getAnalysisLogs(
    id: string,
    page = 1,
    pageSize = 50,
    search?: string,
    severity?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<LogEntry>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      sort_order: sortOrder,
    });
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (severity && severity !== 'ALL') {
      params.append('severity', severity);
    }
    const res = await fetch(`${API_BASE}/analyses/${id}/logs?${params.toString()}`);
    return handleResponse(res);
  },

  async getAnalysisPatterns(id: string): Promise<ErrorPattern[]> {
    const res = await fetch(`${API_BASE}/analyses/${id}/patterns`);
    return handleResponse(res);
  },

  async getSampleLogs(): Promise<SampleFileItem[]> {
    const res = await fetch(`${API_BASE}/samples`);
    return handleResponse(res);
  },

  async uploadLogFile(file: File): Promise<AnalysisSummary> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async analyzeSampleLog(sampleId: string): Promise<AnalysisSummary> {
    const res = await fetch(`${API_BASE}/analyze/sample/${sampleId}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async deleteAnalysis(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  getExportCsvUrl(id: string): string {
    return `${API_BASE}/analyses/${id}/export/csv`;
  },

  getExportJsonUrl(id: string): string {
    return `${API_BASE}/analyses/${id}/export/json`;
  },

  getExportTxtUrl(id: string): string {
    return `${API_BASE}/analyses/${id}/export/txt`;
  },
};
