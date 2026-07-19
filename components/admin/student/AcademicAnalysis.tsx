'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BookOpen, Award } from 'lucide-react';
import { useStudentPerformance, useExams, useStudentMarks } from '@/services/exam/queries';
import { CURRENT_SESSION } from '@/lib/constants';

interface AcademicAnalysisProps {
  studentId: string;
  student: any;
}

export default function AcademicAnalysis({ studentId, student }: AcademicAnalysisProps) {
  const { data: exams = [] } = useExams();
  const { data: studentMarks = [] } = useStudentMarks(studentId, CURRENT_SESSION);
  const { data: analyticsData, isLoading } = useStudentPerformance(studentId, {
    session: CURRENT_SESSION,
  });

  // Extract real trend data and subject data from analytics endpoint
  const performanceData = React.useMemo(() => {
    // Check both analyticsData?.data and analyticsData as an array directly
    const rawData = Array.isArray(analyticsData) 
      ? analyticsData 
      : (analyticsData?.data && Array.isArray(analyticsData.data)) 
        ? analyticsData.data 
        : [];
        
    if (rawData.length > 0) {
      return rawData.map((t: any) => {
        const examObj = exams.find((e: any) => e.id === t.examId);
        return {
          month: examObj?.examName || `Exam ${t.examId}`,
          percentage: t.percentage ?? t.percentageObtained ?? 0,
        };
      });
    }
    return [];
  }, [analyticsData, exams]);

  // Extract subject level performance from useStudentMarks
  const subjectData = React.useMemo(() => {
    if (Array.isArray(studentMarks) && studentMarks.length > 0) {
      return studentMarks.map((s: any) => ({
        name: s.subjectName || s.subject?.subjectName || 'Subject',
        score: s.marksObtained ?? s.score ?? 0,
      }));
    }
    return [];
  }, [studentMarks]);

  const colours = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading academic analysis...</p>
      </div>
    );
  }

  if (performanceData.length === 0 && subjectData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl p-16 text-center bg-slate-50/50">
        <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4">
          <BookOpen className="h-10 w-10" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Analytics Data Available</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          There are no registered exam marks or performance records found for this student in session {CURRENT_SESSION}.
        </p>
      </div>
    );
  }

  const avgPercentage = Math.round(
    performanceData.reduce((sum: number, d: any) => sum + d.percentage, 0) / (performanceData.length || 1)
  );

  const overallGrade = analyticsData?.overallGrade || (avgPercentage >= 80 ? 'A' : avgPercentage >= 70 ? 'B' : avgPercentage >= 60 ? 'C' : 'D');

  const bestSubject = subjectData.length > 0
    ? subjectData.reduce((max: any, s: any) => (s.score > max.score ? s : max))
    : { name: 'None', score: 0 };
  const weakSubject = subjectData.length > 0
    ? subjectData.reduce((min: any, s: any) => (s.score < min.score ? s : min))
    : { name: 'None', score: 0 };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Overall Grade</p>
                <Badge className="bg-blue-500/10 text-blue-600 text-lg px-3 py-1">{overallGrade}</Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Average Score</p>
                <h3 className="text-3xl font-bold text-foreground">{avgPercentage}%</h3>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Subjects</p>
                <h3 className="text-3xl font-bold text-foreground">{subjectData.length}</h3>
              </div>
              <Award className="h-8 w-8 text-purple-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Performance Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                name="Percentage (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
            <CardTitle className="text-lg font-bold tracking-tight">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/50">
                <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Best Subject</p>
                <p className="text-sm font-bold text-emerald-900">{bestSubject.name} - {bestSubject.score}%</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200/50">
                <p className="text-[10px] font-bold uppercase text-red-600 mb-1">Needs Improvement</p>
                <p className="text-sm font-bold text-red-900">{weakSubject.name} - {weakSubject.score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
          <CardHeader className="border-b border-border/50  bg-muted/10 py-6 px-8">
            <CardTitle className="text-lg font-bold tracking-tight">Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={subjectData} dataKey="score" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {subjectData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '8px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="border-border shadow-sm rounded-4xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/10 py-6 px-8">
          <CardTitle className="text-lg font-bold tracking-tight">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Highest</p>
              <h3 className="text-3xl font-bold">
                {subjectData.length > 0 ? Math.max(...subjectData.map((s: any) => s.score)) : 0}
              </h3>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Average</p>
              <h3 className="text-3xl font-bold">
                {subjectData.length > 0
                  ? Math.round(subjectData.reduce((sum: number, s: any) => sum + s.score, 0) / subjectData.length)
                  : 0}
              </h3>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Lowest</p>
              <h3 className="text-3xl font-bold">
                {subjectData.length > 0 ? Math.min(...subjectData.map((s: any) => s.score)) : 0}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
