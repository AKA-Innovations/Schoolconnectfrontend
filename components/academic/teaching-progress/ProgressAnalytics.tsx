'use client';

import React, { useMemo } from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TeachingProgress } from '@/services/academic/types';

interface Props { data: TeachingProgress[]; }

export const ProgressAnalytics = React.memo(function ProgressAnalytics({ data }: Props) {
  const stats = useMemo(() => {
    const total = data.length;
    const completed = data.filter((p) => p.status === 'completed').length;
    const inProgress = data.filter((p) => p.status === 'in_progress').length;
    const notStarted = total - completed - inProgress;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, notStarted, percentage };
  }, [data]);

  const kpis = [
    { label: 'Total Topics', value: stats.total, icon: Circle, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Not Started', value: stats.notStarted, icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="rounded-2xl border-none shadow-lg shadow-slate-200/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-11 w-11 rounded-2xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {/* Completion gauge */}
      <Card className="rounded-2xl border-none shadow-lg shadow-slate-200/30">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="relative h-11 w-11">
            <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#0d9488" strokeWidth="3"
                strokeDasharray={`${stats.percentage} ${100 - stats.percentage}`} strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-600">{stats.percentage}%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
