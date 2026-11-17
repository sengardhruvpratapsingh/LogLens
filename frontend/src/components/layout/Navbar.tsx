import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Activity, UploadCloud, History, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Eye },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Analyze', path: '/analyze', icon: UploadCloud },
    { name: 'History', path: '/history', icon: History },
    { name: 'Documentation', path: '/documentation', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2D4A] bg-[#0B1220]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#172337] to-[#111B2E] border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE] shadow-lg shadow-cyan-500/10 group-hover:border-[#22D3EE] transition-all">
            <Eye className="w-5 h-5 text-[#22D3EE] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-[#22D3EE] bg-clip-text text-transparent">
              LogLens
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1 tracking-wider uppercase">
              Observability
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#172337] text-[#22D3EE] border border-[#22D3EE]/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-[#22D3EE]' : 'text-slate-500')} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Launch Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Launch Analyzer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
