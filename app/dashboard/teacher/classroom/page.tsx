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
  ChevronDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useStudentList, useFilterAttendance } from '@/hooks/useStudents';
import { useSubjectDetails, useClassSectionLists } from '@/hooks/useClasses';
import { useSubjectProgress } from '@/hooks/useAcademic';
import { useDebounce } from '@/hooks/useDebounce';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import Link from 'next/link';
import { Loader2, TrendingUp } from 'lucide-react';

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

export default function ClassRoomPage() {
  const { user, isClassTeacher, assignedClass, isSyncing } = useTeacherProfile();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const debouncedSearch = useDebounce(search, 400);

  const { data: mySubjects = [] } = useSubjectDetails(user?.id, CURRENT_SESSION);
  const { data: allSections = [] } = useClassSectionLists();

  // Resolve assignedClass names if they are missing but ID is present (lookup from allSections)
  const resolvedAssignedClass = useMemo(() => {
    if (!assignedClass) return null;
    if (assignedClass.className && assignedClass.sectionName) return assignedClass;

    // Try to find names in allSections list by ID (check multiple possible ID fields)
    const match = allSections.find(s => 
      s.id === assignedClass.classDtlsId || 
      s.id === assignedClass.id ||
      s.mappingId === assignedClass.id ||
      s.mappingId === assignedClass.classDtlsId
    );
    if (match) {
      return {
        ...assignedClass,
        className: match.className,
        sectionName: match.sectionName
      };
    }
    return assignedClass;
  }, [assignedClass, allSections]);

  // Final resolved IDs for data fetching
  const resolvedClassSectionId = resolvedAssignedClass?.classDtlsId;
  const selectedClass = resolvedAssignedClass?.className || '';
  const selectedSection = resolvedAssignedClass?.sectionName || '';
  const hasSelection = !!resolvedClassSectionId;

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

  const { data: todayAttendance } = useFilterAttendance({
    classSectionId: resolvedClassSectionId,
    date: today,
  }, { enabled: !!resolvedClassSectionId });

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
                          subjectId={sd.subjectDtlsId}
                          classSectionId={resolvedClassSectionId}
                          subjectName={sd.subjectName}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
