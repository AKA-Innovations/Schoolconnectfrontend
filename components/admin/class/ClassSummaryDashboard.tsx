'use client';

import React from 'react';
import { useClassSummary } from '@/hooks/useClasses';
import { BookOpen, Layers, GraduationCap, TrendingUp } from 'lucide-react';

const STAT_CONFIG = [
  {
    key: 'totalClasses',
    label: 'Grade Levels',
    sublabel: 'Active class groups',
    icon: BookOpen,
    accent: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600',
    trend: '+2 this year',
  },
  {
    key: 'totalSections',
    label: 'Total Sections',
    sublabel: 'Across all grades',
    icon: Layers,
    accent: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600',
    trend: 'All active',
  },
  {
    key: 'totalClassTeachersAssigned',
    label: 'Teachers Mapped',
    sublabel: 'Class assignments',
    icon: GraduationCap,
    accent: '#8b5cf6',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-600',
    trend: 'Fully staffed',
  },
];

export function ClassSummaryDashboard() {
  const { data, isLoading } = useClassSummary();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {STAT_CONFIG.map((stat, i) => {
        const Icon = stat.icon;
        const value = isLoading ? null : (data as any)?.[stat.key] ?? 0;
        return (
          <div
            key={stat.key}
            className="relative rounded-2xl border border-border bg-card overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: stat.accent }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-9 w-16 bg-muted rounded-lg animate-pulse" />
                ) : (
                  <p className="text-4xl font-black tracking-tight text-foreground">{value}</p>
                )}
                <p className="text-sm font-semibold text-foreground/80">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
