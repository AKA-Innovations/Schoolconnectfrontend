'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClassSectionLists, useSubjectDetails } from '@/hooks/useClasses';
import { useTeacherList } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';
import { Users, Search, ArrowRight } from 'lucide-react';

export default function CoordinatorTeachersPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [] } = useClassSectionLists();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: teachersData, isLoading } = useTeacherList({ schoolId, page: 1, pageSize: 500 });
  const allTeachers: any[] = (teachersData as any)?.items ?? (teachersData as any)?.data ?? [];

  const classSections = useMemo(
    () => coordinatorClasses.length > 0
      ? allClassSections.filter((cs) => coordinatorClasses.includes(cs.className))
      : allClassSections,
    [allClassSections, coordinatorClasses],
  );

  // Teachers who teach in coordinator's classes
  const scopedSubjects = useMemo(
    () => coordinatorClasses.length > 0
      ? subjectDetails.filter((sd) => coordinatorClasses.includes(sd.className))
      : subjectDetails,
    [subjectDetails, coordinatorClasses],
  );

  const scopedTeacherIds = useMemo(() => new Set(scopedSubjects.map((sd) => sd.teacherId)), [scopedSubjects]);
  // Include class teachers too
  const classTeacherIds = useMemo(
    () => new Set(classSections.map((cs) => (cs as any).classTeacherId).filter(Boolean)),
    [classSections],
  );

  const scopedTeachers = useMemo(
    () => allTeachers.filter((t) => scopedTeacherIds.has(t.id) || classTeacherIds.has(t.id)),
    [allTeachers, scopedTeacherIds, classTeacherIds],
  );

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return scopedTeachers;
    const q = search.toLowerCase();
    return scopedTeachers.filter((t) =>
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.employeeId?.toLowerCase().includes(q) ||
      t.mobileNumber?.includes(q),
    );
  }, [scopedTeachers, search]);

  // Build teacher → subjects map
  const teacherSubjectsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    scopedSubjects.forEach((sd) => {
      if (!map[sd.teacherId]) map[sd.teacherId] = [];
      map[sd.teacherId].push(`${sd.subjectName} (${sd.className}-${sd.sectionName})`);
    });
    return map;
  }, [scopedSubjects]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teachers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {coordinatorClasses.length > 0
              ? `Teachers in: ${coordinatorClasses.join(', ')}`
              : 'All teachers'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, or phone..." className="pl-9 rounded-xl" />
        </div>
        <Badge variant="secondary" className="rounded-lg shrink-0">{filtered.length} teachers</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <Card className="erp-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    {['#', 'Name', 'Employee ID', 'Phone', 'Roles', 'Subjects', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">No teachers found</td></tr>
                  ) : filtered.map((t, i) => (
                    <tr key={t.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-sm">{t.firstName} {t.lastName}</div>
                        <div className="text-xs text-muted-foreground">{t.emailId}</div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{t.employeeId}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{t.mobileNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {t.isPrincipal && <Badge className="text-[9px] bg-red-100 text-red-700 border-0">Principal</Badge>}
                          {t.isCoordinator && <Badge className="text-[9px] bg-purple-100 text-purple-700 border-0">Coordinator</Badge>}
                          {t.isClassTeacher && <Badge className="text-[9px] bg-blue-100 text-blue-700 border-0">Class Teacher</Badge>}
                          {t.isSubjectTeacher && <Badge className="text-[9px] bg-green-100 text-green-700 border-0">Subject</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(teacherSubjectsMap[t.id] ?? []).slice(0, 3).map((s) => (
                            <Badge key={s} variant="outline" className="text-[9px] rounded-md">{s}</Badge>
                          ))}
                          {(teacherSubjectsMap[t.id]?.length ?? 0) > 3 && (
                            <Badge variant="outline" className="text-[9px] rounded-md">+{teacherSubjectsMap[t.id].length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs h-7">
                          <Link href={`/dashboard/coordinator/teachers/${t.id}`}>
                            Profile <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
