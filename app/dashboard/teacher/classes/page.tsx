'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useSubjectDetails } from '@/hooks/useClasses';
import { BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TeacherClassesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: allSubjectDetails = [], isLoading } = useSubjectDetails();

  // Filter to only this teacher's assignments
  const mySubjectDetails = useMemo(
    () => allSubjectDetails.filter((sd) => sd.teacherId === user?.id),
    [allSubjectDetails, user?.id],
  );

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

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Classes</h1>
        <p className="text-muted-foreground mt-1">Subjects and classes assigned to you</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="erp-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mySubjectDetails.length}</p>
              <p className="text-xs text-muted-foreground">Subject Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="erp-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{keys.length}</p>
              <p className="text-xs text-muted-foreground">Class Sections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="erp-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{new Set(mySubjectDetails.map((s) => s.subjectName)).size}</p>
              <p className="text-xs text-muted-foreground">Unique Subjects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="erp-card animate-pulse">
              <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold text-muted-foreground">No classes assigned</p>
          <p className="text-xs text-muted-foreground mt-1">Ask your admin to assign you to a class via Subject Mapping</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keys.map((key) => {
            const [className, sectionName] = key.split('|');
            const subjects = grouped[key];
            return (
              <Card key={key} className="erp-card hover:shadow-md transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{className}</h3>
                      <p className="text-sm text-muted-foreground">Section {sectionName}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-lg">
                      {subjects.length} subject{subjects.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {subjects.map((sd) => (
                      <div key={sd.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/20">
                        <BookOpen className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                        <span className="text-sm font-medium">{sd.subjectName}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border/30 flex gap-2">
                    <Button asChild size="sm" className="rounded-lg text-xs h-8">
                      <Link href={`/dashboard/teacher/classes/${encodeURIComponent(className)}/${encodeURIComponent(sectionName)}`}>
                        View Class <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
                      <Link href="/dashboard/teacher/attendance">Mark Attendance</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
