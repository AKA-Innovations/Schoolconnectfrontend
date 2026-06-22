import { useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from './service';
import { examKeys } from './queries';
import {
  CreateExamMasterDto,
  UpdateExamMasterDto,
  CreateExamTypeDto,
  UpdateExamTypeDto,
  CreateExamSubjectDto,
  UpdateExamSubjectItemDto,
  CreateGradeMstrDto,
  CreateExamScheduleDto,
  UpdateExamScheduleDto,
  CreateMarksEntryDto,
  UpdateMarksDto,
  LockMarksDto,
  BulkAbsentDto,
  GenerateResultDto,
  PublishResultDto,
} from '@/types/exam.types';

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamMasterDto) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamMasterDto }) => examService.updateExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useCreateExamSubjects = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamSubjectDto) => examService.createExamSubjects(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.subjects() });
    },
  });
};

export const useUpdateExamSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamSubjectItemDto }) => examService.updateExamSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.subjects() });
    },
  });
};

export const useDeleteExamSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.deleteExamSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.subjects() });
    },
  });
};

export const useConfigureGrades = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGradeMstrDto) => examService.configureGrades(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.gradeList(variables.session) });
    },
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.grades() });
    },
  });
};

export const useCreateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamTypeDto) => examService.createExamType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.types() });
    },
  });
};

export const useUpdateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamTypeDto }) => examService.updateExamType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.types() });
      queryClient.invalidateQueries({ queryKey: examKeys.typeDetail(variables.id) });
    },
  });
};

export const useDeleteExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.deleteExamType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.types() });
    },
  });
};

export const useCreateSchedules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamScheduleDto) => examService.createSchedules(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.schedules() });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamScheduleDto }) => examService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.schedules() });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.schedules() });
    },
  });
};

export const useEnterMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarksEntryDto) => examService.enterMarks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.marks() });
    },
  });
};

export const useUpdateMark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMarksDto }) => examService.updateMark(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.marks() });
    },
  });
};

export const useBulkMarkAbsent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAbsentDto) => examService.markAbsent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.marks() });
    },
  });
};

export const useLockMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LockMarksDto) => examService.lockMarks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.marks() });
    },
  });
};

export const useUnlockMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LockMarksDto) => examService.unlockMarks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.marks() });
    },
  });
};

export const useGenerateResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateResultDto) => examService.generateResults(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
    },
  });
};

export const useUpdateTeacherRemarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks: string }) => examService.updateTeacherRemarks(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
    },
  });
};

export const useUpdatePrincipalRemarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks: string }) => examService.updatePrincipalRemarks(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
    },
  });
};

export const usePublishResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PublishResultDto) => examService.publishResults(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
      queryClient.invalidateQueries({ queryKey: examKeys.all }); // Update exam master published state too
    },
  });
};

export const useUnpublishResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PublishResultDto) => examService.unpublishResults(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.results() });
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};
