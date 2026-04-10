import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolService, UpdateSchoolPayload, UpdateAdministratorPayload } from '@/services/school.service';

// ─── Query key factories ──────────────────────────────────────────────────────
export const schoolKeys = {
  detail: (id: string) => ['school', 'detail', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────
export function useSchool(id: string | null) {
  return useQuery({
    queryKey: schoolKeys.detail(id ?? ''),
    queryFn: () => schoolService.getSchool(id!),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export function useUpdateSchool(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSchoolPayload) => schoolService.updateSchool(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.detail(id) }),
  });
}

export function useUploadSchoolImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => schoolService.uploadSchoolProfileImage(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.detail(id) }),
  });
}

export function useDeleteSchoolImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => schoolService.deleteSchoolProfileImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.detail(id) }),
  });
}

export function useUploadOwnerImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => schoolService.uploadOwnerProfileImage(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.detail(id) }),
  });
}

export function useDeleteOwnerImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => schoolService.deleteOwnerProfileImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.detail(id) }),
  });
}

export function useUpdateAdministrator(adminId: string, schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAdministratorPayload) =>
      schoolService.updateAdministrator(adminId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schoolKeys.detail(schoolId) }),
  });
}

export function useUploadAdminImage(adminId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => schoolService.uploadAdministratorProfileImage(adminId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-profile', adminId] }),
  });
}

export function useDeleteAdminImage(adminId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => schoolService.deleteAdministratorProfileImage(adminId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-profile', adminId] }),
  });
}

// ─── Administrator query ───────────────────────────────────────────────────────

export const adminKeys = {
  bySchool: (schoolCode: string) => ['administrators', 'by-school', schoolCode] as const,
};

export function useAdministratorBySchool(schoolCode?: string) {
  return useQuery({
    queryKey: adminKeys.bySchool(schoolCode ?? ''),
    queryFn: () => schoolService.getAdministrators({ schoolCode, pageSize: 1 }),
    enabled: !!schoolCode,
    select: (data) => data.items[0] ?? null,
  });
}
