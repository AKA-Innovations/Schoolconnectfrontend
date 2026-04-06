import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  classService,
  ClassListResponse,
  ClassTeacherListResponse,
  ClassDetails,
  ClassTeacher,
  CreateClassPayload,
  UpdateClassPayload,
  ClassSummary,
} from '@/services/class.service';

// ─── Query key factories ──────────────────────────────────────────────────────

export const classKeys = {
  all: ['classes'] as const,
  list: (params?: any) => ['classes', 'list', params] as const,
  detail: (id: number) => ['classes', 'detail', id] as const,
  sections: (className: string) => ['classes', 'sections', className] as const,
  teachers: (params?: any) => ['classes', 'teachers', params] as const,
  summary: () => ['classes', 'summary'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useClasses(params?: { page?: number; limit?: number; className?: string }) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classService.getClasses(params),
    placeholderData: (prev) => prev,
  });
}

export function useClass(classDtlsId: number) {
  return useQuery({
    queryKey: classKeys.detail(classDtlsId),
    queryFn: () => classService.getClass(classDtlsId),
    enabled: !!classDtlsId,
  });
}

export function useSectionsByClassName(className: string) {
  return useQuery({
    queryKey: classKeys.sections(className),
    queryFn: () => classService.getSectionsByClassName(className),
    enabled: !!className,
  });
}

export function useClassTeachers(params?: { page?: number; limit?: number; className?: string; teacherName?: string }) {
  return useQuery({
    queryKey: classKeys.teachers(params),
    queryFn: () => classService.getClassTeachers(params),
    placeholderData: (prev) => prev,
  });
}

export function useClassSummary() {
  return useQuery({
    queryKey: classKeys.summary(),
    queryFn: () => classService.getClassSummary(),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassPayload) => classService.createClass(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}

export function useUpdateClass(classDtlsId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClassPayload) => classService.updateClass(classDtlsId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
      qc.invalidateQueries({ queryKey: classKeys.detail(classDtlsId) });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classDtlsId: number) => classService.deleteClass(classDtlsId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}
