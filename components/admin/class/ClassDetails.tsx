'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClass, useClasses, useDeleteClass } from '@/hooks/useClasses';
import { useTeacher } from '@/hooks/useTeachers';
import { ArrowLeft, Edit2, Trash2, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function ClassTeacherDetailsCard({ classTeacherId, initialName }: { classTeacherId: string; initialName?: string | null }) {
  const { data: teacher } = useTeacher(classTeacherId);

  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/10">
        <CardTitle className="text-lg font-bold">Class Teacher</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teacher Name</p>
            <h3 className="text-base font-bold text-slate-800 mt-0.5">
              {teacher ? `${teacher.firstName} ${teacher.lastName}` : (initialName || 'Loading...')}
            </h3>
            <p className="text-xs text-muted-foreground/70 font-mono mt-1">ID: {classTeacherId}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClassDetails() {
  const params = useParams();
  const router = useRouter();
  const classDtlsId = parseInt(params?.id as string);

  const { data: classData, isLoading: classLoading } = useClass(classDtlsId);
  const { data: classesData, isLoading: sectionsLoading } = useClasses();
  const sections = React.useMemo(
    () => (classesData?.items || []).filter((c) => c.className === classData?.className),
    [classesData, classData?.className],
  );

  if (classLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Class not found</p>
        <Button onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {classData.className} – {classData.sectionName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage class section details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push(`/dashboard/admin/class/${classDtlsId}/edit`)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border shadow-sm bg-blue-50/50 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Class Name</p>
                <h3 className="text-2xl font-bold mt-2">{classData.className}</h3>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-sm bg-emerald-50/50 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Section</p>
                <h3 className="text-2xl font-bold mt-2">{classData.sectionName}</h3>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-600/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-sm bg-purple-50/50 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Max Limit</p>
                <h3 className="text-2xl font-bold mt-2">{classData.maxLimit ?? 'N/A'}</h3>
              </div>
              <Users className="h-8 w-8 text-purple-600/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Teacher */}
      {classData.classTeacherId && (
        <ClassTeacherDetailsCard classTeacherId={classData.classTeacherId} initialName={(classData as any).classTeacherName || (classData as any).teacherName} />
      )}

      {/* All Sections of this class */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10">
          <CardTitle className="text-lg font-bold">All Sections of {classData.className}</CardTitle>
          <CardDescription className="text-xs font-medium mt-1">
            {sections?.length || 0} section{sections?.length !== 1 ? 's' : ''} in this class
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sectionsLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading sections...</div>
          ) : sections && sections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest">Section</th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest">Max Limit</th>
                    <th className="px-8 py-4 text-left font-bold text-xs uppercase tracking-widest">Class Teacher ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.id} className={cn('border-b border-border/30 hover:bg-muted/2', section.id === classDtlsId && 'bg-primary/5')}>
                      <td className="px-8 py-4 font-semibold">
                        <Badge className={cn('border-0', section.id === classDtlsId ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                          {section.sectionName}
                        </Badge>
                      </td>
                      <td className="px-8 py-4">{section.maxLimit ?? '-'}</td>
                      <td className="px-8 py-4 font-mono text-xs text-muted-foreground">{section.classTeacherId ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">No sections found</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

