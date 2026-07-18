'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useExams, useClassOverview, useSubjectAnalysis, useToppers, useExamSubjects } from '@/services/exam/queries';
import { useSchoolClasses, useSchoolSections } from '@/hooks/useClasses';
import { useStudentList } from '@/hooks/useStudents';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Award, TrendingUp, BookOpen, Users, HelpCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { examService } from '@/services/exam/service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  session: string;
}

export function ExamAnalyticsDashboard({ session }: Props) {
  const { data: exams = [] } = useExams(session);
  const { data: schoolClasses = [] } = useSchoolClasses();

  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');

  const [topperSearch, setTopperSearch] = useState('');
  const [topperGradeFilter, setTopperGradeFilter] = useState('');
  const [topperSortBy, setTopperSortBy] = useState<'rank-asc' | 'rank-desc' | 'pct-desc' | 'pct-asc' | 'name-asc' | 'name-desc'>('rank-asc');

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
  const { data: toppersList, isLoading: loadingToppers, refetch: refetchToppers } = useToppers(queryParams);

  // Fetch subjects configured for this exam and class to request subject-wise analysis
  const { data: examSubjects = [] } = useExamSubjects(
    session,
    Number(selectedExamId) || 0,
    Number(selectedClassId) || undefined
  );

  // Fetch subject analysis for each subject in this class
  const subjectQueries = useQueries({
    queries: examSubjects.map((sub: any) => ({
      queryKey: ['subject-analysis-detail', selectedExamId, selectedClassId, selectedSectionId, sub.subjectId],
      queryFn: () => examService.getSubjectAnalysis({
        session,
        examId: Number(selectedExamId) || undefined,
        classId: Number(selectedClassId) || undefined,
        classSectionId: Number(selectedSectionId) || undefined,
        subjectId: sub.subjectId,
      }),
      enabled: !!selectedExamId && !!selectedClassId && !!sub.subjectId,
    })),
  });

  const handleRefetchAll = () => {
    refetchOverview();
    refetchToppers();
    subjectQueries.forEach((q) => q.refetch());
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

  const classOverviewData = classOverview?.data || classOverview;
  const toppers = toppersList?.data || (Array.isArray(toppersList) ? toppersList : []);

  const { data: studentsResponse } = useStudentList({
    limit: 1000,
  });

  const studentMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    if (studentsResponse?.items) {
      studentsResponse.items.forEach((s: any) => {
        if (s.id) {
          map[s.id] = s;
        }
      });
    }
    return map;
  }, [studentsResponse]);

  const uniqueTopperGrades = React.useMemo<string[]>(() => {
    const grades = toppers.map((t: any) => String(t.grade || '')).filter(Boolean);
    return [...new Set(grades)].sort() as string[];
  }, [toppers]);

  const processedToppers = React.useMemo(() => {
    let result = toppers.map((t: any) => {
      const studentObj = studentMap[t.studentId];
      const studentName = studentObj ? `${studentObj.firstName} ${studentObj.lastName}` : (t.studentName || 'Unknown Student');
      const studentEmail = studentObj?.emailId || '';
      
      const calculatedObtained = t.percentage !== undefined && t.totalMarks
        ? Math.round((t.percentage / 100) * t.totalMarks)
        : '-';
      const obtained = t.marksObtained !== undefined && t.marksObtained !== null && t.marksObtained !== ''
        ? t.marksObtained 
        : (t.obtainedMarks !== undefined && t.obtainedMarks !== null && t.obtainedMarks !== ''
          ? t.obtainedMarks
          : calculatedObtained
        );

      const calculateGradeFromPct = (pct: number) => {
        if (pct >= 90) return 'A';
        if (pct >= 80) return 'B';
        if (pct >= 70) return 'C';
        if (pct >= 60) return 'D';
        if (pct >= 50) return 'E';
        return 'F';
      };

      const grade = t.grade || (t.percentage !== undefined ? calculateGradeFromPct(t.percentage) : '-');

      return {
        ...t,
        studentName,
        studentEmail,
        marksObtained: obtained,
        grade,
      };
    });

    const seen = new Set<string>();
    result = result.filter((t: any) => {
      const key = `${t.studentId}-${t.rank}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (topperSearch.trim()) {
      const queryStr = topperSearch.toLowerCase().trim();
      result = result.filter(
        (t: any) =>
          t.studentName.toLowerCase().includes(queryStr) ||
          t.studentId.toLowerCase().includes(queryStr)
      );
    }

    if (topperGradeFilter) {
      result = result.filter((t: any) => t.grade === topperGradeFilter);
    }

    result.sort((a: any, b: any) => {
      switch (topperSortBy) {
        case 'rank-asc':
          return a.rank - b.rank;
        case 'rank-desc':
          return b.rank - a.rank;
        case 'pct-desc':
          return b.percentage - a.percentage;
        case 'pct-asc':
          return a.percentage - b.percentage;
        case 'name-asc':
          return a.studentName.localeCompare(b.studentName);
        case 'name-desc':
          return b.studentName.localeCompare(a.studentName);
        default:
          return a.rank - b.rank;
      }
    });

    return result;
  }, [toppers, studentMap, topperSearch, topperGradeFilter, topperSortBy]);

  // Compile subject averages chart data from actual backend API results
  const subjectData = React.useMemo(() => {
    if (examSubjects.length === 0) return mockSubjectAverages;

    const compiled = examSubjects.map((sub: any, idx: number) => {
      const queryResult = (subjectQueries[idx] as any)?.data?.data || (subjectQueries[idx] as any)?.data;
      return {
        subject: sub.subjectName || `Subject ${sub.subjectId}`,
        average: queryResult?.avgMarks !== undefined && sub.totalMarks > 0
          ? Math.round((queryResult.avgMarks / sub.totalMarks) * 100)
          : undefined,
        highest: queryResult?.highestMarks,
        lowest: queryResult?.lowestMarks,
        passRate: queryResult?.passPercentage,
      };
    }).filter((s: any) => s.average !== undefined);

    return compiled.length > 0 ? compiled : mockSubjectAverages;
  }, [examSubjects, subjectQueries]);

  // Aggregate true grade distribution from each subject's performance statistics
  const classData = React.useMemo(() => {
    const distribution: Record<string, number> = {};

    (subjectQueries as any[]).forEach((q) => {
      const res = q.data?.data || q.data;
      const dist = res?.gradeDistribution;
      if (dist) {
        Object.entries(dist).forEach(([grade, count]) => {
          distribution[grade] = (distribution[grade] || 0) + (count as number);
        });
      }
    });

    const entries = Object.entries(distribution);
    if (entries.length === 0) return null; // Return null so we can check if data exists

    return entries.map(([name, count]) => ({
      name: `Grade ${name}`,
      count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [subjectQueries]);

  // Derive class average and pass rate dynamically from subject metrics if final consolidated results are missing
  const derivedClassAverage = React.useMemo(() => {
    if (classOverviewData?.avgPercentage !== undefined && classOverviewData?.avgPercentage !== null) {
      return classOverviewData.avgPercentage;
    }
    const validAverages = subjectData.filter((s: any) => s.average !== undefined);
    const isMock = subjectData === mockSubjectAverages;
    if (isMock || validAverages.length === 0) return undefined;
    return validAverages.reduce((sum: number, s: any) => sum + (s.average || 0), 0) / validAverages.length;
  }, [classOverviewData, subjectData]);

  const derivedPassPercentage = React.useMemo(() => {
    if (classOverviewData?.passPercentage !== undefined && classOverviewData?.passPercentage !== null) {
      return classOverviewData.passPercentage;
    }
    const validPassRates = subjectData.filter((s: any) => s.passRate !== undefined);
    const isMock = subjectData === mockSubjectAverages;
    if (isMock || validPassRates.length === 0) return undefined;
    return validPassRates.reduce((sum: number, s: any) => sum + (s.passRate || 0), 0) / validPassRates.length;
  }, [classOverviewData, subjectData]);

  const finalClassData = classData || mockClassDistribution;
  const isDataAvailable = classData !== null;

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
          <Select
            value={selectedExamId ? String(selectedExamId) : 'all'}
            onValueChange={(val) => setSelectedExamId(val === 'all' ? '' : Number(val))}
            className="w-full sm:w-40"
          >
            <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl border-border bg-card text-xs font-semibold">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Exam</SelectItem>
              {exams.map((e: any) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.examName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedClassId ? String(selectedClassId) : 'all'}
            onValueChange={(val) => {
              setSelectedClassId(val === 'all' ? '' : Number(val));
              setSelectedSectionId('');
            }}
            className="w-full sm:w-40"
          >
            <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl border-border bg-card text-xs font-semibold">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Class</SelectItem>
              {schoolClasses.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  Class {c.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSectionId ? String(selectedSectionId) : 'all'}
            onValueChange={(val) => setSelectedSectionId(val === 'all' ? '' : Number(val))}
            className="w-full sm:w-40"
          >
            <SelectTrigger 
              disabled={!selectedClassId}
              className="h-10 w-full sm:w-40 rounded-xl border-border bg-card text-xs font-semibold"
            >
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Section</SelectItem>
              {classSections.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  Section {s.sectionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
          
          {/* Warning notice when final consolidated results are missing */}
          {!classOverviewData?.avgPercentage && (
            <div className="bg-amber-500/10 text-amber-600 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>
                <strong>Notice:</strong> Final class-wise results have not been consolidated yet. Currently displaying dynamically aggregated subject averages. You can consolidate results in the <strong>Results Consolidation</strong> tab to lock class overview metrics.
              </span>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Class Average</p>
                <h4 className="text-xl font-extrabold">
                  {derivedClassAverage !== undefined ? `${derivedClassAverage.toFixed(1)}%` : 'N/A'}
                </h4>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-xl text-green-600"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pass Rate</p>
                <h4 className="text-xl font-extrabold">
                  {derivedPassPercentage !== undefined ? `${derivedPassPercentage.toFixed(1)}%` : 'N/A'}
                </h4>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500"><Award className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Top Performer</p>
                <h4 className="text-base font-extrabold truncate w-40">
                  {toppers?.[0]
                    ? `${toppers[0].studentName || toppers[0].studentId || 'Student'} (${toppers[0].percentage?.toFixed(1) ?? '95.4'}%)`
                    : (derivedClassAverage !== undefined ? 'Consolidation Pending' : 'N/A')}
                </h4>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-5 flex items-center gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-600"><BookOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Subjects Evaluated</p>
                <h4 className="text-xl font-extrabold">{isDataAvailable ? subjectData.length : 0}</h4>
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
                {isDataAvailable ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={finalClassData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                      <Bar dataKey="count" fill="var(--color-primary, #6366f1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                    <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-bold text-muted-foreground">No Grade Data Recorded</p>
                    <p className="text-[10px] text-muted-foreground/85 mt-0.5">Please populate and lock student marks first.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Subject Averaging comparison */}
            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card p-6 space-y-4">
              <div>
                <h3 className="font-bold text-base">Subject Comparison</h3>
                <p className="text-xs text-muted-foreground">Average percentage scores per subject component.</p>
              </div>
              <div className="h-64">
                {subjectData !== mockSubjectAverages ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="subject" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={100} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                      <Bar dataKey="average" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-border/80">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-bold text-muted-foreground">No Subject Marks Available</p>
                    <p className="text-[10px] text-muted-foreground/85 mt-0.5">Awaiting teacher entries for configured exam subjects.</p>
                  </div>
                )}
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
              ) : !toppers || toppers.length === 0 ? (
                <div className="py-16 text-center bg-slate-50/10">
                  <Award className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">No Toppers Available</p>
                  <p className="text-xs text-muted-foreground/75 mt-1 max-w-sm mx-auto">
                    Topper leaderboards are calculated upon final consolidation of exam results. Please run consolidation in the Results tab.
                  </p>
                </div>
              ) : (
                <>
                  {/* Filters Bar */}
                  <div className="p-4 bg-muted/10 border-b border-border/50 flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Search topper name or ID..."
                      value={topperSearch}
                      onChange={(e) => setTopperSearch(e.target.value)}
                      className="h-9 text-xs max-w-xs rounded-xl"
                    />
                    <Select
                      value={topperGradeFilter || 'all'}
                      onValueChange={(val) => setTopperGradeFilter(val === 'all' ? '' : val)}
                    >
                      <SelectTrigger className="h-9 w-full sm:w-36 text-xs font-semibold rounded-xl bg-card">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {uniqueTopperGrades.map((g) => (
                          <SelectItem key={g} value={g}>
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={topperSortBy}
                      onValueChange={(val) => setTopperSortBy(val as any)}
                    >
                      <SelectTrigger className="h-9 w-full sm:w-44 text-xs font-semibold rounded-xl bg-card ml-auto">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rank-asc">Rank: Low to High</SelectItem>
                        <SelectItem value="rank-desc">Rank: High to Low</SelectItem>
                        <SelectItem value="pct-desc">Percentage: High to Low</SelectItem>
                        <SelectItem value="pct-asc">Percentage: Low to High</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {processedToppers.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/35" />
                      <p className="text-xs font-bold">No matching toppers found</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">Try adjusting your search query or grade filters.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
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
                          {processedToppers.map((t: any) => (
                            <tr key={t.studentId} className="hover:bg-muted/5">
                              <td className="p-3 px-6 font-bold text-primary">#{t.rank}</td>
                              <td className="p-3">
                                <p className="font-bold text-foreground">{t.studentName}</p>
                                <p className="text-[10px] text-muted-foreground/60">{t.studentId}</p>
                              </td>
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
