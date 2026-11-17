import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#1E2D4A] rounded-xl bg-[#111B2E]/50',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#172337] border border-[#1E2D4A] flex items-center justify-center text-[#22D3EE] mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] text-[#0B1220] font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/10 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
