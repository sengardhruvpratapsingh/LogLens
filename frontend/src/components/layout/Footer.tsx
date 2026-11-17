import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Github, FileCode, CheckCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1E2D4A] bg-[#0B1220] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#172337] border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <Eye className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-100">LogLens</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Intelligent Log Analysis & Monitoring Platform. Converts raw, unstructured system logs into actionable diagnostic clarity.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero cloud tokens • Safe in-memory parsing</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Workspace</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link to="/dashboard" className="hover:text-[#22D3EE] transition-colors">Main Dashboard</Link>
            </li>
            <li>
              <Link to="/analyze" className="hover:text-[#22D3EE] transition-colors">Log File Analyzer</Link>
            </li>
            <li>
              <Link to="/history" className="hover:text-[#22D3EE] transition-colors">Analysis History</Link>
            </li>
            <li>
              <Link to="/documentation" className="hover:text-[#22D3EE] transition-colors">Technical Docs</Link>
            </li>
          </ul>
        </div>

        {/* Supported Formats */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Supported Formats</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-[#172337] border border-[#1E2D4A] text-[#22D3EE]">
              .LOG
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-[#172337] border border-[#1E2D4A] text-sky-400">
              .TXT
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-[#172337] border border-[#1E2D4A] text-purple-400">
              .JSONL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            Standard Python logging, Apache & Nginx access/error logs, structured JSONL, and generic timestamped records.
          </p>
        </div>

        {/* Technology & Architecture */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Engine & Stack</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Built on FastAPI, React, TypeScript, Tailwind CSS, Recharts, and SQLite with SQLAlchemy ORM.
          </p>
          <a
            href="https://github.com/placeholder/loglens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#22D3EE] hover:underline"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository Placeholder</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1E2D4A] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© {new Date().getFullYear()} LogLens Platform. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-[#22D3EE]" /> Designed for developer diagnostic observability
        </p>
      </div>
    </footer>
  );
};
