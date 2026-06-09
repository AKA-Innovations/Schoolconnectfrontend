import { useQuery } from '@tanstack/react-query';
import { examService } from './service';
import { ExamScheduleQueryDto, AnalyticsQueryDto } from '@/types/exam.types';

export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (session?: string, page?: number, limit?: number) => [...examKeys.lists(), { session, page, limit }] as const,
  detail: (id: number) => [...examKeys.all, 'detail', id] as const,
  
  subjects: () => ['exam-subjects'] as const,
  subjectList: (session: string, examId: number, classId?: number) => [...examKeys.subjects(), { session, examId, classId }] as const,
  
  grades: () => ['grade-configs'] as const,
  gradeList: (session: string) => [...examKeys.grades(), { session }] as const,
  
  types: () => ['exam-types'] as const,
  typeList: (page?: number, limit?: number) => [...examKeys.types(), { page, limit }] as const,
  typeDetail: (id: number) => [...examKeys.types(), 'detail', id] as const,
  
  schedules: () => ['exam-schedules'] as const,
  scheduleList: (query: ExamScheduleQueryDto) => [...examKeys.schedules(), query] as const,
  studentSchedule: (session: string) => [...examKeys.schedules(), 'student', { session }] as const,
  
  marks: () => ['exam-marks'] as const,
  marksList: (examId: number, classId: number, classSectionId: number, subjectId?: number) =>
    [...examKeys.marks(), { examId, classId, classSectionId, subjectId }] as const,
  completionStatus: (examId: number, session: string) => [...examKeys.marks(), 'completion', { examId, session }] as const,
  studentMarks: (studentId: string, session: string) => [...examKeys.marks(), 'student', { studentId, session }] as const,
  
  results: () => ['exam-results'] as const,
  classResults: (examId: number, classId: number, classSectionId: number) =>
    [...examKeys.results(), 'class', { examId, classId, classSectionId }] as const,
  reportCard: (studentId: string, examId: number, session: string) =>
    [...examKeys.results(), 'report-card', { studentId, examId, session }] as const,
    
  analytics: () => ['exam-analytics'] as const,
  studentPerf: (studentId: string, query: AnalyticsQueryDto) => [...examKeys.analytics(), 'student', studentId, query] as const,
  classOverview: (query: AnalyticsQueryDto) => [...examKeys.analytics(), 'class-overview', query] as const,
  subjectAnalysis: (query: AnalyticsQueryDto) => [...examKeys.analytics(), 'subject-analysis', query] as const,
  toppers: (query: AnalyticsQueryDto) => [...examKeys.analytics(), 'toppers', query] as const,
};

export const useExams = (session?: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: examKeys.list(session, page, limit),
    queryFn: async () => {
      const data = await examService.getExams(page, limit);
      if (session) {
        return data.filter((exam: any) => exam.session === session);
      }
      return data;
    },
  });
};

export const useExamById = (id: number) => {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examService.getExamById(id),
    enabled: !!id,
  });
};

export const useExamSubjects = (session: string, examId: number, classId?: number) => {
  return useQuery({
    queryKey: examKeys.subjectList(session, examId, classId),
    queryFn: () => examService.getExamSubjects(session, examId, classId),
    enabled: !!session && !!examId,
  });
};

export const useGradeConfig = (session: string) => {
  return useQuery({
    queryKey: examKeys.gradeList(session),
    queryFn: () => examService.getGrades(session),
    enabled: !!session,
  });
};

export const useExamTypes = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: examKeys.typeList(page, limit),
    queryFn: () => examService.getExamTypes(page, limit),
  });
};

export const useExamTypeById = (id: number) => {
  return useQuery({
    queryKey: examKeys.typeDetail(id),
    queryFn: () => examService.getExamTypeById(id),
    enabled: !!id,
  });
};

export const useExamSchedules = (query: ExamScheduleQueryDto) => {
  return useQuery({
    queryKey: examKeys.scheduleList(query),
    queryFn: () => examService.getSchedules(query),
  });
};

export const useStudentSchedule = (session: string) => {
  return useQuery({
    queryKey: examKeys.studentSchedule(session),
    queryFn: () => examService.getStudentSchedule(session),
    enabled: !!session,
  });
};

export const useMarks = (examId: number, classId: number, classSectionId: number, subjectId?: number) => {
  return useQuery({
    queryKey: examKeys.marksList(examId, classId, classSectionId, subjectId),
    queryFn: () => examService.getMarks(examId, classId, classSectionId, subjectId),
    enabled: !!examId && !!classId && !!classSectionId,
  });
};

export const useMarksCompletionStatus = (examId: number, session: string) => {
  return useQuery({
    queryKey: examKeys.completionStatus(examId, session),
    queryFn: () => examService.getCompletionStatus(examId, session),
    enabled: !!examId && !!session,
  });
};

export const useStudentMarks = (studentId: string, session: string) => {
  return useQuery({
    queryKey: examKeys.studentMarks(studentId, session),
    queryFn: () => examService.getStudentMarks(studentId, session),
    enabled: !!studentId && !!session,
  });
};

export const useClassResults = (examId: number, classId: number, classSectionId: number) => {
  return useQuery({
    queryKey: examKeys.classResults(examId, classId, classSectionId),
    queryFn: () => examService.getClassResults(examId, classId, classSectionId),
    enabled: !!examId && !!classId && !!classSectionId,
  });
};

export const useReportCard = (studentId: string, examId: number, session: string) => {
  return useQuery({
    queryKey: examKeys.reportCard(studentId, examId, session),
    queryFn: () => examService.getReportCard(studentId, examId, session),
    enabled: !!studentId && !!examId && !!session,
  });
};

export const useStudentPerformance = (studentId: string, query: AnalyticsQueryDto) => {
  return useQuery({
    queryKey: examKeys.studentPerf(studentId, query),
    queryFn: () => examService.getStudentPerformance(studentId, query),
    enabled: !!studentId && !!query.session,
  });
};

export const useClassOverview = (query: AnalyticsQueryDto) => {
  return useQuery({
    queryKey: examKeys.classOverview(query),
    queryFn: () => examService.getClassOverview(query),
    enabled: !!query.session,
  });
};

export const useSubjectAnalysis = (query: AnalyticsQueryDto) => {
  return useQuery({
    queryKey: examKeys.subjectAnalysis(query),
    queryFn: () => examService.getSubjectAnalysis(query),
    enabled: !!query.session,
  });
};

export const useToppers = (query: AnalyticsQueryDto) => {
  return useQuery({
    queryKey: examKeys.toppers(query),
    queryFn: () => examService.getToppers(query),
    enabled: !!query.session,
  });
};
