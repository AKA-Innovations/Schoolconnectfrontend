'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useSubjectDetails } from '@/hooks/useClasses';
import { BookOpen, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function TeacherClassesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: subjectDetails = [], isLoading } = useSubjectDetails();

  // Since we don't have a direct filter by teacherId atm, show all (backend should scope by auth)
  // Group by class
  const grouped = useMemo(() => {
    const map: Record<string, typeof subjectDetails> = {};
    subjectDetails.forEach((sd) => {
      const key = `${sd.className ?? 'Unknown'} — ${sd.sectionName ?? ''}`;
      if (!map[key]) map[key] = [];
      map[key].push(sd);
    });
    return map;
  }, [subjectDetails]);

  const classNames = Object.keys(grouped);

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
              <p className="text-2xl font-bold">{subjectDetails.length}</p>
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
              <p className="text-2xl font-bold">{classNames.length}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="erp-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{new Set(subjectDetails.map((s) => s.subjectName)).size}</p>
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
      ) : classNames.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold text-muted-foreground">No classes assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classNames.map((className) => (
            <Card key={className} className="erp-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{className}</h3>
                  <Badge variant="secondary" className="rounded-lg">
                    {grouped[className].length} subject{grouped[className].length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {grouped[className].map((sd) => (
                    <div key={sd.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <BookOpen className="h-4 w-4 text-primary/60" />
                      <span className="text-sm font-medium">{sd.subjectName}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex gap-2">
                  <Link href="/dashboard/teacher/attendance" className="text-xs text-primary hover:underline font-medium">
                    Mark Attendance →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
