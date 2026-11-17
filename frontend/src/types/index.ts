export type SeverityLevel = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG' | 'UNKNOWN';

export interface SeverityDistribution {
  critical: number;
  error: number;
  warning: number;
  info: number;
  debug: number;
  unknown: number;
  percentages: Record<string, number>;
}

export interface TimelinePoint {
  timestamp: string;
  total: number;
  error: number;
  warning: number;
  info: number;
  critical: number;
  debug: number;
}

export interface TopErrorCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface ErrorPattern {
  id: number;
  analysis_id: string;
  normalized_message: string;
  original_message: string;
  severity: SeverityLevel;
  occurrence_count: number;
  first_occurrence: string | null;
  last_occurrence: string | null;
}

export interface LogEntry {
  id: number;
  analysis_id: string;
  timestamp: string | null;
  severity: SeverityLevel;
  source: string;
  message: string;
  original_line: string;
  parsed: boolean;
  metadata_json?: string | null;
}

export interface AnalysisSummary {
  id: string;
  filename: string;
  file_hash: string;
  file_size: number;
  detected_format: string;
  created_at: string;
  total_records: number;
  parsed_records: number;
  unparsed_records: number;
  critical_count: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  debug_count: number;
  unknown_count: number;
  error_percentage: number;
  status: string;
  first_timestamp: string | null;
  last_timestamp: string | null;
}

export interface AnalysisDetail extends AnalysisSummary {
  severity_distribution: SeverityDistribution;
  timeline: TimelinePoint[];
  top_patterns: ErrorPattern[];
  top_categories: TopErrorCategory[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: T[];
}

export interface SampleFileItem {
  id: string;
  name: string;
  filename: string;
  format: string;
  description: string;
  size_bytes: number;
}

export interface DashboardOverview {
  total_analyses: number;
  total_logs: number;
  total_errors: number;
  total_warnings: number;
  total_criticals: number;
  total_info: number;
  total_debug: number;
  total_unknown: number;
  recent_analyses: AnalysisSummary[];
  top_patterns: { pattern: string; severity: SeverityLevel; count: number }[];
}
