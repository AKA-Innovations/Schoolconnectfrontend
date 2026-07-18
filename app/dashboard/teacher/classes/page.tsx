'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useSubjectDetails, useClassSectionLists } from '@/hooks/useClasses';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { useHomeworks } from '@/hooks/useAcademic';
import { studentService } from '@/services/student.service';
import { 
  BookOpen, Users, GraduationCap, ClipboardCheck, 
  AlertCircle, FileText, Eye, BarChart2, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// Emojis for subject tags
const getSubjectEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('algebra') || lower.includes('geometry')) return '📐';
  if (lower.includes('english') || lower.includes('grammar') || lower.includes('literature')) return '📘';
  if (lower.includes('science') || lower.includes('physics') || lower.includes('chemistry') || lower.includes('biology')) return '🔬';
  if (lower.includes('computer') || lower.includes('coding') || lower.includes('it') || lower.includes('information')) return '💻';
  if (lower.includes('history') || lower.includes('social') || lower.includes('civics') || lower.includes('geography')) return '🌍';
  if (lower.includes('art') || lower.includes('paint') || lower.includes('craft')) return '🎨';
  if (lower.includes('music') || lower.includes('sing')) return '🎵';
  if (lower.includes('sport') || lower.includes('pe') || lower.includes('physical') || lower.includes('gym')) return '⚽';
  return '📚';
};

const getHomeworkStatus = (dueDateStr: string): 'active' | 'overdue' => {
  const now = new Date();
  const due = new Date(dueDateStr);
  if (due < now) return 'overdue';
  return 'active';
};

function ClassCard({
  classKey,
  className,
  sectionName,
  subjects,
  classSectionId,
}: {
  classKey: string;
  className: string;
  sectionName: string;
  subjects: any[];
  classSectionId: number;
}) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch live student count
  const { data: studentData } = useStudentList(
    { classSectionId, limit: 200 },
    { enabled: !!classSectionId && classSectionId > 0 }
  );
  const studentCount = studentData?.pagination?.totalItemsCount ?? studentData?.items?.length ?? 0;

  // Fetch live attendance status
  const { data: todayAttendance } = useFilterAttendance({
    classSectionId,
    date: today,
  });

  const attendanceStatus = useMemo(() => {
    if (!todayAttendance) return 'Pending';
    const records = Array.isArray(todayAttendance)
      ? todayAttendance
      : Array.isArray((todayAttendance as any)?.items) ? (todayAttendance as any).items : [];
    return records.length > 0 ? 'Marked' : 'Pending';
  }, [todayAttendance]);

  // Fetch live active homework count
  const { data: homeworks = [] } = useHomeworks(className);
  const activeHwCount = useMemo(() => {
    return homeworks.filter(h => h.sectionName === sectionName && getHomeworkStatus(h.dueDate) === 'active').length;
  }, [homeworks, sectionName]);

  const detailUrl = `/dashboard/teacher/classes/${encodeURIComponent(className)}/${encodeURIComponent(sectionName)}`;

  return (
    <Card className="relative rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-card overflow-hidden group">
      {/* Contextual Indicator Badge on Top-Right */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          attendanceStatus === 'Marked' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full mr-1 ${attendanceStatus === 'Marked' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          {attendanceStatus === 'Marked' ? '🟢 Marked' : '🟡 Pending'}
        </span>
      </div>

      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        {/* Class Identity & Stats */}
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-2">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">
              {className}-{sectionName}
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {subjects.length} Subject{subjects.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <span>👨 {studentCount || '0'} Students</span>
          </div>
        </div>

        {/* Subject Chips */}
        <div className="flex flex-wrap gap-1">
          {subjects.map((sd) => (
            <div
              key={sd.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100/80 text-[10px] font-bold text-slate-600"
            >
              <span>{getSubjectEmoji(sd.subjectName)}</span>
              <span>{sd.subjectName}</span>
            </div>
          ))}
        </div>

        {/* Homework status & quick action text */}
        <div className="text-xs font-semibold text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100/50">
          <span className="flex items-center gap-1 text-[11px]">
            📚 Homework: <span className="font-extrabold text-slate-700">{activeHwCount} Active</span>
          </span>
        </div>

        {/* Footer Actions (Standard view + Hover Reveal Quick Actions on desktop) */}
        <div className="relative pt-1 h-9 overflow-hidden">
          {/* Normal Buttons (default state) */}
          <div className="flex gap-2 w-full transition-all duration-300 group-hover:md:-translate-y-12">
            <Button asChild size="sm" className="rounded-xl text-xs h-9 px-3 font-bold w-full bg-slate-900 hover:bg-slate-800 text-white border-0">
              <Link href={detailUrl}>
                Open Class
              </Link>
            </Button>
          </div>

          {/* Quick Icon Actions (Reveals on hover for desktop) */}
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-between gap-1 px-1 bg-white border border-slate-100 rounded-xl translate-y-12 md:group-hover:translate-y-0 transition-transform duration-300 hidden md:flex">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Quick Actions:</span>
            <div className="flex gap-1">
              <Button asChild variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50" title="Open Class">
                <Link href={detailUrl}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50" title="Homework">
                <Link href={`${detailUrl}?tab=homework`}>
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-50" title="Performance Progress">
                <Link href={`${detailUrl}?tab=progress`}>
                  <BarChart2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useQueries } from '@tanstack/react-query';

export default function TeacherClassesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: mySubjectDetails = [], isLoading } = useSubjectDetails(user?.id);
  const { data: allSections = [] } = useClassSectionLists();

  // Group by "className|sectionName"
  const grouped = useMemo(() => {
    const map: Record<string, typeof mySubjectDetails> = {};
    mySubjectDetails.forEach((sd) => {
      const key = `${sd.className ?? 'Unknown'}|${sd.sectionName ?? ''}`;
      if (!map[key]) map[key] = [];
      map[key].push(sd);
    });
    return map;
  }, [mySubjectDetails]);

  const keys = Object.keys(grouped);

  // Map class keys to section mapping IDs
  const resolvedClassSections = useMemo(() => {
    return keys.map((key) => {
      const [className, sectionName] = key.split('|');
      const match = allSections.find(
        (s) => s.className === className && s.sectionName === sectionName
      );
      return {
        key,
        className,
        sectionName,
        subjects: grouped[key],
        classSectionId: match?.masterSectionId ?? match?.id ?? 0,
      };
    });
  }, [keys, grouped, allSections]);

  const uniqueSubjectsCount = useMemo(() => {
    return new Set(mySubjectDetails.map((s) => s.subjectName)).size;
  }, [mySubjectDetails]);

  // Fetch student counts dynamically for each section
  const studentQueries = useQueries({
    queries: resolvedClassSections.map((cs) => ({
      queryKey: ['student-list-count', cs.classSectionId],
      queryFn: () => studentService.list({ classSectionId: cs.classSectionId, limit: 1 }),
      enabled: !!cs.classSectionId && cs.classSectionId > 0,
    })),
  });

  // Calculate total students across all assigned sections dynamically
  const totalStudentsTaught = useMemo(() => {
    let total = 0;
    studentQueries.forEach((q) => {
      const count = (q.data as any)?.pagination?.totalItemsCount ?? (q.data as any)?.items?.length ?? 0;
      total += count;
    });
    return total;
  }, [studentQueries]);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50/30 min-h-screen">
      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">My Classes</h1>
          <p className="text-xs text-slate-400 mt-1">Analytical dashboard for subjects and sections assigned to your teacher profile</p>
        </div>
      </div>

      {/* Premium KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { value: mySubjectDetails.length, label: 'Subject Mappings', sub: 'Active course schedules', icon: BookOpen, iconColor: 'text-violet-600 bg-violet-50 border-violet-100' },
          { value: keys.length, label: 'Class Sections', sub: 'Assigned classroom groups', icon: GraduationCap, iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { value: uniqueSubjectsCount, label: 'Curriculum Subjects', sub: 'Distinct subject courses', icon: Users, iconColor: 'text-blue-600 bg-blue-50 border-blue-100' },
          { value: `${totalStudentsTaught}+`, label: 'Students Reached', sub: 'Combined classroom enrollment', icon: TrendingUp, iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        ].map((k, i) => (
          <Card key={i} className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${k.iconColor}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">{k.value}</span>
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mt-1.5">{k.label}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{k.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class-wise cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-slate-100 shadow-sm rounded-3xl animate-pulse">
              <CardContent className="p-6 h-48 bg-slate-50/50" />
            </Card>
          ))}
        </div>
      ) : resolvedClassSections.length === 0 ? (
        <Card className="border border-dashed border-slate-200 rounded-3xl">
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">No classes assigned yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Please contact your administrator to map your teacher profile to subjects and sections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Classrooms Timetables & Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resolvedClassSections.map((item) => (
              <ClassCard
                key={item.key}
                classKey={item.key}
                className={item.className}
                sectionName={item.sectionName}
                subjects={item.subjects}
                classSectionId={item.classSectionId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
