import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CURRENT_SESSION } from '../lib/constants';
import {
  classService,
  ClassListResponse,
  ClassTeacherListResponse,
  ClassDetails,
  ClassTeacher,
  CreateClassPayload,
  CreateSubjectOptionPayload,
  CreateSubjectDetailPayload,
  CreatePeriodSlotPayload,
  CreateTimetablePayload,
  TimetableFilterParams,
  UpdateClassPayload,
  ClassSummary,
} from '@/services/class.service';
import { teacherService } from '@/services/teacher.service';
import { teacherKeys } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';

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
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classService.getClasses({ ...params, schoolId: schoolId || '' }),
    enabled: !!schoolId,
    placeholderData: (prev) => prev,
  });
}

export function useClass(classDtlsId: number) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.detail(classDtlsId),
    queryFn: () => classService.getClass(classDtlsId, schoolId || ''),
    enabled: !!classDtlsId && !!schoolId,
  });
}

export function useSectionsByClassName(className: string) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.sections(className),
    queryFn: () => classService.getSectionsByClassName(className, schoolId || ''),
    enabled: !!className && !!schoolId,
  });
}

export function useClassTeachers(params?: { page?: number; limit?: number; className?: string; teacherName?: string }) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.teachers(params),
    queryFn: () => classService.getClassTeachers({ ...params, schoolId: schoolId || '' }),
    enabled: !!schoolId,
    placeholderData: (prev) => prev,
  });
}

export function useClassSummary() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.summary(),
    queryFn: () => classService.getClassSummary(schoolId || ''),
    enabled: !!schoolId,
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

/**
 * Assign a teacher as class teacher.
 * 1. Updates the class record (classTeacherId).
 * 2. Updates the teacher record (isClassTeacher = true).
 * Both teacher list and class caches are invalidated.
 */
export function useAssignClassTeacher(classDtlsId: number) {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: async ({
      classTeacherId,
      previousTeacherId,
    }: {
      classTeacherId: string | undefined;
      previousTeacherId?: string;
    }) => {
      const currentClass = await classService.getClass(classDtlsId, schoolId || '');
      // Fetch all classes to detect cross-class conflicts
      const allClassesRes = await classService.getClasses({ schoolId: schoolId || '' });
      const allClasses = allClassesRes.items;

      // If the new teacher is already assigned to a DIFFERENT class, remove them from there first
      if (classTeacherId) {
        const previousClassOfNewTeacher = allClasses.find(
          (c) => c.classTeacherId === classTeacherId && c.id !== classDtlsId,
        );
        if (previousClassOfNewTeacher) {
          await classService.updateClass(previousClassOfNewTeacher.id, { classTeacherId: undefined });
          await teacherService.updateTeacherDetails(classTeacherId, { isClassTeacher: true });
        }
      }

      // Unmark the old teacher of THIS class as class teacher (if they're being replaced)
      if (previousTeacherId && previousTeacherId !== classTeacherId) {
        await teacherService.updateTeacherDetails(previousTeacherId, { isClassTeacher: false });
      }

      // Update this class with the new teacher (or undefined to unassign)
      await classService.updateClass(classDtlsId, { classTeacherId });
      // Mark the new teacher as class teacher
      if (classTeacherId) {
        await teacherService.updateTeacherDetails(classTeacherId, { isClassTeacher: true });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
      qc.invalidateQueries({ queryKey: classKeys.detail(classDtlsId) });
      // Invalidate entire teacher list so the dropdown refreshes
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
  });
}

// ─── Class Section Lists ────────────────────────────────────────────────────

export const classSectionKeys = {
  lists: ['class-section-lists'] as const,
  classList: ['class-list'] as const,
};

export function useClassSectionLists() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classSectionKeys.lists,
    queryFn: () => classService.getClassSectionLists(schoolId || ''),
    enabled: !!schoolId,
  });
}

export function useClassList() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classSectionKeys.classList,
    queryFn: () => classService.getClassList(schoolId || ''),
    enabled: !!schoolId,
  });
}

// ─── Subject Options ────────────────────────────────────────────────────────

export const subjectOptionKeys = {
  all: ['subject-options'] as const,
};

export function useSubjectOptions(className?: string) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: ['subject-options', schoolId, className],
    queryFn: () => classService.getSubjectOptions(schoolId || '', className),
    enabled: !!schoolId,
  });
}

export function useCreateSubjectOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectOptionPayload) => classService.createSubjectOption(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectOptionKeys.all }),
  });
}

export function useUpdateSubjectOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSubjectOptionPayload> }) =>
      classService.updateSubjectOption(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectOptionKeys.all }),
  });
}

export function useDeleteSubjectOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteSubjectOption(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectOptionKeys.all }),
  });
}

// ─── Subject Details (Teacher-Subject Mapping) ──────────────────────────────

export const subjectDetailKeys = {
  all: ['subject-details'] as const,
};

export function useSubjectDetails(teacherId?: string) {
  return useQuery({
    queryKey: [...subjectDetailKeys.all, teacherId],
    queryFn: () => classService.getSubjectDetails(teacherId ? { teacherId, session: CURRENT_SESSION } : {}),
    enabled: true,
  });
}

export function useCreateSubjectDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectDetailPayload) => classService.createSubjectDetail(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectDetailKeys.all }),
  });
}

export function useUpdateSubjectDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSubjectDetailPayload> }) =>
      classService.updateSubjectDetail(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectDetailKeys.all }),
  });
}

export function useDeleteSubjectDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteSubjectDetail(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectDetailKeys.all }),
  });
}

// ─── Period Slots ───────────────────────────────────────────────────────────

export const periodSlotKeys = {
  all: ['period-slots'] as const,
};

export function usePeriodSlots() {
  return useQuery({
    queryKey: periodSlotKeys.all,
    queryFn: () => classService.getPeriodSlots(),
  });
}

export function useCreatePeriodSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePeriodSlotPayload) => classService.createPeriodSlot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: periodSlotKeys.all }),
  });
}

export function useUpdatePeriodSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePeriodSlotPayload> }) =>
      classService.updatePeriodSlot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: periodSlotKeys.all }),
  });
}

export function useDeletePeriodSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deletePeriodSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: periodSlotKeys.all }),
  });
}

// ─── Timetable ──────────────────────────────────────────────────────────────

export const timetableKeys = {
  all: ['timetable'] as const,
  filtered: (params?: TimetableFilterParams) => ['timetable', 'list', params] as const,
  fetch: (params?: any) => ['timetable', 'fetch', params] as const,
};

export function useTimetable(params?: TimetableFilterParams) {
  return useQuery({
    queryKey: timetableKeys.filtered(params),
    queryFn: () => classService.getTimetable(params),
  });
}

export function useCreateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetablePayload) => classService.createTimetableEntry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useCreateTimetableBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetablePayload[]) => classService.createTimetableBulk(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useUpdateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTimetablePayload> }) =>
      classService.updateTimetableEntry(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useDeleteTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteTimetableEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useFetchTimetable(params: any) {
  return useQuery({
    queryKey: timetableKeys.fetch(params),
    queryFn: () => classService.fetchTimetable(params),
    enabled: !!params?.session,
  });
}
