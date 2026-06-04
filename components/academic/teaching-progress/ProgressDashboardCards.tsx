'use client';

import React, { useMemo } from 'react';
import { useSubjectProgress } from '@/hooks/useAcademic';
import { useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { CURRENT_SESSION } from '@/lib/constants';

function ProgressCardItem({ assignment }: { assignment: any }) {
  const { data: progress, isLoading } = useSubjectProgress(
    assignment.subjectDtlsId || assignment.subjectId, 
    assignment.classDtlsId || assignment.classSectionId,
    CURRENT_SESSION
  );

  // Normalize backend response
  const normalized = useMemo(() => {
    if (!progress) return null;
    const d = (progress as any).data ?? progress;
    return {
      percentage: d.overallPercentage ?? d.completionPercentage ?? 0,
      chaptersCount: d.chaptersCount ?? d.chapters?.length ?? 0
    };
  }, [progress]);

  if (isLoading) {
    return <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />;
  }

  if (!normalized) return null;

  return (
    <Card className="rounded-2xl border-none shadow-lg shadow-slate-200/30 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{assignment.subjectName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Class {assignment.className}-{assignment.sectionName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-slate-900">{normalized.percentage}%</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              <CheckCircle2 size={10} />
              <span>{normalized.chaptersCount} Chapters</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100">
          <div 
            className="h-full bg-primary transition-all duration-1000" 
            style={{ width: `${normalized.percentage}%` }} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const ProgressDashboardCards = () => {
  const user = useAuthStore((s) => s.user);
  const { data: assignments = [], isLoading } = useSubjectDetails(user?.id, CURRENT_SESSION);

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((as) => (
        <ProgressCardItem key={as.id} assignment={as} />
      ))}
    </div>
  );
};
