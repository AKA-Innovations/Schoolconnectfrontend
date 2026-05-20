import { useQuery } from '@tanstack/react-query';
import { examService } from './service';

export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (session: string) => [...examKeys.lists(), { session }] as const,
  schedules: () => ['exam-schedules'] as const,
  scheduleList: (session?: string) => [...examKeys.schedules(), { session }] as const,
  results: () => ['exam-results'] as const,
  resultList: (filters: any) => [...examKeys.results(), { filters }] as const,
};

export const useExams = (session: string) => {
  return useQuery({
    queryKey: examKeys.list(session),
    queryFn: () => examService.getExams(session),
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExamSchedules = (session?: string) => {
  return useQuery({
    queryKey: examKeys.scheduleList(session),
    queryFn: () => examService.getSchedules(session),
  });
};

export const useExamResults = (filters: { session?: string; examId?: number; classSectionId?: number; subjectId?: number }) => {
  return useQuery({
    queryKey: examKeys.resultList(filters),
    queryFn: () => examService.getResults(filters),
    enabled: !!filters.session || !!filters.examId,
  });
};
