'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useExams, useClassResults } from '@/services/exam/queries';
import {
  useGenerateResults,
  usePublishResults,
  useUnpublishResults,
  useUpdateTeacherRemarks,
  useUpdatePrincipalRemarks,
} from '@/services/exam/mutations';
import { useSchoolClasses, useSchoolSections, useSubjectDetails } from '@/hooks/useClasses';
import { CURRENT_SESSION } from '@/lib/constants';
import { Eye, CheckCircle2, AlertCircle, RefreshCw, Send, Check, Play, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  session: string;
}

export function ResultMonitoring({ session }: Props) {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role; // 'school_admin' or others
  const isPowerUser = userRole === 'principal' || userRole === 'school_admin' || !!user?.isPrincipal;

  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  // Fetch teacher's assigned classes and subjects (or all if principal/admin)
  const { data: mySubjectDetailsRaw } = useSubjectDetails(
    isPowerUser ? undefined : user?.id,
    CURRENT_SESSION
  );
  const mySubjectDetails = (mySubjectDetailsRaw as any[]) || [];

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');

  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

  const filteredClasses = React.useMemo(() => {
    if (isPowerUser) {
      return schoolClasses;
    }
    const uniqueMap = new Map<number, string>();
    mySubjectDetails.forEach((sd: any) => {
      if (sd.classId) {
        uniqueMap.set(Number(sd.classId), sd.className);
      }
    });
    return Array.from(uniqueMap.entries()).map(([id, className]) => ({
      id,
      className,
    }));
  }, [isPowerUser, schoolClasses, mySubjectDetails]);

  const filteredSections = React.useMemo(() => {
    if (isPowerUser) {
      return classSections;
    }
    if (!selectedClassId) return [];
    
    const uniqueMap = new Map<number, string>();
    mySubjectDetails.forEach((sd: any) => {
      if (Number(sd.classId) === Number(selectedClassId) && sd.classSectionId) {
        uniqueMap.set(Number(sd.classSectionId), sd.sectionName);
      }
    });
    return Array.from(uniqueMap.entries()).map(([id, sectionName]) => ({
      id,
      sectionName,
    }));
  }, [isPowerUser, classSections, selectedClassId, mySubjectDetails]);

  const { data: results = [], isLoading: loadingResults, refetch: refetchResults } = useClassResults(
    selectedExamId || 0,
    selectedClassId || 0,
    selectedSectionId || 0
  );

  const generateMutation = useGenerateResults();
  const publishMutation = usePublishResults();
  const unpublishMutation = useUnpublishResults();
  const teacherRemarksMutation = useUpdateTeacherRemarks();
  const principalRemarksMutation = useUpdatePrincipalRemarks();

  // Local state for editing remarks
  const [editingRemarks, setEditingRemarks] = useState<Record<number, { teacher: string; principal: string }>>({});

  const handleRemarksChange = (resultId: number, type: 'teacher' | 'principal', value: string) => {
    setEditingRemarks(prev => ({
      ...prev,
      [resultId]: {
        ...(prev[resultId] || { teacher: '', principal: '' }),
        [type]: value,
      },
    }));
  };

  const handleSaveRemarks = async (resultId: number, type: 'teacher' | 'principal') => {
    const text = editingRemarks[resultId]?.[type];
    if (text === undefined) return;

    try {
      if (type === 'teacher') {
        await teacherRemarksMutation.mutateAsync({ id: resultId, remarks: text });
      } else {
        await principalRemarksMutation.mutateAsync({ id: resultId, remarks: text });
      }
      toast.success('Remarks updated successfully');
      refetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update remarks');
    }
  };

  const handleGenerateResults = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSectionId) return;

    try {
      await generateMutation.mutateAsync({
        session,
        examIds: [Number(selectedExamId)],
        classId: Number(selectedClassId),
        classSectionId: Number(selectedSectionId),
      });
      toast.success('Results consolidated and generated successfully');
      refetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate results');
    }
  };

  const handlePublishToggle = async (publish: boolean) => {
    if (!selectedExamId || !selectedClassId || !selectedSectionId) return;

    const payload = {
      session,
      examId: Number(selectedExamId),
      classId: Number(selectedClassId),
      classSectionId: Number(selectedSectionId),
    };

    try {
      if (publish) {
        await publishMutation.mutateAsync(payload);
        toast.success('Results published to student dashboards');
      } else {
        await unpublishMutation.mutateAsync(payload);
        toast.success('Results unpublished successfully');
      }
      refetchResults();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update publication state');
    }
  };

  const resultsList = Array.isArray(results) ? results : [];
  const isClassPublished = resultsList.length > 0 && resultsList.every(r => r.isPublished);

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Result Consolidation & Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidate student marks, compute percentages, write remarks, and publish class report cards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
            className="flex h-10 w-full sm:w-40 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Exam</option>
            {exams.map((e: any) => (
              <option key={e.id} value={e.id}>{e.examName}</option>
            ))}
          </select>

          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value ? Number(e.target.value) : '');
              setSelectedSectionId('');
            }}
            className="flex h-10 w-full sm:w-40 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Class</option>
            {filteredClasses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>

          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value ? Number(e.target.value) : '')}
            disabled={!selectedClassId}
            className="flex h-10 w-full sm:w-40 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Section</option>
            {filteredSections.map((s: any) => (
              <option key={s.id} value={s.id}>{s.sectionName}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchResults()}
            className="rounded-xl h-10 w-10 shrink-0"
            disabled={!selectedSectionId}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!selectedSectionId || !selectedExamId ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please select Exam, Class, and Section to monitor results.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Action Ribbon */}
          <Card className="rounded-2xl border border-border/85 shadow-sm bg-card p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Actions for this Class Section</p>
                <p className="text-xs text-muted-foreground">Consolidate subject marks or toggle dashboard visibility.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={handleGenerateResults}
                className="rounded-xl gap-2 font-bold w-full sm:w-auto"
                disabled={generateMutation.isPending}
              >
                Generate Results
              </Button>
              {isClassPublished ? (
                <Button
                  variant="outline"
                  onClick={() => handlePublishToggle(false)}
                  className="rounded-xl gap-2 font-bold w-full sm:w-auto hover:bg-rose-50 text-rose-600 border-rose-200"
                  disabled={unpublishMutation.isPending}
                >
                  <Lock className="h-4 w-4" /> Unpublish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handlePublishToggle(true)}
                  className="rounded-xl gap-2 font-bold w-full sm:w-auto hover:bg-green-50 text-green-600 border-green-200"
                  disabled={publishMutation.isPending}
                >
                  <Globe className="h-4 w-4" /> Publish to Student
                </Button>
              )}
            </div>
          </Card>

          {/* Results Sheet */}
          <Card className="rounded-2xl border border-border/80 shadow-sm bg-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="text-lg font-bold">Consolidated Results List</CardTitle>
              <CardDescription className="text-xs">Class-level summary sheet and remarks entry.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingResults ? (
                <div className="p-12 text-center text-muted-foreground">Loading generated results...</div>
              ) : resultsList.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No consolidated results found. Click "Generate Results" above to compute them.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
                        <th className="p-4 px-6">Rank</th>
                        <th className="p-4">Student ID</th>
                        <th className="p-4 text-center">Marks</th>
                        <th className="p-4 text-center">Pct %</th>
                        <th className="p-4 text-center">Grade</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4">Teacher Remarks</th>
                        <th className="p-4">Principal Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                      {resultsList.map((res) => {
                        const localTeacher = editingRemarks[res.id]?.teacher ?? res.teacherRemarks ?? '';
                        const localPrincipal = editingRemarks[res.id]?.principal ?? res.principalRemarks ?? '';

                        return (
                          <tr key={res.id} className="hover:bg-muted/5 transition-colors">
                            <td className="p-4 px-6 font-bold text-primary">#{res.rank || '-'}</td>
                            <td className="p-4 font-semibold">{res.studentId}</td>
                            <td className="p-4 text-center font-medium">
                              {res.marksObtained} <span className="text-muted-foreground/60 text-xs">/ {res.totalMarks}</span>
                            </td>
                            <td className="p-4 text-center font-bold">{res.percentage.toFixed(1)}%</td>
                            <td className="p-4 text-center font-bold text-indigo-600">{res.grade}</td>
                            <td className="p-4 text-center">
                              <Badge className={`rounded-lg ${res.status === 'PASS' ? 'bg-green-500/10 text-green-500 border-0' : 'bg-rose-500/10 text-rose-500 border-0'}`}>
                                {res.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <Input
                                  value={localTeacher}
                                  onChange={(e) => handleRemarksChange(res.id, 'teacher', e.target.value)}
                                  className="h-8 rounded-lg text-xs w-48"
                                  placeholder="Enter remarks..."
                                />
                                {localTeacher !== res.teacherRemarks && (
                                  <Button size="icon" variant="ghost" onClick={() => handleSaveRemarks(res.id, 'teacher')} className="h-8 w-8 text-green-600">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <Input
                                  value={localPrincipal}
                                  onChange={(e) => handleRemarksChange(res.id, 'principal', e.target.value)}
                                  className="h-8 rounded-lg text-xs w-48"
                                  placeholder="Enter remarks..."
                                  disabled={userRole !== 'school_admin' && (user as any)?.teacherProfile?.teacherRole !== 'PRINCIPAL'}
                                />
                                {localPrincipal !== res.principalRemarks && (
                                  <Button size="icon" variant="ghost" onClick={() => handleSaveRemarks(res.id, 'principal')} className="h-8 w-8 text-green-600">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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
        </div>
      )}
    </div>
  );
}
