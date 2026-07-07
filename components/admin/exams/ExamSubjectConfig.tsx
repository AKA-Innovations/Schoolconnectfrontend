'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useExams, useExamSubjects } from '@/services/exam/queries';
import { useCreateExamSubjects, useDeleteExamSubject } from '@/services/exam/mutations';
import { useSchoolClasses, useSubjectOptions } from '@/hooks/useClasses';
import { examService } from '@/services/exam/service';
import { Plus, Trash2, RefreshCw, AlertCircle, Sparkles, HelpCircle, Copy, Grid } from 'lucide-react';
import { toast } from 'sonner';
import { GradingType } from '@/types/exam.types';
import { cn } from '@/lib/utils';

interface Props {
  session: string;
}

export function ExamSubjectConfig({ session }: Props) {
  const { data: exams = [] } = useExams(session);
  const { data: classes = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');

  const [activeMode, setActiveMode] = useState<'single' | 'bulk' | 'copy'>('single');

  const selectedClassName = classes.find(c => c.id === selectedClassId)?.className || '';

  const { data: subjectsData, isLoading, refetch, isFetching } = useExamSubjects(
    session,
    selectedExamId || 0,
    selectedClassId || undefined
  );

  const subjects = Array.isArray(subjectsData) 
    ? subjectsData 
    : (subjectsData as any)?.data || (subjectsData as any)?.items || [];

  const { data: subjectOptions = [] } = useSubjectOptions(selectedClassId || undefined);

  const createMutation = useCreateExamSubjects();
  const deleteMutation = useDeleteExamSubject();

  // Form State for creating subject mapping
  const [newSubjectId, setNewSubjectId] = useState<number | ''>('');
  const [newExamType, setNewExamType] = useState('THEORY');
  const [newTotalMarks, setNewTotalMarks] = useState(100);
  const [newPassingMarks, setNewPassingMarks] = useState(33);
  const [newWeightage, setNewWeightage] = useState(100);
  const [newGradingType, setNewGradingType] = useState<GradingType>(GradingType.MARKS_AND_GRADE);
  const [includeInFinal, setIncludeInFinal] = useState(true);

  // Bulk Selection State
  const [selectedBulkSubjectIds, setSelectedBulkSubjectIds] = useState<number[]>([]);

  // Copy Setup State
  const [copySourceExamId, setCopySourceExamId] = useState<number | ''>('');
  const [copySourceClassId, setCopySourceClassId] = useState<number | ''>('');

  // Auto-update exam type matching the active exam definition
  const activeExam = exams.find((e: any) => e.id === Number(selectedExamId));
  const activeExamType = activeExam?.examType || '';

  React.useEffect(() => {
    if (activeExamType) {
      setNewExamType(activeExamType);
    }
  }, [activeExamType]);

  const unconfiguredSubjects = React.useMemo(() => {
    return subjectOptions.filter(opt => !subjects.some((s: any) => s.subjectId === opt.id));
  }, [subjectOptions, subjects]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedClassId || !newSubjectId) {
      toast.error('Please select an Exam, Class, and Subject');
      return;
    }

    try {
      await createMutation.mutateAsync({
        session,
        examId: Number(selectedExamId),
        subjects: [
          {
            classId: Number(selectedClassId),
            subjectId: Number(newSubjectId),
            examType: activeExamType || newExamType,
            totalMarks: Number(newTotalMarks),
            passingMarks: Number(newPassingMarks),
            weightage: Number(newWeightage),
            gradingType: newGradingType,
            includeInFinalResult: includeInFinal,
            displayOrder: 1,
          },
        ],
      });
      setNewSubjectId('');
      toast.success('Subject config added successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add subject configuration');
    }
  };

  const handleAddBulkSubjects = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedClassId || selectedBulkSubjectIds.length === 0) {
      toast.error('Please select Exam, Class, and at least one Subject');
      return;
    }

    const payload = selectedBulkSubjectIds.map(subId => ({
      classId: Number(selectedClassId),
      subjectId: subId,
      examType: activeExamType || newExamType,
      totalMarks: Number(newTotalMarks),
      passingMarks: Number(newPassingMarks),
      weightage: Number(newWeightage),
      gradingType: newGradingType,
      includeInFinalResult: includeInFinal,
      displayOrder: 1,
    }));

    try {
      await createMutation.mutateAsync({
        session,
        examId: Number(selectedExamId),
        subjects: payload,
      });
      setSelectedBulkSubjectIds([]);
      toast.success(`Successfully configured ${payload.length} subjects in bulk`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add bulk configurations');
    }
  };

  const handleCopyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedClassId || !copySourceExamId || !copySourceClassId) {
      toast.error('Please specify target and source configurations');
      return;
    }

    try {
      const sourceData = await examService.getExamSubjects(
        session,
        Number(copySourceExamId),
        Number(copySourceClassId)
      );
      
      const sourceList = Array.isArray(sourceData) 
        ? sourceData 
        : (sourceData as any)?.data || (sourceData as any)?.items || [];

      if (sourceList.length === 0) {
        toast.error('The selected source configuration has no configured subjects to copy.');
        return;
      }

      const payload = sourceList.map((s: any) => ({
        classId: Number(selectedClassId),
        subjectId: s.subjectId,
        examType: activeExamType || s.examType,
        totalMarks: s.totalMarks,
        passingMarks: s.passingMarks,
        weightage: s.weightage,
        gradingType: s.gradingType,
        includeInFinalResult: s.includeInFinalResult,
        displayOrder: s.displayOrder || 1,
      }));

      await createMutation.mutateAsync({
        session,
        examId: Number(selectedExamId),
        subjects: payload,
      });

      toast.success(`Copied configuration of ${payload.length} subjects successfully`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to copy configuration');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject configuration?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Subject config deleted successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete configuration');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Subject Configurations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define subjects, max marks, passing thresholds, and grading schemes per exam and class.
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
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="rounded-xl h-10 w-10 shrink-0"
            disabled={!selectedExamId}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {!selectedExamId || !selectedClassId ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please select both an Exam and a Class to view or configure subjects.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Configuration tools (Form / Bulk / Copy) */}
          <Card className="rounded-2xl border border-border/80 shadow-sm bg-card h-fit">
            <CardHeader className="pb-4">
              <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setActiveMode('single')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeMode === 'single' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Single
                </button>
                <button
                  onClick={() => setActiveMode('bulk')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1",
                    activeMode === 'bulk' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="h-3 w-3" /> Bulk
                </button>
                <button
                  onClick={() => setActiveMode('copy')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1",
                    activeMode === 'copy' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Copy className="h-3 w-3" /> Copy Setup
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Single Mode Form */}
              {activeMode === 'single' && (
                <form onSubmit={handleAddSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Subject</Label>
                    <select
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value ? Number(e.target.value) : '')}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjectOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.subjectName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Exam Type</Label>
                    <Input
                      value={activeExamType || 'None selected'}
                      readOnly
                      disabled
                      className="rounded-xl h-11 bg-muted font-bold text-muted-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Total Marks</Label>
                      <Input
                        type="number"
                        value={newTotalMarks}
                        onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Passing Marks</Label>
                      <Input
                        type="number"
                        value={newPassingMarks}
                        onChange={(e) => setNewPassingMarks(Number(e.target.value))}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Weightage %</Label>
                      <Input
                        type="number"
                        value={newWeightage}
                        onChange={(e) => setNewWeightage(Number(e.target.value))}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Grading Scheme</Label>
                      <select
                        value={newGradingType}
                        onChange={(e) => setNewGradingType(e.target.value as GradingType)}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value={GradingType.MARKS_AND_GRADE}>Marks & Grade</option>
                        <option value={GradingType.MARKS}>Marks Only</option>
                        <option value={GradingType.GRADE}>Grade Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="includeInFinal"
                      checked={includeInFinal}
                      onChange={(e) => setIncludeInFinal(e.target.checked)}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <Label htmlFor="includeInFinal" className="text-sm font-semibold cursor-pointer">
                      Include in final results calculation
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 mt-2 font-bold h-11"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Saving...' : 'Add Subject Config'}
                  </Button>
                </form>
              )}

              {/* Bulk Mode Form */}
              {activeMode === 'bulk' && (
                <form onSubmit={handleAddBulkSubjects} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Select Subjects</Label>
                      {unconfiguredSubjects.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedBulkSubjectIds.length === unconfiguredSubjects.length) {
                              setSelectedBulkSubjectIds([]);
                            } else {
                              setSelectedBulkSubjectIds(unconfiguredSubjects.map(s => s.id));
                            }
                          }}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          {selectedBulkSubjectIds.length === unconfiguredSubjects.length ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>
                    {unconfiguredSubjects.length === 0 ? (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border text-center">
                        All subjects in this class have already been configured.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-3 space-y-2 bg-muted/10">
                        {unconfiguredSubjects.map(opt => {
                          const isChecked = selectedBulkSubjectIds.includes(opt.id);
                          return (
                            <label key={opt.id} className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold hover:bg-muted/40 p-1.5 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBulkSubjectIds(prev => [...prev, opt.id]);
                                  } else {
                                    setSelectedBulkSubjectIds(prev => prev.filter(id => id !== opt.id));
                                  }
                                }}
                                className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                              />
                              <span>{opt.subjectName}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Total Marks</Label>
                      <Input
                        type="number"
                        value={newTotalMarks}
                        onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Passing Marks</Label>
                      <Input
                        type="number"
                        value={newPassingMarks}
                        onChange={(e) => setNewPassingMarks(Number(e.target.value))}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Weightage %</Label>
                      <Input
                        type="number"
                        value={newWeightage}
                        onChange={(e) => setNewWeightage(Number(e.target.value))}
                        className="rounded-xl h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Grading Scheme</Label>
                      <select
                        value={newGradingType}
                        onChange={(e) => setNewGradingType(e.target.value as GradingType)}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value={GradingType.MARKS_AND_GRADE}>Marks & Grade</option>
                        <option value={GradingType.MARKS}>Marks Only</option>
                        <option value={GradingType.GRADE}>Grade Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="includeInFinalBulk"
                      checked={includeInFinal}
                      onChange={(e) => setIncludeInFinal(e.target.checked)}
                      className="rounded text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <Label htmlFor="includeInFinalBulk" className="text-sm font-semibold cursor-pointer">
                      Include in final results calculation
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 mt-2 font-bold h-11"
                    disabled={createMutation.isPending || selectedBulkSubjectIds.length === 0}
                  >
                    {createMutation.isPending ? 'Saving...' : `Configure Checked (${selectedBulkSubjectIds.length})`}
                  </Button>
                </form>
              )}

              {/* Copy Mode Form */}
              {activeMode === 'copy' && (
                <form onSubmit={handleCopyConfig} className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-primary/80 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> Copy Instructions
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      This copies the exact subjects, max marks, passing thresholds, and grading schemes configured for another Class and Exam into your active selection.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Source Exam</Label>
                    <select
                      value={copySourceExamId}
                      onChange={(e) => setCopySourceExamId(e.target.value ? Number(e.target.value) : '')}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select Source Exam</option>
                      {exams.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.examName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Source Class</Label>
                    <select
                      value={copySourceClassId}
                      onChange={(e) => setCopySourceClassId(e.target.value ? Number(e.target.value) : '')}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select Source Class</option>
                      {classes.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.className}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 mt-2 font-bold h-11"
                    disabled={createMutation.isPending || !copySourceExamId || !copySourceClassId}
                  >
                    {createMutation.isPending ? 'Copying...' : 'Copy Configuration'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* List of Configured Subjects */}
          <Card className="rounded-2xl border border-border/80 shadow-sm bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Configured Subjects</CardTitle>
              <CardDescription className="text-xs">Subjects registered for evaluation in this class.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading configurations...</div>
              ) : subjects.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No subjects configured yet. Configure them using the panel tools.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
                        <th className="p-4 px-6">Subject</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-center">Marks</th>
                        <th className="p-4 text-center">Grading</th>
                        <th className="p-4 text-center">Final</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                      {subjects.map((sub: any) => {
                        const optSubject = subjectOptions.find(o => o.id === sub.subjectId);
                        return (
                          <tr key={sub.id} className="hover:bg-muted/5 transition-colors">
                            <td className="p-4 px-6 font-semibold">{optSubject?.subjectName || `Subject ${sub.subjectId}`}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs rounded-lg">
                                {sub.examType}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium">{sub.passingMarks}</span>
                              <span className="text-muted-foreground/60 text-xs"> / {sub.totalMarks}</span>
                            </td>
                            <td className="p-4 text-center text-xs font-medium text-muted-foreground">{sub.gradingType}</td>
                            <td className="p-4 text-center">
                              <Badge className={`rounded-lg ${sub.includeInFinalResult ? 'bg-green-500/10 text-green-500 border-0' : 'bg-rose-500/10 text-rose-500 border-0'}`}>
                                {sub.includeInFinalResult ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(sub.id)}
                                className="rounded-lg h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
