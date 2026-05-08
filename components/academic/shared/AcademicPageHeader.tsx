'use client';

import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';

interface Props {
  badge: string;
  title: string;
  titleAccent: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export const AcademicPageHeader = React.memo(function AcademicPageHeader({
  badge,
  title,
  titleAccent,
  children,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{badge}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900/80">
          {title} <span className="text-slate-400 font-light">{titleAccent}</span>
        </h1>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
});
