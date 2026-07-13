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
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
    trend: '+2 this year',
  },
  {
    key: 'totalSections',
    label: 'Total Sections',
    sublabel: 'Across all grades',
    icon: Layers,
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
    trend: 'All active',
  },
  {
    key: 'totalClassTeachersAssigned',
    label: 'Teachers Mapped',
    sublabel: 'Class assignments',
    icon: GraduationCap,
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
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
