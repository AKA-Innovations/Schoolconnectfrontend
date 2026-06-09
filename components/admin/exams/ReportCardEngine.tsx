'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useExams, useReportCard } from '@/services/exam/queries';
import { useSchoolClasses, useSchoolSections } from '@/hooks/useClasses';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student/service';
import { FileText, Printer, AlertCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  session: string;
}

export function ReportCardEngine({ session }: Props) {
  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

  // Fetch students in selected section
  const { data: studentList } = useQuery({
    queryKey: ['students-report-card-select', selectedSectionId],
    queryFn: () => studentService.list({ classSectionId: Number(selectedSectionId), limit: 150 }),
    enabled: !!selectedSectionId,
  });

  // Fetch report card data
  const { data: reportCard, isLoading: loadingReportCard } = useReportCard(
    selectedStudentId,
    Number(selectedExamId) || 0,
    session
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Card Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and view structured, student-wise final report cards.
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
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={!selectedSectionId}
            className="flex h-10 w-full sm:w-48 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Student</option>
            {studentList?.items?.map((student: any) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedStudentId || !selectedExamId ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center print:hidden">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please select an Exam and a Student to preview their report card.</p>
        </Card>
      ) : loadingReportCard ? (
        <div className="p-12 text-center text-muted-foreground print:hidden">Loading report card data...</div>
      ) : !reportCard ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center print:hidden">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500/40" />
          <p className="text-muted-foreground font-medium">No generated report card data found for this selection. Consolidate results first.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Action header */}
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/50 print:hidden">
            <h3 className="font-bold text-sm">Report Card Preview</h3>
            <Button onClick={handlePrint} className="rounded-xl gap-2 font-bold bg-primary hover:bg-primary/90">
              <Printer className="h-4 w-4" /> Print Report Card
            </Button>
          </div>

          {/* Printable Report Card Sheet */}
          <Card className="rounded-2xl border border-border/80 shadow-md bg-white text-black p-8 sm:p-12 space-y-8 max-w-4xl mx-auto print:shadow-none print:border-0 print:p-0">
            {/* School Header */}
            <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
              <h1 className="text-3xl font-black tracking-tight uppercase">SkoolConnect Academy</h1>
              <p className="text-sm font-semibold tracking-wide text-slate-700">Annual Progress & Evaluation Report</p>
              <p className="text-xs text-slate-500">Academic Session {session}</p>
            </div>

            {/* Student metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Student Name</p>
                <p className="font-extrabold text-slate-900">{reportCard.studentName || `${reportCard.student?.firstName} ${reportCard.student?.lastName}`}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Student ID / Roll No</p>
                <p className="font-extrabold text-slate-900">{reportCard.studentId} / {reportCard.rollNo || '-'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Class & Section</p>
                <p className="font-extrabold text-slate-900">{schoolClasses.find((c: any) => c.id === selectedClassId)?.className || ''} - {classSections.find((s: any) => s.id === selectedSectionId)?.sectionName}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Overall Rank</p>
                <p className="font-extrabold text-slate-950 text-base">#{reportCard.rank || 'N/A'}</p>
              </div>
            </div>

            {/* Subject marks table */}
            <div className="border-2 border-slate-900 rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider border-b border-slate-900">
                    <th className="p-3.5 pl-5">Subject Evaluated</th>
                    <th className="p-3.5 text-center">Passing Marks</th>
                    <th className="p-3.5 text-center">Max Marks</th>
                    <th className="p-3.5 text-center">Marks Obtained</th>
                    <th className="p-3.5 pr-5 text-center">Grade Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportCard.subjects?.map((sub: any, idx: number) => (
                    <tr key={idx} className="font-medium text-slate-800">
                      <td className="p-3.5 pl-5 font-bold text-slate-950">{sub.subjectName}</td>
                      <td className="p-3.5 text-center text-slate-600">{sub.passingMarks}</td>
                      <td className="p-3.5 text-center text-slate-600">{sub.maxMarks}</td>
                      <td className="p-3.5 text-center font-bold text-slate-950">{sub.marksObtained ?? '-'}</td>
                      <td className="p-3.5 pr-5 text-center font-black text-slate-950">{sub.grade || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-950 border-t-2 border-slate-900">
                    <td className="p-4 pl-5">Aggregated Total</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">{reportCard.totalMarks}</td>
                    <td className="p-4 text-center text-base font-black">{reportCard.marksObtained}</td>
                    <td className="p-4 pr-5 text-center text-base font-black text-indigo-700">
                      {reportCard.grade} ({reportCard.percentage?.toFixed(1)}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Remarks and Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="border border-slate-200 p-5 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider">Class Teacher Remarks</h4>
                <p className="text-sm font-medium text-slate-800 italic">"{reportCard.teacherRemarks || 'No remarks provided.'}"</p>
              </div>
              <div className="border border-slate-200 p-5 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider">Principal Remarks</h4>
                <p className="text-sm font-medium text-slate-800 italic">"{reportCard.principalRemarks || 'No remarks provided.'}"</p>
              </div>
            </div>

            {/* Signature fields */}
            <div className="flex justify-between items-end pt-12 text-sm text-center">
              <div className="w-40 border-t border-slate-400 pt-2 font-bold text-slate-600">Class Teacher</div>
              <div className="w-40 border-t border-slate-400 pt-2 font-bold text-slate-600">Principal Signature</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
