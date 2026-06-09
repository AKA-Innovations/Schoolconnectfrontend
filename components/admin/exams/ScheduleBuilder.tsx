'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExams, useExamSubjects, useExamSchedules } from '@/services/exam/queries';
import { useCreateSchedules, useDeleteSchedule } from '@/services/exam/mutations';
import { useSchoolClasses, useSchoolSections, useSubjectOptions } from '@/hooks/useClasses';
import { Calendar, Save, Trash2, RefreshCw, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExamScheduleItemDto } from '@/types/exam.types';

interface Props {
  session: string;
}

export function ScheduleBuilder({ session }: Props) {
  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [applyToAllSections, setApplyToAllSections] = useState(true);

  // Fetch sections of class
  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

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

  const createMutation = useCreateSchedules();
  const deleteMutation = useDeleteSchedule();

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

  const handleSubmit = async () => {
    if (!selectedExamId || !selectedClassId) return;

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
        roomNo: input.room || undefined,
      };

      if (applyToAllSections && classSections.length > 0) {
        classSections.forEach(section => {
          schedulesToCreate.push({
            ...baseItem,
            classSectionId: section.id,
          });
        });
      } else {
        // Fallback: assign to the first section if not checking bulk
        if (classSections[0]) {
          schedulesToCreate.push({
            ...baseItem,
            classSectionId: classSections[0].id,
          });
        }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Exam Schedules
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build dates and timings of exam components for each class and section.
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
            onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
            className="flex h-10 w-full sm:w-48 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
          >
            <option value="">Select Class</option>
            {schoolClasses.map((c: any) => (
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
          <p className="text-muted-foreground font-medium">Please select an Exam and a Class to build or view schedules.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left/Middle Column: Schedule Builder Grid */}
          <Card className="rounded-2xl border border-border/80 shadow-sm bg-card xl:col-span-2">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg font-bold">Schedule Builder Grid</CardTitle>
                  <CardDescription className="text-xs">Configure dates for mapped subject components.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="applyAll"
                    checked={applyToAllSections}
                    onChange={(e) => setApplyToAllSections(e.target.checked)}
                    className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                  />
                  <Label htmlFor="applyAll" className="text-xs font-bold cursor-pointer">
                    Apply to all sections ({classSections.map(s => s.sectionName).join(', ')})
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {examSubjects.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No subjects configured for this class in Exam Subject Config. Define them first.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {examSubjects.map((sub) => {
                    const optSub = subjectOptions.find(s => s.id === sub.subjectId);
                    const values = scheduleInputs[sub.subjectId] || { date: '', start: '09:00', end: '12:00', room: '' };
                    return (
                      <div key={sub.id} className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-muted/5 transition-colors">
                        <div className="w-full md:w-1/4 shrink-0">
                          <p className="font-bold text-sm text-foreground">{optSub?.subjectName || `Subject ${sub.subjectId}`}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">{sub.examType}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
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
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Room No</Label>
                            <Input
                              type="text"
                              placeholder="e.g. 101"
                              value={values.room}
                              onChange={(e) => handleInputChange(sub.subjectId, 'room', e.target.value)}
                              className="h-9 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-4 px-6 bg-muted/5 flex justify-end">
                    <Button onClick={handleSubmit} className="rounded-xl gap-2 font-bold" disabled={createMutation.isPending}>
                      <Save className="h-4 w-4" />
                      {createMutation.isPending ? 'Generating...' : 'Save Schedules'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Existing Schedules List */}
          <Card className="rounded-2xl border border-border/80 shadow-sm bg-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Existing Schedules</CardTitle>
              <CardDescription className="text-xs">Schedules already established.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {existingSchedules.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No existing schedules found for this selection.
                </div>
              ) : (
                <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                  {existingSchedules.map((sch: any) => {
                    const optSub = subjectOptions.find((s: any) => s.id === sch.subjectId);
                    const sec = classSections.find((s: any) => s.id === sch.classSectionId);
                    return (
                      <div key={sch.id} className="p-4 hover:bg-muted/5 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs">{optSub?.subjectName || `Subject ${sch.subjectId}`} ({sec?.sectionName || `Section ${sch.classSectionId}`})</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(sch.examDate).toLocaleDateString()} | {sch.startTime} - {sch.endTime} {sch.roomNo && `| Room ${sch.roomNo}`}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="rounded-lg h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
