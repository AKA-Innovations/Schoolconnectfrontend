'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-600', label: 'Completed' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'In Progress' },
  not_started: { bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Not Started' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Pending' },
  submitted: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-600', label: 'Submitted' },
  reviewed: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-600', label: 'Reviewed' },
  late: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', label: 'Late' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-600', label: 'Active' },
  overdue: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', label: 'Overdue' },
};

interface Props {
  status: string;
  className?: string;
}

export const StatusBadge = React.memo(function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.pending;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter',
        config.bg,
        config.text,
        className,
      )}
    >
      <div className={cn('h-1 w-1 rounded-full', config.dot)} />
      {config.label}
    </div>
  );
});
