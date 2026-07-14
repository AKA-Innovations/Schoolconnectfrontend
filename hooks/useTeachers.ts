import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import { TeacherFilterParams, TeacherUpdateDetails, TeacherClass, Address, SchoolRecord } from '@/types/roles';

// ─── Query key factories ──────────────────────────────────────────────────────
export const teacherKeys = {
  all: ['teachers'] as const,
  list: (filters: TeacherFilterParams) => ['teachers', 'list', filters] as const,
  detail: (id: string) => ['teachers', 'detail', id] as const,
  basicDetails: (id: string) => ['teachers', 'basic-details', id] as const,
  personalData: (id: string) => ['teachers', 'personal-data', id] as const,
  academicData: (id: string) => ['teachers', 'academic-data', id] as const,
  professionalData: (id: string) => ['teachers', 'professional-data', id] as const,
  familyDetails: (id: string) => ['teachers', 'family-details', id] as const,
  addresses: (id: string) => ['teachers', 'addresses', id] as const,
  schoolRecord: (id: string) => ['teachers', 'school-record', id] as const,
  coordinatorClasses: (id: string) => ['teachers', 'coordinator-classes', id] as const,
  classTeacher: (id: string) => ['teachers', 'class-teacher', id] as const,
  classSubjectDetails: (teacherId?: string) => ['teachers', 'class-subject-details', teacherId] as const,
  birthdays: (date: string) => ['teachers', 'birthdays', date] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────
export function useTeacherList(filters: TeacherFilterParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: teacherKeys.list(filters),
    queryFn: () => teacherService.listTeachers(filters),
    enabled: options?.enabled ?? true, // School ID is not required for this endpoint
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

// ─── New Tab-Wise Custom Hooks ───────────────────────────────────────────────

export function useTeacherBasicDetails(id: string) {
  return useQuery({
    queryKey: teacherKeys.basicDetails(id),
    queryFn: () => teacherService.getBasicDetails(id),
    enabled: !!id,
  });
}

export function useUpdateTeacherBasicDetails(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teacherService.updateBasicDetails(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.basicDetails(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
    },
  });
}

export function useTeacherPersonalData(id: string) {
  return useQuery({
    queryKey: teacherKeys.personalData(id),
    queryFn: () => teacherService.getPersonalData(id),
    enabled: !!id,
  });
}

export function useUpdateTeacherPersonalData(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teacherService.updatePersonalData(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.personalData(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
    },
  });
}

export function useTeacherAcademicData(id: string) {
  return useQuery({
    queryKey: teacherKeys.academicData(id),
    queryFn: () => teacherService.getAcademicData(id),
    enabled: !!id,
  });
}

export function useUpdateTeacherAcademicData(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teacherService.updateAcademicData(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.academicData(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
    },
  });
}

export function useTeacherProfessionalData(id: string) {
  return useQuery({
    queryKey: teacherKeys.professionalData(id),
    queryFn: () => teacherService.getProfessionalData(id),
    enabled: !!id,
  });
}

export function useUpdateTeacherProfessionalData(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teacherService.updateProfessionalData(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.professionalData(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
    },
  });
}

export function useTeacherFamilyDetails(id: string) {
  return useQuery({
    queryKey: teacherKeys.familyDetails(id),
    queryFn: () => teacherService.getFamilyDetails(id),
    enabled: !!id,
  });
}

export function useUpdateTeacherFamilyDetails(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => teacherService.updateFamilyDetails(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.familyDetails(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
    },
  });
}

export function useTeacherAddresses(id: string) {
  return useQuery({
    queryKey: teacherKeys.addresses(id),
    queryFn: () => teacherService.getAddresses(id),
    enabled: !!id,
  });
}

export function useTeacherSchoolRecord(id: string) {
  return useQuery({
    queryKey: teacherKeys.schoolRecord(id),
    queryFn: () => teacherService.getSchoolRecord(id),
    enabled: !!id,
  });
}

export function useTeacherCoordinatorClasses(id: string) {
  return useQuery({
    queryKey: teacherKeys.coordinatorClasses(id),
    queryFn: () => teacherService.getCoordinatorClasses(id),
    enabled: !!id,
  });
}

export function useUpdateTeacherCoordinatorClasses(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { session: string; classes: { className: string }[] }) =>
      teacherService.updateCoordinatorClasses(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.coordinatorClasses(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
    },
  });
}

export function useTeacherClassTeacher(id: string) {
  return useQuery({
    queryKey: teacherKeys.classTeacher(id),
    queryFn: () => teacherService.getClassTeacher(id),
    enabled: !!id,
  });
}

export function useAssignClassTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { teacherId: string; classDtlsId: number; schoolId?: string }) =>
      teacherService.assignClassTeacher(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all }),
  });
}

export function useTeacherClassSubjectDetails(teacherId?: string) {
  return useQuery({
    queryKey: teacherKeys.classSubjectDetails(teacherId),
    queryFn: () => teacherService.getClassSubjectDetails(teacherId),
  });
}

export function useTeacherBirthdays(date: string) {
  return useQuery({
    queryKey: teacherKeys.birthdays(date),
    queryFn: () => teacherService.getBirthdays(date),
    enabled: !!date,
  });
}
