'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { useSubjectDetails, useClassSectionLists } from '@/hooks/useClasses';
import { useHomeworks, useClassworks, useSubjectProgress } from '@/hooks/useAcademic';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';
import {
  ArrowLeft, Users, CheckCircle2, XCircle, Clock, AlertCircle,
  BookOpen, ClipboardCheck, FileText, Plus, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

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

const PROGRESS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  not_started: 'bg-slate-100 text-slate-600 border-slate-200',
};

function SubjectProgressItem({ subjectId, classSectionId, subjectName }: { subjectId: number; classSectionId?: number; subjectName: string }) {
  const { data: progress } = useSubjectProgress(subjectId, classSectionId, CURRENT_SESSION);

  if (!progress) return null;

  const percentage = progress.overallPercentage ?? 0;
  const chaptersCount = progress.chapters?.length ?? 0;

  return (
    <div className="px-6 py-4 hover:bg-muted/5 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-foreground">📚 {subjectName}</span>
            <span className="text-xs font-bold text-primary">{percentage}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {chaptersCount} Chapters in total
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all',
                percentage >= 80 ? 'bg-emerald-500' :
                  percentage >= 40 ? 'bg-blue-500' : 'bg-amber-500'
              )}
              style={{ width: `${percentage}%` }}
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

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const className = decodeURIComponent(params.className as string);
  const sectionName = decodeURIComponent(params.sectionName as string);
  const today = new Date().toISOString().split('T')[0];

  // Get teacher's subject-class assignments (reliable classDtlsId)
  const { data: allSubjectDetails = [] } = useSubjectDetails(user?.id);
  const mySubjects = useMemo(
    () => allSubjectDetails.filter(
      (sd) => sd.className === className && sd.sectionName === sectionName
    ),
    [allSubjectDetails, className, sectionName],
  );

  // Derive classSectionId from teacher's mapping or class teacher assignment (more reliable)
  const teacherClassSectionId = useMemo(() => {
    if (user?.classTeacherClass?.className === className && user?.classTeacherClass?.sectionName === sectionName) {
      return (user.classTeacherClass as any).classDtlsId;
    }
    return mySubjects.length > 0 ? mySubjects[0].classDtlsId : undefined;
  }, [user, className, sectionName, mySubjects]);

  const isClassTeacher = useMemo(() => {
    if (!user) return false;
    // Check if user is a class teacher and assigned class matches this one
    const ctClass = user.classTeacherClass;
    return user.isClassTeacher && 
           ctClass?.className === className && 
           ctClass?.sectionName === sectionName;
  }, [user, className, sectionName]);

  // Fallback: global class sections list
  const { data: allSections = [] } = useClassSectionLists();
  const classSection = allSections.find(s => s.className === className && s.sectionName === sectionName);

  // Use teacher's classDtlsId first, fallback to global list (skip negative IDs)
  const resolvedClassSectionId = teacherClassSectionId
    || (classSection?.id && classSection.id > 0 ? classSection.id : undefined);

  // All subjects for this class (only used for class teacher view)
  const { data: classWideSubjects = [] } = useSubjectDetails(
    undefined,
    CURRENT_SESSION,
    resolvedClassSectionId
  );

  const displaySubjects = isClassTeacher ? classWideSubjects : mySubjects;

  // Students for this class-section - Added className/sectionName fallbacks
  const { data: studentData, isLoading: studentsLoading } = useStudentList({
    classSectionId: resolvedClassSectionId,
    className: !resolvedClassSectionId ? className : undefined,
    sectionName: !resolvedClassSectionId ? sectionName : undefined,
    limit: 200,
  });

  // Create a subject name map for lookups in HW/CW lists
  const subjectNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    // Merge all possible sources of subject info
    [...allSubjectDetails, ...classWideSubjects].forEach((s: any) => {
      if (s.subjectDtlsId) map[String(s.subjectDtlsId)] = s.subjectName;
    });
    return map;
  }, [allSubjectDetails, classWideSubjects]);

  // Today's attendance records - Added className/sectionName fallbacks
  const { data: attendanceRaw } = useFilterAttendance({
    classSectionId: resolvedClassSectionId,
    className: !resolvedClassSectionId ? className : undefined,
    sectionName: !resolvedClassSectionId ? sectionName : undefined,
    date: today
  });

  // Homework & Classwork
  const { data: allHomeworks = [] } = useHomeworks(className);
  const { data: allClassworks = [] } = useClassworks(className);

  // Filter homework/classwork for this class-section
  const homeworks = useMemo(() => 
    allHomeworks.filter(h => h.className === className && h.sectionName === sectionName),
    [allHomeworks, className, sectionName]
  );

  const classworks = useMemo(() => {
    // Classwork might use classId/sectionId strings
    return allClassworks.filter(cw => {
      const matchClass = cw.classId === className || (cw as any).className === className;
      const matchSection = cw.sectionId === sectionName || (cw as any).sectionName === sectionName;
      return matchClass && matchSection;
    });
  }, [allClassworks, className, sectionName]);

  const students = studentData?.items ?? [];
  
  // Refactor attendanceMap to be more resilient (using both ID and Roll Number)
  const attendanceMap = useMemo(() => {
    const rawRecords: any[] = Array.isArray(attendanceRaw)
      ? attendanceRaw
      : Array.isArray((attendanceRaw as any)?.items) ? (attendanceRaw as any).items
        : Array.isArray((attendanceRaw as any)?.data) ? (attendanceRaw as any).data
          : [];
    
    const map = new Map<string, string>();
    rawRecords.forEach((r: any) => {
      const status = r.attendanceStatus || r.status || 'Present';
      if (r.studentId) map.set(String(r.studentId), status);
      if (r.studentRollNumber) map.set(`roll-${r.studentRollNumber}`, status);
      if (r.rollNumber) map.set(`roll-${r.rollNumber}`, status);
    });
    return map;
  }, [attendanceRaw]);

  const getStudentStatus = (s: any) => {
    const rollNo = s.academics?.[0]?.rollNumber;
    return attendanceMap.get(String(s.id)) || (rollNo ? attendanceMap.get(`roll-${rollNo}`) : null);
  };

  const absentStudents = students.filter((s) => getStudentStatus(s) === 'Absent');
  const presentCount = students.filter((s) => getStudentStatus(s) === 'Present').length;
  const notMarkedCount = students.filter((s) => !getStudentStatus(s)).length;

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
            {isClassTeacher && (
              <Badge variant="default" className="rounded-lg bg-indigo-600 hover:bg-indigo-700">Class Teacher</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Today: {today}</p>
        </div>
      </div>

      {/* My subjects for this class */}
      {mySubjects.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Taught Subjects</p>
          <div className="flex flex-wrap gap-2">
            {mySubjects.map((sd) => (
              <div key={sd.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                <BookOpen className="h-3 w-3" /> {sd.subjectName}
              </div>
            ))}
          </div>
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
        <TabsList className="rounded-xl flex-wrap">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="homework">Homework ({homeworks.length})</TabsTrigger>
          <TabsTrigger value="classwork">Classwork ({classworks.length})</TabsTrigger>
          <TabsTrigger value="progress">Academic Progress</TabsTrigger>
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
                        const status = getStudentStatus(s);
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

        {/* Homework */}
        <TabsContent value="homework" className="mt-4">
          <Card className="erp-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Homework</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{homeworks.length} assignment{homeworks.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/dashboard/teacher/academic">
                <Button size="sm" className="rounded-xl h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Homework
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {homeworks.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground">No homework assigned yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create homework from the Academic section</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {homeworks.map((hw) => (
                    <div key={hw.id} className="px-6 py-4 hover:bg-muted/5 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate">{hw.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{hw.description}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] rounded-lg bg-indigo-50/50 text-indigo-700 border-indigo-100">
                              {subjectNameMap[hw.subjectId] || `Subject: ${hw.subjectId}`}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-semibold">By: {hw.assignedBy || 'Assigned Teacher'}</span>
                            {hw.chapterId && (
                              <Badge variant="outline" className="text-[10px] rounded-lg">
                                Ch #{hw.chapterId}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due</p>
                          <p className="text-sm font-bold text-foreground">{formatDate(new Date(hw.dueDate), 'MMM dd')}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDate(new Date(hw.assignedDate || hw.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classwork */}
        <TabsContent value="classwork" className="mt-4">
          <Card className="erp-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Classwork</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{classworks.length} entr{classworks.length !== 1 ? 'ies' : 'y'}</p>
              </div>
              <Link href="/dashboard/teacher/academic">
                <Button size="sm" className="rounded-xl h-8 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Classwork
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {classworks.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground">No classwork recorded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Record classwork from the Academic section</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {classworks.map((cw) => (
                    <div key={cw.id} className="px-6 py-4 hover:bg-muted/5 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{cw.description}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] rounded-lg bg-teal-50/50 text-teal-700 border-teal-100">
                              {subjectNameMap[cw.subjectId] || `Subject: ${cw.subjectId}`}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">By Teacher ID: {cw.teacherId}</span>
                            {cw.chapterId && (
                              <Badge variant="outline" className="text-[10px] rounded-lg">
                                Ch #{cw.chapterId}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conducted</p>
                          <p className="text-sm font-bold text-foreground">{formatDate(new Date(cw.conductedOn || cw.createdAt), 'MMM dd')}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDate(new Date(cw.conductedOn || cw.createdAt), 'yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teaching Progress */}
        <TabsContent value="progress" className="mt-4">
          <Card className="erp-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Academic Progress</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isClassTeacher ? 'Class-wide coverage report' : `${mySubjects.length} subject${mySubjects.length !== 1 ? 's' : ''} assigned`}
                </p>
              </div>
              <Link href="/dashboard/teacher/academic">
                <Button size="sm" className="rounded-xl h-8 text-xs">
                  View Full Report
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {displaySubjects.length === 0 ? (
                <div className="py-16 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground">No subjects found</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {displaySubjects.map((sd) => (
                    <SubjectProgressItem
                      key={sd.id}
                      subjectId={sd.subjectDtlsId}
                      classSectionId={resolvedClassSectionId}
                      subjectName={sd.subjectName ?? ''}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
