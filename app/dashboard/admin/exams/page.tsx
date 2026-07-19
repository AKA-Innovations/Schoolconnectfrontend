'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CURRENT_SESSION } from '@/lib/constants';
import { ExamsOverview } from '@/components/admin/exams/ExamsOverview';
import { ExamTypesManager } from '@/components/admin/exams/ExamTypesManager';
import { ExamSubjectConfig } from '@/components/admin/exams/ExamSubjectConfig';
import { GradeConfigManager } from '@/components/admin/exams/GradeConfigManager';
import { ScheduleBuilder } from '@/components/admin/exams/ScheduleBuilder';
import { MarksEntryManager } from '@/components/admin/exams/MarksEntryManager';
import { ResultMonitoring } from '@/components/admin/exams/ResultMonitoring';
import { ExamAnalyticsDashboard } from '@/components/admin/exams/ExamAnalyticsDashboard';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'exam-types', label: 'Exam Types' },
  { id: 'master', label: 'Exam Master' },
  { id: 'subject-config', label: 'Subject Config' },
  { id: 'grade-config', label: 'Grade Config' },
  { id: 'schedules', label: 'Schedules' },
  { id: 'results', label: 'Results' },
  { id: 'analytics', label: 'Analytics' },
];

export default function ExamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'master';
  const [session, setSession] = useState(CURRENT_SESSION);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/dashboard/admin/exams?${params.toString()}`);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'exam-types':
        return <ExamTypesManager />;
      case 'master':
        return <ExamsOverview session={session} />;
      case 'subject-config':
        return <ExamSubjectConfig session={session} />;
      case 'grade-config':
        return <GradeConfigManager session={session} />;
      case 'schedules':
        return <ScheduleBuilder session={session} />;
      case 'results':
        return (
          <React.Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading...</div>}>
            <ResultMonitoring session={session} />
          </React.Suspense>
        );
      case 'analytics':
        return <ExamAnalyticsDashboard session={session} />;
      default:
        return <ExamsOverview session={session} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Session and Navigation Panel */}
      {activeTab !== 'exam-types' && (
        <div className="flex flex-col md:flex-row items-center justify-end border-b border-border/60 pb-4 gap-4">
          {/* Global Academic Session Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session:</span>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="flex h-9 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="2026-27">Session 2026-27</option>
              <option value="2025-26">Session 2025-26</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Panel Render */}
      <div className="mt-4 animate-in fade-in duration-300">
        {renderActiveTab()}
      </div>
    </div>
  );
}
