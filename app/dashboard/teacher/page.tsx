'use client';

import React from 'react';
import { useTeacherDashboard } from '../../../hooks/useTeacherDashboard';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';
import { ClipboardCheck, FilePlus, PenTool, RefreshCw } from 'lucide-react';

export default function TeacherDashboard() {
  const { data: summary, isLoading, refetch } = useTeacherDashboard();

  const actions = [
    { label: 'Mark Attendance', icon: ClipboardCheck, onClick: () => {}, variant: 'default' as const },
    { label: 'Upload Assignment', icon: FilePlus, onClick: () => {} },
    { label: 'Enter Grades', icon: PenTool, onClick: () => {} },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your classes and students</p>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm text-sm font-semibold hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            Refresh
          </button>
        </div>
      </div>

      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Schedule Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="ml-6 h-20 bg-gray-100 rounded animate-pulse" />)
              ) : (
                summary?.classes.map((cls, idx) => (
                  <div key={cls.id} className="relative ml-6">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white" />
                    <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-amber-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-accent uppercase mb-1">{cls.time}</p>
                          <h4 className="text-lg font-bold text-foreground">{cls.name}</h4>
                          <p className="text-sm text-muted-foreground">{cls.room}</p>
                        </div>
                        <button className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-bold">START CLASS</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <QuickActions actions={actions} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grading Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/10">
                  <span className="text-sm font-medium">Math Mid-term</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">12 Left</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md border border-border">
                  <span className="text-sm font-medium">Algebra Quiz 2</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
