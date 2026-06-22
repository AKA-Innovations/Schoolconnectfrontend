'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClassSectionLists, useSubjectDetails, useTimetable, usePeriodSlots } from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { teacherService } from '@/services/teacher.service';
import { CURRENT_SESSION } from '@/lib/constants';
import { Compass, Users, BookOpen, Calendar, GraduationCap, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CoordinatorDashboard() {
  const user               = useAuthStore((s) => s.user);
  const schoolId           = useAuthStore((s) => s.schoolId);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [], isLoading: loadingClasses } = useClassSectionLists();
  const { data: subjectDetails   = [] }                            = useSubjectDetails();
  const { data: rawTimetableEntries = [] }                         = useTimetable({ 
    session: CURRENT_SESSION,
  });
  
  // Normalization Layer: Resolves missing IDs from enriched names
  const timetableEntries = useMemo(() => {
    const raw = Array.isArray(rawTimetableEntries) ? rawTimetableEntries : [];
    return raw.map(e => {
      let classSubjectId = e.classSubjectId;
      if (!classSubjectId && e.subjectName) {
        const match = subjectDetails.find(sd => 
          String(sd.subjectName).trim().toLowerCase() === String(e.subjectName).trim().toLowerCase() && 
          String(sd.className) === String(e.className || '') &&
          String(sd.sectionName) === String(e.sectionName || '')
        );
        if (match) classSubjectId = String(match.id);
      }
      return { ...e, classSubjectId };
    });
  }, [rawTimetableEntries, subjectDetails]);
  const { data: teachersData }                                     = useTeacherList({ schoolId: schoolId ?? '', page: 1, pageSize: 500 });
  const allTeachers = (teachersData as any)?.items ?? (teachersData as any)?.data ?? [];
  const [isSyncing, setIsSyncing] = React.useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  // Background Sync: Refresh coordinator classes on mount (same as attendance page)
  React.useEffect(() => {
    if (user?.id && token) {
      const syncProfile = async () => {
        setIsSyncing(true);
        try {
          const details = await teacherService.getTeacherById(user.id);
          const newMappings = details.coordinatorMappings ?? [];
          
          const currentIds = coordinatorClasses.map(c => (typeof c === 'object' ? c.id : c)).sort();
          const newIds = newMappings.map(m => m.id).sort();

          if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
            setAuth({
              user: { ...user, coordinatorClasses: newMappings },
              token: token
            });
          }
        } catch (err) {
          console.error('Failed to sync coordinator profile:', err);
        } finally {
          setIsSyncing(false);
        }
      };
      syncProfile();
    }
  }, [user?.id, token, setAuth]);

  // Normalize coordinator classes to strings for filtering
  const coordClassNames = useMemo(() => {
    const names = coordinatorClasses.map(c => typeof c === 'object' ? c.className : c).filter(Boolean);
    console.log('Coordinator Classes from Store:', coordinatorClasses);
    console.log('Normalized Class Names:', names);
    return names;
  }, [coordinatorClasses]);

  // Scope to coordinator's assigned classes
  const mySections = useMemo(
    () => {
      console.log('All Class Sections available:', allClassSections);
      const filtered = coordClassNames.length > 0
        ? allClassSections.filter((cs) => coordClassNames.includes(String(cs.className)))
        : allClassSections;
      console.log('Filtered Sections:', filtered);
      return filtered;
    },
    [allClassSections, coordClassNames],
  );

  const mySubjectDetails = useMemo(
    () => coordClassNames.length > 0
      ? subjectDetails.filter((sd) => coordClassNames.includes(String(sd.className)))
      : subjectDetails,
    [subjectDetails, coordClassNames],
  );

  const mySdIds = useMemo(() => new Set(mySubjectDetails.map((sd) => String(sd.id))), [mySubjectDetails]);
  const myTimetableEntries = useMemo(
    () => timetableEntries.filter((e) => mySdIds.has(String(e.classSubjectId))),
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
      const cls = cs.className || '';
      if (!classMap.has(cls)) {
        classMap.set(cls, { sections: [], subjects: new Set(), teacherCount: 0 });
      }
      classMap.get(cls)!.sections.push(cs.sectionName || '');
    });
    mySubjectDetails.forEach((sd) => {
      const entry = classMap.get(sd.className || '');
      if (entry) entry.subjects.add(sd.subjectName || '');
    });
    myTeachers.forEach((t: any) => {
      mySubjectDetails.filter((sd) => sd.teacherId === t.id).forEach((sd) => {
        const entry = classMap.get(sd.className || '');
        if (entry) entry.teacherCount++;
      });
    });
    return Array.from(classMap.entries()).map(([className, data]) => ({
      className,
      sections: [...new Set(data.sections)].sort(),
      subjects: [...data.subjects].sort(),
      timetabled: myTimetableEntries.filter((e) => {
        const sd = mySubjectDetails.find((s) => String(s.id) === String(e.classSubjectId));
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Coordinator Dashboard
            {isSyncing && <RefreshCw className="h-4 w-4 animate-spin text-primary opacity-50" />}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {coordClassNames.length > 0
              ? `Scope: ${coordClassNames.join(' · ')}`
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
