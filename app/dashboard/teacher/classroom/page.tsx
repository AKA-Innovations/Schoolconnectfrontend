'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users, ClipboardCheck, BookOpen, GraduationCap,
  ArrowRight, Phone, Mail, RefreshCw, Search, ShieldAlert,
  ChevronDown, AlertCircle, Award, HelpCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useStudentList, useFilterAttendance, birthdayKeys } from '@/hooks/useStudents';
import { useSubjectDetails, useClassSectionLists } from '@/hooks/useClasses';
import { studentService } from '@/services/student.service';
import { useQueries } from '@tanstack/react-query';
import { Gift, Cake, CalendarDays, Sparkles } from 'lucide-react';
import { useSubjectProgress, academicKeys } from '@/hooks/useAcademic';
import { useDebounce } from '@/hooks/useDebounce';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import Link from 'next/link';
import { Loader2, TrendingUp } from 'lucide-react';
import { useExams, useClassOverview, useToppers, useExamSubjects } from '@/services/exam/queries';
import { examService } from '@/services/exam/service';
import { academicService } from '@/services/academic.service';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

function SubjectProgressItem({ subjectId, classSectionId, subjectName }: { subjectId: number; classSectionId?: number; subjectName: string }) {
  const { data: rawProgress, isLoading: progressLoading } = useSubjectProgress(subjectId, classSectionId, CURRENT_SESSION);

  // Normalize backend response if it's wrapped in { message, data }
  const progress = useMemo(() => {
    if (!rawProgress) return null;
    const d = (rawProgress as any).data ?? rawProgress;
    return {
      percentage: d.overallPercentage ?? d.completionPercentage ?? 0,
      chaptersCount: d.chaptersCount ?? d.chapters?.length ?? 0,
      totalTopics: d.totalTopics ?? 0,
      completedTopics: d.completedTopics ?? 0
    };
  }, [rawProgress]);

  if (progressLoading) {
    return (
      <div className="px-6 py-4 border-b border-border/30 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-2" />
        <div className="h-2 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="px-6 py-4 hover:bg-muted/5 transition-colors border-b border-border/30 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-foreground">📚 {subjectName}</span>
            <span className="text-xs font-bold text-primary">{progress.percentage}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {progress.chaptersCount} Chapters • {progress.completedTopics}/{progress.totalTopics} Topics
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all',
                progress.percentage >= 80 ? 'bg-emerald-500' :
                  progress.percentage >= 40 ? 'bg-blue-500' : 'bg-amber-500'
              )}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter font-bold">
            Overall Coverage
          </p>
        </div>
      </div>
    </div>
  );
}

function ClassroomBirthdays({ classSectionId }: { classSectionId: number }) {
  const birthdayQueries = useQueries({
    queries: Array.from({ length: 8 }).map((_, index) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + index);
      const dateString = targetDate.toISOString().split('T')[0];
      return {
        queryKey: birthdayKeys.filter(classSectionId, dateString),
        queryFn: () => studentService.getBirthdays(classSectionId, dateString),
        enabled: !!classSectionId && classSectionId > 0,
      };
    }),
  });

  const { todayBirthdays, upcomingBirthdays, isLoading } = useMemo(() => {
    const todayList: any[] = [];
    const upcomingList: { date: string; dayName: string; students: any[] }[] = [];
    let loading = false;

    birthdayQueries.forEach((query, index) => {
      if (query.isLoading) loading = true;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + index);
      const dateString = targetDate.toISOString().split('T')[0];

      // Format upcoming day label nicely
      let dayName = '';
      if (index === 1) {
        dayName = 'Tomorrow';
      } else {
        dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }

      const students = Array.isArray(query.data) ? query.data : [];
      if (index === 0) {
        todayList.push(...students);
      } else if (students.length > 0) {
        upcomingList.push({
          date: dateString,
          dayName,
          students,
        });
      }
    });

    return {
      todayBirthdays: todayList,
      upcomingBirthdays: upcomingList,
      isLoading: loading,
    };
  }, [birthdayQueries]);

  if (isLoading) {
    return (
      <Card className="border-purple-100 shadow-lg shadow-purple-100/20 bg-gradient-to-br from-purple-50/20 to-pink-50/20 overflow-hidden border-none backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-purple-200 animate-pulse rounded-md" />
            <div className="h-5 w-36 bg-purple-200 animate-pulse rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-16 bg-purple-100/50 animate-pulse rounded-xl" />
          <div className="h-20 bg-purple-100/30 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-[#E6EBF2] rounded-3xl shadow-none overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#EAF8F5] flex items-center justify-center">
            <Gift className="h-5 w-5 text-[#2DB6A3]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#243B63]">
              Classroom Birthdays
            </h3>
            <p className="text-xs text-[#8A97AB]">
              Upcoming celebrations
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Today's Birthdays */}
        <div className="rounded-2xl border border-[#EEF2F7] bg-[#FAFBFD] p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#2DB6A3]">
              Today
            </p>

            {todayBirthdays.length > 0 && (
              <span className="text-[10px] text-[#8A97AB] font-medium">
                {todayBirthdays.length} Celebration
                {todayBirthdays.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {todayBirthdays.length > 0 ? (
            <div className="space-y-3">
              {todayBirthdays.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-2 border-b border-[#F0F3F7] last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#EAF8F5] flex items-center justify-center">
                      <Cake className="h-4 w-4 text-[#2DB6A3]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#243B63]">
                        {student.firstName} {student.lastName}
                      </p>

                      <p className="text-xs text-[#8A97AB]">
                        Roll No.{" "}
                        {student.academics?.[0]?.rollNumber || "—"}
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-[#EAF8F5] text-[#2DB6A3] border-0 hover:bg-[#EAF8F5]">
                    Today
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Cake className="h-10 w-10 text-[#D0D7E2]" />
              <p className="mt-3 text-sm text-[#8A97AB]">
                No birthdays today
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Birthdays */}
        <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8A97AB]">
              Upcoming This Week
            </p>

            <CalendarDays className="h-4 w-4 text-[#8A97AB]" />
          </div>

          {upcomingBirthdays.length > 0 ? (
            <div className="space-y-5 max-h-[240px] overflow-y-auto pr-1">
              {upcomingBirthdays.map((item) => (
                <div key={item.date}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-[#2DB6A3]" />

                    <p className="text-xs font-semibold text-[#243B63]">
                      {item.dayName}
                    </p>
                  </div>

                  <div className="space-y-2 pl-4">
                    {item.students.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#243B63]">
                            {student.firstName} {student.lastName}
                          </p>
                        </div>

                        <span className="text-xs text-[#8A97AB]">
                          Roll #
                          {student.academics?.[0]?.rollNumber || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Gift className="h-12 w-12 text-[#D0D7E2]" />

              <p className="mt-3 text-sm font-medium text-[#8A97AB]">
                No birthdays this week
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClassRoomPage() {
  const { user, isClassTeacher, assignedClass: rawAssignedClass, isSyncing } = useTeacherProfile();
  const assignedClass = rawAssignedClass as any;

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const debouncedSearch = useDebounce(search, 400);

  const { data: mySubjects = [] } = useSubjectDetails(user?.id, CURRENT_SESSION);
  const { data: allSections = [] } = useClassSectionLists();

  // Resolve assignedClass names and classId
  const resolvedAssignedClass = useMemo(() => {
    if (!assignedClass) return null;
    
    // Find matching section in allSections to resolve classId, className, sectionName
    const match = allSections.find(s =>
      s.id === assignedClass.classDtlsId ||
      s.id === assignedClass.id ||
      s.mappingId === assignedClass.id ||
      s.mappingId === assignedClass.classDtlsId ||
      (s.className === assignedClass.className && s.sectionName === assignedClass.sectionName)
    );

    if (match) {
      return {
        ...assignedClass,
        className: match.className,
        sectionName: match.sectionName,
        classDtlsId: match.mappingId || match.id,
        classId: match.classId,
      };
    }
    return assignedClass;
  }, [assignedClass, allSections]);

  // Final resolved IDs for data fetching
  const resolvedClassSectionId = resolvedAssignedClass?.classDtlsId;
  const resolvedClassId = resolvedAssignedClass?.classId;
  const selectedClass = resolvedAssignedClass?.className || '';
  const selectedSection = resolvedAssignedClass?.sectionName || '';
  const hasSelection = !!resolvedClassSectionId;

  // Analytics State & Hooks
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const { data: exams = [] } = useExams(CURRENT_SESSION);

  const [attendanceRange, setAttendanceRange] = useState<'week' | 'month'>('week');

  // 1. Get weekdays dynamically based on range
  const lastDates = useMemo(() => {
    const dates: string[] = [];
    const curr = new Date();
    const count = attendanceRange === 'week' ? 5 : 20;
    while (dates.length < count) {
      curr.setDate(curr.getDate() - 1);
      const day = curr.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday (0) and not Saturday (6)
        dates.unshift(curr.toISOString().split('T')[0]);
      }
    }
    return dates;
  }, [attendanceRange]);

  // 2. Attendance queries for dynamic weekdays
  const attendanceQueries = useQueries({
    queries: lastDates.map((dateString) => ({
      queryKey: ['attendance-trend', resolvedClassSectionId, dateString],
      queryFn: () => studentService.filterAttendance({
        classSectionId: Number(resolvedClassSectionId),
        date: dateString,
      }),
      enabled: !!resolvedClassSectionId,
    })),
  });

  // 3. Class overview queries across all exams
  const examsOverviewQueries = useQueries({
    queries: exams.map((exam: any) => ({
      queryKey: ['exam-overview-trend', exam.id, resolvedClassId, resolvedClassSectionId],
      queryFn: () => examService.getClassOverview({
        session: CURRENT_SESSION,
        examId: exam.id,
        classId: Number(resolvedClassId) || undefined,
        classSectionId: Number(resolvedClassSectionId) || undefined,
      }),
      enabled: !!resolvedClassId && exams.length > 0,
    })),
  });

  // 4. Subjects mapped to this class section
  const { data: classWideSubjectsList = [] } = useSubjectDetails(
    undefined,
    CURRENT_SESSION,
    resolvedClassSectionId ? Number(resolvedClassSectionId) : undefined
  );

  // 5. Subject progress queries
  const progressQueries = useQueries({
    queries: classWideSubjectsList.map((sub: any) => {
      const sId = sub.subjectDtlsId || sub.subjectId || sub.id;
      return {
        queryKey: academicKeys.subjectProgress(sId, Number(resolvedClassSectionId), CURRENT_SESSION),
        queryFn: () => academicService.getSubjectProgress(sId, Number(resolvedClassSectionId), CURRENT_SESSION),
        enabled: !!resolvedClassSectionId && !!sId,
      };
    }),
  });

  // 6. Selected Exam queries
  const queryParams = {
    session: CURRENT_SESSION,
    examId: selectedExamId || undefined,
    classId: resolvedClassId || undefined,
    classSectionId: resolvedClassSectionId || undefined,
  };

  const { data: classOverview, isLoading: loadingOverview, refetch: refetchOverview } = useClassOverview(queryParams);
  const { data: toppersList, isLoading: loadingToppers, refetch: refetchToppers } = useToppers(queryParams);

  const { data: examSubjects = [] } = useExamSubjects(
    CURRENT_SESSION,
    Number(selectedExamId) || 0,
    Number(resolvedClassId) || undefined
  );

  const subjectQueries = useQueries({
    queries: examSubjects.map((sub: any) => ({
      queryKey: ['subject-analysis-detail', selectedExamId, resolvedClassId, resolvedClassSectionId, sub.subjectId],
      queryFn: () => examService.getSubjectAnalysis({
        session: CURRENT_SESSION,
        examId: Number(selectedExamId) || undefined,
        classId: Number(resolvedClassId) || undefined,
        classSectionId: Number(resolvedClassSectionId) || undefined,
        subjectId: sub.subjectId,
      }),
      enabled: !!selectedExamId && !!resolvedClassId && !!sub.subjectId,
    })),
  });

  const handleRefetchAll = () => {
    refetchOverview();
    refetchToppers();
    subjectQueries.forEach((q) => q.refetch());
    attendanceQueries.forEach((q) => q.refetch());
    examsOverviewQueries.forEach((q) => q.refetch());
    progressQueries.forEach((q) => q.refetch());
  };

  // 7. Data Compilers for Charts
  const attendanceTrendData = useMemo(() => {
    if (!resolvedClassSectionId) return [];
    return lastDates.map((dateString, idx) => {
      const query = attendanceQueries[idx] as any;
      const records = Array.isArray(query?.data) ? query.data : [];
      const total = records.length;
      const present = records.filter((r: any) => r.status === 'Present').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        date: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        rate,
        total,
      };
    }).filter((d) => d.total > 0);
  }, [attendanceQueries, resolvedClassSectionId, lastDates]);

  const syllabusProgressData = useMemo(() => {
    if (!resolvedClassSectionId || classWideSubjectsList.length === 0) return [];
    return classWideSubjectsList.map((sub: any, idx: number) => {
      const query = progressQueries[idx] as any;
      const rawProgress = query?.data;
      const d = (rawProgress as any)?.data ?? rawProgress;
      const pct = d ? (d.overallPercentage ?? d.completionPercentage ?? 0) : 0;
      return {
        subject: sub.subjectName || `Subject ${sub.subjectId}`,
        progress: pct,
      };
    });
  }, [progressQueries, classWideSubjectsList, resolvedClassSectionId]);

  const examTrendsData = useMemo(() => {
    if (!resolvedClassId || exams.length === 0) return [];
    return exams.map((exam: any, idx: number) => {
      const query = examsOverviewQueries[idx] as any;
      const data = query?.data?.data || query?.data;
      let avg = data?.avgPercentage;
      let pass = data?.passPercentage;
      return {
        examName: exam.examName,
        average: avg ? Math.round(avg) : 0,
        passRate: pass ? Math.round(pass) : 0,
      };
    }).filter((e: any) => e.average > 0 || e.passRate > 0);
  }, [examsOverviewQueries, exams, resolvedClassId]);

  const mockClassDistribution = [
    { name: '90-100%', count: 4 },
    { name: '80-89%', count: 8 },
    { name: '70-79%', count: 12 },
    { name: '60-69%', count: 6 },
    { name: '50-59%', count: 3 },
    { name: 'Below 50%', count: 1 },
  ];

  const mockSubjectAverages = [
    { subject: 'Mathematics', average: 78 },
    { subject: 'Science', average: 72 },
    { subject: 'English', average: 85 },
    { subject: 'Social Studies', average: 80 },
    { subject: 'Computer', average: 92 },
  ];

  const classOverviewData = classOverview?.data || classOverview;
  const toppers = toppersList?.data || (Array.isArray(toppersList) ? toppersList : []);

  const subjectData = useMemo(() => {
    if (examSubjects.length === 0) return mockSubjectAverages;

    const compiled = examSubjects.map((sub: any, idx: number) => {
      const queryResult = (subjectQueries[idx] as any)?.data?.data || (subjectQueries[idx] as any)?.data;
      return {
        subject: sub.subjectName || `Subject ${sub.subjectId}`,
        average: queryResult?.avgMarks !== undefined && sub.totalMarks > 0
          ? Math.round((queryResult.avgMarks / sub.totalMarks) * 100)
          : undefined,
        highest: queryResult?.highestMarks,
        lowest: queryResult?.lowestMarks,
        passRate: queryResult?.passPercentage,
      };
    }).filter((s: any) => s.average !== undefined);

    return compiled.length > 0 ? compiled : mockSubjectAverages;
  }, [examSubjects, subjectQueries]);

  const classData = useMemo(() => {
    const distribution: Record<string, number> = {};

    (subjectQueries as any[]).forEach((q) => {
      const res = q.data?.data || q.data;
      const dist = res?.gradeDistribution;
      if (dist) {
        Object.entries(dist).forEach(([grade, count]) => {
          distribution[grade] = (distribution[grade] || 0) + (count as number);
        });
      }
    });

    const entries = Object.entries(distribution);
    if (entries.length === 0) return null;

    return entries.map(([name, count]) => ({
      name: `Grade ${name}`,
      count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [subjectQueries]);

  const derivedClassAverage = useMemo(() => {
    if (classOverviewData?.avgPercentage !== undefined && classOverviewData?.avgPercentage !== null) {
      return classOverviewData.avgPercentage;
    }
    const validAverages = subjectData.filter((s: any) => s.average !== undefined);
    const isMock = subjectData === mockSubjectAverages;
    if (isMock || validAverages.length === 0) return undefined;
    return validAverages.reduce((sum: number, s: any) => sum + (s.average || 0), 0) / validAverages.length;
  }, [classOverviewData, subjectData]);

  const derivedPassPercentage = useMemo(() => {
    if (classOverviewData?.passPercentage !== undefined && classOverviewData?.passPercentage !== null) {
      return classOverviewData.passPercentage;
    }
    const validPassRates = subjectData.filter((s: any) => s.passRate !== undefined);
    const isMock = subjectData === mockSubjectAverages;
    if (isMock || validPassRates.length === 0) return undefined;
    return validPassRates.reduce((sum: number, s: any) => sum + (s.passRate || 0), 0) / validPassRates.length;
  }, [classOverviewData, subjectData]);

  const finalClassData = classData || mockClassDistribution;
  const isDataAvailable = classData !== null;

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  const { data: studentData, isLoading, refetch, isFetching } = useStudentList(
    {
      classSectionId: resolvedClassSectionId,
      firstName: debouncedSearch || undefined,
      limit: 100,
    },
    { enabled: !!resolvedClassSectionId }
  );
  console.log("resolvedClassSectionId", resolvedClassSectionId)
  const { data: todayAttendance } = useFilterAttendance({
    classSectionId: resolvedClassSectionId,
    date: today,
  });

  // All subjects for this class (for Academics tab)
  const { data: classWideSubjects = [], isLoading: subjectsLoading } = useSubjectDetails(
    undefined, // get all subjects for the class
    CURRENT_SESSION,
    resolvedClassSectionId
  );

  const students = studentData?.items ?? [];
  const totalStudents = studentData?.pagination?.totalItemsCount ?? 0;

  const attendanceRecords = Array.isArray(todayAttendance)
    ? todayAttendance
    : Array.isArray((todayAttendance as any)?.items)
      ? (todayAttendance as any).items
      : Array.isArray((todayAttendance as any)?.data)
        ? (todayAttendance as any).data
        : [];

  // Build a map for quick lookup. Use studentId if available, otherwise fallback to matching by roll number
  const attendanceMap = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach((a: any) => {
      if (a.studentId) {
        map.set(String(a.studentId), a);
      }
      if (a.studentRollNumber) {
        map.set(`roll-${a.studentRollNumber}`, a);
      }
    });
    return map;
  }, [attendanceRecords]);

  const presentCount = attendanceRecords.filter((a: any) => a.status === 'Present').length;
  const absentCount = attendanceRecords.filter((a: any) => a.status === 'Absent').length;
  const lateCount = attendanceRecords.filter((a: any) => a.status === 'Late' || a.status === 'HalfDay').length;

  const kpis = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-primary' },
    { label: 'Present Today', value: presentCount, icon: ClipboardCheck, color: 'text-success' },
    { label: 'Absent Today', value: absentCount, icon: ClipboardCheck, color: 'text-destructive' },
    { label: 'Late / Half Day', value: lateCount, icon: ClipboardCheck, color: 'text-warning' },
  ];

  const tabs = [
    { id: 'students', label: 'Students', icon: <Users size={13} /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={13} /> },
    { id: 'academics', label: 'Academics', icon: <BookOpen size={13} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={13} /> },
  ];

  // ── Syncing state ────────────────────────────────────────────────────────
  if (isSyncing && !hasSelection) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 transition-all">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-foreground">Verifying Class Teacher Permissions</p>
          <p className="text-xs text-muted-foreground">Synchronizing your assignment details...</p>
        </div>
      </div>
    );
  }

  // ── Access Check ──────────────────────────────────────────────────────────
  // Strictly allow entry only if they have a resolved assigned class from profile
  const canAccess = !!resolvedAssignedClass;

  if (!canAccess) {
    return (
      <div className="m-4 space-y-6 animate-in fade-in duration-500">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
            <span className="inline-block h-1 w-6 bg-primary rounded-full" aria-hidden="true" />
            Class Teacher Portal
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Classroom</h1>
        </div>
        <Card className="border-border shadow-sm">
          <CardContent className="py-16 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldAlert size={32} className="text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-foreground">Access Restricted</p>
              <p className="text-sm max-w-md">
                The classroom portal is designed for class teachers and subject teachers. You are not currently assigned to any class or section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="m-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
            <span className="inline-block h-1 w-6 bg-primary rounded-full" aria-hidden="true" />
            Class Teacher Portal
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Classroom</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="icon" onClick={() => refetch()}
            className="rounded-xl h-10 w-10 border border-border" title="Refresh">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Link href="/dashboard/teacher/attendance">
            <Button className="rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs">
              <ClipboardCheck size={14} className="mr-2" /> Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Class info — read-only, auto-populated */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Class</Label>
              <div className="h-10 px-4 flex items-center bg-muted/30 border border-border rounded-xl text-sm font-bold text-foreground cursor-not-allowed">
                {selectedClass || '—'}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Section</Label>
              <div className="h-10 px-4 flex items-center bg-muted/30 border border-border rounded-xl text-sm font-bold text-foreground cursor-not-allowed">
                {selectedSection || '—'}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Student name..." className="pl-9 rounded-xl h-10" />
              </div>
            </div>
          </div>
          {/* Debug info — remove after verification */}
          {!resolvedClassSectionId && hasSelection && (
            <p className="text-xs text-destructive mt-2">⚠ Could not resolve classSectionId for {selectedClass}-{selectedSection}. Students cannot be fetched.</p>
          )}
        </CardContent>
      </Card>

      {!hasSelection ? (
        <Card className="border-border shadow-sm">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <GraduationCap size={44} className="opacity-20" />
            <p className="font-semibold text-sm">Select a class and section to view student details</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(kpi => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn('h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center', kpi.color)}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                      <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex w-max gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/50">
                  {tabs.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}
                      className="rounded-xl px-5 py-2 text-[10px] font-bold tracking-widest uppercase gap-1.5 flex items-center data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                      {tab.icon}{tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="students" className="mt-4">
                  <Card className="border-border shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6">
                      <CardTitle className="text-lg font-bold">Student Directory</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Class {selectedClass} Section {selectedSection}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6 w-12">#</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Roll No</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-6">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            [...Array(5)].map((_, i) => (
                              <TableRow key={i}><TableCell colSpan={6} className="py-3 pl-6"><div className="h-8 bg-muted/40 rounded-lg animate-pulse" /></TableCell></TableRow>
                            ))
                          ) : students.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                  <Users size={32} className="opacity-20" />
                                  <p className="text-sm font-semibold">No students found</p>
                                  {!resolvedClassSectionId && (
                                    <p className="text-xs text-destructive">classSectionId could not be resolved</p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            students.map((s, idx) => {
                              const roll = s.academics?.[0]?.rollNumber;
                              const att = (attendanceMap.get(String(s.id)) || (roll ? attendanceMap.get(`roll-${roll}`) : null)) as any;
                              return (
                                <TableRow key={s.id} className="group hover:bg-muted/10 transition-colors border-b border-border/30">
                                  <TableCell className="pl-6 text-xs font-bold text-muted-foreground">{idx + 1}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-xl bg-muted/40 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {s.firstName?.[0]}{s.lastName?.[0]}
                                      </div>
                                      <p className="text-sm font-semibold text-foreground">{s.firstName} {s.lastName}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm font-medium text-muted-foreground">
                                    {s.academics?.[0]?.rollNumber ?? '—'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail size={10} className="opacity-50" />{s.emailId}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <Phone size={10} className="opacity-50" />{s.mobileNumber}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {att ? (
                                      <Badge className={cn('rounded-full text-[10px] font-bold border px-2',
                                        att.status === 'Present' ? 'bg-success/10 text-success border-success/20' :
                                          att.status === 'Absent' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                            'bg-warning/10 text-warning border-warning/20'
                                      )}>
                                        {att.status}
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">Not marked</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                    <Link href={`/dashboard/teacher/students/${s.id}`}>
                                      <Button variant="ghost" size="sm" className="rounded-xl h-8 px-3 text-xs font-bold opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all">
                                        View <ArrowRight size={12} className="ml-1" />
                                      </Button>
                                    </Link>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attendance" className="mt-4">
                  <Card className="border-border shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6">
                      <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Today&apos;s attendance summary for Class {selectedClass} - {selectedSection}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {attendanceRecords.length === 0 ? (
                        <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                          <ClipboardCheck size={36} className="opacity-20" />
                          <p className="text-sm font-semibold">No attendance marked for today</p>
                          <Link href="/dashboard/teacher/attendance">
                            <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold mt-1">
                              Mark Attendance Now
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-success">{presentCount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Present</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-destructive">{absentCount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Absent</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-warning">{lateCount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Late / Half</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-primary">
                              {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Attendance Rate</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="academics" className="mt-4">
                  <Card className="border-border shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6">
                      <CardTitle className="text-lg font-bold">Academic Progress</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Syllabus coverage across all subjects</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {subjectsLoading ? (
                        <div className="p-8 space-y-4">
                          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
                        </div>
                      ) : classWideSubjects.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                          <TrendingUp size={36} className="opacity-20" />
                          <p className="text-sm font-semibold">No subjects mapped to this class</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/20">
                          {classWideSubjects.map((sd: any) => (
                            <SubjectProgressItem
                              key={sd.id}
                              subjectId={sd.subjectDtlsId || sd.subjectId || sd.id}
                              classSectionId={resolvedClassSectionId}
                              subjectName={sd.subjectName}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-4">
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Comprehensive trends charts for Class Teacher */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* 1. Exam Performance Trend */}
                      <Card className="border-border shadow-sm bg-white p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" /> Exam Trends
                          </h3>
                          <p className="text-xs text-muted-foreground">Class average & pass rate trends across exams.</p>
                        </div>
                        <div className="h-56">
                          {examTrendsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={examTrendsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="examName" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="average" name="Average" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="passRate" name="Pass Rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                              <TrendingUp className="h-7 w-7 text-muted-foreground/30 mb-1.5" />
                              <p className="text-xs font-bold text-muted-foreground">No Exam Records Available</p>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* 2. Syllabus Progress Trend */}
                      <Card className="border-border shadow-sm bg-white p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" /> Syllabus Progress
                          </h3>
                          <p className="text-xs text-muted-foreground">Completion coverage per subject.</p>
                        </div>
                        <div className="h-56">
                          {syllabusProgressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={syllabusProgressData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="subject" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} width={80} />
                                <Tooltip />
                                <Bar dataKey="progress" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                              <BookOpen className="h-7 w-7 text-muted-foreground/30 mb-1.5" />
                              <p className="text-xs font-bold text-muted-foreground">No Subjects Configured</p>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* 3. Recent Attendance Trend */}
                      <Card className="border-border shadow-sm bg-white p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" /> Attendance Trend
                            </h3>
                            <p className="text-xs text-muted-foreground">Attendance percentage over the selected period.</p>
                          </div>
                          <select
                            value={attendanceRange}
                            onChange={(e) => setAttendanceRange(e.target.value as 'week' | 'month')}
                            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 cursor-pointer"
                          >
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                          </select>
                        </div>
                        <div className="h-56">
                          {resolvedClassSectionId && attendanceTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={attendanceTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="rate" name="Attendance Rate %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : !resolvedClassSectionId ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                              <Users className="h-7 w-7 text-muted-foreground/30 mb-1.5" />
                              <p className="text-xs font-bold text-muted-foreground">Class section not resolved</p>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                              <Users className="h-7 w-7 text-muted-foreground/30 mb-1.5" />
                              <p className="text-xs font-bold text-muted-foreground">No Attendance Marked</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">No attendance logs found for the selected period.</p>
                            </div>
                          )}
                        </div>
                      </Card>

                    </div>

                    {/* Detailed Exam Level Analysis Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="h-px bg-border flex-1" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Detailed Exam Analysis</span>
                        <span className="h-px bg-border flex-1" />
                      </div>

                      <Card className="border-border shadow-sm bg-white p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Exam for Detailed View</Label>
                            <div className="mt-1.5 w-64">
                              <select
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
                                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="">Select Exam</option>
                                {exams.map((e: any) => (
                                  <option key={e.id} value={e.id}>{e.examName}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {selectedExamId && (
                            <Button
                              variant="outline"
                              onClick={handleRefetchAll}
                              className="rounded-xl h-10 px-4 mt-auto"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                            </Button>
                          )}
                        </div>
                      </Card>

                      {selectedExamId && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          {/* Warning notice when final consolidated results are missing */}
                          {!classOverviewData?.avgPercentage && (
                            <div className="bg-amber-500/10 text-amber-700 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border border-amber-500/20">
                              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                              <span>
                                <strong>Notice:</strong> Final class-wise results have not been consolidated yet. Currently displaying dynamically aggregated subject averages.
                              </span>
                            </div>
                          )}

                          {/* Quick Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border-border shadow-sm bg-white p-5 flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Users className="h-5 w-5" /></div>
                              <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Class Average</p>
                                <h4 className="text-xl font-extrabold text-foreground">
                                  {derivedClassAverage !== undefined ? `${derivedClassAverage.toFixed(1)}%` : 'N/A'}
                                </h4>
                              </div>
                            </Card>
                            <Card className="border-border shadow-sm bg-white p-5 flex items-center gap-4">
                              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
                              <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pass Rate</p>
                                <h4 className="text-xl font-extrabold text-foreground">
                                  {derivedPassPercentage !== undefined ? `${derivedPassPercentage.toFixed(1)}%` : 'N/A'}
                                </h4>
                              </div>
                            </Card>
                            <Card className="border-border shadow-sm bg-white p-5 flex items-center gap-4">
                              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500"><Award className="h-5 w-5" /></div>
                              <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Top Performer</p>
                                <h4 className="text-sm font-extrabold text-foreground truncate w-40">
                                  {toppers?.[0]
                                    ? `${toppers[0].studentName || toppers[0].studentId || 'Student'} (${toppers[0].percentage?.toFixed(1) ?? '95.4'}%)`
                                    : (derivedClassAverage !== undefined ? 'Consolidation Pending' : 'N/A')}
                                </h4>
                              </div>
                            </Card>
                            <Card className="border-border shadow-sm bg-white p-5 flex items-center gap-4">
                              <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-600"><BookOpen className="h-5 w-5" /></div>
                              <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Subjects Evaluated</p>
                                <h4 className="text-xl font-extrabold text-foreground">{isDataAvailable ? subjectData.length : 0}</h4>
                              </div>
                            </Card>
                          </div>

                          {/* Visual Charts Row */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Class overview distribution */}
                            <Card className="border-border shadow-sm bg-white p-6 space-y-4">
                              <div>
                                <h3 className="font-bold text-base text-foreground">Grade Distribution</h3>
                                <p className="text-xs text-muted-foreground">Percentage bands across all students.</p>
                              </div>
                              <div className="h-64">
                                {isDataAvailable ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={finalClassData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                                    <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs font-bold text-slate-500">No Grade Data Recorded</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Please populate and lock student marks first.</p>
                                  </div>
                                )}
                              </div>
                            </Card>

                            {/* Subject Averaging comparison */}
                            <Card className="border-border shadow-sm bg-white p-6 space-y-4">
                              <div>
                                <h3 className="font-bold text-base text-foreground">Subject Comparison</h3>
                                <p className="text-xs text-muted-foreground">Average percentage scores per subject component.</p>
                              </div>
                              <div className="h-64">
                                {subjectData !== mockSubjectAverages ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectData} layout="vertical">
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                      <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                      <YAxis type="category" dataKey="subject" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
                                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                      <Bar dataKey="average" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                                    <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs font-bold text-slate-500">No Subject Marks Available</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Awaiting teacher entries for configured exam subjects.</p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </div>

                          {/* Toppers Leaderboard */}
                          <Card className="border-border shadow-sm bg-white overflow-hidden">
                            <CardHeader className="border-b border-border bg-slate-50/50 px-6 py-4">
                              <CardTitle className="text-base font-bold text-foreground">Class Toppers List</CardTitle>
                              <CardDescription className="text-xs text-muted-foreground">Highest-scoring student ranks for this assessment.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                              {loadingToppers ? (
                                <div className="p-8 text-center text-muted-foreground font-medium">Loading toppers...</div>
                              ) : !toppers || toppers.length === 0 ? (
                                <div className="py-16 text-center bg-slate-50/10">
                                  <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground/25" />
                                  <p className="text-sm font-bold text-muted-foreground">No Toppers Available</p>
                                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-medium">
                                    Topper leaderboards are calculated upon final consolidation of exam results.
                                  </p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                      <tr className="border-b border-border text-xs font-semibold uppercase text-muted-foreground bg-slate-50/50">
                                        <th className="p-4 px-6">Rank</th>
                                        <th className="p-4">Student ID</th>
                                        <th className="p-4">Total Marks</th>
                                        <th className="p-4">Obtained Marks</th>
                                        <th className="p-4">Percentage</th>
                                        <th className="p-4 pr-6 text-right">Grade</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                      {toppers.map((t: any) => (
                                        <tr key={t.rank} className="hover:bg-slate-50/30">
                                          <td className="p-4 px-6 font-bold text-primary">#{t.rank}</td>
                                          <td className="p-4 font-bold text-foreground">{t.studentId}</td>
                                          <td className="p-4 text-slate-400">{t.totalMarks}</td>
                                          <td className="p-4 font-medium text-slate-600">{t.marksObtained}</td>
                                          <td className="p-4 font-extrabold text-emerald-600">{t.percentage.toFixed(1)}%</td>
                                          <td className="p-4 pr-6 text-right font-black text-slate-700">{t.grade}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>

                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <ClassroomBirthdays classSectionId={resolvedClassSectionId} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
