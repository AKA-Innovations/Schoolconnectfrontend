'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student/service';
import { useExams, useExamSubjects, useMarks, useGradeConfig } from '@/services/exam/queries';
import { useEnterMarks, useLockMarks, useUnlockMarks, useBulkMarkAbsent } from '@/services/exam/mutations';
import { useSchoolClasses, useSchoolSections, useSubjectOptions } from '@/hooks/useClasses';
import { Save, Lock, Unlock, AlertCircle, RefreshCw, Sparkles, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import { MarksEntryItemDto } from '@/types/exam.types';

interface Props {
  session: string;
  teacherContext?: {
    assignedClassSectionIds?: number[];
    assignedSubjectIds?: number[];
  };
}

export function MarksEntryManager({ session, teacherContext }: Props) {
  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');

  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

  const { data: examSubjects = [] } = useExamSubjects(
    session,
    selectedExamId || 0,
    selectedClassId || undefined
  );

  const selectedClassName = schoolClasses.find(c => c.id === selectedClassId)?.className || '';
  const { data: subjectOptions = [] } = useSubjectOptions(selectedClassName || undefined);

  // Fetch student list for selected section
  const { data: studentList, isLoading: loadingStudents } = useQuery({
    queryKey: ['students-marks-list', selectedSectionId],
    queryFn: () => studentService.list({ classSectionId: Number(selectedSectionId), limit: 150 }),
    enabled: !!selectedSectionId,
  });

  // Fetch existing marks
  const { data: existingMarks = [], refetch: refetchMarks, isLoading: loadingMarks } = useMarks(
    selectedExamId || 0,
    selectedClassId || 0,
    selectedSectionId || 0,
    selectedSubjectId || undefined
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

  const currentSubjectConfig = examSubjects.find(s => s.subjectId === selectedSubjectId);
  const isMarksLocked = existingMarks.some(m => m.isLocked && m.subjectId === selectedSubjectId);

  useEffect(() => {
    if (studentList?.items) {
      const initialGrid: typeof marksGrid = {};
      studentList.items.forEach((student: any) => {
        const matchingMark = existingMarks.find(m => m.studentId === student.id && m.subjectId === selectedSubjectId);
        initialGrid[student.id] = {
          marksObtained: matchingMark?.marksObtained !== undefined ? matchingMark.marksObtained : '',
          isAbsent: matchingMark?.isAbsent || false,
          remarks: matchingMark?.remarks || '',
        };
      });
      setMarksGrid(initialGrid);
    }
  }, [studentList, existingMarks, selectedSubjectId]);

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
    const match = gradeConfig.find(g => pct >= g.minPercentage && pct <= g.maxPercentage);
    return match ? match.gradeName : '-';
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSectionId || !selectedSubjectId) return;

    const marksPayload: MarksEntryItemDto[] = [];
    Object.entries(marksGrid).forEach(([studentId, data]) => {
      marksPayload.push({
        studentId,
        examSubjectDtlId: currentSubjectConfig?.id || 0,
        subjectId: Number(selectedSubjectId),
        marksObtained: data.isAbsent || data.marksObtained === '' ? undefined : Number(data.marksObtained),
        isAbsent: data.isAbsent,
        remarks: data.remarks || undefined,
      });
    });

    try {
      await enterMarksMutation.mutateAsync({
        session,
        examId: Number(selectedExamId),
        classId: Number(selectedClassId),
        classSectionId: Number(selectedSectionId),
        marks: marksPayload,
      });
      toast.success('Marks saved successfully');
      refetchMarks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    }
  };

  const handleLockUnlock = async (action: 'lock' | 'unlock') => {
    if (!selectedExamId || !selectedClassId || !selectedSectionId || !selectedSubjectId || !currentSubjectConfig) return;
    
    const payload = {
      examId: Number(selectedExamId),
      examSubjectDtlId: currentSubjectConfig.id,
      classId: Number(selectedClassId),
      classSectionId: Number(selectedSectionId),
      subjectId: Number(selectedSubjectId),
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
    if (selectedStudents.length === 0 || !currentSubjectConfig) return;
    
    try {
      await bulkAbsentMutation.mutateAsync({
        examId: Number(selectedExamId),
        examSubjectDtlId: currentSubjectConfig.id,
        classId: Number(selectedClassId),
        classSectionId: Number(selectedSectionId),
        subjectId: Number(selectedSubjectId),
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
    <div className="space-y-6">
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
            onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
            className="flex h-10 w-full sm:w-40 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Class</option>
            {schoolClasses.map((c: any) => (
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
            {classSections.map((s: any) => (
              <option key={s.id} value={s.id}>{s.sectionName}</option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
            disabled={!selectedClassId}
            className="flex h-10 w-full sm:w-40 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Subject</option>
            {examSubjects.map((sub: any) => {
              const match = subjectOptions.find((o: any) => o.id === sub.subjectId);
              return (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {match?.subjectName || `Subject ${sub.subjectId}`} ({sub.examType})
                </option>
              );
            })}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchMarks()}
            className="rounded-xl h-10 w-10 shrink-0"
            disabled={!selectedSubjectId || !selectedSectionId}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!selectedSubjectId || !selectedSectionId ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please specify Exam, Class, Section, and Subject to enter marks.</p>
        </Card>
      ) : (
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

            <div className="flex items-center gap-2">
              {selectedStudents.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleBulkAbsent} className="rounded-lg text-xs hover:bg-rose-50 text-rose-600 border-rose-200">
                  Mark Selected Absent ({selectedStudents.length})
                </Button>
              )}
              {isMarksLocked ? (
                <Button variant="outline" size="sm" onClick={() => handleLockUnlock('unlock')} className="rounded-lg text-xs gap-1">
                  <Unlock className="h-3.5 w-3.5" /> Unlock Marks
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => handleLockUnlock('lock')} className="rounded-lg text-xs gap-1">
                  <Lock className="h-3.5 w-3.5" /> Lock Marks
                </Button>
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
                          checked={selectedStudents.length === studentList?.items?.length && studentList?.items?.length > 0}
                          onChange={(e) => {
                            if (e.target.checked && studentList?.items) {
                              setSelectedStudents(studentList.items.map((s: any) => s.id));
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
                    {studentList?.items?.map((student: any) => {
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
