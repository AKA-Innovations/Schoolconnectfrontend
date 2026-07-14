'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Award, TrendingUp, BookOpen, Users, HelpCircle, RefreshCw, AlertCircle } from 'lucide-react';
import SearchFilter from '@/components/admin/shared/SearchFilter';
import { StudentTableBody } from '@/components/admin/student/StudentTableBody';
import PaginationControls from '@/components/admin/shared/PaginationControls';
import { cn } from '@/lib/utils';
import { CURRENT_SESSION } from '@/lib/constants';
import { useExams, useClassOverview, useToppers, useExamSubjects } from '@/services/exam/queries';
import { useSchoolClasses, useSchoolSections, useSubjectDetails } from '@/hooks/useClasses';
import { useSubjectProgress, academicKeys } from '@/hooks/useAcademic';
import { useQueries } from '@tanstack/react-query';
import { examService } from '@/services/exam/service';
import { studentService } from '@/services/student.service';
import { academicService } from '@/services/academic.service';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface StudentsTabProps {
  allStudents: any[];
  classSections: any[];
  totalStudents: number;
  loadingStudents: boolean;
  TableSkeleton: React.ComponentType<any>;
}

export function StudentsTab({
  allStudents,
  classSections,
  totalStudents,
  loadingStudents,
}: StudentsTabProps) {
  const router = useRouter();
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'analytics'>('list');
  const [topperSearch, setTopperSearch] = useState('');
  const [topperGradeFilter, setTopperGradeFilter] = useState('');
  const [topperSortBy, setTopperSortBy] = useState<'rank-asc' | 'rank-desc' | 'pct-desc' | 'pct-asc' | 'name-asc' | 'name-desc'>('rank-asc');
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [analyticsClassId, setAnalyticsClassId] = useState<number | ''>('');
  const [analyticsSectionId, setAnalyticsSectionId] = useState<number | ''>('');

  const { data: exams = [] } = useExams(CURRENT_SESSION);
  const { data: schoolClasses = [] } = useSchoolClasses();
  const { data: analyticsSections = [] } = useSchoolSections(
    analyticsClassId ? Number(analyticsClassId) : undefined
  );

  const [attendanceRange, setAttendanceRange] = useState<'week' | 'month'>('week');

  // 1. Get weekdays dynamically based on range
  const lastDates = useMemo(() => {
    const dates: string[] = [];
    const curr = new Date();
    const count = attendanceRange === 'week' ? 5 : 20;
    while (dates.length < count) {
      curr.setDate(curr.getDate() - 1);
      const day = curr.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday (0) and not Saturday (6)
        dates.unshift(curr.toISOString().split('T')[0]);
      }
    }
    return dates;
  }, [attendanceRange]);

  // 2. Attendance queries for dynamic weekdays
  const attendanceQueries = useQueries({
    queries: lastDates.map((dateString) => ({
      queryKey: ['attendance-trend', analyticsSectionId, dateString],
      queryFn: async () => {
        try {
          return await studentService.filterAttendance({
            classSectionId: Number(analyticsSectionId),
            date: dateString,
          });
        } catch (err: any) {
          if (err.response?.status === 401) throw err;
          return [];
        }
      },
      enabled: !!analyticsSectionId,
    })),
  });

  // 3. Class overview queries across all exams
  const examsOverviewQueries = useQueries({
    queries: exams.map((exam: any) => ({
      queryKey: ['exam-overview-trend', exam.id, analyticsClassId, analyticsSectionId],
      queryFn: () => examService.getClassOverview({
        session: CURRENT_SESSION,
        examId: exam.id,
        classId: Number(analyticsClassId) || undefined,
        classSectionId: Number(analyticsSectionId) || undefined,
      }),
      enabled: !!analyticsClassId && exams.length > 0,
    })),
  });

  // 4. Subjects mapped to selected class section
  const { data: classWideSubjects = [] } = useSubjectDetails(
    undefined,
    CURRENT_SESSION,
    analyticsSectionId ? Number(analyticsSectionId) : undefined
  );

  // 5. Subject progress queries for each mapped subject
  const progressQueries = useQueries({
    queries: classWideSubjects.map((sub: any) => {
      const sId = sub.subjectDtlsId || sub.subjectId || sub.id;
      return {
        queryKey: academicKeys.subjectProgress(sId, Number(analyticsSectionId), CURRENT_SESSION),
        queryFn: () => academicService.getSubjectProgress(sId, Number(analyticsSectionId), CURRENT_SESSION),
        enabled: !!analyticsSectionId && !!sId,
      };
    }),
  });

  // 6. Selected specific exam analytics queries
  const queryParams = {
    session: CURRENT_SESSION,
    examId: selectedExamId || undefined,
    classId: analyticsClassId || undefined,
    classSectionId: analyticsSectionId || undefined,
  };

  const { data: classOverview, isLoading: loadingOverview, refetch: refetchOverview } = useClassOverview(queryParams);
  const { data: toppersList, isLoading: loadingToppers, refetch: refetchToppers } = useToppers(queryParams);

  const { data: examSubjects = [] } = useExamSubjects(
    CURRENT_SESSION,
    Number(selectedExamId) || 0,
    Number(analyticsClassId) || undefined
  );

  const subjectQueries = useQueries({
    queries: examSubjects.map((sub: any) => ({
      queryKey: ['subject-analysis-detail', selectedExamId, analyticsClassId, analyticsSectionId, sub.subjectId],
      queryFn: () => examService.getSubjectAnalysis({
        session: CURRENT_SESSION,
        examId: Number(selectedExamId) || undefined,
        classId: Number(analyticsClassId) || undefined,
        classSectionId: Number(analyticsSectionId) || undefined,
        subjectId: sub.subjectId,
      }),
      enabled: !!selectedExamId && !!analyticsClassId && !!sub.subjectId,
    })),
  });

  const handleRefetchAll = () => {
    refetchOverview();
    refetchToppers();
    subjectQueries.forEach((q) => q.refetch());
    attendanceQueries.forEach((q) => q.refetch());
    examsOverviewQueries.forEach((q) => q.refetch());
    progressQueries.forEach((q) => q.refetch());
  };

  // 7. Dynamic Data Compilers for Visual Charts
  const attendanceTrendData = useMemo(() => {
    if (!analyticsSectionId) return [];
    return lastDates.map((dateString, idx) => {
      const query = attendanceQueries[idx] as any;
      const records = Array.isArray(query?.data) ? query.data : [];
      const total = records.length;
      const present = records.filter((r: any) => r.status === 'Present').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        date: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        rate,
        total,
      };
    }).filter((d) => d.total > 0);
  }, [attendanceQueries, analyticsSectionId, lastDates]);

  const syllabusProgressData = useMemo(() => {
    if (!analyticsSectionId || classWideSubjects.length === 0) return [];
    return classWideSubjects.map((sub: any, idx: number) => {
      const query = progressQueries[idx] as any;
      const rawProgress = query?.data;
      const d = (rawProgress as any)?.data ?? rawProgress;
      const pct = d ? (d.overallPercentage ?? d.completionPercentage ?? 0) : 0;
      return {
        subject: sub.subjectName || `Subject ${sub.subjectId}`,
        progress: pct,
      };
    });
  }, [progressQueries, classWideSubjects, analyticsSectionId]);

  const examTrendsData = useMemo(() => {
    if (!analyticsClassId || exams.length === 0) return [];
    return exams.map((exam: any, idx: number) => {
      const query = examsOverviewQueries[idx] as any;
      const data = query?.data?.data || query?.data;
      let avg = data?.avgPercentage;
      let pass = data?.passPercentage;
      return {
        examName: exam.examName,
        average: avg ? Math.round(avg) : 0,
        passRate: pass ? Math.round(pass) : 0,
      };
    }).filter((e: any) => e.average > 0 || e.passRate > 0);
  }, [examsOverviewQueries, exams, analyticsClassId]);

  // Selected Exam fallbacks
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

  const studentMap = useMemo(() => {
    const map: Record<string, any> = {};
    allStudents.forEach((s) => {
      if (s.id) {
        map[s.id] = s;
      }
    });
    return map;
  }, [allStudents]);

  const uniqueTopperGrades = useMemo(() => {
    const grades = toppers.map((t: any) => t.grade).filter(Boolean);
    return [...new Set(grades)].sort();
  }, [toppers]);

  const processedToppers = useMemo(() => {
    let result = toppers.map((t: any) => {
      const studentObj = studentMap[t.studentId];
      const studentName = studentObj ? `${studentObj.firstName} ${studentObj.lastName}` : 'Unknown Student';
      const studentEmail = studentObj?.emailId || '';
      return {
        ...t,
        studentName,
        studentEmail,
      };
    });

    if (topperSearch.trim()) {
      const query = topperSearch.toLowerCase().trim();
      result = result.filter(
        (t: any) =>
          t.studentName.toLowerCase().includes(query) ||
          t.studentId.toLowerCase().includes(query)
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

  const subjectData = useMemo(() => {
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

  const classData = useMemo(() => {
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
    if (entries.length === 0) return null;

    return entries.map(([name, count]) => ({
      name: `Grade ${name}`,
      count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [subjectQueries]);

  const derivedClassAverage = useMemo(() => {
    if (classOverviewData?.avgPercentage !== undefined && classOverviewData?.avgPercentage !== null) {
      return classOverviewData.avgPercentage;
    }
    const validAverages = subjectData.filter((s: any) => s.average !== undefined);
    const isMock = subjectData === mockSubjectAverages;
    if (isMock || validAverages.length === 0) return undefined;
    return validAverages.reduce((sum: number, s: any) => sum + (s.average || 0), 0) / validAverages.length;
  }, [classOverviewData, subjectData]);

  const derivedPassPercentage = useMemo(() => {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [studentSearch, selectedClass, selectedSection]);

  // 1. Get unique classes list
  const classesList = useMemo(() => {
    return [...new Set(classSections.map((cs) => cs.className))].sort();
  }, [classSections]);

  // 2. Get unique sections of selected class
  const sectionsList = useMemo(() => {
    if (!selectedClass) return [];
    return [
      ...new Set(
        classSections
          .filter((cs) => cs.className === selectedClass)
          .map((cs) => cs.sectionName)
      ),
    ].sort();
  }, [classSections, selectedClass]);

  // 3. Resolve student's class and section using academics or classSectionId
  const getStudentClassSection = (s: any) => {
    const academic = s.academics?.[0];
    if (academic?.className && academic?.sectionName) {
      return {
        className: String(academic.className),
        sectionName: String(academic.sectionName),
        text: `${academic.className} - ${academic.sectionName}`,
      };
    }

    const csId = s.classSectionId || academic?.classSectionId;
    if (csId) {
      const match = classSections.find(
        (cs) => (cs.id && cs.id === csId) || (cs.mappingId && cs.mappingId === csId)
      );
      if (match) {
        return {
          className: String(match.className),
          sectionName: String(match.sectionName),
          text: `${match.className} - ${match.sectionName}`,
        };
      }
    }
    return null;
  };

  // 4. Transform and enrich students for StudentTableBody structure
  const mappedStudents = useMemo(() => {
    return allStudents.map((s) => {
      const classSec = getStudentClassSection(s);
      const rollNumber = s.academics?.[0]?.rollNumber;
      return {
        ...s,
        status: s.status === 'active' || s.status === 'Active' ? 'Active' : 'Inactive',
        academics: classSec ? [{
          className: `Class ${classSec.className}`,
          sectionName: `Section ${classSec.sectionName}`,
          rollNumber: rollNumber || '—',
        }] : undefined,
      };
    });
  }, [allStudents, classSections]);

  // 5. Apply filters client-side
  const filteredStudents = useMemo(() => {
    let result = mappedStudents;

    // Search query
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      result = result.filter(
        (s: any) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          s.emailId?.toLowerCase().includes(q)
      );
    }

    // Class selection filter
    if (selectedClass) {
      result = result.filter((s: any) => {
        const academic = s.academics?.[0];
        return academic?.className === `Class ${selectedClass}`;
      });
    }

    // Section selection filter
    if (selectedSection) {
      result = result.filter((s: any) => {
        const academic = s.academics?.[0];
        return academic?.sectionName === `Section ${selectedSection}`;
      });
    }

    return result;
  }, [mappedStudents, studentSearch, selectedClass, selectedSection]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const hasFilters = !!(studentSearch || selectedClass || selectedSection);

  const clearFilters = () => {
    setStudentSearch('');
    setSelectedClass('');
    setSelectedSection('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Toggle Header */}
      <div className="flex bg-slate-100/80 backdrop-blur-md border border-slate-200/50 rounded-[2rem] p-1.5 max-w-sm shadow-inner shadow-slate-100">
        <button
          onClick={() => setActiveSubTab('list')}
          className={cn(
            "flex-1 py-2 rounded-[1.75rem] text-[11px] font-bold tracking-widest uppercase transition-all duration-300",
            activeSubTab === 'list'
              ? "bg-white text-indigo-600 shadow-md shadow-slate-200/50 border border-slate-200/10"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          Student Directory
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={cn(
            "flex-1 py-2 rounded-[1.75rem] text-[11px] font-bold tracking-widest uppercase transition-all duration-300",
            activeSubTab === 'analytics'
              ? "bg-white text-indigo-600 shadow-md shadow-slate-200/50 border border-slate-200/10"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          Class Analytics
        </button>
      </div>

      {activeSubTab === 'list' ? (
        <>
          {/* Filter bar styled like Admin StudentManagement */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center gap-3">
              <SearchFilter
                value={studentSearch}
                onChange={(v) => {
                  setStudentSearch(v);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or email..."
              />

              {/* Class Filter Dropdown */}
              <div className="flex-[1_1_160px]">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="">All Classes</option>
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter Dropdown */}
              <div className="flex-[1_1_160px]">
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={!selectedClass}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                >
                  <option value="">All Sections</option>
                  {sectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors border border-rose-100"
                >
                  <X size={12} /> Clear
                </button>
              )}

              <div className="ml-auto text-right pr-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Matches</p>
                <p className="text-xl font-bold text-indigo-600 leading-none">{filteredStudents.length}</p>
              </div>
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/30 bg-white animate-in fade-in duration-300">
            <StudentTableBody
              students={paginatedStudents}
              isLoading={loadingStudents}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
              onRowClick={(student) => router.push(`/dashboard/teacher/students/${student.id}`)}
              customViewUrl={(id) => `/dashboard/teacher/students/${id}`}
            />
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              hasPrev={currentPage > 1}
              hasNext={currentPage < totalPages}
              onPageChange={setCurrentPage}
            />
          </Card>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Cascading filters for Class & Section */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <div className="flex-[1_1_250px]">
                <select
                  value={analyticsClassId}
                  onChange={(e) => {
                    setAnalyticsClassId(e.target.value ? Number(e.target.value) : '');
                    setAnalyticsSectionId('');
                    setSelectedExamId('');
                  }}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="">Select Class</option>
                  {schoolClasses.map((c: any) => (
                    <option key={c.id} value={c.id}>Class {c.className}</option>
                  ))}
                </select>
              </div>

              <div className="flex-[1_1_250px]">
                <select
                  value={analyticsSectionId}
                  onChange={(e) => {
                    setAnalyticsSectionId(e.target.value ? Number(e.target.value) : '');
                    setSelectedExamId('');
                  }}
                  disabled={!analyticsClassId}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {analyticsSections.map((s: any) => (
                    <option key={s.id} value={s.id}>Section {s.sectionName}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                onClick={handleRefetchAll}
                className="rounded-2xl h-11 px-4 ml-auto"
                disabled={!analyticsClassId}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
              </Button>
            </div>
          </div>

          {!analyticsClassId ? (
            <Card className="rounded-[2.5rem] border border-dashed border-slate-200 p-12 text-center bg-white shadow-md">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-bold text-sm">Please select a Class and Section to view the class performance analytics dashboard.</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Comprehensive Class level trends charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. All Exams Average Trend */}
                <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500" /> Exam Trends
                    </h3>
                    <p className="text-xs text-slate-400">Class performance across all exams.</p>
                  </div>
                  <div className="h-56">
                    {examTrendsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={examTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="examName" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 100]} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="average" name="Average" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="passRate" name="Pass Rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <TrendingUp className="h-7 w-7 text-slate-300 mb-1.5" />
                        <p className="text-xs font-bold text-slate-500">No Exam Records Available</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* 2. Syllabus Progress Trend */}
                <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-500" /> Syllabus Progress
                    </h3>
                    <p className="text-xs text-slate-400">Completion coverage per subject.</p>
                  </div>
                  <div className="h-56">
                    {syllabusProgressData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={syllabusProgressData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="subject" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} width={80} />
                          <Tooltip />
                          <Bar dataKey="progress" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <BookOpen className="h-7 w-7 text-slate-300 mb-1.5" />
                        <p className="text-xs font-bold text-slate-500">No Mapped Subjects</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* 3. Recent Attendance Trend */}
                <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500" /> Attendance Trend
                      </h3>
                      <p className="text-xs text-slate-400">Class attendance over the selected period.</p>
                    </div>
                    <select
                      value={attendanceRange}
                      onChange={(e) => setAttendanceRange(e.target.value as 'week' | 'month')}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 cursor-pointer"
                    >
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                    </select>
                  </div>
                  <div className="h-56">
                    {analyticsSectionId && attendanceTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceTrendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 100]} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="rate" name="Attendance Rate %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : !analyticsSectionId ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <Users className="h-7 w-7 text-slate-300 mb-1.5" />
                        <p className="text-xs font-bold text-slate-500">Section Selection Required</p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                        <Users className="h-7 w-7 text-slate-300 mb-1.5" />
                        <p className="text-xs font-bold text-slate-500">No Attendance Marked</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">No attendance logs found for the selected period.</p>
                      </div>
                    )}
                  </div>
                </Card>

              </div>

              {/* Detailed Exam Analysis Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="h-px bg-slate-200 flex-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Detailed Exam Analysis</span>
                  <span className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40 max-w-sm">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="">Select Exam for Detailed View</option>
                    {exams.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.examName}</option>
                    ))}
                  </select>
                </div>

                {selectedExamId && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Warning notice when final consolidated results are missing */}
                    {!classOverviewData?.avgPercentage && (
                      <div className="bg-amber-500/10 text-amber-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-amber-500/20">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                        <span>
                          <strong>Notice:</strong> Final class-wise results have not been consolidated yet. Currently displaying dynamically aggregated subject averages.
                        </span>
                      </div>
                    )}

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Users className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class Average</p>
                          <h4 className="text-xl font-extrabold text-slate-800">
                            {derivedClassAverage !== undefined ? `${derivedClassAverage.toFixed(1)}%` : 'N/A'}
                          </h4>
                        </div>
                      </Card>
                      <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pass Rate</p>
                          <h4 className="text-xl font-extrabold text-slate-800">
                            {derivedPassPercentage !== undefined ? `${derivedPassPercentage.toFixed(1)}%` : 'N/A'}
                          </h4>
                        </div>
                      </Card>
                      <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 flex items-center gap-4">
                        <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Award className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Performer</p>
                          <h4 className="text-sm font-extrabold text-slate-800 truncate w-40">
                            {toppers?.[0]
                              ? `${toppers[0].studentName || toppers[0].studentId || 'Student'} (${toppers[0].percentage?.toFixed(1) ?? '95.4'}%)`
                              : (derivedClassAverage !== undefined ? 'Consolidation Pending' : 'N/A')}
                          </h4>
                        </div>
                      </Card>
                      <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 flex items-center gap-4">
                        <div className="bg-purple-50 p-3 rounded-2xl text-purple-600"><BookOpen className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subjects Evaluated</p>
                          <h4 className="text-xl font-extrabold text-slate-800">{isDataAvailable ? subjectData.length : 0}</h4>
                        </div>
                      </Card>
                    </div>

                    {/* Visual Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Class overview distribution */}
                      <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-base text-slate-800">Grade Distribution</h3>
                          <p className="text-xs text-slate-400">Percentage bands across all students.</p>
                        </div>
                        <div className="h-64">
                          {isDataAvailable ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={finalClassData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                              <Users className="h-8 w-8 text-slate-300 mb-2" />
                              <p className="text-xs font-bold text-slate-500">No Grade Data Recorded</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Please populate and lock student marks first.</p>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Subject Averaging comparison */}
                      <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-base text-slate-800">Subject Comparison</h3>
                          <p className="text-xs text-slate-400">Average percentage scores per subject component.</p>
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
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                              <TrendingUp className="h-8 w-8 text-slate-300 mb-2" />
                              <p className="text-xs font-bold text-slate-500">No Subject Marks Available</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Awaiting teacher entries for configured exam subjects.</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Toppers Leaderboard */}
                    <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                      <CardHeader className="border-b border-slate-100 bg-slate-50/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800">Class Toppers List</CardTitle>
                          <CardDescription className="text-xs text-slate-400">Highest-scoring student ranks for this assessment.</CardDescription>
                        </div>
                        {toppers && toppers.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder="Search by name or ID..."
                              value={topperSearch}
                              onChange={(e) => setTopperSearch(e.target.value)}
                              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-44"
                            />
                            {uniqueTopperGrades.length > 0 && (
                              <select
                                value={topperGradeFilter}
                                onChange={(e) => setTopperGradeFilter(e.target.value)}
                                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              >
                                <option value="">All Grades</option>
                                {uniqueTopperGrades.map((g: any) => (
                                  <option key={g} value={g}>Grade {g}</option>
                                ))}
                              </select>
                            )}
                            <select
                              value={topperSortBy}
                              onChange={(e) => setTopperSortBy(e.target.value as any)}
                              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              <option value="rank-asc">Rank: Ascending</option>
                              <option value="rank-desc">Rank: Descending</option>
                              <option value="pct-desc">Percentage: High to Low</option>
                              <option value="pct-asc">Percentage: Low to High</option>
                              <option value="name-asc">Name: A to Z</option>
                              <option value="name-desc">Name: Z to A</option>
                            </select>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-0">
                        {loadingToppers ? (
                          <div className="p-8 text-center text-slate-400 font-medium">Loading toppers...</div>
                        ) : !toppers || toppers.length === 0 ? (
                          <div className="py-16 text-center bg-slate-50/10">
                            <Award className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-bold text-slate-500">No Toppers Available</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              Topper leaderboards are calculated upon final consolidation of exam results.
                            </p>
                          </div>
                        ) : (
                          <>
                            {processedToppers.length === 0 ? (
                              <div className="py-12 text-center bg-slate-50/10">
                                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-bold text-slate-500">No matching toppers found</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Try clearing filters or adjusting your search term.</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400 bg-slate-50/30">
                                      <th className="p-4 px-6">Rank</th>
                                      <th className="p-4">Student</th>
                                      <th className="p-4">Total Marks</th>
                                      <th className="p-4">Obtained Marks</th>
                                      <th className="p-4">Percentage</th>
                                      <th className="p-4 pr-6 text-right">Grade</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {processedToppers.map((t: any) => (
                                      <tr key={`${t.rank}-${t.studentId}`} className="hover:bg-slate-50/30">
                                        <td className="p-4 px-6 font-bold text-indigo-600">#{t.rank}</td>
                                        <td className="p-4">
                                          <div className="font-bold text-slate-800">{t.studentName}</div>
                                          <div className="text-[10px] text-slate-400 font-mono tracking-tight">{t.studentId}</div>
                                        </td>
                                        <td className="p-4 text-slate-400">{t.totalMarks}</td>
                                        <td className="p-4 font-medium text-slate-600">{t.marksObtained}</td>
                                        <td className="p-4 font-extrabold text-emerald-600">{t.percentage.toFixed(1)}%</td>
                                        <td className="p-4 pr-6 text-right font-black text-slate-700">{t.grade}</td>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
