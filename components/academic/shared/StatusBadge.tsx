'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string; label: string }> = {
  completed: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-500/20 dark:border-emerald-500/10', label: 'Completed' },
  in_progress: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-50', border: 'border-amber-500/20 dark:border-amber-500/10', label: 'In Progress' },
  not_started: { bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', border: 'border-slate-500/20 dark:border-slate-500/10', label: 'Not Started' },
  pending: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', border: 'border-amber-500/20 dark:border-amber-500/10', label: 'Pending' },
  submitted: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500', border: 'border-blue-500/20 dark:border-blue-500/10', label: 'Submitted' },
  reviewed: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-500/20 dark:border-emerald-500/10', label: 'Reviewed' },
  late: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', border: 'border-rose-500/20 dark:border-rose-500/10', label: 'Late' },
  active: { bg: 'bg-emerald-500/15 dark:bg-emerald-500/25', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-500/30 dark:border-emerald-500/20', label: 'Active' },
  overdue: { bg: 'bg-rose-500/15 dark:bg-rose-500/25', text: 'text-rose-800 dark:text-rose-300', dot: 'bg-rose-500', border: 'border-rose-500/30 dark:border-rose-500/20', label: 'Overdue' },
};

interface Props {
  status: string;
  className?: string;
}

export const StatusBadge = React.memo(function StatusBadge({ status, className }: Props) {
  const normalizedStatus = (status || 'pending').toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.pending;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border',
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      <div className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </div>
  );
});
