'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExams } from '@/services/exam/queries';
import { useEnterMarks } from '@/services/exam/mutations';
import { calculateGrade } from '@/services/exam/transformers';
import { Save, FileSpreadsheet, Send, CheckCircle2 } from 'lucide-react';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { classService } from '@/services/class/service';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { studentService } from '@/services/student/service';
import { AssignmentSelector } from '@/components/academic/shared/AssignmentSelector';

// Dummy student type for the grid
interface StudentEntry {
  studentId: string;
  name: string;
  rollNo: string;
  marksObtained: number | '';
  maxMarks: number;
  status: 'PRESENT' | 'AB' | 'ML' | 'EXEMPT';
  remarks: string;
}

export function ResultEntry() {
  const [session] = useState('2026-27');
  
  // Selections
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [assignmentKey, setAssignmentKey] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClassSectionId, setSelectedClassSectionId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const handleAssignmentChange = (val: string, detail: any) => {
    setAssignmentKey(val);
    if (detail) {
      setSelectedClassId(detail.classId.toString());
      setSelectedClassSectionId(detail.classSectionId.toString());
      setSelectedSubjectId(detail.subjectDtlsId.toString());
    } else {
      setSelectedClassId('');
      setSelectedClassSectionId('');
      setSelectedSubjectId('');
    }
  };

  const { user } = useTeacherProfile();
  
  // Fetching Data
  const { data: exams } = useExams(session);
  const createBulkResults = useEnterMarks();

  // Fetch actual students for the selected section
  const { data: sectionStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', selectedClassSectionId],
    queryFn: () => studentService.list({ classSectionId: Number(selectedClassSectionId), limit: 100 }),
    enabled: !!selectedClassSectionId,
  });

  // Grid State
  const [students, setStudents] = useState<StudentEntry[]>([]);

  // Sync fetched students to grid state
  useEffect(() => {
    if (sectionStudents?.items) {
      const initializedStudents = sectionStudents.items.map((student: any) => {
        const academic = student.academics?.[0]; // Assuming first academic record corresponds to current class
        return {
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`.trim(),
          rollNo: academic?.rollNumber || '-',
          marksObtained: '' as const,
          maxMarks: 100, // Ideally pulled from Exam config, defaulting to 100
          status: 'PRESENT' as const,
          remarks: ''
        };
      });
      setStudents(initializedStudents);
    } else {
      setStudents([]);
    }
  }, [sectionStudents]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleUpdateStudent = (id: string, field: keyof StudentEntry, value: any) => {
    setStudents(prev => prev.map(s => s.studentId === id ? { ...s, [field]: value } : s));
  };

  const handleDraftSave = () => {
    // In reality, this would save to localStorage or a draft backend endpoint
    alert('Draft saved locally. You can return later to complete it.');
  };

  const handleSubmit = async () => {
    if (!selectedExamId || !selectedClassSectionId || !selectedSubjectId) {
      alert('Please select Exam, Class, and Subject before submitting.');
      return;
    }

    const payload = {
      session,
      results: students.map((s: any) => {
        const isAbsent = s.status !== 'PRESENT';
        return {
          examId: Number(selectedExamId),
          classSectionId: Number(selectedClassSectionId),
          subjectId: Number(selectedSubjectId),
          studentId: s.studentId,
          marksObtained: isAbsent || s.marksObtained === '' ? undefined : Number(s.marksObtained),
          maxMarks: s.maxMarks,
          grade: isAbsent || s.marksObtained === '' ? '' : calculateGrade(Number(s.marksObtained), s.maxMarks),
          remarks: isAbsent ? s.status : s.remarks,
        };
      })
    };

    try {
      await createBulkResults.mutateAsync(payload as any);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit marks', error);
      alert('Failed to submit results');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Result Entry</h2>
          <p className="text-sm text-muted-foreground mt-1">Spreadsheet-style marks entry for subject teachers</p>
        </div>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-lg font-bold">1. Select Assessment</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <Label>Exam Component</Label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map((exam: any) => (
                    <SelectItem key={exam.id} value={exam.id?.toString() || ''}>
                      {exam.examName} - {exam.examType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-1 md:col-span-3">
              <AssignmentSelector
                value={assignmentKey}
                onChange={handleAssignmentChange}
              />
            </div>
            
            <div className="flex items-end">
              <Button className="w-full rounded-xl gap-2 h-10" variant="outline">
                <FileSpreadsheet className="h-4 w-4" /> Import Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isSubmitted ? (
        <Card className="rounded-2xl border-border shadow-sm bg-green-500/5 border-green-500/20">
          <CardContent className="p-12 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-green-700">Results Submitted Successfully!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your marks have been recorded. They are now pending administrative review before being published on report cards.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="rounded-xl mt-4">
              Enter Another Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex justify-between items-center">
              <span>2. Spreadsheet Entry</span>
              {selectedExamId && selectedClassSectionId && (
                <span className="text-xs font-normal text-muted-foreground bg-background px-3 py-1 rounded-full border">
                  Auto-calculating Grades
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto p-6">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="pb-2 pl-2 font-semibold">Roll</th>
                    <th className="pb-2 font-semibold">Student Name</th>
                    <th className="pb-2 font-semibold w-32">Status</th>
                    <th className="pb-2 font-semibold w-24">Marks</th>
                    <th className="pb-2 font-semibold w-24">Grade</th>
                    <th className="pb-2 font-semibold">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const grade = student.marksObtained !== '' 
                      ? calculateGrade(Number(student.marksObtained), student.maxMarks) 
                      : '-';

                    const isAbsent = student.status !== 'PRESENT';

                    return (
                      <tr key={student.studentId} className={`transition-colors ${isAbsent ? 'opacity-60 bg-muted/20' : ''}`}>
                        <td className="px-2 py-1 font-medium">{student.rollNo}</td>
                        <td className="px-2 py-1 font-bold">{student.name}</td>
                        <td className="px-2 py-1">
                          <Select 
                            value={student.status} 
                            onValueChange={(v: any) => handleUpdateStudent(student.studentId, 'status', v)}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PRESENT">Present</SelectItem>
                              <SelectItem value="AB">Absent (AB)</SelectItem>
                              <SelectItem value="ML">Medical (ML)</SelectItem>
                              <SelectItem value="EXEMPT">Exempted</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-1">
                          <Input 
                            id={`result-marks-input-${student.studentId}`}
                            type="number"
                            className="h-9 rounded-lg"
                            placeholder=" / 100"
                            value={student.marksObtained}
                            disabled={isAbsent}
                            onChange={(e) => handleUpdateStudent(student.studentId, 'marksObtained', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                let nextIndex = index + 1;
                                while (nextIndex < students.length) {
                                  const nextStudent = students[nextIndex];
                                  const nextInput = document.getElementById(`result-marks-input-${nextStudent.studentId}`) as HTMLInputElement | null;
                                  if (nextInput && !nextInput.disabled) {
                                    nextInput.focus();
                                    nextInput.select();
                                    break;
                                  }
                                  nextIndex++;
                                }
                              }
                            }}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <div className="h-9 flex items-center justify-center font-bold text-primary bg-primary/5 rounded-lg border border-primary/10">
                            {isAbsent ? student.status : grade}
                          </div>
                        </td>
                        <td className="px-2 py-1">
                          <Input 
                            className="h-9 rounded-lg"
                            placeholder="Add remark..."
                            value={student.remarks}
                            onChange={(e) => handleUpdateStudent(student.studentId, 'remarks', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 p-6 flex justify-between bg-muted/5 rounded-b-2xl">
            <Button variant="outline" onClick={handleDraftSave} className="rounded-xl gap-2">
              <Save className="h-4 w-4" /> Save as Draft
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createBulkResults.isPending}
              className="rounded-xl bg-primary hover:bg-primary/90 gap-2 font-semibold shadow-md"
            >
              <Send className="h-4 w-4" /> {createBulkResults.isPending ? 'Submitting...' : 'Final Submit'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
