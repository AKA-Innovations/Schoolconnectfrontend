'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClassSectionLists, useSubjectDetails } from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import {
  GraduationCap, Users, BookOpen, ShieldCheck,
  TrendingUp, AlertCircle,
} from 'lucide-react';

export default function PrincipalDashboard() {
  const schoolId = useAuthStore((s) => s.schoolId);

  const { data: classSections = [],   isLoading: loadingClasses }   = useClassSectionLists();
  const { data: subjectDetails  = [], isLoading: loadingSubjects }   = useSubjectDetails();
  const { data: teachersData,         isLoading: loadingTeachers }   = useTeacherList({ schoolId: schoolId ?? '', page: 1, pageSize: 500 });
  const allTeachers: any[] = (teachersData as any)?.items ?? (teachersData as any)?.data ?? [];

  const isLoading = loadingClasses || loadingSubjects || loadingTeachers;

  // Unique class names
  const classNames = useMemo(() => [...new Set(classSections.map((cs) => cs.className))].sort(), [classSections]);

  // Subjects with no mapping (classes/sections that have no subject-teacher assignments)
  const coveredSectionKeys = useMemo(
    () => new Set(subjectDetails.map((sd) => `${sd.className}|${sd.sectionName}`)),
    [subjectDetails],
  );
  const uncoveredSections = useMemo(
    () => classSections.filter((cs) => !coveredSectionKeys.has(`${cs.className}|${cs.sectionName}`)),
    [classSections, coveredSectionKeys],
  );

  // Teachers with no classes assigned
  const teachersWithClasses = useMemo(() => new Set(subjectDetails.map((sd) => sd.teacherId)), [subjectDetails]);
  const unassignedTeachers  = useMemo(
    () => allTeachers.filter((t: any) => !teachersWithClasses.has(t.id) && t.isSubjectTeacher),
    [allTeachers, teachersWithClasses],
  );

  // Per-class summary
  const classSummary = useMemo(() => classNames.map((className) => {
    const sections    = classSections.filter((cs) => cs.className === className);
    const subjects    = subjectDetails.filter((sd) => sd.className === className);
    const teacherIds  = new Set(subjects.map((sd) => sd.teacherId));
    return {
      className,
      sectionCount:   sections.length,
      subjectCount:   new Set(subjects.map((sd) => sd.subjectName)).size,
      teacherCount:   teacherIds.size,
      covered:        sections.every((cs) => coveredSectionKeys.has(`${cs.className}|${cs.sectionName}`)),
    };
  }), [classNames, classSections, subjectDetails, coveredSectionKeys]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Principal Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">School-wide academic overview</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Classes',        value: classNames.length,                  icon: GraduationCap, color: 'text-blue-500   bg-blue-500/10' },
          { label: 'Sections',       value: classSections.length,               icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Teachers',       value: allTeachers.length,                 icon: Users,         color: 'text-green-500  bg-green-500/10' },
          { label: 'Subject Map.',   value: subjectDetails.length,              icon: BookOpen,      color: 'text-primary    bg-primary/10' },
        ].map((kpi) => (
          <Card key={kpi.label} className="erp-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                ) : (
                  <kpi.icon className="h-5 w-5" />
                )}
              </div>
              <div>
                {isLoading ? (
                  <div className="h-7 w-10 bg-muted rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{kpi.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(uncoveredSections.length > 0 || unassignedTeachers.length > 0) && !isLoading && (
        <div className="space-y-2">
          {uncoveredSections.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">{uncoveredSections.length} section{uncoveredSections.length > 1 ? 's' : ''} have no subject-teacher mappings: </span>
                {uncoveredSections.slice(0, 5).map((cs) => `${cs.className}-${cs.sectionName}`).join(', ')}
                {uncoveredSections.length > 5 ? ` +${uncoveredSections.length - 5} more` : ''}
              </div>
            </div>
          )}
          {unassignedTeachers.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">{unassignedTeachers.length} subject teacher{unassignedTeachers.length > 1 ? 's' : ''} not assigned to any class: </span>
                {unassignedTeachers.slice(0, 3).map((t: any) => `${t.firstName} ${t.lastName}`).join(', ')}
                {unassignedTeachers.length > 3 ? ` +${unassignedTeachers.length - 3} more` : ''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs: Academic Structure & Teacher Overview */}
      <Tabs defaultValue="classes">
        <TabsList className="rounded-xl">
          <TabsTrigger value="classes">Academic Structure</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Overview</TabsTrigger>
        </TabsList>

        {/* Academic Structure */}
        <TabsContent value="classes" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : classSummary.length === 0 ? (
            <Card className="erp-card">
              <CardContent className="p-8 text-center">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-bold text-muted-foreground">No classes defined yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classSummary.map((cls) => (
                <Card key={cls.className} className="erp-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{cls.className}</h3>
                      {cls.covered
                        ? <Badge className="rounded-lg bg-emerald-100 text-emerald-700 border-0 text-[10px]">Fully Mapped</Badge>
                        : <Badge className="rounded-lg bg-amber-100 text-amber-700 border-0 text-[10px]">Incomplete</Badge>
                      }
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mt-3">
                      {[
                        { label: 'Sections',  value: cls.sectionCount },
                        { label: 'Subjects',  value: cls.subjectCount },
                        { label: 'Teachers',  value: cls.teacherCount },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-muted/20 rounded-lg py-2">
                          <p className="text-base font-bold">{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {classSections.filter(cs => cs.className === cls.className).map((cs) => (
                        <Badge key={cs.id} variant="outline" className="text-[10px] rounded-md">{cs.sectionName}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Teacher Overview */}
        <TabsContent value="teachers" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <Card className="erp-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/10">
                        {['Teacher', 'Employee ID', 'Roles', 'Classes Assigned'].map((h) => (
                          <th key={h} className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allTeachers.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">No teachers found</td></tr>
                      ) : allTeachers.map((t: any) => {
                        const tSubjects      = subjectDetails.filter((sd) => sd.teacherId === t.id);
                        const tClassSections = [...new Set(tSubjects.map((sd) => `${sd.className}-${sd.sectionName}`))];
                        return (
                          <tr key={t.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-6">
                              <div className="font-semibold text-sm">{t.firstName} {t.lastName}</div>
                              <div className="text-xs text-muted-foreground">{t.emailId}</div>
                            </td>
                            <td className="py-3 px-6 text-sm text-muted-foreground">{t.employeeId}</td>
                            <td className="py-3 px-6">
                              <div className="flex flex-wrap gap-1">
                                {t.isPrincipal    && <Badge className="text-[9px] bg-red-100    text-red-700    border-0">Principal</Badge>}
                                {t.isCoordinator  && <Badge className="text-[9px] bg-purple-100 text-purple-700 border-0">Coordinator</Badge>}
                                {t.isClassTeacher && <Badge className="text-[9px] bg-blue-100   text-blue-700   border-0">Class Teacher</Badge>}
                                {t.isSubjectTeacher && <Badge className="text-[9px] bg-green-100 text-green-700  border-0">Subject</Badge>}
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex flex-wrap gap-1">
                                {tClassSections.length === 0
                                  ? <span className="text-xs text-muted-foreground/50">—</span>
                                  : tClassSections.map((cs) => (
                                    <Badge key={cs} variant="outline" className="text-[10px] rounded-md">{cs}</Badge>
                                  ))
                                }
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React from 'react';
import { usePrincipalDashboard } from '../../../hooks/usePrincipalDashboard';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';
import { MessageSquare, UserPlus, FileBarChart, CheckSquare } from 'lucide-react';

export default function PrincipalDashboard() {
  const { data: summary, isLoading } = usePrincipalDashboard();

  const actions = [
    { label: 'Post Announcement', icon: MessageSquare, onClick: () => {}, variant: 'default' as const },
    { label: 'Approve Leave', icon: CheckSquare, onClick: () => {} },
    { label: 'Academic Reports', icon: FileBarChart, onClick: () => {} },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Principal Dashboard</h1>
        <p className="text-muted-foreground mt-1">School-wide performance monitoring</p>
      </div>

      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Teacher Attendance & Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)
              ) : (
                summary?.teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center text-success font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        teacher.attendance === 'Present' ? "bg-success" : "bg-destructive"
                      )} />
                      <span className="text-sm font-medium">{teacher.attendance}</span>
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
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-secondary pl-4 py-1">
                <p className="text-xs text-muted-foreground">09:00 AM</p>
                <p className="text-sm font-bold">Assembly &amp; Prayer</p>
              </div>
              <div className="border-l-4 border-secondary pl-4 py-1">
                <p className="text-xs text-muted-foreground">11:00 AM</p>
                <p className="text-sm font-bold">HOD Weekly Meeting</p>
              </div>
              <div className="border-l-4 border-border pl-4 py-1">
                <p className="text-xs text-muted-foreground">02:30 PM</p>
                <p className="text-sm font-bold opacity-60">Parent Orientation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
