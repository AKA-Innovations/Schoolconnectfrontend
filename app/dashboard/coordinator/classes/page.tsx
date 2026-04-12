'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClassSectionLists, useSubjectDetails, useTimetable } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Users, Calendar, ArrowRight, GraduationCap } from 'lucide-react';

export default function CoordinatorClassesPage() {
  const user = useAuthStore((s) => s.user);
  const coordinatorClasses = user?.coordinatorClasses ?? [];

  const { data: allClassSections = [], isLoading } = useClassSectionLists();
  const { data: subjectDetails = [] } = useSubjectDetails();
  const { data: timetableEntries = [] } = useTimetable();

  // Scope to coordinator's assigned classes
  const classSections = useMemo(
    () => coordinatorClasses.length > 0
      ? allClassSections.filter((cs) => coordinatorClasses.includes(cs.className))
      : allClassSections,
    [allClassSections, coordinatorClasses],
  );

  // Group by className
  const classGroups = useMemo(() => {
    const map: Record<string, typeof classSections> = {};
    classSections.forEach((cs) => {
      if (!map[cs.className]) map[cs.className] = [];
      map[cs.className].push(cs);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [classSections]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Managed Classes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {coordinatorClasses.length > 0
              ? `You coordinate: ${coordinatorClasses.join(', ')}`
              : 'All classes overview'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : classGroups.length === 0 ? (
        <Card className="erp-card">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold text-muted-foreground">No classes assigned</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Contact admin to assign coordinator classes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {classGroups.map(([className, sections]) => (
            <div key={className}>
              <h2 className="text-xl font-bold mb-4">{className}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((cs) => {
                  const sectionSubjects = subjectDetails.filter(
                    (sd) => sd.className === cs.className && sd.sectionName === cs.sectionName,
                  );
                  const sectionTimetable = timetableEntries.filter((e) =>
                    sectionSubjects.some((sd) => sd.id === e.teacherClassId),
                  );
                  const uniqueTeachers = new Set(sectionSubjects.map((sd) => sd.teacherId)).size;

                  return (
                    <Card key={cs.id} className="erp-card group hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{cs.className}</h3>
                            <Badge variant="secondary" className="rounded-lg mt-1">
                              Section {cs.sectionName}
                            </Badge>
                          </div>
                          {(cs as any).classTeacherName && (
                            <Badge className="rounded-lg bg-blue-100 text-blue-700 border-0 text-[10px]">
                              CT: {(cs as any).classTeacherName}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mt-3">
                          {[
                            { label: 'Subjects', value: sectionSubjects.length, icon: BookOpen },
                            { label: 'Teachers', value: uniqueTeachers, icon: Users },
                            { label: 'TT Slots', value: sectionTimetable.length, icon: Calendar },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-muted/20 rounded-lg py-2">
                              <p className="text-base font-bold">{stat.value}</p>
                              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                            </div>
                          ))}
                        </div>

                        <Button asChild variant="outline" size="sm" className="w-full mt-4 rounded-lg text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Link href={`/dashboard/coordinator/classes/${encodeURIComponent(cs.className)}/${encodeURIComponent(cs.sectionName)}`}>
                            View Details <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
