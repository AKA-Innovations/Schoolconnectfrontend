'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClassSectionLists, useSubjectDetails, useTimetable } from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { Compass, Users, BookOpen, Calendar, GraduationCap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CoordinatorDashboard() {
  const user               = useAuthStore((s) => s.user);
  const schoolId           = useAuthStore((s) => s.schoolId);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [], isLoading: loadingClasses } = useClassSectionLists();
  const { data: subjectDetails   = [] }                            = useSubjectDetails();
  const { data: timetableEntries = [] }                            = useTimetable();
  const { data: teachersData }                                     = useTeacherList({ schoolId: schoolId ?? '', page: 1, pageSize: 500 });
  const allTeachers = (teachersData as any)?.items ?? (teachersData as any)?.data ?? [];

  // Scope to coordinator's assigned classes
  const mySections = useMemo(
    () => coordinatorClasses.length > 0
      ? allClassSections.filter((cs) => coordinatorClasses.includes(cs.className))
      : allClassSections,
    [allClassSections, coordinatorClasses],
  );

  const mySubjectDetails = useMemo(
    () => coordinatorClasses.length > 0
      ? subjectDetails.filter((sd) => coordinatorClasses.includes(sd.className))
      : subjectDetails,
    [subjectDetails, coordinatorClasses],
  );

  const mySdIds = useMemo(() => new Set(mySubjectDetails.map((sd) => sd.id)), [mySubjectDetails]);
  const myTimetableEntries = useMemo(
    () => timetableEntries.filter((e) => mySdIds.has(e.teacherClassId)),
    [timetableEntries, mySdIds],
  );

  const myTeacherIds = useMemo(
    () => new Set(mySubjectDetails.map((sd) => sd.teacherId)),
    [mySubjectDetails],
  );
  const myTeachers = useMemo(
    () => (allTeachers as any[]).filter((t: any) => myTeacherIds.has(t.id)),
    [allTeachers, myTeacherIds],
  );

  // Group sections by className
  const classSummary = useMemo(() => {
    const classMap = new Map<string, { sections: string[]; subjects: Set<string>; teacherCount: number }>();
    mySections.forEach((cs) => {
      if (!classMap.has(cs.className)) {
        classMap.set(cs.className, { sections: [], subjects: new Set(), teacherCount: 0 });
      }
      classMap.get(cs.className)!.sections.push(cs.sectionName);
    });
    mySubjectDetails.forEach((sd) => {
      const entry = classMap.get(sd.className);
      if (entry) entry.subjects.add(sd.subjectName);
    });
    myTeachers.forEach((t: any) => {
      mySubjectDetails.filter((sd) => sd.teacherId === t.id).forEach((sd) => {
        const entry = classMap.get(sd.className);
        if (entry) entry.teacherCount++;
      });
    });
    return Array.from(classMap.entries()).map(([className, data]) => ({
      className,
      sections: [...new Set(data.sections)].sort(),
      subjects: [...data.subjects].sort(),
      timetabled: myTimetableEntries.filter((e) => {
        const sd = mySubjectDetails.find((s) => s.id === e.teacherClassId);
        return sd?.className === className;
      }).length,
    }));
  }, [mySections, mySubjectDetails, myTeachers, myTimetableEntries]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
          <Compass className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {coordinatorClasses.length > 0
              ? `Scope: ${coordinatorClasses.join(' · ')}`
              : 'Academic coordination overview'}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Classes',       value: new Set(mySections.map(s => s.className)).size, icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Sections',         value: mySections.length,                              icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Subject Teachers', value: myTeachers.length,                              icon: Users,         color: 'text-green-500 bg-green-500/10' },
          { label: 'Timetable Slots',  value: myTimetableEntries.length,                      icon: Calendar,      color: 'text-purple-500 bg-purple-500/10' },
        ].map((kpi) => (
          <Card key={kpi.label} className="erp-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Classes grid */}
      <div>
        <h2 className="text-lg font-bold mb-4">My Classes</h2>
        {loadingClasses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Card key={i} className="erp-card animate-pulse"><CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent></Card>)}
          </div>
        ) : classSummary.length === 0 ? (
          <Card className="erp-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold">No classes assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classSummary.map((cls) => (
              <Card key={cls.className} className="erp-card hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">{cls.className}</h3>
                    <Badge variant="secondary" className="rounded-lg">
                      {cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cls.sections.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] rounded-md border-border/50">{s}</Badge>
                    ))}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      {cls.subjects.length} subject{cls.subjects.length !== 1 ? 's' : ''}: {cls.subjects.slice(0, 3).join(', ')}{cls.subjects.length > 3 ? '…' : ''}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {cls.timetabled} timetable entries
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Subject Teacher Overview */}
      {myTeachers.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Subject Teachers ({myTeachers.length})</h2>
          <Card className="erp-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/10">
                      {['Name', 'Employee ID', 'Assigned Subjects'].map((h) => (
                        <th key={h} className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(myTeachers as any[]).map((t: any) => {
                      const tSubjects = mySubjectDetails.filter((sd) => sd.teacherId === t.id);
                      return (
                        <tr key={t.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                          <td className="py-3 px-6 font-semibold text-sm">{t.firstName} {t.lastName}</td>
                          <td className="py-3 px-6 text-sm text-muted-foreground">{t.employeeId}</td>
                          <td className="py-3 px-6">
                            <div className="flex flex-wrap gap-1">
                              {tSubjects.map((sd) => (
                                <Badge key={sd.id} variant="secondary" className="text-[10px] rounded-md">
                                  {sd.className}-{sd.sectionName}: {sd.subjectName}
                                </Badge>
                              ))}
                              {tSubjects.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
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
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useCoordinatorDashboard } from '../../../hooks/useCoordinatorDashboard';
import { StatsRow } from '../../../components/dashboard/StatsRow';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Layers, BookOpen, Users, ClipboardList } from 'lucide-react';

export default function CoordinatorDashboard() {
  const { data: summary, isLoading } = useCoordinatorDashboard();

  const actions = [
    { label: 'Create Assessment', icon: ClipboardList, onClick: () => {}, variant: 'default' as const },
    { label: 'Update Curriculum', icon: BookOpen, onClick: () => {} },
    { label: 'Assign Teacher', icon: Users, onClick: () => {} },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Dashboard</h1>
        <p className="text-muted-foreground mt-1">Academic and department coordination</p>
      </div>

      <StatsRow stats={summary?.kpis} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex-1 space-y-4 p-8 pt-6">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)
              ) : (
                summary?.subjects.map((sub) => (
                  <div key={sub.id} className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded text-primary">
                          <Layers size={20} />
                        </div>
                          <h4 className="font-bold text-foreground">{sub.name}</h4>
                      </div>
                      <span className="text-sm font-bold text-primary">{sub.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${sub.progress}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <QuickActions actions={actions} />
          
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">Assessment Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <p className="text-sm font-medium">Mid-terms (Locked)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-medium">Monthly Quiz Oct (Active)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <p className="text-sm font-medium">Final Exams (Draft)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
