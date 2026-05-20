'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExams, useExamSchedules, useExamResults } from '@/services/exam/queries';
import { classService } from '@/services/class/service';
import { useQuery } from '@tanstack/react-query';
import { Eye, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function ResultMonitoring() {
  const [session] = useState('2026-27');
  
  const { data: exams, isLoading: loadingExams } = useExams(session);
  const { data: schedules, isLoading: loadingSchedules } = useExamSchedules(session);
  const { data: results, isLoading: loadingResults } = useExamResults({ session });

  const { data: subjects } = useQuery({
    queryKey: ['schoolSubjects'],
    queryFn: () => classService.getSubjectOptions('school_id_placeholder'),
  });

  const { data: classSections } = useQuery({
    queryKey: ['allSchoolSections'],
    // Fetching sections without classId gets all sections for the school in the current backend API design
    queryFn: () => classService.getSchoolSections('school_id_placeholder'),
  });

  const isLoading = loadingExams || loadingSchedules || loadingResults;

  const evaluationProgress = schedules?.map(schedule => {
    const exam = exams?.find(e => e.id === schedule.examId);
    const subject = subjects?.find(s => s.id === schedule.subjectId);
    const section = classSections?.find(s => s.id === schedule.classSectionId);
    
    const hasResults = results?.some(r => 
      r.examId === schedule.examId && 
      r.classSectionId === schedule.classSectionId && 
      r.subjectId === schedule.subjectId
    );

    return {
      id: schedule.id || Math.random(),
      examName: exam?.examName || 'Unknown Exam',
      examType: exam?.examType || 'Theory',
      className: section?.sectionName || `Section ${schedule.classSectionId}`,
      subject: subject?.subjectName || `Subject ${schedule.subjectId}`,
      teacher: 'Assigned Teacher',
      status: hasResults ? 'Submitted' : 'Pending',
      timestamp: hasResults ? 'Recently' : '-',
    };
  }) || [];

  const pendingCount = evaluationProgress.filter(e => e.status === 'Pending').length;
  const submittedCount = evaluationProgress.filter(e => e.status === 'Submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Result Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1">Track teacher evaluation progress and publish results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl"><Clock className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Evaluations</p>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '...' : pendingCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl"><AlertCircle className="h-6 w-6 text-amber-600" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '...' : evaluationProgress.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-green-500/5 border-green-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl"><CheckCircle2 className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitted & Locked</p>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '...' : submittedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Evaluation Progress</CardTitle>
          <Button variant="outline" size="sm" className="rounded-xl">Publish Selected</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/5 border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 font-semibold w-10">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="p-4 font-semibold">Exam</th>
                  <th className="p-4 font-semibold">Class/Section</th>
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold">Teacher</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading evaluation data...</td>
                  </tr>
                ) : evaluationProgress.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No exam schedules found. Create schedules to monitor evaluations.</td>
                  </tr>
                ) : evaluationProgress.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/2">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" disabled={sub.status !== 'Submitted'} />
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{sub.examName}</div>
                      <div className="text-xs text-muted-foreground">{sub.examType}</div>
                    </td>
                    <td className="p-4 font-medium">{sub.className}</td>
                    <td className="p-4">{sub.subject}</td>
                    <td className="p-4 text-muted-foreground">{sub.teacher}</td>
                    <td className="p-4">
                      <Badge 
                        variant="secondary" 
                        className={
                          sub.status === 'Submitted' ? 'bg-green-500/10 text-green-700 border-0' : 
                          'bg-amber-500/10 text-amber-700 border-0'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="View Marks">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
