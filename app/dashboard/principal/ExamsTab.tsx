'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the existing admin exam components to reuse them in the principal view
import { ScheduleBuilder } from '@/components/admin/exams/ScheduleBuilder';
import { MarksEntryManager } from '@/components/admin/exams/MarksEntryManager';
import { ResultMonitoring } from '@/components/admin/exams/ResultMonitoring';
import { ExamAnalyticsDashboard } from '@/components/admin/exams/ExamAnalyticsDashboard';

interface ExamsTabProps {
  sub: string;
  exams: any[];
  examSchedules: any[];
  loadingExams: boolean;
  loadingSchedules: boolean;
  CURRENT_SESSION: string;
  TableSkeleton: React.ComponentType<any>;
}

export function ExamsTab({
  sub,
  exams,
  examSchedules,
  loadingExams,
  loadingSchedules,
  CURRENT_SESSION,
  TableSkeleton,
}: ExamsTabProps) {
  const activeSub = sub || 'list';

  return (
    <div className="space-y-6">
      {/* Exam Master */}
      {activeSub === 'list' && (
        <Card className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Exam Master</CardTitle>
            <CardDescription className="text-xs">All exams defined for {CURRENT_SESSION}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExams ? (
              <TableSkeleton rows={5} cols={3} />
            ) : exams.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No exams configured for this session</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                     key={exam.id}
                     className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{exam.examName}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                        {exam.examType}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        'text-[9px] border-0 font-bold',
                        exam.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'
                      )}
                    >
                      {exam.status || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exam Schedules */}
      {activeSub === 'schedules' && (
        <ScheduleBuilder session={CURRENT_SESSION} />
      )}

      {/* Marks Review */}
      {activeSub === 'marks' && (
        <MarksEntryManager session={CURRENT_SESSION} />
      )}

      {/* Results Consolidation & Monitoring */}
      {activeSub === 'results' && (
        <React.Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading...</div>}>
          <ResultMonitoring session={CURRENT_SESSION} />
        </React.Suspense>
      )}

      {/* Exam Performance Analytics */}
      {activeSub === 'analytics' && (
        <ExamAnalyticsDashboard session={CURRENT_SESSION} />
      )}
    </div>
  );
}

