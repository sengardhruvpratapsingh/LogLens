import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  UploadCloud,
  Layers,
  Cpu,
  BarChart3,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden border-b border-[#1E2D4A]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2D4A15_1px,transparent_1px),linear-gradient(to_bottom,#1E2D4A15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#172337] border border-[#22D3EE]/30 text-xs font-semibold text-[#22D3EE] mb-6 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Intelligent Log Analysis & Monitoring Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1] mb-6">
            Turn Raw Logs Into{' '}
            <span className="bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-cyan-300 bg-clip-text text-transparent">
              Actionable Insights.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Analyze application logs, detect recurring errors, and understand system behavior through a powerful, intuitive analytics workspace.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/analyze"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-bold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Analyzing</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#172337] border border-[#1E2D4A] text-slate-200 font-semibold text-base hover:bg-[#1D2D47] hover:border-slate-600 transition-all cursor-pointer"
            >
              Explore Features
            </a>
          </div>

          {/* PRODUCT PREVIEW DASHBOARD MOCKUP */}
          <div className="relative max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-[#1E2D4A] via-[#172337] to-[#0B1220] shadow-2xl shadow-cyan-950/40 border border-[#22D3EE]/20">
            <div className="bg-[#111B2E] rounded-xl overflow-hidden border border-[#1E2D4A] text-left">
              {/* Window controls bar */}
              <div className="px-4 py-3 bg-[#0B1220] border-b border-[#1E2D4A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">production-cluster.log — LogLens Workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Analysis Ready
                </div>
              </div>

              {/* Mock telemetry cards */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#1E2D4A]">
                <div className="p-4 rounded-lg bg-[#172337] border border-[#1E2D4A]">
                  <span className="text-xs text-slate-400">Total Entries</span>
                  <div className="text-2xl font-bold text-slate-100 font-mono mt-1">14,250</div>
                </div>
                <div className="p-4 rounded-lg bg-[#172337] border border-[#1E2D4A]">
                  <span className="text-xs text-rose-400">Error Events</span>
                  <div className="text-2xl font-bold text-rose-400 font-mono mt-1">182</div>
                </div>
                <div className="p-4 rounded-lg bg-[#172337] border border-[#1E2D4A]">
                  <span className="text-xs text-amber-400">Warnings</span>
                  <div className="text-2xl font-bold text-amber-400 font-mono mt-1">340</div>
                </div>
                <div className="p-4 rounded-lg bg-[#172337] border border-[#1E2D4A]">
                  <span className="text-xs text-cyan-400">Unique Patterns</span>
                  <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">12</div>
                </div>
              </div>

              {/* Mock recurring errors preview */}
              <div className="p-6 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Top Normalized Recurring Patterns (Demonstration)
                </div>
                <div className="p-3.5 rounded-lg bg-[#172337]/90 border border-rose-900/40 flex items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity="ERROR" />
                    <span className="text-slate-200">Database connection pool exhausted: timeout on &lt;IP&gt;</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                    68 occurrences
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#172337]/90 border border-amber-900/40 flex items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity="WARNING" />
                    <span className="text-slate-200">Disk I/O latency spiked above &lt;NUM&gt;ms threshold</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                    34 occurrences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-[#0B1220] border-b border-[#1E2D4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-[#22D3EE] tracking-widest uppercase mb-2">Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-100 sm:text-4xl">How LogLens Operates</p>
            <p className="text-sm text-slate-400 mt-3">From raw text files to actionable diagnostic clarity in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Upload Logs',
                desc: 'Drag & drop .log, .txt, or .jsonl files up to 10MB, or load pre-bundled system samples.',
                icon: UploadCloud,
              },
              {
                step: '02',
                title: 'Parse & Normalize',
                desc: 'Automatic format detection extracts timestamps, severities, sources, and multiline stack traces.',
                icon: Cpu,
              },
              {
                step: '03',
                title: 'Detect Patterns',
                desc: 'Deterministic pattern engine replaces dynamic UUIDs and IPs to rank recurring errors.',
                icon: Layers,
              },
              {
                step: '04',
                title: 'Explore & Export',
                desc: 'Search, filter, inspect full stack traces, and export reports in CSV, JSON, or readable TXT.',
                icon: Download,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="relative overflow-hidden group hover:border-[#22D3EE]/50 transition-all">
                  <div className="text-4xl font-extrabold text-[#1E2D4A] group-hover:text-[#22D3EE]/20 transition-colors font-mono mb-4">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#111B2E] border border-[#1E2D4A] flex items-center justify-center text-[#22D3EE] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-[#111B2E]/50 border-b border-[#1E2D4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-[#22D3EE] tracking-widest uppercase mb-2">Capabilities</h2>
            <p className="text-3xl font-extrabold text-slate-100 sm:text-4xl">Engineered for Developer Productivity</p>
            <p className="text-sm text-slate-400 mt-3">Everything you need to triage system errors without external dependencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Intelligent Log Parsing',
                desc: 'Understands Python logger formats, Apache/Nginx access and error formats, and structured JSON lines with graceful generic fallback.',
                icon: Layers,
              },
              {
                title: 'Error Pattern Detection',
                desc: 'Normalizes dynamic tokens (UUIDs, IP addresses, memory hex, request IDs) to group repeated failure spikes together.',
                icon: AlertCircle,
              },
              {
                title: 'Severity Classification',
                desc: 'Strictly classifies CRITICAL, ERROR, WARNING, INFO, DEBUG, and UNKNOWN without false positives from informational text.',
                icon: CheckCircle2,
              },
              {
                title: 'Interactive Analytics',
                desc: 'Visualizes event frequency over time buckets, severity distribution donuts, and top error category breakdowns.',
                icon: BarChart3,
              },
              {
                title: 'Log Explorer & Search',
                desc: 'Real-time keyword search, severity filtering, timestamp sorting, and expandable multiline stack trace inspection.',
                icon: Search,
              },
              {
                title: 'Multi-Format Export',
                desc: 'Export parsed datasets into standardized CSV, structured machine-readable JSON, or clean diagnostic TXT reports.',
                icon: Download,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} hoverEffect>
                  <div className="w-12 h-12 rounded-xl bg-[#0B1220] border border-[#1E2D4A] flex items-center justify-center text-[#22D3EE] mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUPPORTED FORMATS */}
      <section className="py-20 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-[#22D3EE] tracking-widest uppercase mb-2">Compatibility</h2>
            <p className="text-3xl font-extrabold text-slate-100 sm:text-4xl">Supported File Formats</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-t-2 border-t-[#22D3EE]">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-[#0B1220] text-[#22D3EE] border border-[#1E2D4A]">
                  .LOG
                </span>
                <h4 className="font-bold text-slate-100">Standard Application Logs</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Python logging, log4j, syslog, and server access/error files with timestamp, level, source, and multiline exception stack traces.
              </p>
              <pre className="p-3 rounded-lg bg-[#0B1220] border border-[#1E2D4A] text-[11px] font-mono text-slate-300 overflow-x-auto">
                2026-11-17 10:30:00 [ERROR] app.db: Connection timeout
              </pre>
            </Card>

            <Card className="border-t-2 border-t-sky-400">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-[#0B1220] text-sky-400 border border-[#1E2D4A]">
                  .TXT
                </span>
                <h4 className="font-bold text-slate-100">Plaintext Output & Dumps</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Raw terminal dumps, container logs (Docker/Kubernetes), and diagnostic outputs with timestamp detection and severity parsing.
              </p>
              <pre className="p-3 rounded-lg bg-[#0B1220] border border-[#1E2D4A] text-[11px] font-mono text-slate-300 overflow-x-auto">
                [WARN] 192.168.1.99 Access forbidden by rule
              </pre>
            </Card>

            <Card className="border-t-2 border-t-purple-400">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-[#0B1220] text-purple-400 border border-[#1E2D4A]">
                  .JSONL
                </span>
                <h4 className="font-bold text-slate-100">Structured JSON Lines</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Modern microservices structured JSON logs. Extracts timestamp, severity level, message, source, and preserves custom metadata.
              </p>
              <pre className="p-3 rounded-lg bg-[#0B1220] border border-[#1E2D4A] text-[11px] font-mono text-slate-300 overflow-x-auto">
                &#123;"level":"ERROR","message":"Gateway 502"&#125;
              </pre>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-bold text-base shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Upload Your Log File</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
