import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  UploadCloud,
  History,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Analyze Logs', path: '/analyze', icon: UploadCloud },
    { name: 'History', path: '/history', icon: History },
    { name: 'Documentation', path: '/documentation', icon: BookOpen },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-[#1E2D4A] bg-[#111B2E]/70 backdrop-blur-sm transition-all duration-300 relative min-h-[calc(100vh-4rem)]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#172337] border border-[#1E2D4A] flex items-center justify-center text-slate-400 hover:text-[#22D3EE] hover:border-[#22D3EE]/50 transition-all z-20 cursor-pointer shadow-md"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Nav List */}
      <div className="p-4 space-y-1.5 flex-1">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 py-2">
          {!collapsed ? 'Diagnostics Workspace' : 'App'}
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-[#172337] text-[#22D3EE] border border-[#22D3EE]/30 shadow-md shadow-cyan-950/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#172337]/50'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Observability Badge */}
      <div className="p-4 border-t border-[#1E2D4A]">
        <div
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#172337]/80 border border-[#1E2D4A]',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Local Engine Active</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> 100% Client-Side Privacy
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
