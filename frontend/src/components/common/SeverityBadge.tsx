import React from 'react';
import { SeverityLevel } from '../../types';
import { getSeverityBadgeConfig } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className,
  showDot = true,
}) => {
  const config = getSeverityBadgeConfig(severity);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full animate-pulse', config.dot)}
        />
      )}
      {severity}
    </span>
  );
};
