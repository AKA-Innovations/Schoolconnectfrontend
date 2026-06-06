'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubjectProgress } from '@/hooks/useAcademic';
import { BookOpen, User, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { CURRENT_SESSION } from '@/lib/constants';

interface ClassDetailTabProps {
  className: string;
  allTeachers: any[];
  classSections: any[];
  subjectDetails: any[];
  onBack: () => void;
}

// Sub-component to fetch and display progress for each subject mapping
function SubjectProgressCell({
  subjectId,
  classSectionId,
  subjectName,
}: {
  subjectId: number | string;
  classSectionId: number | string;
  subjectName: string;
}) {
  const { data: progress, isLoading } = useSubjectProgress(subjectId, classSectionId, CURRENT_SESSION);

  const normalized = useMemo(() => {
    if (!progress) return null;
    const d = (progress as any).data ?? progress;
    return {
      percentage: d.overallPercentage ?? d.completionPercentage ?? 0,
      chaptersCount: d.chaptersCount ?? d.chapters?.length ?? 0,
    };
  }, [progress]);

  if (isLoading) {
    return <div className="h-4 bg-slate-100 animate-pulse rounded w-24" />;
  }

  if (!normalized) {
    return (
      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <Clock className="h-3 w-3 text-slate-400" /> No progress logged
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-[100px] max-w-[150px]">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${normalized.percentage}%` }} />
        </div>
      </div>
      <span className="text-xs font-bold text-foreground shrink-0">{normalized.percentage}%</span>
      <Badge variant="outline" className="text-[9px] rounded-md font-semibold text-emerald-600 bg-emerald-50/50 border-emerald-100 py-0 h-4 flex items-center gap-0.5">
        <CheckCircle2 className="h-2.5 w-2.5" /> {normalized.chaptersCount} Chapters
      </Badge>
    </div>
  );
}

export function ClassDetailTab({
  className,
  allTeachers,
  classSections,
  subjectDetails,
  onBack,
}: ClassDetailTabProps) {
  // Filter sections belonging to this class
  const classSecs = useMemo(() => {
    return classSections.filter((cs) => cs.className === className);
  }, [classSections, className]);

  // Map teacher ID to full name helper
  const getTeacherName = (id: string | null) => {
    if (!id) return null;
    const t = allTeachers.find((teach) => String(teach.id) === String(id));
    return t ? `${t.firstName} ${t.lastName}` : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Class {className} — Detailed Mapping & Progress
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              Subject-wise teacher assignments and syllabus completion status
            </p>
          </div>
        </div>
      </div>

      {classSecs.length === 0 ? (
        <Card className="erp-card border-none bg-white/40">
          <CardContent className="p-12 text-center text-muted-foreground text-sm font-semibold">
            No sections mapped for Class {className}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {classSecs.map((section) => {
            // Get subjects taught in this section
            const sectionSubjects = subjectDetails.filter(
              (sd) => sd.className === className && sd.sectionName === section.sectionName
            );

            const classTeacherName = section.classTeacherName || getTeacherName(section.classTeacherId);

            return (
              <Card
                key={section.id}
                className="erp-card border-none bg-white/40 backdrop-blur-md shadow-xl shadow-slate-200/50 overflow-hidden"
              >
                <CardHeader className="border-b border-slate-100/50 bg-white/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-black text-foreground">
                      Section {section.sectionName}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Max enrollment capacity: {section.maxLimit || 'Not set'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 text-xs text-primary font-semibold max-w-fit">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>Class Teacher: {classTeacherName || 'Not Assigned'}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {sectionSubjects.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground font-medium">
                      No subject mappings or assignments mapped to Section {section.sectionName}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/20 text-muted-foreground">
                            {['Subject', 'Assigned Teacher', 'Syllabus Progress'].map((h) => (
                              <th
                                key={h}
                                className="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {sectionSubjects.map((mapping) => {
                            const subTeacherName = mapping.teacherName || getTeacherName(mapping.teacherId);
                            // subjectDtlsId maps to subjectId, classDtlsId maps to classSectionId
                            const sId = mapping.subjectDtlsId || mapping.subjectId;
                            const csId = mapping.classDtlsId || mapping.classSectionId || section.mappingId || section.id;

                            return (
                              <tr key={mapping.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 px-6">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                      <BookOpen className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">
                                      {mapping.subjectName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-6">
                                  {subTeacherName ? (
                                    <span className="text-xs text-foreground font-semibold">
                                      {subTeacherName}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/50">Unassigned</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-6">
                                  {sId && csId ? (
                                    <SubjectProgressCell
                                      subjectId={sId}
                                      classSectionId={csId}
                                      subjectName={mapping.subjectName}
                                    />
                                  ) : (
                                    <span className="text-xs text-muted-foreground/50">—</span>
                                  )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
