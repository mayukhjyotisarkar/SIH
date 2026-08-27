import React from 'react';
import { AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AbnormalBadgeProps {
  flag?: 'NORMAL' | 'HIGH' | 'LOW' | string | null;
  label?: string;
  className?: string;
}

export const AbnormalBadge: React.FC<AbnormalBadgeProps> = ({
  flag,
  label,
  className = '',
}) => {
  if (!flag || flag === 'NORMAL') return null;

  const isHigh = flag === 'HIGH' || flag.includes('HIGH') || flag.includes('High');
  const isLow = flag === 'LOW' || flag.includes('LOW') || flag.includes('Low');

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
        isHigh
          ? 'bg-rose-100 text-rose-800 border border-rose-300'
          : isLow
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : 'bg-rose-100 text-rose-800 border border-rose-300'
      } ${className}`}
    >
      {isHigh ? (
        <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
      ) : isLow ? (
        <ArrowDownRight className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      )}
      <span>{label || flag}</span>
    </span>
  );
};

