'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowLeft, Users, CheckCircle2, XCircle, Clock, AlertCircle,
  BookOpen, ClipboardCheck, Construction,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  Present: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Absent: 'border-red-200   bg-red-50   text-red-700',
  Late: 'border-amber-200 bg-amber-50  text-amber-700',
  HalfDay: 'border-blue-200  bg-blue-50   text-blue-700',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Present: <CheckCircle2 className="h-3 w-3" />,
  Absent: <XCircle className="h-3 w-3" />,
  Late: <Clock className="h-3 w-3" />,
  HalfDay: <AlertCircle className="h-3 w-3" />,
};

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const className = decodeURIComponent(params.className as string);
  const sectionName = decodeURIComponent(params.sectionName as string);
  const today = new Date().toISOString().split('T')[0];

  // Students for this class-section
  const { data: studentData, isLoading: studentsLoading } = useStudentList({
    className,
    sectionName,
    limit: 200,
  });

  // Today's attendance records
  const { data: attendanceRaw } = useFilterAttendance({ className, sectionName, date: today });

  // This teacher's subjects for this class-section
  const { data: allSubjectDetails = [] } = useSubjectDetails();
  const mySubjects = useMemo(
    () => allSubjectDetails.filter(
      (sd) => sd.teacherId === user?.id && sd.className === className && sd.sectionName === sectionName
    ),
    [allSubjectDetails, user?.id, className, sectionName],
  );

  const students = studentData?.items ?? [];
  const attendanceMap = useMemo(() => {
    const records: any[] = Array.isArray(attendanceRaw)
      ? attendanceRaw
      : Array.isArray((attendanceRaw as any)?.items) ? (attendanceRaw as any).items
        : Array.isArray((attendanceRaw as any)?.data) ? (attendanceRaw as any).data
          : [];
    return Object.fromEntries(records.map((r: any) => [r.studentId, r.status]));
  }, [attendanceRaw]);

  const absentStudents = students.filter((s) => attendanceMap[s.id] === 'Absent');
  const presentCount = students.filter((s) => attendanceMap[s.id] === 'Present').length;
  const notMarkedCount = students.filter((s) => !attendanceMap[s.id]).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl h-9 w-9 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{className}</h1>
            <Badge variant="secondary" className="rounded-lg">Section {sectionName}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Today: {today}</p>
        </div>
      </div>

      {/* My subjects for this class */}
      {mySubjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mySubjects.map((sd) => (
            <div key={sd.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <BookOpen className="h-3 w-3" /> {sd.subjectName}
            </div>
          ))}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-500   bg-blue-500/10' },
          { label: 'Present Today', value: presentCount, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Absent Today', value: absentStudents.length, icon: XCircle, color: 'text-red-500    bg-red-500/10' },
          { label: 'Not Marked', value: notMarkedCount, icon: AlertCircle, color: 'text-amber-500  bg-amber-500/10' },
        ].map((kpi) => (
          <Card key={kpi.label} className="erp-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Absent highlight banner */}
      {absentStudents.length > 0 && (
        <Card className="erp-card border-l-4 border-l-red-500 bg-red-50/40">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Absent Today ({absentStudents.length} students)
            </p>
            <div className="flex flex-wrap gap-2">
              {absentStudents.map((s) => {
                const rollNo = s.academics?.[0]?.rollNumber;
                return (
                  <Badge key={s.id} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                    {s.firstName} {s.lastName}
                    {rollNo && <span className="ml-1 opacity-60">#{rollNo}</span>}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList className="rounded-xl">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
        </TabsList>

        {/* Students */}
        <TabsContent value="students" className="mt-4">
          <Card className="erp-card overflow-hidden">
            <CardContent className="p-0">
              {studentsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                </div>
              ) : students.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground">No students enrolled</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/10">
                        {['#', 'Name', 'Roll No.', 'Gender', "Today's Status", ''].map((h) => (
                          <th key={h} className="text-left py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => {
                        const status = attendanceMap[s.id] ?? null;
                        const rollNo = s.academics?.[0]?.rollNumber ?? '—';
                        return (
                          <tr
                            key={s.id}
                            className={cn(
                              'border-b border-border/30 hover:bg-muted/10 transition-colors',
                              status === 'Absent' && 'bg-red-50/40',
                            )}
                          >
                            <td className="py-3 px-5 text-sm text-muted-foreground">{idx + 1}</td>
                            <td className="py-3 px-5 text-sm font-semibold">{s.firstName} {s.lastName}</td>
                            <td className="py-3 px-5 text-sm text-muted-foreground">{rollNo}</td>
                            <td className="py-3 px-5 text-sm text-muted-foreground capitalize">{s.gender ?? '—'}</td>
                            <td className="py-3 px-5">
                              {status ? (
                                <Badge variant="outline" className={cn('text-[10px] flex items-center gap-1 w-fit', STATUS_STYLES[status])}>
                                  {STATUS_ICON[status]} {status}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">Not Marked</Badge>
                              )}
                            </td>
                            <td className="py-3 px-5">
                              <Link href={`/dashboard/teacher/students/${s.id}`}>
                                <Button variant="ghost" size="sm" className="rounded-xl h-7 px-3 text-xs font-bold hover:bg-primary/10 hover:text-primary">
                                  Profile
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance shortcut */}
        <TabsContent value="attendance" className="mt-4">
          <Card className="erp-card">
            <CardContent className="p-8 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-primary/30" />
              <p className="text-base font-bold text-foreground mb-1">Mark Today's Attendance</p>
              <p className="text-sm text-muted-foreground mb-5">
                Use the full attendance page to record present, absent, late, and half-day status.
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/dashboard/teacher/attendance">Open Attendance Page</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marks placeholder */}
        <TabsContent value="marks" className="mt-4">
          <ComingSoon label="Marks & Grades" description="Exam results and grade tracking will appear here." />
        </TabsContent>

        {/* Homework placeholder */}
        <TabsContent value="homework" className="mt-4">
          <ComingSoon label="Homework & Classwork" description="Assignment tracking and classwork logs will appear here." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComingSoon({ label, description }: { label: string; description: string }) {
  return (
    <Card className="erp-card">
      <CardContent className="p-12 text-center">
        <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-base font-bold text-foreground mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant="outline" className="mt-4 text-xs">Coming Soon</Badge>
      </CardContent>
    </Card>
  );
}
