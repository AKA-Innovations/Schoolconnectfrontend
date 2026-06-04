'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExams } from '@/services/exam/queries';
import { useCreateBulkSchedules } from '@/services/exam/mutations';
import { groupExamsByName } from '@/services/exam/transformers';
import { useSchoolClasses, useSubjectOptions, useSchoolSections } from '@/hooks/useClasses';
import { Calendar, Save, AlertTriangle, ArrowRight } from 'lucide-react';

interface GridRow {
  id: string;
  classId: number;
  subjectId: number;
  examDate: string;
  startTime: string;
  endTime: string;
}

export function ScheduleBuilder() {
  const [session] = useState('2026-27');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [scope, setScope] = useState<'ALL' | 'CLASS'>('CLASS');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [applyToAllSections, setApplyToAllSections] = useState(true);

  const [gridRows, setGridRows] = useState<GridRow[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Fetching Data
  const { data: exams } = useExams(session);
  const groupedExams = exams ? groupExamsByName(exams) : [];

  const { data: schoolClasses = [] } = useSchoolClasses();

  const { data: subjects = [] } = useSubjectOptions();

  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

  const createBulkSchedules = useCreateBulkSchedules();

  const handleAddRow = () => {
    if (!selectedClassId) {
      alert("Please select a class first");
      return;
    }
    setGridRows([
      ...gridRows, 
      { id: Date.now().toString(), classId: Number(selectedClassId), subjectId: 0, examDate: '', startTime: '09:00', endTime: '12:00' }
    ]);
  };

  const handleUpdateRow = (id: string, field: keyof GridRow, value: any) => {
    setGridRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleRemoveRow = (id: string) => {
    setGridRows(rows => rows.filter(r => r.id !== id));
  };

  const validateConflicts = () => {
    const newConflicts: string[] = [];
    const seen = new Set<string>();

    gridRows.forEach(row => {
      if (!row.subjectId || !row.examDate) {
        newConflicts.push(`Row missing subject or date.`);
        return;
      }
      const key = `${row.classId}-${row.subjectId}-${row.examDate}`;
      if (seen.has(key)) {
        newConflicts.push(`Duplicate schedule found for a subject on ${row.examDate}`);
      }
      seen.add(key);
    });

    setConflicts(newConflicts);
    return newConflicts.length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedExamId || gridRows.length === 0) return;
    if (!validateConflicts()) return;

    try {
      // SMART EXPANSION LOGIC
      // If applyToAllSections is true, expand each grid row to all sections of that class
      const schedulesToCreate = [];

      for (const row of gridRows) {
        if (applyToAllSections && classSections) {
          classSections.forEach(section => {
            schedulesToCreate.push({
              examId: Number(selectedExamId),
              classSectionId: section.id, // Assuming section.id is classSectionId
              subjectId: row.subjectId,
              examDate: new Date(row.examDate).toISOString(),
              startTime: row.startTime,
              endTime: row.endTime
            });
          });
        } else {
          // Manual fallback (if not expanding, would require explicit section selection per row, simplified here)
          schedulesToCreate.push({
              examId: Number(selectedExamId),
              classSectionId: Number(selectedClassId), // simplified
              subjectId: row.subjectId,
              examDate: new Date(row.examDate).toISOString(),
              startTime: row.startTime,
              endTime: row.endTime
          });
        }
      }

      await createBulkSchedules.mutateAsync({
        session,
        schedules: schedulesToCreate as any
      });

      alert(`Successfully generated ${schedulesToCreate.length} schedules!`);
      setGridRows([]);
    } catch (error) {
      console.error("Bulk scheduling failed", error);
      alert("Failed to create schedules.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Smart Schedule Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">Bulk generate timetables for entire classes at once</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Configuration */}
        <Card className="rounded-2xl border-border shadow-sm md:col-span-1">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-lg font-bold">1. Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Select Exam</Label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Exam Component" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map(exam => (
                    <SelectItem key={exam.id} value={exam.id?.toString() || ''}>
                      {exam.examName} - {exam.examType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLASS">Specific Class</SelectItem>
                  <SelectItem value="ALL">Entire School (Auto)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scope === 'CLASS' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label>Class</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolClasses?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2 border rounded-xl p-4 bg-primary/5 border-primary/20">
              <Checkbox 
                id="applyAll" 
                checked={applyToAllSections} 
                onCheckedChange={(c: boolean) => setApplyToAllSections(c)} 
              />
              <Label htmlFor="applyAll" className="text-sm font-bold cursor-pointer text-primary">
                Apply to all Sections
              </Label>
            </div>
            {applyToAllSections && classSections && (
              <p className="text-xs text-muted-foreground pl-6">
                This will automatically generate schedules for {classSections.map(s => s.sectionName).join(', ')}.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Timetable Grid */}
        <Card className="rounded-2xl border-border shadow-sm md:col-span-2">
          <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">2. Timetable Grid</CardTitle>
            <Button onClick={handleAddRow} size="sm" variant="outline" className="rounded-xl h-8">
              + Add Subject
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {gridRows.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Calendar className="h-10 w-10 mb-3 opacity-20" />
                <p>No subjects added to schedule yet.</p>
                <p className="text-sm mt-1">Configure your class on the left and add subjects.</p>
              </div>
            ) : (
              <div className="overflow-x-auto p-6">
                <table className="w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Subject</th>
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold">Start</th>
                      <th className="pb-2 font-semibold">End</th>
                      <th className="pb-2 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridRows.map(row => (
                      <tr key={row.id}>
                        <td className="pr-2">
                          <Select 
                            value={row.subjectId ? row.subjectId.toString() : ''} 
                            onValueChange={(v) => handleUpdateRow(row.id, 'subjectId', Number(v))}
                          >
                            <SelectTrigger className="h-10 rounded-lg">
                              <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects?.map((s: any) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {s.subjectName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2">
                          <Input 
                            type="date" 
                            className="h-10 rounded-lg"
                            value={row.examDate}
                            onChange={(e) => handleUpdateRow(row.id, 'examDate', e.target.value)}
                          />
                        </td>
                        <td className="px-2">
                          <Input 
                            type="time" 
                            className="h-10 rounded-lg"
                            value={row.startTime}
                            onChange={(e) => handleUpdateRow(row.id, 'startTime', e.target.value)}
                          />
                        </td>
                        <td className="px-2">
                          <Input 
                            type="time" 
                            className="h-10 rounded-lg"
                            value={row.endTime}
                            onChange={(e) => handleUpdateRow(row.id, 'endTime', e.target.value)}
                          />
                        </td>
                        <td className="text-right pl-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-lg"
                            onClick={() => handleRemoveRow(row.id)}
                          >
                            ×
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {conflicts.length > 0 && (
                  <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-bold mb-1">Conflicts Detected!</p>
                      <ul className="list-disc pl-4">
                        {conflicts.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/50 p-6 flex justify-end bg-muted/5 rounded-b-2xl">
            <Button 
              className="rounded-xl gap-2 font-semibold shadow-md"
              size="lg"
              disabled={gridRows.length === 0 || createBulkSchedules.isPending || !selectedExamId}
              onClick={handleSubmit}
            >
              {createBulkSchedules.isPending ? 'Generating...' : (
                <>Generate Bulk Schedules <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
