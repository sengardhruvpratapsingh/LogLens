import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-[#172337] border border-[#1E2D4A] rounded-xl p-6 shadow-lg shadow-black/20',
        hoverEffect && 'transition-all duration-200 hover:border-[#22D3EE]/50 hover:shadow-cyan-950/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
