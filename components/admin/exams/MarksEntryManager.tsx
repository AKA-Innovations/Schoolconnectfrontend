'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student/service';
import { useExams, useExamSubjects, useMarks, useGradeConfig, useExamSchedules, useMarksCompletionStatus } from '@/services/exam/queries';
import { useEnterMarks, useLockMarks, useUnlockMarks, useBulkMarkAbsent } from '@/services/exam/mutations';
import { useSubjectDetails } from '@/hooks/useClasses';
import { examService } from '@/services/exam/service';
import { useAuthStore } from '@/store/authStore';
import { Save, Lock, Unlock, AlertCircle, RefreshCw, Sparkles, ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarksEntryItemDto } from '@/types/exam.types';

interface Props {
  session: string;
}

export function MarksEntryManager({ session }: Props) {
  const user = useAuthStore((s) => s.user);
  const isPowerUser = user?.role === 'principal' || user?.role === 'school_admin' || !!user?.isPrincipal;
  
  // Fetch teacher's assigned classes and subjects (or all if principal/admin)
  const { data: mySubjectDetailsRaw, isLoading: loadingMySubjects } = useSubjectDetails(isPowerUser ? undefined : user?.id);
  
  // If class teacher, also fetch all subjects for their assigned class section
  const isClassTeacher = !!user?.isClassTeacher || !!user?.classTeacherClass;
  const classTeacherSectionId = user?.classTeacherClass?.classDtlsId;
  const { data: classWideSubjectDetailsRaw, isLoading: loadingClassWideSubjects } = useSubjectDetails(
    undefined,
    session,
    isClassTeacher && classTeacherSectionId ? Number(classTeacherSectionId) : undefined
  );

  const loadingSubjectDetails = loadingMySubjects || (isClassTeacher && !!classTeacherSectionId && loadingClassWideSubjects);

  const mySubjectDetails = React.useMemo(() => {
    const list = [...((mySubjectDetailsRaw as any[]) || [])];
    const classWide = (classWideSubjectDetailsRaw as any[]) || [];
    
    for (const item of classWide) {
      const exists = list.some(
        (x) =>
          x.classDtlsId === item.classDtlsId &&
          x.subjectDtlsId === item.subjectDtlsId
      );
      if (!exists) {
        list.push(item);
      }
    }
    return list;
  }, [mySubjectDetailsRaw, classWideSubjectDetailsRaw]);
  
  const { data: exams = [] } = useExams(session);

  // Fetch all schedules for the session to filter scheduled exams
  const { data: allSessionSchedules = [] } = useQuery<any[]>({
    queryKey: ['all-session-schedules', session],
    queryFn: () => examService.getSchedules({ session }),
  });

  const scheduledExams = React.useMemo(() => {
    const scheduledExamIds = new Set(allSessionSchedules.map((s: any) => s.examId));
    return exams.filter((e: any) => scheduledExamIds.has(e.id));
  }, [exams, allSessionSchedules]);

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedMappingIndex, setSelectedMappingIndex] = useState<number | ''>('');
  const [showOnlyMarked, setShowOnlyMarked] = useState<boolean>(false);
  const [mappingFilter, setMappingFilter] = useState<'all' | 'marked' | 'remaining' | 'future'>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Derive unique classes and sections for filters
  const classOptions = React.useMemo(() => {
    const classes = mySubjectDetails.map((sd: any) => sd.className);
    return ['all', ...Array.from(new Set(classes))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [mySubjectDetails]);

  const sectionOptions = React.useMemo(() => {
    const sections = mySubjectDetails.map((sd: any) => sd.sectionName);
    return ['all', ...Array.from(new Set(sections))].sort();
  }, [mySubjectDetails]);

  const selectedMapping = selectedMappingIndex !== '' ? (mySubjectDetails[selectedMappingIndex] as any) : null;

  // Fetch student list for selected section
  const { data: studentList, isLoading: loadingStudents } = useQuery({
    queryKey: ['students-marks-list', selectedMapping?.classSectionId],
    queryFn: () => studentService.list({ classSectionId: Number(selectedMapping?.classSectionId), limit: 150 }),
    enabled: !!selectedMapping?.classSectionId,
  });

  // Fetch existing marks
  const { data: existingMarksRaw, refetch: refetchMarks, isLoading: loadingMarks } = useMarks(
    selectedExamId || 0,
    selectedMapping?.classId || 0,
    selectedMapping?.classSectionId || 0,
    selectedMapping?.subjectId || undefined
  );

  const existingMarks = React.useMemo(() => existingMarksRaw || [], [existingMarksRaw]);

  // Fetch exam schedules to verify date and mapping
  const { data: allSchedules = [], isLoading: loadingSchedules } = useExamSchedules({
    session,
    examId: selectedExamId || undefined,
  });

  // Fetch completion status for the selected exam
  const { data: completionStatus = [] } = useMarksCompletionStatus(
    Number(selectedExamId) || 0,
    session
  );

  // Fetch grade configuration for auto-grading
  const { data: gradeConfig = [] } = useGradeConfig(session);

  const enterMarksMutation = useEnterMarks();
  const lockMutation = useLockMarks();
  const unlockMutation = useUnlockMarks();
  const bulkAbsentMutation = useBulkMarkAbsent();

  // Local grid state
  const [marksGrid, setMarksGrid] = useState<Record<string, { marksObtained: number | ''; isAbsent: boolean; remarks: string }>>({});
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Fetch subjects configured for this class + exam to get totalMarks and passingMarks
  const { data: examSubjects = [] } = useExamSubjects(
    session,
    selectedExamId || 0,
    selectedMapping?.classId || undefined
  );

  const currentSubjectConfig = React.useMemo(() => {
    if (!selectedMapping) return null;
    return examSubjects.find((s: any) => s.subjectId === selectedMapping.subjectId);
  }, [examSubjects, selectedMapping]);

  const isMarksLocked = React.useMemo(() => {
    if (!selectedMapping) return false;
    return existingMarks.some((m: any) => m.isLocked && m.subjectId === selectedMapping.subjectId);
  }, [existingMarks, selectedMapping]);

  // Find schedule for selected subject
  const subjectSchedule = React.useMemo(() => {
    if (!selectedMapping || !allSchedules.length) return null;
    return allSchedules.find(
      (sch: any) =>
        sch.classId === selectedMapping.classId &&
        sch.classSectionId === selectedMapping.classSectionId &&
        sch.subjectId === selectedMapping.subjectId
    );
  }, [selectedMapping, allSchedules]);

  // Verify schedule existence and date passed
  const scheduleStatus = React.useMemo(() => {
    if (!selectedExamId || !selectedMapping) return 'pending_selection';
    if (loadingSchedules) return 'loading';
    if (!subjectSchedule) return 'no_schedule';

    const examDate = new Date(subjectSchedule.examDate);
    examDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (examDate > today) return 'date_not_passed';
    return 'allowed';
  }, [selectedExamId, selectedMapping, subjectSchedule, loadingSchedules]);

  // Sort students by Roll Number
  const sortedStudents = React.useMemo(() => {
    if (!studentList?.items) return [];
    return [...studentList.items].sort((a, b) => {
      const rollA = a.academics?.[0]?.rollNumber || '';
      const rollB = b.academics?.[0]?.rollNumber || '';
      return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [studentList]);

  // Categorized teacher mappings for the selected exam
  const categorizedMappings = React.useMemo(() => {
    if (!selectedExamId) return { remaining: [], marked: [], upcoming: [] };

    const remaining: any[] = [];
    const marked: any[] = [];
    const upcoming: any[] = [];

    mySubjectDetails.forEach((sd: any, idx: number) => {
      // Find schedule
      const sch = allSchedules.find(
        (s: any) =>
          s.classId === sd.classId &&
          s.subjectId === sd.subjectId &&
          s.classSectionId === sd.classSectionId
      );

      // If no schedule exists, exclude from the lists
      if (!sch) return;

      // Check if future
      let isFuture = false;
      if (sch) {
        const examDate = new Date(sch.examDate);
        examDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (examDate > today) {
          isFuture = true;
        }
      }

      // Find completion status
      const comp = completionStatus.find(
        (c: any) =>
          c.classId === sd.classId &&
          c.subjectId === sd.subjectId &&
          c.classSectionId === sd.classSectionId
      );

      const enteredCount = comp?.enteredCount || 0;
      const totalCount = comp?.totalStudents || 0;
      const isLocked = comp?.isLocked || false;

      const mappingItem = {
        ...sd,
        originalIndex: idx,
        schedule: sch,
        completion: comp,
        enteredCount,
        totalCount,
        isLocked,
      };

      if (isFuture) {
        upcoming.push(mappingItem);
      } else if (isLocked) {
        marked.push(mappingItem);
      } else {
        remaining.push(mappingItem);
      }
    });

    return { remaining, marked, upcoming };
  }, [mySubjectDetails, selectedExamId, allSchedules, completionStatus]);

  const filteredSubjectDetails = mySubjectDetails;

  // Reset selected mapping index when the exam changes
  useEffect(() => {
    setSelectedMappingIndex('');
  }, [selectedExamId]);

  // Filter students based on showOnlyMarked state
  const displayedStudents = React.useMemo(() => {
    if (!sortedStudents) return [];
    if (!showOnlyMarked || !selectedMapping) return sortedStudents;

    return sortedStudents.filter((student) => {
      const matchingMark = existingMarks.find(
        (m: any) => m.studentId === student.id && m.subjectId === selectedMapping.subjectId
      );
      return (
        matchingMark &&
        ((matchingMark.marksObtained !== undefined &&
          matchingMark.marksObtained !== null &&
          matchingMark.marksObtained !== '') ||
          matchingMark.isAbsent)
      );
    });
  }, [sortedStudents, showOnlyMarked, existingMarks, selectedMapping]);

  useEffect(() => {
    if (sortedStudents.length > 0 && selectedMapping) {
      const initialGrid: typeof marksGrid = {};
      sortedStudents.forEach((student: any) => {
        const matchingMark = existingMarks.find((m: any) => m.studentId === student.id && m.subjectId === selectedMapping.subjectId);
        initialGrid[student.id] = {
          marksObtained: matchingMark?.marksObtained !== undefined ? matchingMark.marksObtained : '',
          isAbsent: matchingMark?.isAbsent || false,
          remarks: matchingMark?.remarks || '',
        };
      });
      setMarksGrid(initialGrid);
    }
  }, [sortedStudents, existingMarks, selectedMapping]);

  const handleMarkChange = (studentId: string, field: 'marksObtained' | 'isAbsent' | 'remarks', value: any) => {
    if (isMarksLocked) {
      toast.error('Marks are locked for this subject. Unlock to edit.');
      return;
    }
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const autoCalculateGrade = (marksObtained: number) => {
    if (!currentSubjectConfig || currentSubjectConfig.totalMarks <= 0) return '-';
    const pct = (marksObtained / currentSubjectConfig.totalMarks) * 100;
    const match = gradeConfig.find((g: any) => pct >= g.minPercentage && pct <= g.maxPercentage);
    return match ? match.gradeName : '-';
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedMapping || !currentSubjectConfig) return;

    const marksPayload: MarksEntryItemDto[] = [];
    Object.entries(marksGrid).forEach(([studentId, data]) => {
      marksPayload.push({
        studentId,
        examSubjectDtlId: currentSubjectConfig.id,
        subjectId: selectedMapping.subjectId,
        marksObtained: data.isAbsent || data.marksObtained === '' ? undefined : Number(data.marksObtained),
        isAbsent: data.isAbsent,
        remarks: data.remarks || undefined,
      });
    });

    try {
      await enterMarksMutation.mutateAsync({
        session,
        examId: Number(selectedExamId),
        classId: Number(selectedMapping.classId),
        classSectionId: Number(selectedMapping.classSectionId),
        marks: marksPayload,
      });
      toast.success('Marks saved successfully');
      refetchMarks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    }
  };

  const handleLockUnlock = async (action: 'lock' | 'unlock') => {
    if (!selectedExamId || !selectedMapping || !currentSubjectConfig) return;
    
    const payload = {
      examId: Number(selectedExamId),
      examSubjectDtlId: currentSubjectConfig.id,
      classId: Number(selectedMapping.classId),
      classSectionId: Number(selectedMapping.classSectionId),
      subjectId: Number(selectedMapping.subjectId),
    };

    try {
      if (action === 'lock') {
        await lockMutation.mutateAsync(payload);
        toast.success('Marks entry locked successfully');
      } else {
        await unlockMutation.mutateAsync(payload);
        toast.success('Marks entry unlocked successfully');
      }
      refetchMarks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} marks`);
    }
  };

  const handleBulkAbsent = async () => {
    if (selectedStudents.length === 0 || !currentSubjectConfig || !selectedMapping) return;
    
    try {
      await bulkAbsentMutation.mutateAsync({
        examId: Number(selectedExamId),
        examSubjectDtlId: currentSubjectConfig.id,
        classId: Number(selectedMapping.classId),
        classSectionId: Number(selectedMapping.classSectionId),
        subjectId: Number(selectedMapping.subjectId),
        studentIds: selectedStudents,
      });
      toast.success('Selected students marked as absent');
      setSelectedStudents([]);
      refetchMarks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark students absent');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & cascading selectors */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Marks Entry Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Input, evaluate, and lock marks for classroom assessments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Exam Selector */}
          <Select
            value={selectedExamId ? String(selectedExamId) : 'all'}
            onValueChange={(val) => setSelectedExamId(val === 'all' ? '' : Number(val))}
            className="w-full sm:w-48"
          >
            <SelectTrigger className="h-10 w-full sm:w-48 rounded-xl border-border bg-card text-xs font-semibold">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Exam</SelectItem>
              {scheduledExams.map((e: any) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.examName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Class, Section, and Subject Selector */}
          <Select
            value={selectedMappingIndex === '' ? 'all' : String(selectedMappingIndex)}
            onValueChange={(val) => setSelectedMappingIndex(val === 'all' ? '' : Number(val))}
            className="w-full sm:w-64"
          >
            <SelectTrigger 
              disabled={loadingSubjectDetails}
              className="h-10 w-full sm:w-64 rounded-xl border-border bg-card text-xs font-semibold"
            >
              <SelectValue placeholder={loadingSubjectDetails ? 'Loading assigned classes...' : 'Select Class, Section & Subject'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Class, Section & Subject</SelectItem>
              {mySubjectDetails.map((sd: any, idx: number) => (
                <SelectItem key={sd.id} value={String(idx)}>
                  {sd.className} - {sd.sectionName} - {sd.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
 
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchMarks()}
            className="rounded-xl h-10 w-10 shrink-0"
            disabled={!selectedMapping || !selectedExamId || scheduleStatus !== 'allowed'}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedMapping && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-4 pl-0 cursor-pointer"
          onClick={() => setSelectedMappingIndex('')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes Overview
        </Button>
      )}

      {/* Overview Dashboard for Mappings when Exam is selected but no class is opened */}
      {selectedExamId && selectedMappingIndex === '' && (
        <div className="space-y-6">
          {/* Dashboard Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl border border-rose-100 bg-rose-50/10 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                {categorizedMappings.remaining.length}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Remaining</h4>
                <p className="text-xs text-muted-foreground">Classes to be marked</p>
              </div>
            </Card>

            <Card className="rounded-2xl border border-emerald-100 bg-emerald-50/10 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                {categorizedMappings.marked.length}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Completed</h4>
                <p className="text-xs text-muted-foreground">Classes fully marked</p>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-100 bg-slate-50/10 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
                {categorizedMappings.upcoming.length}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Upcoming</h4>
                <p className="text-xs text-muted-foreground">Future scheduled exams</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Remaining / Pending */}
            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-card">
              <CardHeader className="border-b border-border/50 bg-rose-50/5 py-4 px-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-rose-800">Pending Marks Entry</CardTitle>
                  <CardDescription className="text-[11px]">Exams that are conducted and require marks input</CardDescription>
                </div>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[10px]">
                  Action Needed
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {categorizedMappings.remaining.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground font-medium">🎉 All conducted exams are fully marked!</p>
                ) : (
                  categorizedMappings.remaining.map((item: any) => (
                    <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-white flex items-center justify-between gap-4 hover:border-rose-200 transition-colors">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-foreground truncate">
                          {item.className} - Section {item.sectionName}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
                          Subject: {item.subjectName}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                          <span className="text-rose-600 font-bold">{item.enteredCount}/{item.totalCount || '?'}</span> students marked
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-lg text-[10px] font-bold h-8 px-3.5 bg-rose-600 hover:bg-rose-700 text-white shrink-0 shadow-sm cursor-pointer"
                        onClick={() => setSelectedMappingIndex(item.originalIndex)}
                      >
                        Enter Marks
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Right: Completed / Marked */}
            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-card">
              <CardHeader className="border-b border-border/50 bg-emerald-50/5 py-4 px-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-emerald-800">Completed Marks Entry</CardTitle>
                  <CardDescription className="text-[11px]">Exams fully marked and verified</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                  Completed
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {categorizedMappings.marked.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground font-medium">No completed marks entry list yet.</p>
                ) : (
                  categorizedMappings.marked.map((item: any) => (
                    <div key={item.id} className="p-3.5 rounded-xl border border-border/80 bg-white flex items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-foreground truncate">
                          {item.className} - Section {item.sectionName}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
                          Subject: {item.subjectName}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-emerald-700 font-bold">{item.enteredCount}/{item.totalCount || '?'}</span> students marked
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-[10px] font-bold h-8 px-3.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0 cursor-pointer"
                        onClick={() => setSelectedMappingIndex(item.originalIndex)}
                      >
                        Edit Marks
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming scheduled exams if any */}
          {categorizedMappings.upcoming.length > 0 && (
            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-card">
              <CardHeader className="border-b border-border/50 bg-slate-50/5 py-4 px-5">
                <CardTitle className="text-sm font-bold text-slate-700">Upcoming Scheduled Exams</CardTitle>
                <CardDescription className="text-[11px]">Future exams scheduled for your classes (marks entry unlocks on exam date)</CardDescription>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedMappings.upcoming.map((item: any) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-border bg-white flex flex-col gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-foreground truncate">
                        {item.className} - Section {item.sectionName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
                        Subject: {item.subjectName}
                      </div>
                    </div>
                    {item.schedule && (
                      <div className="mt-1 p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 font-medium flex items-center gap-1.5 border border-slate-100">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Date: {new Date(item.schedule.examDate).toLocaleDateString()} ({item.schedule.startTime} - {item.schedule.endTime})</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Conditional Renders based on Exam Schedule Verification */}
      {!selectedExamId && (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please select an Exam to view and enter marks.</p>
        </Card>
      )}

      {selectedExamId && selectedMapping && scheduleStatus === 'pending_selection' && (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please specify both the Exam and your Class & Subject mapping to enter marks.</p>
        </Card>
      )}

      {scheduleStatus === 'loading' && (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40 animate-spin" />
          <p className="text-muted-foreground font-medium">Checking exam schedules...</p>
        </Card>
      )}

      {scheduleStatus === 'no_schedule' && (
        <Card className="rounded-2xl border border-rose-200 bg-rose-50/20 p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-rose-500/80" />
          <h3 className="font-bold text-rose-800 text-lg">Exam Not Scheduled</h3>
          <p className="text-rose-700/80 text-sm max-w-md mx-auto mt-2">
            No schedule was found for this exam component. Please ask the school coordinator or principal to schedule this exam under the Schedules tab.
          </p>
        </Card>
      )}

      {scheduleStatus === 'date_not_passed' && subjectSchedule && (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/20 p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500/80 animate-pulse" />
          <h3 className="font-bold text-amber-800 text-lg">Exam Date In Future</h3>
          <p className="text-amber-700/80 text-sm max-w-md mx-auto mt-2">
            This exam component is scheduled for <span className="font-bold">{new Date(subjectSchedule.examDate).toLocaleDateString()}</span> ({subjectSchedule.startTime} - {subjectSchedule.endTime}).
          </p>
          <p className="text-amber-700/80 text-xs mt-1">
            Marks entry spreadsheet will automatically unlock once the scheduled exam date is reached.
          </p>
        </Card>
      )}

      {scheduleStatus === 'allowed' && selectedMapping && (
        <Card className="rounded-2xl border border-border/80 shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-5 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Spreadsheet Marks Entry</span>
                {isMarksLocked ? (
                  <Badge className="bg-rose-500/10 text-rose-500 border-0 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </Badge>
                ) : (
                  <Badge className="bg-green-500/10 text-green-500 border-0 flex items-center gap-1">
                    <Unlock className="h-3 w-3" /> Editable
                  </Badge>
                )}
              </CardTitle>
              {currentSubjectConfig && (
                <CardDescription className="text-xs mt-1">
                  Evaluation: <span className="font-bold">{currentSubjectConfig.examType}</span> | Max Marks: <span className="font-bold">{currentSubjectConfig.totalMarks}</span> | Passing Marks: <span className="font-bold">{currentSubjectConfig.passingMarks}</span>
                </CardDescription>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none bg-muted/40 hover:bg-muted/70 px-3 py-1.5 rounded-lg border border-border/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showOnlyMarked}
                  onChange={(e) => setShowOnlyMarked(e.target.checked)}
                  className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                />
                Show Only Marked
              </label>

              {selectedStudents.length > 0 && !isMarksLocked && (
                <Button variant="outline" size="sm" onClick={handleBulkAbsent} className="rounded-lg text-xs hover:bg-rose-50 text-rose-600 border-rose-200">
                  Mark Selected Absent ({selectedStudents.length})
                </Button>
              )}
              {isMarksLocked ? (
                // Unlock can only be done by coordinator, principal, school_admin
                (isPowerUser || user?.role === 'subject_coordinator') && (
                  <Button variant="outline" size="sm" onClick={() => handleLockUnlock('unlock')} className="rounded-lg text-xs gap-1">
                    <Unlock className="h-3.5 w-3.5" /> Unlock Marks
                  </Button>
                )
              ) : (
                // Lock can be done by teacher or class teacher
                (user?.role === 'teacher' || isClassTeacher) && (
                  <Button variant="outline" size="sm" onClick={() => handleLockUnlock('lock')} className="rounded-lg text-xs gap-1">
                    <Lock className="h-3.5 w-3.5" /> Lock Marks
                  </Button>
                )
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingStudents || loadingMarks ? (
              <div className="p-12 text-center text-muted-foreground">Loading student spreadsheet...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
                      <th className="p-4 px-6 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === displayedStudents.length && displayedStudents.length > 0}
                          onChange={(e) => {
                            if (e.target.checked && displayedStudents.length > 0) {
                              setSelectedStudents(displayedStudents.map((s: any) => s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                          className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                        />
                      </th>
                      <th className="p-4 px-6 w-24">Roll No</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4 w-28 text-center">Status</th>
                      <th className="p-4 w-36 text-center">Obtained Marks</th>
                      <th className="p-4 w-24 text-center">Grade</th>
                      <th className="p-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {displayedStudents.map((student: any) => {
                      const academic = student.academics?.[0];
                      const studentGridData = marksGrid[student.id] || { marksObtained: '', isAbsent: false, remarks: '' };
                      const autoGrade = studentGridData.isAbsent
                        ? 'AB'
                        : studentGridData.marksObtained !== ''
                        ? autoCalculateGrade(Number(studentGridData.marksObtained))
                        : '-';

                      return (
                        <tr key={student.id} className={`hover:bg-muted/5 transition-colors ${studentGridData.isAbsent ? 'bg-muted/20 opacity-60' : ''}`}>
                          <td className="p-3 px-6 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                              className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                            />
                          </td>
                          <td className="p-3 px-6 font-medium text-xs text-muted-foreground">{academic?.rollNumber || '-'}</td>
                          <td className="p-3 font-bold text-foreground">{`${student.firstName} ${student.lastName}`}</td>
                          <td className="p-3">
                            <select
                              value={studentGridData.isAbsent ? 'AB' : 'PRESENT'}
                              onChange={(e) => handleMarkChange(student.id, 'isAbsent', e.target.value === 'AB')}
                              disabled={isMarksLocked}
                              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="PRESENT">Present</option>
                              <option value="AB">Absent</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="relative">
                              <Input
                                type="number"
                                value={studentGridData.marksObtained}
                                max={currentSubjectConfig?.totalMarks}
                                min={0}
                                placeholder={`/ ${currentSubjectConfig?.totalMarks}`}
                                disabled={studentGridData.isAbsent || isMarksLocked}
                                onChange={(e) => handleMarkChange(student.id, 'marksObtained', e.target.value === '' ? '' : Number(e.target.value))}
                                className="h-9 rounded-lg text-center"
                              />
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-xs bg-primary/5 text-primary border border-primary/10 rounded-lg p-1.5 px-3">
                              {autoGrade}
                            </span>
                          </td>
                          <td className="p-3">
                            <Input
                              value={studentGridData.remarks}
                              disabled={isMarksLocked}
                              onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)}
                              placeholder="Notes..."
                              className="h-9 rounded-lg text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {!isMarksLocked && (
            <CardFooter className="border-t border-border/50 p-6 flex justify-end bg-muted/5">
              <Button
                onClick={handleSaveMarks}
                className="rounded-xl bg-primary hover:bg-primary/90 gap-2 font-bold shadow-md shadow-primary/20"
                disabled={enterMarksMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {enterMarksMutation.isPending ? 'Saving Marks...' : 'Save Marks Spreadsheet'}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
