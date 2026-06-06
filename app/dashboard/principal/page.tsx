'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClassSectionLists, useSubjectDetails } from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useStudentList } from '@/hooks/useStudents';
import { useHomeworks, useClassworks, useTeachingProgressList } from '@/hooks/useAcademic';
import { useExams, useExamSchedules } from '@/services/exam/queries';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck, Users, GraduationCap, BookOpen,
  AlertCircle, Activity, LayoutGrid, FileText,
  RefreshCw,
} from 'lucide-react';

// Sub-components
import { OverviewTab } from './OverviewTab';
import { AcademicTab } from './AcademicTab';
import { TeachersTab } from './TeachersTab';
import { StudentsTab } from './StudentsTab';
import { ExamsTab } from './ExamsTab';
import { ClassDetailTab } from './ClassDetailTab';
import TimetablePage from '@/app/dashboard/admin/class/timetable/page';

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <div className="p-5 flex items-center gap-4 animate-pulse">
      <div className="h-12 w-12 rounded-2xl bg-slate-100" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-16 bg-slate-100 rounded-lg" />
        <div className="h-3 w-24 bg-slate-50 rounded" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-5 bg-slate-50 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

const DAY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 3 Days', value: '3' },
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
];

function isWithinDays(dateStr: string, days: string): boolean {
  if (days === 'all') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  if (days === 'today') {
    const todayStr = now.toISOString().split('T')[0];
    return dateStr.startsWith(todayStr);
  }
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= parseInt(days);
}

export default function PrincipalDashboard() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const activeTab = searchParams.get('tab') || 'overview';
  const sub = searchParams.get('sub') || '';

  // ── Data Queries ──────────────────────────────────────────────────────────
  const { data: classSections = [], isLoading: loadingClasses, refetch: refetchClasses } = useClassSectionLists();
  const { data: subjectDetails = [], isLoading: loadingSubjects, refetch: refetchSubjects } = useSubjectDetails();
  const { data: teachersData, isLoading: loadingTeachers, refetch: refetchTeachers } = useTeacherList({ schoolId: schoolId ?? '', page: 1, pageSize: 500 });
  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useStudentList({ schoolId: schoolId ?? '', page: 1, limit: 500 });
  const { data: allHomeworks = [], isLoading: loadingHomework, refetch: refetchHW } = useHomeworks();
  const { data: allClassworks = [], isLoading: loadingClasswork, refetch: refetchCW } = useClassworks();
  const { data: allProgress = [], isLoading: loadingProgress, refetch: refetchProgress } = useTeachingProgressList();
  const { data: exams = [], isLoading: loadingExams } = useExams(CURRENT_SESSION);
  const { data: examSchedules = [], isLoading: loadingSchedules } = useExamSchedules(CURRENT_SESSION);

  const allTeachers: any[] = useMemo(() => (teachersData as any)?.items ?? (teachersData as any)?.data ?? [], [teachersData]);
  const allStudents: any[] = useMemo(() => (studentsData as any)?.items ?? (studentsData as any)?.data ?? [], [studentsData]);
  const totalStudents: number = (studentsData as any)?.pagination?.totalItemsCount ?? allStudents.length;
  const totalTeachers: number = (teachersData as any)?.pagination?.totalItemsCount ?? allTeachers.length;

  const isLoading = loadingClasses || loadingSubjects || loadingTeachers || loadingStudents;

  // ── Derived Metrics ───────────────────────────────────────────────────────
  const classNames = useMemo(() => [...new Set(classSections.map((cs) => cs.className))].sort(), [classSections]);

  const coveredSectionKeys = useMemo(
    () => new Set(subjectDetails.map((sd) => `${sd.className}|${sd.sectionName}`)),
    [subjectDetails],
  );

  const teachersWithClasses = useMemo(() => new Set(subjectDetails.map((sd) => sd.teacherId)), [subjectDetails]);
  const unassignedTeachers = useMemo(
    () => allTeachers.filter((t: any) => !teachersWithClasses.has(t.id) && t.isSubjectTeacher),
    [allTeachers, teachersWithClasses],
  );

  const classSummary = useMemo(() => classNames.map((className) => {
    const sections = classSections.filter((cs) => cs.className === className);
    const subjects = subjectDetails.filter((sd) => sd.className === className);
    const teacherIds = new Set(subjects.map((sd) => sd.teacherId));
    return {
      className,
      sectionCount: sections.length,
      subjectCount: new Set(subjects.map((sd) => sd.subjectName)).size,
      teacherCount: teacherIds.size,
      covered: sections.every((cs) => coveredSectionKeys.has(`${cs.className}|${cs.sectionName}`)),
    };
  }), [classNames, classSections, subjectDetails, coveredSectionKeys]);

  // ── Tab States ────────────────────────────────────────────────────────────
  const [teacherSearch, setTeacherSearch] = React.useState('');
  const [hwDayFilter, setHwDayFilter] = React.useState('7');
  const [cwDayFilter, setCwDayFilter] = React.useState('7');
  const [progressView, setProgressView] = React.useState<'grid' | 'list'>('grid');
  const [hwView, setHwView] = React.useState<'grid' | 'list'>('list');
  const [cwView, setCwView] = React.useState<'grid' | 'list'>('grid');

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch) return allTeachers;
    const q = teacherSearch.toLowerCase();
    return allTeachers.filter((t: any) =>
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.employeeId?.toLowerCase().includes(q) ||
      t.emailId?.toLowerCase().includes(q)
    );
  }, [allTeachers, teacherSearch]);

  const filteredHomeworks = useMemo(() =>
    (allHomeworks as any[]).filter((hw) => isWithinDays(hw.assignedDate || hw.createdAt, hwDayFilter)),
    [allHomeworks, hwDayFilter],
  );

  const filteredClassworks = useMemo(() =>
    (allClassworks as any[]).filter((cw) => isWithinDays(cw.conductedOn || cw.createdAt, cwDayFilter)),
    [allClassworks, cwDayFilter],
  );

  const refreshAll = useCallback(() => {
    refetchClasses();
    refetchSubjects();
    refetchTeachers();
    refetchStudents();
    refetchHW();
    refetchCW();
    refetchProgress();
  }, [refetchClasses, refetchSubjects, refetchTeachers, refetchStudents, refetchHW, refetchCW, refetchProgress]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-8">
      {activeTab === 'overview' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Welcome, {user?.name?.split(' ')[0] || 'Principal'}!
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  School-wide oversight & monitoring — Session {CURRENT_SESSION}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={refreshAll}
              className="rounded-xl h-11 bg-white/50 backdrop-blur-sm border-slate-200"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2 text-muted-foreground", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Students', value: totalStudents, icon: GraduationCap, accent: 'text-blue-600 bg-blue-50' },
              { label: 'Total Teachers', value: totalTeachers, icon: Users, accent: 'text-emerald-600 bg-emerald-50' },
              { label: 'Classes', value: classNames.length, icon: BookOpen, accent: 'text-violet-600 bg-violet-50' },
              { label: 'Sections', value: classSections.length, icon: LayoutGrid, accent: 'text-amber-600 bg-amber-50' },
              { label: 'Subject Mappings', value: subjectDetails.length, icon: Activity, accent: 'text-primary bg-primary/10' },
            ].map((kpi) => (
              <Card key={kpi.label} className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50">
                {isLoading ? <KpiSkeleton /> : (
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', kpi.accent)}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Alerts */}
          {!isLoading && unassignedTeachers.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">{unassignedTeachers.length} subject teacher{unassignedTeachers.length > 1 ? 's' : ''} not assigned to any class: </span>
                {unassignedTeachers.slice(0, 3).map((t: any) => `${t.firstName} ${t.lastName}`).join(', ')}
                {unassignedTeachers.length > 3 ? ` +${unassignedTeachers.length - 3} more` : ''}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dynamic Tab Render */}
      <div className="space-y-6 mt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            isLoading={isLoading}
            classSummary={classSummary}
            classSections={classSections}
            onClassClick={(className) => router.push(`/dashboard/principal?tab=class-detail&class=${className}`)}
          />
        )}
        {activeTab === 'class-detail' && (
          <ClassDetailTab
            className={searchParams.get('class') || ''}
            allTeachers={allTeachers}
            classSections={classSections}
            subjectDetails={subjectDetails}
            onBack={() => router.push('/dashboard/principal?tab=overview')}
          />
        )}
        {activeTab === 'academic' && (
          <AcademicTab
            sub={sub}
            allHomeworks={allHomeworks}
            allClassworks={allClassworks}
            allProgress={allProgress}
            loadingHomework={loadingHomework}
            loadingClasswork={loadingClasswork}
            loadingProgress={loadingProgress}
            filteredHomeworks={filteredHomeworks}
            filteredClassworks={filteredClassworks}
            hwDayFilter={hwDayFilter}
            setHwDayFilter={setHwDayFilter}
            cwDayFilter={cwDayFilter}
            setCwDayFilter={setCwDayFilter}
            hwView={hwView}
            setHwView={setHwView}
            cwView={cwView}
            setCwView={setCwView}
            progressView={progressView}
            setProgressView={setProgressView}
            DAY_OPTIONS={DAY_OPTIONS}
            TableSkeleton={TableSkeleton}
          />
        )}
        {activeTab === 'teachers' && (
          <TeachersTab
            filteredTeachers={filteredTeachers}
            allTeachers={allTeachers}
            loadingTeachers={loadingTeachers}
            teacherSearch={teacherSearch}
            setTeacherSearch={setTeacherSearch}
            subjectDetails={subjectDetails}
            TableSkeleton={TableSkeleton}
          />
        )}
        {activeTab === 'students' && (
          <StudentsTab
            allStudents={allStudents}
            classSections={classSections}
            totalStudents={totalStudents}
            loadingStudents={loadingStudents}
            TableSkeleton={TableSkeleton}
          />
        )}
        {activeTab === 'timetable' && (
          <TimetablePage />
        )}
        {activeTab === 'exams' && (
          <ExamsTab
            sub={sub}
            exams={exams}
            examSchedules={examSchedules}
            loadingExams={loadingExams}
            loadingSchedules={loadingSchedules}
            CURRENT_SESSION={CURRENT_SESSION}
            TableSkeleton={TableSkeleton}
          />
        )}
      </div>
    </div>
  );
}
