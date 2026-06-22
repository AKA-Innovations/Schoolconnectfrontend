'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStudentMarks } from '@/services/exam/queries';
import { CURRENT_SESSION } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function StudentMarksPage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id || '';

  const { data: marksData = [], isLoading } = useStudentMarks(studentId, CURRENT_SESSION);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Subject Marks</h2>
        <p className="text-sm text-muted-foreground mt-1">View your subject-wise marks breakdown for the current session {CURRENT_SESSION}</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading marks data...</div>
      ) : marksData.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No marks entries found for session {CURRENT_SESSION}.</p>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Assessment Breakdown</CardTitle>
            <CardDescription className="text-xs">Subject-level marks and evaluation types.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
                    <th className="p-4 px-6">Subject</th>
                    <th className="p-4">Exam</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-center">Marks Obtained</th>
                    <th className="p-4 text-center">Grade</th>
                    <th className="p-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm">
                  {marksData.map((mark: any) => (
                    <tr key={mark.id} className="hover:bg-muted/5 transition-colors">
                      <td className="p-4 px-6 font-bold">{mark.subjectName || `Subject ${mark.subjectId}`}</td>
                      <td className="p-4 font-semibold text-muted-foreground">{mark.examName || `Exam ${mark.examId}`}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs rounded-lg">{mark.examType}</Badge>
                      </td>
                      <td className="p-4 text-center font-bold">
                        {mark.isAbsent ? (
                          <span className="text-rose-600 font-bold text-xs uppercase">Absent</span>
                        ) : (
                          `${mark.marksObtained} / ${mark.maxMarks}`
                        )}
                      </td>
                      <td className="p-4 text-center font-black text-primary">{mark.isAbsent ? 'AB' : mark.grade}</td>
                      <td className="p-4 text-muted-foreground text-xs">{mark.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
