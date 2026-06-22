'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExams, useExamSubjects, useExamSchedules } from '@/services/exam/queries';
import { useCreateSchedules, useDeleteSchedule, useUpdateSchedule } from '@/services/exam/mutations';
import { useSchoolClasses, useSchoolSections, useSubjectOptions, useSubjectDetails } from '@/hooks/useClasses';
import { Calendar, Save, Trash2, RefreshCw, HelpCircle, AlertCircle, Pencil, Eye, Copy, Sparkles, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useTeacherRoles } from '@/lib/permissions';
import { examService } from '@/services/exam/service';
import { toast } from 'sonner';
import { ExamScheduleItemDto } from '@/types/exam.types';
import { cn } from '@/lib/utils';

interface Props {
  session: string;
}

export function ScheduleBuilder({ session }: Props) {
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.role);
  const { isPrincipal, isCoordinator } = useTeacherRoles();

  const isNormalTeacher = userRole === 'teacher' && !isPrincipal && !isCoordinator;

  // Fetch teacher's assigned classes and subjects
  const { data: mySubjectDetails = [] } = useSubjectDetails(
    userRole === 'teacher' ? user?.id : undefined
  );

  const myClassIds = React.useMemo(() => {
    return Array.from(new Set(mySubjectDetails.map((sd: any) => sd.classId)));
  }, [mySubjectDetails]);

  const mySectionIds = React.useMemo(() => {
    return Array.from(new Set(mySubjectDetails.map((sd: any) => sd.classSectionId)));
  }, [mySubjectDetails]);

  const mySubjectIds = React.useMemo(() => {
    return Array.from(new Set(mySubjectDetails.map((sd: any) => sd.subjectId)));
  }, [mySubjectDetails]);

  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [applyToAllSections, setApplyToAllSections] = useState(true);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  // Edit schedule modal state
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  // Detailed view modal state
  const [viewingSchedule, setViewingSchedule] = useState<any | null>(null);

  // Bulk Scheduling states
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkStartTime, setBulkStartTime] = useState('09:00');
  const [bulkEndTime, setBulkEndTime] = useState('12:00');
  const [bulkIncrementDays, setBulkIncrementDays] = useState(true);
  const [bulkSkipSundays, setBulkSkipSundays] = useState(true);

  // Bulk Schedule Mode states
  const [scheduleMode, setScheduleMode] = useState<'individual' | 'bulk'>('individual');
  const [bulkSelectedSubjectIds, setBulkSelectedSubjectIds] = useState<number[]>([]);
  const [bulkScheduleDate, setBulkScheduleDate] = useState('');
  const [bulkScheduleStart, setBulkScheduleStart] = useState('09:00');
  const [bulkScheduleEnd, setBulkScheduleEnd] = useState('12:00');

  // Copy Schedule states
  const [copySourceExamId, setCopySourceExamId] = useState<number | ''>('');
  const [copySourceClassId, setCopySourceClassId] = useState<number | ''>('');

  // Restrict class choices to coordinator/teacher's own classes if not admin/principal
  const allowedClasses = React.useMemo(() => {
    if (userRole === 'school_admin' || isPrincipal) return schoolClasses;
    return schoolClasses.filter(c => myClassIds.includes(c.id));
  }, [schoolClasses, userRole, isPrincipal, myClassIds]);

  // Fetch sections of class
  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

  // Restrict section choices if needed
  const allowedSections = React.useMemo(() => {
    if (userRole === 'school_admin' || isPrincipal) return classSections;
    return classSections.filter(s => mySectionIds.includes(s.id));
  }, [classSections, userRole, isPrincipal, mySectionIds]);

  // Fetch subjects configured for this class + exam
  const { data: examSubjects = [] } = useExamSubjects(
    session,
    selectedExamId || 0,
    selectedClassId || undefined
  );

  // Fetch subject master options to resolve names
  const selectedClassName = schoolClasses.find(c => c.id === selectedClassId)?.className || '';
  const { data: subjectOptions = [] } = useSubjectOptions(selectedClassName || undefined);

  // Get current schedules to display
  const { data: existingSchedules = [], refetch, isFetching } = useExamSchedules({
    session,
    examId: selectedExamId || undefined,
    classId: selectedClassId || undefined,
  });

  const displayedSchedules = React.useMemo(() => {
    let list = existingSchedules;

    // Filter schedules to only show teacher's own classes and subjects
    if (isNormalTeacher) {
      list = list.filter((sch: any) =>
        mySectionIds.includes(sch.classSectionId) &&
        mySubjectIds.includes(sch.subjectId)
      );
    }

    if (applyToAllSections || selectedSectionIds.length === 0) {
      return list;
    }
    return list.filter((sch: any) => selectedSectionIds.includes(sch.classSectionId));
  }, [existingSchedules, applyToAllSections, selectedSectionIds, isNormalTeacher, mySectionIds, mySubjectIds]);

  // Filter out subjects already scheduled in the current view
  const unscheduledSubjects = React.useMemo(() => {
    return examSubjects.filter((sub: any) => {
      if (!applyToAllSections && selectedSectionIds.length > 0) {
        return !selectedSectionIds.every(sectionId =>
          existingSchedules.some((sch: any) => sch.examSubjectDtlId === sub.id && sch.classSectionId === sectionId)
        );
      }
      return !existingSchedules.some((sch: any) => sch.examSubjectDtlId === sub.id);
    });
  }, [examSubjects, existingSchedules, applyToAllSections, selectedSectionIds]);

  const createMutation = useCreateSchedules();
  const deleteMutation = useDeleteSchedule();
  const updateMutation = useUpdateSchedule();

  // Grid inputs state for each subject
  const [scheduleInputs, setScheduleInputs] = useState<Record<number, { date: string; start: string; end: string; room: string }>>({});

  const handleInputChange = (subjectId: number, field: string, value: string) => {
    setScheduleInputs(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || { date: '', start: '09:00', end: '12:00', room: '' }),
        [field]: value,
      },
    }));
  };

  const handleApplyBulkSettings = () => {
    if (!bulkStartDate) {
      toast.error('Please select a start date');
      return;
    }

    const updatedInputs = { ...scheduleInputs };
    let currentDate = new Date(bulkStartDate);

    unscheduledSubjects.forEach((sub: any, idx: number) => {
      if (idx > 0 && bulkIncrementDays) {
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Skip Sundays
        if (bulkSkipSundays && currentDate.getDay() === 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const dateStr = currentDate.toISOString().split('T')[0];
      updatedInputs[sub.subjectId] = {
        date: dateStr,
        start: bulkStartTime,
        end: bulkEndTime,
        room: '',
      };
    });

    setScheduleInputs(updatedInputs);
    toast.success(`Applied bulk timing configurations to ${unscheduledSubjects.length} subjects!`);
  };

  const handleCopySchedules = async () => {
    if (!selectedExamId || !selectedClassId || !copySourceExamId || !copySourceClassId) {
      toast.error('Please specify target and source configurations');
      return;
    }

    try {
      const sourceSchedules = await examService.getSchedules({
        session,
        examId: Number(copySourceExamId),
        classId: Number(copySourceClassId),
      });

      if (sourceSchedules.length === 0) {
        toast.error('The selected source class has no exam schedules to copy.');
        return;
      }

      const schedulesToCreate: ExamScheduleItemDto[] = [];

      sourceSchedules.forEach((sch: any) => {
        const subConfig = examSubjects.find((s: any) => s.subjectId === sch.subjectId);
        if (!subConfig) return;

        const baseItem = {
          examId: Number(selectedExamId),
          classId: Number(selectedClassId),
          examSubjectDtlId: subConfig.id,
          subjectId: sch.subjectId,
          examDate: sch.examDate.split('T')[0],
          startTime: sch.startTime,
          endTime: sch.endTime,
        };

        if (applyToAllSections && allowedSections.length > 0) {
          allowedSections.forEach(section => {
            schedulesToCreate.push({
              ...baseItem,
              classSectionId: section.id,
            });
          });
        } else {
          selectedSectionIds.forEach(sectionId => {
            schedulesToCreate.push({
              ...baseItem,
              classSectionId: sectionId,
            });
          });
        }
      });

      if (schedulesToCreate.length === 0) {
        toast.error('No matching configured subjects found to duplicate schedules for.');
        return;
      }

      await createMutation.mutateAsync({
        session,
        schedules: schedulesToCreate,
      });

      toast.success(`Copied schedule configuration for ${schedulesToCreate.length} slots successfully`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to copy schedules');
    }
  };

  const handleSubmit = async () => {
    if (!selectedExamId || !selectedClassId) return;

    if (!applyToAllSections && selectedSectionIds.length === 0) {
      toast.error('Please select at least one section');
      return;
    }

    const schedulesToCreate: ExamScheduleItemDto[] = [];

    // Loop through configured exam subjects
    for (const sub of examSubjects) {
      const input = scheduleInputs[sub.subjectId];
      if (!input || !input.date) continue; // Skip if date not entered

      const baseItem = {
        examId: Number(selectedExamId),
        classId: Number(selectedClassId),
        examSubjectDtlId: sub.id,
        subjectId: sub.subjectId,
        examDate: new Date(input.date).toISOString().split('T')[0],
        startTime: input.start,
        endTime: input.end,
      };

      if (applyToAllSections && allowedSections.length > 0) {
        allowedSections.forEach(section => {
          schedulesToCreate.push({
            ...baseItem,
            classSectionId: section.id,
          });
        });
      } else {
        selectedSectionIds.forEach(sectionId => {
          schedulesToCreate.push({
            ...baseItem,
            classSectionId: sectionId,
          });
        });
      }
    }

    if (schedulesToCreate.length === 0) {
      toast.error('Please fill schedule details for at least one subject');
      return;
    }

    try {
      await createMutation.mutateAsync({
        session,
        schedules: schedulesToCreate,
      });
      toast.success(`Generated ${schedulesToCreate.length} schedules successfully`);
      setScheduleInputs({});
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create exam schedules');
    }
  };

  const handleBulkSubmit = async () => {
    if (!selectedExamId || !selectedClassId) return;
    if (bulkSelectedSubjectIds.length === 0) {
      toast.error('Please select at least one subject to schedule');
      return;
    }
    if (!bulkScheduleDate) {
      toast.error('Please select an exam date for bulk scheduling');
      return;
    }

    if (!applyToAllSections && selectedSectionIds.length === 0) {
      toast.error('Please select at least one section');
      return;
    }

    const schedulesToCreate: ExamScheduleItemDto[] = [];

    for (const subjectId of bulkSelectedSubjectIds) {
      const sub = examSubjects.find((s: any) => s.subjectId === subjectId);
      if (!sub) continue;

      const baseItem = {
        examId: Number(selectedExamId),
        classId: Number(selectedClassId),
        examSubjectDtlId: sub.id,
        subjectId: sub.subjectId,
        examDate: new Date(bulkScheduleDate).toISOString().split('T')[0],
        startTime: bulkScheduleStart,
        endTime: bulkScheduleEnd,
      };

      if (applyToAllSections && allowedSections.length > 0) {
        allowedSections.forEach(section => {
          schedulesToCreate.push({
            ...baseItem,
            classSectionId: section.id,
          });
        });
      } else {
        selectedSectionIds.forEach(sectionId => {
          schedulesToCreate.push({
            ...baseItem,
            classSectionId: sectionId,
          });
        });
      }
    }

    try {
      await createMutation.mutateAsync({
        session,
        schedules: schedulesToCreate,
      });
      toast.success(`Successfully created ${schedulesToCreate.length} schedules in bulk`);
      setBulkSelectedSubjectIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create bulk schedules');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Schedule deleted successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const handleEditSave = async () => {
    if (!editingSchedule) return;
    try {
      await updateMutation.mutateAsync({
        id: editingSchedule.id,
        data: {
          examDate: editDate,
          startTime: editStart,
          endTime: editEnd,
        },
      });
      toast.success('Schedule updated successfully');
      setEditingSchedule(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update schedule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Exam Schedules
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isNormalTeacher 
              ? 'View dates and timings of exam components for your assigned classes.' 
              : 'Build dates and timings of exam components for each class and section.'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
            className="flex h-10 w-full sm:w-48 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
          >
            <option value="">Select Exam</option>
            {exams.map((e: any) => (
              <option key={e.id} value={e.id}>{e.examName}</option>
            ))}
          </select>

          <select
            value={selectedClassId}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : '';
              setSelectedClassId(val);
              setSelectedSectionIds([]);
            }}
            className="flex h-10 w-full sm:w-48 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
          >
            <option value="">Select Class</option>
            {allowedClasses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="rounded-xl h-10 w-10 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {!selectedExamId || !selectedClassId ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please select an Exam and a Class to view schedules.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left/Middle Column: Schedule Builder Grid */}
          {!isNormalTeacher && (
            <div className="xl:col-span-2 space-y-6">
              {/* Auto Scheduler & Copy Tools Card */}
              <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5">
                <h3 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" /> Bulk Scheduling Wizards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
                  
                  {/* Auto Scheduler Wizard */}
                  <div className="space-y-3 pr-0 md:pr-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">1. Auto-Spacing Scheduler</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Date</Label>
                          <Input
                            type="date"
                            value={bulkStartDate}
                            onChange={(e) => setBulkStartDate(e.target.value)}
                            className="h-9 rounded-lg text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start</Label>
                            <Input
                              type="text"
                              value={bulkStartTime}
                              onChange={(e) => setBulkStartTime(e.target.value)}
                              placeholder="09:00"
                              className="h-9 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End</Label>
                            <Input
                              type="text"
                              value={bulkEndTime}
                              onChange={(e) => setBulkEndTime(e.target.value)}
                              placeholder="12:00"
                              className="h-9 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold">
                          <input
                            type="checkbox"
                            checked={bulkIncrementDays}
                            onChange={(e) => setBulkIncrementDays(e.target.checked)}
                            className="rounded text-primary focus:ring-primary/20 h-3.5 w-3.5"
                          />
                          <span>Increment 1 day per subject</span>
                        </label>
                        {bulkIncrementDays && (
                          <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold">
                            <input
                              type="checkbox"
                              checked={bulkSkipSundays}
                              onChange={(e) => setBulkSkipSundays(e.target.checked)}
                              className="rounded text-primary focus:ring-primary/20 h-3.5 w-3.5"
                            />
                            <span>Skip Sundays</span>
                          </label>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={handleApplyBulkSettings}
                        variant="secondary"
                        className="rounded-xl w-full text-xs font-bold gap-1.5 h-9"
                        disabled={unscheduledSubjects.length === 0}
                      >
                        <Wand2 className="h-3.5 w-3.5" /> Apply Auto-Spacing settings
                      </Button>
                    </div>
                  </div>

                  {/* Copy Schedule Wizard */}
                  <div className="space-y-3 pt-6 md:pt-0 pl-0 md:pl-6">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">2. Copy Schedule Configuration</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Exam</Label>
                          <select
                            value={copySourceExamId}
                            onChange={(e) => setCopySourceExamId(e.target.value ? Number(e.target.value) : '')}
                            className="flex h-9 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                          >
                            <option value="">Select Exam</option>
                            {exams.map((e: any) => (
                              <option key={e.id} value={e.id}>{e.examName}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Class</Label>
                          <select
                            value={copySourceClassId}
                            onChange={(e) => setCopySourceClassId(e.target.value ? Number(e.target.value) : '')}
                            className="flex h-9 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                          >
                            <option value="">Select Class</option>
                            {schoolClasses.map((c: any) => (
                              <option key={c.id} value={c.id}>{c.className}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleCopySchedules}
                        className="rounded-xl w-full text-xs font-bold gap-1.5 h-9 bg-primary hover:bg-primary/90"
                        disabled={!copySourceExamId || !copySourceClassId}
                      >
                        <Copy className="h-3.5 w-3.5" /> Duplicate Schedule configuration
                      </Button>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Builder Grid List */}
              <Card className="rounded-2xl border border-border/80 shadow-sm bg-card overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/10 pb-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4">
                    <div>
                      <CardTitle className="text-lg font-bold">Schedule Builder</CardTitle>
                      <CardDescription className="text-xs">Configure dates and timings for mapped subject components.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="applyAll"
                          checked={applyToAllSections}
                          onChange={(e) => {
                            setApplyToAllSections(e.target.checked);
                            if (e.target.checked) setSelectedSectionIds([]);
                          }}
                          className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                        />
                        <Label htmlFor="applyAll" className="text-xs font-bold cursor-pointer">
                          Apply to all sections ({allowedSections.map(s => s.sectionName).join(', ')})
                        </Label>
                      </div>
                      {!applyToAllSections && (
                        <div className="flex flex-wrap items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/80">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Sections:</span>
                          {allowedSections.map((s: any) => {
                            const isChecked = selectedSectionIds.includes(s.id);
                            return (
                              <label key={s.id} className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSectionIds(prev => [...prev, s.id]);
                                    } else {
                                      setSelectedSectionIds(prev => prev.filter(id => id !== s.id));
                                    }
                                  }}
                                  className="rounded text-primary focus:ring-primary/20 h-3.5 w-3.5"
                                />
                                <span>{s.sectionName}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => setScheduleMode('individual')}
                      className={cn(
                        "pb-3 pt-3 text-xs font-bold border-b-2 px-6 transition-colors",
                        scheduleMode === 'individual'
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Individual Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode('bulk')}
                      className={cn(
                        "pb-3 pt-3 text-xs font-bold border-b-2 px-6 transition-colors",
                        scheduleMode === 'bulk'
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Bulk Scheduler
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {unscheduledSubjects.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      All subjects have been scheduled for this selection, or no subjects are configured.
                    </div>
                  ) : scheduleMode === 'individual' ? (
                    <div className="divide-y divide-border/50">
                      {unscheduledSubjects.map((sub: any) => {
                        const optSub = subjectOptions.find((s: any) => s.id === sub.subjectId);
                        const values = scheduleInputs[sub.subjectId] || { date: '', start: '09:00', end: '12:00', room: '' };
                        return (
                          <div key={sub.id} className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-muted/5 transition-colors">
                            <div className="w-full md:w-1/4 shrink-0">
                              <p className="font-bold text-sm text-foreground">{optSub?.subjectName || `Subject ${sub.subjectId}`}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">{sub.examType}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 w-full">
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Date</Label>
                                <Input
                                  type="date"
                                  value={values.date}
                                  onChange={(e) => handleInputChange(sub.subjectId, 'date', e.target.value)}
                                  className="h-9 rounded-lg text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start Time</Label>
                                <Input
                                  type="text"
                                  placeholder="09:00"
                                  value={values.start}
                                  onChange={(e) => handleInputChange(sub.subjectId, 'start', e.target.value)}
                                  className="h-9 rounded-lg text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">End Time</Label>
                                <Input
                                  type="text"
                                  placeholder="12:00"
                                  value={values.end}
                                  onChange={(e) => handleInputChange(sub.subjectId, 'end', e.target.value)}
                                  className="h-9 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="p-4 px-6 bg-muted/5 flex justify-end">
                        <Button onClick={handleSubmit} className="rounded-xl gap-2 font-bold select-none h-10 shadow-sm" disabled={createMutation.isPending}>
                          <Save className="h-4 w-4" />
                          {createMutation.isPending ? 'Generating...' : 'Save Schedules'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">1. Select Subjects to Schedule</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-muted/20 rounded-xl border border-border/80">
                          {unscheduledSubjects.map((sub: any) => {
                            const optSub = subjectOptions.find((s: any) => s.id === sub.subjectId);
                            const isChecked = bulkSelectedSubjectIds.includes(sub.subjectId);
                            return (
                              <label key={sub.id} className="flex items-center space-x-2.5 p-3 bg-background rounded-xl border border-border/50 hover:border-primary/30 cursor-pointer transition-all">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setBulkSelectedSubjectIds(prev => [...prev, sub.subjectId]);
                                    } else {
                                      setBulkSelectedSubjectIds(prev => prev.filter(id => id !== sub.subjectId));
                                    }
                                  }}
                                  className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                                />
                                <div>
                                  <p className="text-xs font-bold text-foreground">{optSub?.subjectName || `Subject ${sub.subjectId}`}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase">{sub.examType}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 rounded-lg font-bold"
                              onClick={() => setBulkSelectedSubjectIds(unscheduledSubjects.map((s: any) => s.subjectId))}
                            >
                              Select All
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 rounded-lg font-bold"
                              onClick={() => setBulkSelectedSubjectIds([])}
                            >
                              Clear Selection
                            </Button>
                          </div>
                          <span className="text-muted-foreground font-semibold">
                            {bulkSelectedSubjectIds.length} of {unscheduledSubjects.length} selected
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-border/50 pt-4">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">2. Set Schedule Timings</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">Exam Date</Label>
                            <Input
                              type="date"
                              value={bulkScheduleDate}
                              onChange={(e) => setBulkScheduleDate(e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">Start Time</Label>
                            <Input
                              type="text"
                              value={bulkScheduleStart}
                              onChange={(e) => setBulkScheduleStart(e.target.value)}
                              placeholder="09:00"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">End Time</Label>
                            <Input
                              type="text"
                              value={bulkScheduleEnd}
                              onChange={(e) => setBulkScheduleEnd(e.target.value)}
                              placeholder="12:00"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-border/50">
                        <Button
                          type="button"
                          onClick={handleBulkSubmit}
                          disabled={createMutation.isPending}
                          className="rounded-xl gap-2 font-bold select-none h-10 shadow-sm"
                        >
                          <Save className="h-4 w-4" />
                          {createMutation.isPending ? 'Scheduling...' : 'Schedule Selected'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Right Column: Existing Schedules List */}
          <Card className={cn(
            "rounded-2xl border border-border/80 shadow-sm bg-card overflow-hidden h-fit",
            isNormalTeacher ? "xl:col-span-3" : ""
          )}>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {isNormalTeacher ? 'My Exam Schedules' : 'Existing Schedules'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isNormalTeacher 
                  ? 'Upcoming exams scheduled for your assigned subjects.' 
                  : 'Schedules already established.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {displayedSchedules.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No schedules found for this selection.
                </div>
              ) : (
                <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
                  {displayedSchedules.map((sch: any) => {
                    const optSub = subjectOptions.find((s: any) => s.id === sch.subjectId);
                    const sec = allowedSections.find((s: any) => s.id === sch.classSectionId);
                    return (
                      <div key={sch.id} className="p-4 hover:bg-muted/5 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs">{optSub?.subjectName || `Subject ${sch.subjectId}`} ({sec?.sectionName || `Section ${sch.classSectionId}`})</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(sch.examDate).toLocaleDateString()} | {sch.startTime} - {sch.endTime} {sch.roomNo && `| Room ${sch.roomNo}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setViewingSchedule(sch);
                            }}
                            className="rounded-lg h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5"
                            title="Detailed View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {!isNormalTeacher && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingSchedule(sch);
                                  setEditDate(sch.examDate ? sch.examDate.split('T')[0] : '');
                                  setEditStart(sch.startTime || '09:00');
                                  setEditEnd(sch.endTime || '12:00');
                                }}
                                className="rounded-lg h-7 w-7 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                                title="Edit Schedule"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteSchedule(sch.id)}
                                className="rounded-lg h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                                title="Delete Schedule"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View Modal */}
      {viewingSchedule && (
        <Dialog open={!!viewingSchedule} onOpenChange={(open) => !open && setViewingSchedule(null)}>
          <DialogContent className="max-w-md bg-white border border-border rounded-2xl p-6 shadow-lg">
            <DialogHeader className="border-b border-border/50 pb-4 mb-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                Exam Schedule Details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detailed schedule mapping for the selected subject.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Subject</span>
                  <span className="text-sm font-bold text-foreground">
                    {subjectOptions.find(s => s.id === viewingSchedule.subjectId)?.subjectName || `Subject ${viewingSchedule.subjectId}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Section</span>
                  <span className="text-sm font-semibold text-foreground">
                    {classSections.find(s => s.id === viewingSchedule.classSectionId)?.sectionName || `Section ${viewingSchedule.classSectionId}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Exam Date</span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(viewingSchedule.examDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Timings</span>
                  <span className="text-sm font-semibold text-foreground">
                    {viewingSchedule.startTime} - {viewingSchedule.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Marks</span>
                  <span className="text-sm font-semibold text-foreground">
                    {viewingSchedule.totalMarks || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Status</span>
                  <span className="text-sm font-bold text-emerald-600 uppercase">
                    {viewingSchedule.status || 'SCHEDULED'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setViewingSchedule(null)} className="rounded-xl px-6 bg-muted hover:bg-muted/80 text-foreground">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
          <DialogContent className="max-w-md bg-white border border-border rounded-2xl p-6 shadow-lg">
            <DialogHeader className="border-b border-border/50 pb-4 mb-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Pencil className="h-5 w-5 text-amber-500" />
                Edit Exam Schedule
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update date and timing settings for this scheduled component.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground">Subject & Section</Label>
                <p className="text-sm font-bold text-foreground mt-1">
                  {subjectOptions.find(s => s.id === editingSchedule.subjectId)?.subjectName || `Subject ${editingSchedule.subjectId}`} ({classSections.find(s => s.id === editingSchedule.classSectionId)?.sectionName || `Section ${editingSchedule.classSectionId}`})
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Exam Date</Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">Start Time</Label>
                  <Input
                    type="text"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    placeholder="09:00"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">End Time</Label>
                  <Input
                    type="text"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    placeholder="12:00"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setEditingSchedule(null)} variant="outline" className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={updateMutation.isPending} className="rounded-xl bg-primary hover:bg-primary/90">
                {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
