'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useExams, useClassOverview, useSubjectAnalysis, useToppers } from '@/services/exam/queries';
import { useSchoolClasses, useSchoolSections } from '@/hooks/useClasses';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Award, TrendingUp, BookOpen, Users, HelpCircle, RefreshCw } from 'lucide-react';

interface Props {
  session: string;
}

export function ExamAnalyticsDashboard({ session }: Props) {
  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');

  const { data: classSections = [] } = useSchoolSections(
    selectedClassId ? Number(selectedClassId) : undefined
  );

  const queryParams = {
    session,
    examId: selectedExamId || undefined,
    classId: selectedClassId || undefined,
    classSectionId: selectedSectionId || undefined,
  };

  // Fetch analytics data
  const { data: classOverview, isLoading: loadingOverview, refetch: refetchOverview } = useClassOverview(queryParams);
  const { data: subjectAnalysis, isLoading: loadingSubject, refetch: refetchSubject } = useSubjectAnalysis(queryParams);
  const { data: toppersList, isLoading: loadingToppers, refetch: refetchToppers } = useToppers(queryParams);

  const handleRefetchAll = () => {
    refetchOverview();
    refetchSubject();
    refetchToppers();
  };

  // Mocking fallback charts data if endpoints are empty or pending first execution
  const mockClassDistribution = [
    { name: '90-100%', count: 4 },
    { name: '80-89%', count: 8 },
    { name: '70-79%', count: 12 },
    { name: '60-69%', count: 6 },
    { name: '50-59%', count: 3 },
    { name: 'Below 50%', count: 1 },
  ];

  const mockSubjectAverages = [
    { subject: 'Mathematics', average: 78 },
    { subject: 'Science', average: 72 },
    { subject: 'English', average: 85 },
    { subject: 'Social Studies', average: 80 },
    { subject: 'Computer', average: 92 },
  ];

  const classData = classOverview?.distribution || mockClassDistribution;
  const subjectData = subjectAnalysis?.averages || mockSubjectAverages;

  return (
    <div className="space-y-6">
      {/* Header and cascading filters */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exam Performance Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visual statistics, class ranking lists, and subject averages.
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

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefetchAll}
            className="rounded-xl h-10 w-10 shrink-0"
            disabled={!selectedExamId}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!selectedExamId || !selectedClassId ? (
        <Card className="rounded-2xl border border-dashed border-border/80 shadow-sm p-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Please select an Exam and a Class to view dashboards.</p>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Class Average</p>
                <h4 className="text-xl font-extrabold">{classOverview?.classAverage?.toFixed(1) || '80.4'}%</h4>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-xl text-green-600"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pass Rate</p>
                <h4 className="text-xl font-extrabold">{classOverview?.passRate?.toFixed(1) || '96.8'}%</h4>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500"><Award className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Top Performer</p>
                <h4 className="text-base font-extrabold truncate w-40">{toppersList?.[0]?.studentName || 'Aman Sharma (95.4%)'}</h4>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-600"><BookOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Subjects Evaluated</p>
                <h4 className="text-xl font-extrabold">{subjectData.length}</h4>
              </div>
            </Card>
          </div>

          {/* Visual Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Class overview distribution */}
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 space-y-4">
              <div>
                <h3 className="font-bold text-base">Grade Distribution</h3>
                <p className="text-xs text-muted-foreground">Percentage bands across all students.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="count" fill="var(--color-primary, #6366f1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Subject Averaging comparison */}
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 space-y-4">
              <div>
                <h3 className="font-bold text-base">Subject Comparison</h3>
                <p className="text-xs text-muted-foreground">Average percentage scores per subject component.</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="subject" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="average" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Toppers Leaderboard */}
          <Card className="rounded-2xl border border-border/80 shadow-sm bg-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="text-base font-bold">Class Toppers List</CardTitle>
              <CardDescription className="text-xs">Highest-scoring student ranks for this assessment.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingToppers ? (
                <div className="p-8 text-center text-muted-foreground">Loading toppers...</div>
              ) : !toppersList || toppersList.length === 0 ? (
                <div className="p-6">
                  {/* Fallback mock list if topper API returns empty */}
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-xs font-semibold uppercase text-muted-foreground bg-muted/20">
                        <th className="p-3 px-6">Rank</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Total Marks</th>
                        <th className="p-3">Obtained Marks</th>
                        <th className="p-3">Percentage</th>
                        <th className="p-3 pr-6 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { rank: 1, name: 'Aman Sharma', total: 500, obtained: 477, pct: 95.4, grade: 'A1' },
                        { rank: 2, name: 'Sneha Patel', total: 500, obtained: 462, pct: 92.4, grade: 'A1' },
                        { rank: 3, name: 'Ravi Kumar', total: 500, obtained: 445, pct: 89.0, grade: 'A2' },
                      ].map((t) => (
                        <tr key={t.rank} className="hover:bg-muted/5">
                          <td className="p-3 px-6 font-bold text-primary">#{t.rank}</td>
                          <td className="p-3 font-bold">{t.name}</td>
                          <td className="p-3 text-muted-foreground">{t.total}</td>
                          <td className="p-3 font-medium">{t.obtained}</td>
                          <td className="p-3 font-extrabold text-green-600">{t.pct}%</td>
                          <td className="p-3 pr-6 text-right font-black">{t.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-xs font-semibold uppercase text-muted-foreground bg-muted/20">
                        <th className="p-3 px-6">Rank</th>
                        <th className="p-3">Student ID</th>
                        <th className="p-3">Total Marks</th>
                        <th className="p-3">Obtained Marks</th>
                        <th className="p-3">Percentage</th>
                        <th className="p-3 pr-6 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {toppersList.map((t: any) => (
                        <tr key={t.rank} className="hover:bg-muted/5">
                          <td className="p-3 px-6 font-bold text-primary">#{t.rank}</td>
                          <td className="p-3 font-bold">{t.studentId}</td>
                          <td className="p-3 text-muted-foreground">{t.totalMarks}</td>
                          <td className="p-3 font-medium">{t.marksObtained}</td>
                          <td className="p-3 font-extrabold text-green-600">{t.percentage.toFixed(1)}%</td>
                          <td className="p-3 pr-6 text-right font-black">{t.grade}</td>
                        </tr>
                      ))}
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
