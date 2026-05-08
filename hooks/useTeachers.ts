import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import { TeacherFilterParams, TeacherUpdateDetails, TeacherClass, Address, SchoolRecord } from '@/types/roles';

// ─── Query key factories ──────────────────────────────────────────────────────
export const teacherKeys = {
  all: ['teachers'] as const,
  list: (filters: TeacherFilterParams) => ['teachers', 'list', filters] as const,
  detail: (id: string) => ['teachers', 'detail', id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────
export function useTeacherList(filters: TeacherFilterParams) {
  return useQuery({
    queryKey: teacherKeys.list(filters),
    queryFn: () => teacherService.listTeachers(filters),
    enabled: true, // School ID is not required for this endpoint
    placeholderData: (prev) => prev,
  });
}

// ─── Single teacher ───────────────────────────────────────────────────────────
export function useTeacher(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teacherService.getTeacherById(id),
    enabled: !!id,
  });
}

// ─── Mutations (all invalidate the relevant cache entries) ────────────────────

export function useRegisterTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teacherService.registerTeacher(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useUpdateTeacher(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeacherUpdateDetails) => teacherService.updateTeacherDetails(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(id) }),
  });
}

export function useUploadTeacherImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => teacherService.uploadProfileImage(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(id) }),
  });
}

export function useDeleteTeacherImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => teacherService.deleteProfileImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(id) }),
  });
}

export function useAddAddress(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addr: Omit<Address, 'id'>) => teacherService.addAddress(teacherId, addr),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useUpdateAddress(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, addr }: { id: number; addr: Omit<Address, 'id'> }) =>
      teacherService.updateAddress(id, addr),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useDeleteAddress(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: number) => teacherService.deleteAddress(addressId),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useAddClass(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cls: TeacherClass) => teacherService.addClass(teacherId, cls),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useUpdateClass(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cls }: { id: number; cls: TeacherClass }) =>
      teacherService.updateClass(id, cls),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useDeleteClass(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId: number) => teacherService.deleteClass(classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useUpdateSchoolRecord(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: number; data: Partial<SchoolRecord> }) =>
      teacherService.updateSchoolRecord(recordId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) }),
  });
}

export function useDeleteTeacher(filters: TeacherFilterParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teacherService.deleteTeacher(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.list(filters) });
    },
  });
}

export function useToggleTeacherStatus(filters: TeacherFilterParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      teacherService.updateTeacherDetails(id, { isActive } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
  });
}

// ─── Class Teacher Assignment ────────────────────────────────────────────────

export function useAddClassTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classTeacherId: string; className: string; sectionName: string; schoolId: string }) =>
      teacherService.addClassTeacher(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useRemoveClassTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classTeacherId: string; className: string; sectionName: string; schoolId: string }) =>
      teacherService.removeClassTeacher(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

// ─── Coordinator-Class Mapping ───────────────────────────────────────────────

export function useAddCoordinatorClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { session: string; teacherId: string; className: string }) =>
      teacherService.addCoordinatorClass(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useRemoveCoordinatorClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mappingId: number) => teacherService.removeCoordinatorClass(mappingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}
