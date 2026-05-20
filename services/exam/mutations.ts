import { useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from './service';
import { examKeys } from './queries';
import { Exam, ExamSchedulePayload, ExamResultPayload } from '@/types/exam.types';

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Exam, 'id'>) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Exam> }) => examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useCreateBulkSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExamSchedulePayload) => examService.createBulkSchedules(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.schedules() });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof examService.updateSchedule>[1] }) => 
      examService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.schedules() });
    },
  });
};

export const useCreateBulkResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExamResultPayload) => examService.createBulkResults(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
    },
  });
};

export const useUpdateResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof examService.updateResult>[1] }) => 
      examService.updateResult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
    },
  });
};
