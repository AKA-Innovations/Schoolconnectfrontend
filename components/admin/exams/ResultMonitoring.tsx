'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useExams, useClassResults } from '@/services/exam/queries';
import { useQuery } from '@tanstack/react-query';
import { examService } from '@/services/exam/service';
import {
  useGenerateResults,
  usePublishResults,
  useUnpublishResults,
  useUpdateTeacherRemarks,
  useUpdatePrincipalRemarks,
} from '@/services/exam/mutations';
import { useSchoolClasses, useSchoolSections, useSubjectDetails, useClassSectionLists } from '@/hooks/useClasses';
import { useStudentList } from '@/hooks/useStudents';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { CURRENT_SESSION } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, CheckCircle2, AlertCircle, RefreshCw, Send, Check, Play, Globe, Lock, Award, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

interface Props {
  session: string;
}

export function ResultMonitoring({ session }: Props) {
  const { user } = useTeacherProfile();
  const userRole = user?.role; // 'school_admin' or others
  const isPowerUser = userRole === 'principal' || userRole === 'school_admin' || !!user?.isPrincipal;

  const { data: exams = [] } = useExams(session);

  // Fetch all schedules for the session to filter scheduled exams
  const { data: allSessionSchedules = [] } = useQuery<any[]>({
    queryKey: ['all-session-schedules', session],
    queryFn: () => examService.getSchedules({ session }),
  });

  const scheduledExams = useMemo(() => {
    const scheduledExamIds = new Set(allSessionSchedules.map((s: any) => s.examId));
    return exams.filter((e: any) => scheduledExamIds.has(e.id));
  }, [exams, allSessionSchedules]);
  const { data: schoolClasses = [] } = useSchoolClasses();
  const { data: classSectionLists = [] } = useClassSectionLists();

  const isClassTeacherOnly = !isPowerUser && (!!user?.isClassTeacher || !!user?.classTeacherClass);

  // Resolve assigned class details from classSectionLists
  const resolvedClass = React.useMemo(() => {
    const assignedClass = user?.classTeacherClass;
    if (!assignedClass || classSectionLists.length === 0) return null;

    const match = classSectionLists.find((s: any) => {
      const classDtlsId = assignedClass.classDtlsId || (assignedClass as any).id;
      if (classDtlsId && (s.mappingId === classDtlsId || s.id === classDtlsId || s.masterSectionId === classDtlsId)) return true;
      if (assignedClass.className && assignedClass.sectionName && s.className === assignedClass.className && s.sectionName === assignedClass.sectionName) return true;
      return false;
    });

    if (match) {
      return {
        ...assignedClass,
        className: match.className,
        sectionName: match.sectionName,
        classDtlsId: (assignedClass.classDtlsId && assignedClass.classDtlsId > 0) ? assignedClass.classDtlsId : (match.mappingId || match.id),
        classId: match.classId,
      };
    }
    return assignedClass;
  }, [user?.classTeacherClass, classSectionLists]);

  // Fetch teacher's assigned classes and subjects (or all if principal/admin)
  const { data: mySubjectDetailsRaw } = useSubjectDetails(
    isPowerUser ? undefined : user?.id,
    CURRENT_SESSION
  );
  const mySubjectDetails = (mySubjectDetailsRaw as any[]) || [];

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');

  // Auto-configure class & section for class teacher
  React.useEffect(() => {
    if (isClassTeacherOnly && resolvedClass) {
      const resClass = resolvedClass as any;
      if (resClass.classId) {
        setSelectedClassId(Number(resClass.classId));
      }
      if (resClass.classDtlsId) {
        setSelectedSectionId(Number(resClass.classDtlsId));
      }
    }
  }, [isClassTeacherOnly, resolvedClass]);

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

  const schoolId = useAuthStore((s) => s.schoolId);

  const { data: results = [], isLoading: loadingResults, refetch: refetchResults } = useClassResults(
    selectedExamId || 0,
    selectedClassId || 0,
    selectedSectionId || 0
  );

  const { data: studentsResponse } = useStudentList({
    schoolId: schoolId ?? '',
    classSectionId: selectedSectionId ? Number(selectedSectionId) : undefined,
    limit: 150,
  });

  const studentsList = studentsResponse?.items || [];

  // Map student name resolver helper
  const getStudentName = React.useCallback((studentId: string) => {
    const student = studentsList.find((s: any) => s.id === studentId);
    if (student) {
      return `${student.firstName} ${student.lastName || ''}`.trim();
    }
    return studentId;
  }, [studentsList]);

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

    // Find the currently selected exam detail
    const currentExam = exams.find((e: any) => e.id === Number(selectedExamId));
    let examIdsPayload = [Number(selectedExamId)];

    if (currentExam) {
      const nameLower = currentExam.examName.toLowerCase();
      
      // Auto-aggregation logic matching Step 3 of Backend Academic Structure:
      if (nameLower.includes('half yearly') || nameLower.includes('semester 1') || nameLower.includes('sem 1') || nameLower.includes('hy')) {
        // Semester 1 aggregates: Half Yearly (Primary, first) + UT1 + UT2
        const ut1 = exams.find((e: any) => e.examName.toLowerCase().includes('unit test 1') || e.examName.toLowerCase().includes('ut1') || e.examName.toLowerCase().includes('ut 1'));
        const ut2 = exams.find((e: any) => e.examName.toLowerCase().includes('unit test 2') || e.examName.toLowerCase().includes('ut2') || e.examName.toLowerCase().includes('ut 2'));
        
        const list = [Number(selectedExamId)];
        if (ut1) list.push(ut1.id);
        if (ut2) list.push(ut2.id);
        examIdsPayload = list;
      } else if (nameLower.includes('final') || nameLower.includes('semester 2') || nameLower.includes('sem 2') || nameLower.includes('fi') || nameLower.includes('annual')) {
        // Semester 2 & Overall Academic Year aggregates: Final Exam (Primary) + UT1 + UT2 + HY + UT3 + UT4
        const ut1 = exams.find((e: any) => e.examName.toLowerCase().includes('unit test 1') || e.examName.toLowerCase().includes('ut1') || e.examName.toLowerCase().includes('ut 1'));
        const ut2 = exams.find((e: any) => e.examName.toLowerCase().includes('unit test 2') || e.examName.toLowerCase().includes('ut2') || e.examName.toLowerCase().includes('ut 2'));
        const hy = exams.find((e: any) => e.examName.toLowerCase().includes('half yearly') || e.examName.toLowerCase().includes('hy') || e.examName.toLowerCase().includes('semester 1') || e.examName.toLowerCase().includes('sem 1'));
        const ut3 = exams.find((e: any) => e.examName.toLowerCase().includes('unit test 3') || e.examName.toLowerCase().includes('ut3') || e.examName.toLowerCase().includes('ut 3'));
        const ut4 = exams.find((e: any) => e.examName.toLowerCase().includes('unit test 4') || e.examName.toLowerCase().includes('ut4') || e.examName.toLowerCase().includes('ut 4'));

        const list = [Number(selectedExamId)];
        if (ut1) list.push(ut1.id);
        if (ut2) list.push(ut2.id);
        if (hy) list.push(hy.id);
        if (ut3) list.push(ut3.id);
        if (ut4) list.push(ut4.id);
        examIdsPayload = list;
      }
    }

    try {
      await generateMutation.mutateAsync({
        session,
        examIds: examIdsPayload,
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

  // Compute real analytics metrics on consolidated list
  const analyticsSummary = React.useMemo(() => {
    if (resultsList.length === 0) return null;

    const total = resultsList.length;
    const passCount = resultsList.filter((r) => (r.resultStatus || r.status) === 'PASS').length;
    const passRate = Math.round((passCount / total) * 100);

    const totalPercentage = resultsList.reduce((sum, r) => sum + r.percentage, 0);
    const classAvg = Math.round(totalPercentage / total);

    // Sort to find toppers and weak students
    const sortedByScore = [...resultsList].sort((a, b) => b.percentage - a.percentage);
    const toppers = sortedByScore.slice(0, 3);
    const weakStudents = sortedByScore.filter((r) => r.percentage < 60).slice(-3).reverse();

    // Group scores into distribution ranges
    const ranges = [
      { name: '90-100%', count: 0 },
      { name: '80-89%', count: 0 },
      { name: '70-79%', count: 0 },
      { name: '60-69%', count: 0 },
      { name: '50-59%', count: 0 },
      { name: 'Below 50%', count: 0 },
    ];

    resultsList.forEach((r) => {
      const pct = r.percentage;
      if (pct >= 90) ranges[0].count++;
      else if (pct >= 80) ranges[1].count++;
      else if (pct >= 70) ranges[2].count++;
      else if (pct >= 60) ranges[3].count++;
      else if (pct >= 50) ranges[4].count++;
      else ranges[5].count++;
    });

    return {
      passRate,
      classAvg,
      toppers,
      weakStudents,
      scoreDistribution: ranges,
    };
  }, [resultsList]);

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
          <Select
            value={selectedExamId ? String(selectedExamId) : 'all'}
            onValueChange={(val) => setSelectedExamId(val === 'all' ? '' : Number(val))}
            className="w-full sm:w-40"
          >
            <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl border-border bg-card text-xs font-semibold">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Exam</SelectItem>
              {scheduledExams.map((e: any) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.examName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isClassTeacherOnly ? (
            <>
              <Select
                value={selectedClassId ? String(selectedClassId) : 'all'}
                onValueChange={(val) => {
                  setSelectedClassId(val === 'all' ? '' : Number(val));
                  setSelectedSectionId('');
                }}
                className="w-full sm:w-40"
              >
                <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl border-border bg-card text-xs font-semibold">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Class</SelectItem>
                  {filteredClasses.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      Class {c.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSectionId ? String(selectedSectionId) : 'all'}
                onValueChange={(val) => setSelectedSectionId(val === 'all' ? '' : Number(val))}
                className="w-full sm:w-40"
              >
                <SelectTrigger 
                  disabled={!selectedClassId}
                  className="h-10 w-full sm:w-40 rounded-xl border-border bg-card text-xs font-semibold"
                >
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Section</SelectItem>
                  {filteredSections.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      Section {s.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            resolvedClass && (
              <Badge variant="outline" className="h-10 px-4 rounded-xl border-dashed border-primary/30 bg-primary/5 text-primary text-xs font-bold flex items-center gap-1.5 shrink-0">
                My Class: {resolvedClass.className || '-'} - {resolvedClass.sectionName || '-'}
              </Badge>
            )
          )}

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

          {/* Results Sheet Analytics Dashboard */}
          {analyticsSummary && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Highlight Cards */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Class Average Score</p>
                    <h3 className="text-3xl font-bold text-indigo-600">{analyticsSummary.classAvg}%</h3>
                    <p className="text-[10px] text-muted-foreground">Aggregated performance across all subjects.</p>
                  </div>
                  <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </Card>

                <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Class Passing Rate</p>
                    <h3 className="text-3xl font-bold text-green-600">{analyticsSummary.passRate}%</h3>
                    <p className="text-[10px] text-muted-foreground">Students meeting the PASS criteria.</p>
                  </div>
                  <div className="bg-green-50 p-3.5 rounded-2xl text-green-600">
                    <Users className="h-6 w-6" />
                  </div>
                </Card>

                {/* Toppers Highlight Card */}
                <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 sm:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      <p className="font-bold text-sm">Class Toppers (Top Performers)</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 font-bold border-0">TOP 3</Badge>
                  </div>
                  <div className="space-y-3">
                    {analyticsSummary.toppers.map((t: any, idx: number) => (
                      <div key={t.id} className="flex items-center justify-between text-xs font-medium bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="h-5 w-5 rounded-full bg-amber-50 text-amber-600 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{getStudentName(t.studentId)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-semibold">{t.obtainedMarks ?? t.marksObtained ?? 0} / {t.totalMarks} Marks</span>
                          <Badge className="bg-indigo-50 text-indigo-600 border-0 font-bold">{t.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Weak Students Highlight Card */}
                <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 sm:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-rose-500" />
                      <p className="font-bold text-sm text-slate-800">Support Needed (Below 60%)</p>
                    </div>
                    <Badge className="bg-rose-100 text-rose-700 font-bold border-0">ALERT</Badge>
                  </div>
                  {analyticsSummary.weakStudents.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 font-semibold">
                      Excellent! No students scored below 60% in this exam.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsSummary.weakStudents.map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between text-xs font-medium bg-rose-50/20 p-2.5 rounded-xl border border-rose-100/50">
                          <span className="font-semibold text-slate-700">{getStudentName(t.studentId)}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-semibold">Rank #{t.rank || '-'}</span>
                            <span className="text-muted-foreground font-semibold">{t.obtainedMarks ?? t.marksObtained ?? 0} / {t.totalMarks} Marks</span>
                            <Badge className="bg-rose-50 text-rose-600 border-0 font-bold">{t.percentage.toFixed(1)}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Score Distribution Chart */}
              <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 flex flex-col justify-between">
                <div className="border-b border-border/50 pb-3 mb-4">
                  <p className="font-bold text-sm">Class Score Distribution</p>
                  <p className="text-[10px] text-muted-foreground">Range analysis of student scores.</p>
                </div>
                <div className="h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsSummary.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                      <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} fontSize={9} stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px' }} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

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
                            <td className="p-4 font-semibold">{getStudentName(res.studentId)}</td>
                            <td className="p-4 text-center font-medium">
                              {res.obtainedMarks ?? res.marksObtained ?? 0} <span className="text-muted-foreground/60 text-xs">/ {res.totalMarks}</span>
                            </td>
                            <td className="p-4 text-center font-bold">{res.percentage.toFixed(1)}%</td>
                            <td className="p-4 text-center font-bold text-indigo-600">{res.overallGrade ?? res.grade}</td>
                            <td className="p-4 text-center">
                              <Badge className={`rounded-lg ${(res.resultStatus || res.status) === 'PASS' ? 'bg-green-500/10 text-green-500 border-0' : 'bg-rose-500/10 text-rose-500 border-0'}`}>
                                {res.resultStatus || res.status}
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
