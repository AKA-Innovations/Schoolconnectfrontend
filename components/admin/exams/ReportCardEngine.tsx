'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useExams, useExamResults } from '@/services/exam/queries';
import { consolidateReportCards, StudentReportCard } from '@/services/exam/calculations';
import { FileText, Printer, Download, Search } from 'lucide-react';
import { classService } from '@/services/class/service';
import { useQuery } from '@tanstack/react-query';

export function ReportCardEngine() {
  const [session] = useState('2026-27');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const { data: schoolClasses } = useQuery({
    queryKey: ['schoolClasses'],
    queryFn: () => classService.getSchoolClasses('school_id_placeholder'),
  });

  const { data: classSections } = useQuery({
    queryKey: ['schoolSections', selectedClassId],
    queryFn: () => classService.getSchoolSections('school_id_placeholder', Number(selectedClassId)),
    enabled: !!selectedClassId,
  });

  // In a real scenario, you'd fetch all results for this class section across ALL exams
  const { data: results, isLoading: loadingResults } = useExamResults({ session, classSectionId: Number(selectedSectionId) });
  const { data: exams } = useExams(session);

  const [reportCards, setReportCards] = useState<StudentReportCard[]>([]);

  const handleGenerate = () => {
    if (!results || !exams) return;

    // Dummy maps for names since we don't have the full graph here
    const studentMap = {
      'STU001': { name: 'Aman Sharma', rollNo: '1' },
      'STU002': { name: 'Ravi Kumar', rollNo: '2' },
      'STU003': { name: 'Sneha Patel', rollNo: '3' },
    };
    
    const subjectMap = {
      10: { name: 'Mathematics' },
      11: { name: 'Science' },
      12: { name: 'English' }
    };

    const consolidated = consolidateReportCards(results, exams, studentMap, subjectMap);
    setReportCards(consolidated);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Report Card Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Consolidate results across Theory, Practical, and Viva to generate final report cards</p>
        </div>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {schoolClasses?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.className}</SelectItem>
                  ))}
                  {/* Dummy fallback */}
                  <SelectItem value="10">Class 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {classSections?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.sectionName}</SelectItem>
                  ))}
                  {/* Dummy fallback */}
                  <SelectItem value="101">Section A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="rounded-xl gap-2 h-11 shadow-sm"
              onClick={handleGenerate}
              disabled={!selectedSectionId || loadingResults}
            >
              <Search className="h-4 w-4" /> Generate Report Cards
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportCards.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/50">
            <h3 className="font-bold text-lg">{reportCards.length} Report Cards Generated</h3>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl gap-2 bg-background">
                <Printer className="h-4 w-4" /> Print All
              </Button>
              <Button className="rounded-xl gap-2 shadow-sm">
                <Download className="h-4 w-4" /> Export PDFs
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCards.map(report => (
              <Card key={report.studentId} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border-border">
                <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-primary">{report.studentName}</h4>
                    <p className="text-xs text-muted-foreground font-mono">Roll No: {report.rollNo} | Rank: {report.rank}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">{report.overallPercentage.toFixed(1)}%</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-primary/70">Grade {report.overallGrade}</div>
                  </div>
                </div>
                <CardContent className="p-0">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30 text-muted-foreground border-b">
                        <th className="text-left p-2 pl-4">Subject</th>
                        <th className="text-right p-2">Marks</th>
                        <th className="text-center p-2 pr-4">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.subjects.map(sub => (
                        <tr key={sub.subjectId} className="border-b last:border-0 border-border/50">
                          <td className="p-2 pl-4 font-medium">{sub.subjectName}</td>
                          <td className="p-2 text-right">
                            {sub.totalMarksObtained}<span className="text-muted-foreground">/{sub.totalMaxMarks}</span>
                          </td>
                          <td className="p-2 pr-4 text-center">
                            <span className="font-bold">{sub.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-muted/10 border-t flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Attendance: {report.attendance.presentDays}/{report.attendance.workingDays}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-primary hover:text-primary gap-1 px-2">
                      <FileText className="h-3 w-3" /> View Full
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
