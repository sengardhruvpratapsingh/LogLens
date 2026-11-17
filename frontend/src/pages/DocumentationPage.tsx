import React from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  ShieldAlert,
  Download,
  Terminal,
  Database,
  Search,
  CheckCircle2,
  FileCode,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172337] border border-[#22D3EE]/30 text-xs font-semibold text-[#22D3EE] mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Technical Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          LogLens Documentation & Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Comprehensive reference guide detailing LogLens parsing algorithms, regex tokens, deterministic error normalization, security controls, and REST API endpoints.
        </p>
      </div>

      {/* 1. ABOUT & PURPOSE */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <FileCode className="w-5 h-5 text-[#22D3EE]" />
          1. About LogLens & Purpose
        </h2>
        <Card className="space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">LogLens</strong> is an intelligent developer diagnostics and log observability platform designed to solve a ubiquitous engineering pain point: inspecting tens of thousands of unstructured, messy log entries during an incident or debugging session.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            By combining deterministic pattern normalization, multiline stack trace accumulation, and severity categorization into a self-hosted, lightweight package, LogLens turns unstructured log dumps into actionable engineering insight with zero paid cloud APIs, zero account requirements, and zero third-party data transmission.
          </p>
        </Card>
      </section>

      {/* 2. SUPPORTED FORMATS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <Layers className="w-5 h-5 text-sky-400" />
          2. Supported Formats & Parsing Engine
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-2">Python Standard Logs</h3>
            <p className="text-xs text-slate-400 mb-3">
              Standard Python logging library formatting. Accurately groups multi-line exception tracebacks into the originating error log line.
            </p>
            <pre className="p-3 bg-[#0B1220] border border-[#1E2D4A] rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
              2026-11-17 08:00:12 [INFO] app.main: Starting...
            </pre>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-2">Server Logs (Nginx/Apache)</h3>
            <p className="text-xs text-slate-400 mb-3">
              Combined access logs and standard error logs. Maps HTTP 5xx codes to ERROR, 4xx to WARNING, and 2xx/3xx to INFO.
            </p>
            <pre className="p-3 bg-[#0B1220] border border-[#1E2D4A] rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
              192.168.1.10 - - [17/Nov/2026:08:00:10] "GET /" 200
            </pre>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-2">Structured JSON Lines (JSONL)</h3>
            <p className="text-xs text-slate-400 mb-3">
              Modern containerized cloud logs. Dynamically extracts timestamp, severity level, message, and preserves attributes in metadata.
            </p>
            <pre className="p-3 bg-[#0B1220] border border-[#1E2D4A] rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
              &#123;"timestamp":"...","level":"ERROR","message":"..."&#125;
            </pre>
          </Card>
        </div>
      </section>

      {/* 3. SEVERITY CLASSIFICATION */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          3. Severity Classification Methodology
        </h2>
        <Card className="p-6">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Severity classification uses strict normalized mapping. To prevent false positives, messages containing words like &ldquo;error&rdquo; as part of an ordinary sentence (e.g. <em>&ldquo;0 errors found during scan&rdquo;</em>) are not categorized as errors unless explicit bracketed or prefixed level markers are present.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity="CRITICAL" />
              </div>
              <span className="text-[11px] text-slate-400">CRITICAL, FATAL, ALERT, EMERGENCY, PANIC</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity="ERROR" />
              </div>
              <span className="text-[11px] text-slate-400">ERROR, EXCEPTION, FAILED, FAILURE, ERR</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity="WARNING" />
              </div>
              <span className="text-[11px] text-slate-400">WARNING, WARN</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity="INFO" />
              </div>
              <span className="text-[11px] text-slate-400">INFO, INFORMATION, NOTICE</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity="DEBUG" />
              </div>
              <span className="text-[11px] text-slate-400">DEBUG, TRACE, VERBOSE</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111B2E] border border-[#1E2D4A]">
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity="UNKNOWN" />
              </div>
              <span className="text-[11px] text-slate-400">Generic lines without explicit tokens</span>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. ERROR PATTERN DETECTION */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          4. Error Pattern Detection & Dynamic Variable Normalization
        </h2>
        <Card className="p-6 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Real production errors frequently include dynamic variables like timestamps, client IP addresses, UUIDs, or record IDs. LogLens normalizes these dynamic tokens into canonical placeholders so that 1,000 instances of the same error are grouped into a single actionable pattern:
          </p>

          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1E2D4A] font-mono text-xs space-y-2">
            <div className="text-rose-400">
              - Raw 1: "Gateway timeout from Stripe: request_id=req_9a8fbc12 at 192.168.1.10"
            </div>
            <div className="text-rose-400">
              - Raw 2: "Gateway timeout from Stripe: request_id=req_4f7e21a8 at 192.168.1.88"
            </div>
            <div className="text-emerald-400 font-bold pt-2 border-t border-[#1E2D4A]">
              → Normalized Pattern: "Gateway timeout from Stripe: request_id=&lt;ID&gt; at &lt;IP&gt;"
            </div>
            <div className="text-slate-400 text-[11px]">
              Output: Frequency: 2x | First Occurrence | Last Occurrence
            </div>
          </div>
        </Card>
      </section>

      {/* 5. PRIVACY & SECURITY */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          5. Privacy, Security & Secret Redaction
        </h2>
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Automatic Secret Redaction Engine</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Before log messages are displayed or exported, LogLens runs redaction filters targeting common security risks:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-mono">
            <li>HTTP Bearer Tokens (JWTs) → <code className="text-[#22D3EE]">[REDACTED_BEARER_TOKEN]</code></li>
            <li>Basic Auth credentials in URIs → <code className="text-[#22D3EE]">[REDACTED_PASSWORD]</code></li>
            <li>Assigned API keys and private tokens → <code className="text-[#22D3EE]">[REDACTED_CREDENTIAL]</code></li>
            <li>AWS Access Keys (AKIA...) → <code className="text-[#22D3EE]">[REDACTED_AWS_KEY]</code></li>
          </ul>
          <p className="text-xs text-amber-400/90 pt-2 border-t border-[#1E2D4A]">
            <strong>Notice:</strong> While secret redaction covers common credentials, users should ensure highly sensitive production keys or PII are handled in compliance with organizational policies.
          </p>
        </Card>
      </section>

      {/* 6. REST API REFERENCE */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <Terminal className="w-5 h-5 text-[#22D3EE]" />
          6. REST API Endpoints
        </h2>
        <div className="space-y-2">
          {[
            { method: 'GET', path: '/api/health', desc: 'Backend health check probe and version' },
            { method: 'POST', path: '/api/analyze', desc: 'Upload and parse multipart file (max 10MB)' },
            { method: 'POST', path: '/api/analyze/sample/{id}', desc: 'Run analysis on bundled sample dataset' },
            { method: 'GET', path: '/api/samples', desc: 'List available demonstration sample log files' },
            { method: 'GET', path: '/api/analyses', desc: 'Paginated analysis history with search' },
            { method: 'GET', path: '/api/analyses/{id}', desc: 'Analysis summary, severity stats & timeline' },
            { method: 'GET', path: '/api/analyses/{id}/logs', desc: 'Paginated log entries with filters & search' },
            { method: 'GET', path: '/api/analyses/{id}/patterns', desc: 'Recurring error patterns' },
            { method: 'GET', path: '/api/analyses/{id}/export/csv', desc: 'Download CSV log records' },
            { method: 'GET', path: '/api/analyses/{id}/export/json', desc: 'Download structured JSON report' },
            { method: 'GET', path: '/api/analyses/{id}/export/txt', desc: 'Download human-readable diagnostic report' },
            { method: 'DELETE', path: '/api/analyses/{id}', desc: 'Delete analysis and cascade-delete dependent records' },
          ].map((ep) => (
            <div
              key={ep.path + ep.method}
              className="p-3.5 rounded-lg bg-[#111B2E] border border-[#1E2D4A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    ep.method === 'GET'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : ep.method === 'POST'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-slate-200">{ep.path}</span>
              </div>
              <span className="text-slate-400 font-sans text-xs">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. KNOWN LIMITATIONS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-[#1E2D4A] pb-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          7. Known Limitations
        </h2>
        <Card className="p-6 text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            • Maximum uploaded file size is configured to 10 MB per file to ensure responsive in-memory parsing without memory thrashing.
          </p>
          <p>
            • Ephemeral cloud hosting (such as free serverless instances) may reset local SQLite storage upon container sleep or redeploy. Persistent volume disks or PostgreSQL should be configured for permanent multi-instance storage in production.
          </p>
        </Card>
      </section>
    </div>
  );
};
