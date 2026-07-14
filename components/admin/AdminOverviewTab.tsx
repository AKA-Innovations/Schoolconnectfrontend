'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { School, Users, GraduationCap, Settings2, Download, ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
interface OverviewTabProps {
  summary: any;
  isLoading: boolean;
  actions: { label: string; icon: LucideIcon; onClick: () => void }[];
}

export function AdminOverviewTab({ summary, isLoading, actions }: OverviewTabProps) {
  const totalStudents = summary?.school?.totalStudents || 0;
  const totalTeachers = summary?.school?.totalTeachers || 0;
  const ratio = totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0;
  
  const facultyLoadValue = ratio > 0 ? `1:${ratio}` : '—';
  const facultyLoadStatus = ratio === 0 ? 'N/A' : ratio <= 15 ? 'Excellent' : ratio <= 25 ? 'Optimal' : 'High';
  const facultyLoadProgress = ratio > 0 ? Math.min(100, Math.max(20, (ratio / 35) * 100)) : 0;
  const facultyLoadStatusColor = ratio === 0 ? 'text-muted-foreground' : ratio <= 25 ? 'text-success' : 'text-destructive';

  const parsedAttendanceRate = 94;

  const metrics = [
    { 
      label: 'Faculty Load', 
      value: facultyLoadValue, 
      status: facultyLoadStatus, 
      progress: facultyLoadProgress,
      statusColor: facultyLoadStatusColor 
    },
    { 
      label: 'Daily Attendance', 
      value: `${parsedAttendanceRate}%`, 
      status: parsedAttendanceRate >= 90 ? 'Healthy' : parsedAttendanceRate >= 80 ? 'Optimal' : 'Needs Attention', 
      progress: parsedAttendanceRate,
      statusColor: parsedAttendanceRate >= 90 ? 'text-success' : parsedAttendanceRate >= 80 ? 'text-warning' : 'text-destructive' 
    },
  ];

  return (
    <div className="space-y-8">
      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* School profile card */}
        <div className="lg:col-span-8">
          <div className="erp-card p-4 bg-card">
            <div className="flex flex-row items-start justify-between mb-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <School size={14} /> School Profile
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {isLoading ? 'Loading...' : summary?.school.name}
                </h2>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg border-border text-xs font-bold px-4">
                <Download size={14} className="mr-2" /> Report
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Active Students', value: summary?.school.totalStudents, icon: GraduationCap, color: 'text-blue-600' },
                { label: 'Faculty Members', value: summary?.school.totalTeachers, icon: Users, color: 'text-indigo-600' },
                { label: 'Total Classrooms', value: summary?.school.totalClasses, icon: School, color: 'text-teal-600' },
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-xl border border-border bg-background/30 hover:bg-card hover:border-primary/20 transition-all group">
                  <item.icon className={cn('mb-4', item.color)} size={20} />
                  <div className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{item.value ?? '0'}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold text-primary">
                  {summary?.school.principal?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Principal</p>
                  <p className="text-sm font-semibold text-foreground">{summary?.school.principal}</p>
                </div>
              </div>
              <Button variant="link" className="text-primary font-bold text-sm">
                View Management Details <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Control Panel</p>
            <QuickActions actions={actions} />
          </div>

          <div className="erp-card p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-primary" />
                <span className="text-sm font-bold text-foreground uppercase tracking-tight">System Health</span>
              </div>
            </div>
            <div className="space-y-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                    <span className="text-sm font-bold text-foreground">{metric.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${metric.progress}%` }} 
                    />
                  </div>
                  <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-wide", metric.statusColor)}>
                    {metric.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
