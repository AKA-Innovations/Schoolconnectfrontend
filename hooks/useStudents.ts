import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentService,
  StudentListFilters,
  StudentDetails,
  RegisterStudentPayload,
  UpdateStudentPayload,
  CreateAcademicPayload,
  CreateParentPayload,
  CreateMedicalPayload,
  CreateAddressPayload,
  BulkAttendancePayload,
  AttendanceRecord,
  AttendanceFilterParams,
} from '@/services/student.service';

// ─── Query key factories ──────────────────────────────────────────────────────

export const studentKeys = {
  all: ['students'] as const,
  list: (filters: StudentListFilters) => ['students', 'list', filters] as const,
  detail: (id: string) => ['students', 'detail', id] as const,
};

// ─── helpers ──────────────────────────────────────────────────────────────────
// Every mutation invalidates the detail + list queries so the UI refetches fresh data.
function invalidateStudent(qc: ReturnType<typeof useQueryClient>, studentId: string) {
  qc.invalidateQueries({ queryKey: studentKeys.detail(studentId) });
  qc.invalidateQueries({ queryKey: studentKeys.all });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useStudentList(filters: StudentListFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => studentService.list(filters),
    placeholderData: (prev) => prev,
    enabled: options?.enabled !== false,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async () => {
      const res = await studentService.getById(id);
      // Unwrap the { message, data } envelope inside queryFn so the cache
      // always stores a clean StudentDetails object — no select() needed.
      const d = (res as any)?.data ?? res;
      return {
        ...d,
        // Normalize backend relation field names
        academics: d.academicDtls ?? d.academics ?? [],
        parents: d.parentDtls ?? d.parents ?? [],
        medicalHistories: d.medicalHistory ?? d.medicalHistories ?? [],
        addresses: d.addresses ?? [],
      } as StudentDetails;
    },
    enabled: !!id,
  });
}

// ─── Registration ─────────────────────────────────────────────────────────────

export function useRegisterStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterStudentPayload) => studentService.register(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

// ─── Update details / status ──────────────────────────────────────────────────

export function useUpdateStudentDetails(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStudentPayload) => studentService.updateDetails(id, data),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

export function useUpdateStudentStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => studentService.updateStatus(id, status),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

// ─── Profile image ────────────────────────────────────────────────────────────

export function useUploadStudentImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => studentService.uploadProfileImage(id, file),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

export function useDeleteStudentImage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => studentService.deleteProfileImage(id),
    onSuccess: () => invalidateStudent(qc, id),
  });
}

// ─── Academic ────────────────────────────────────────────────────────────────

export function useAddAcademic(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicPayload) => studentService.addAcademic(studentId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useUpdateAcademic(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ academicId, data }: { academicId: number; data: Partial<CreateAcademicPayload> }) =>
      studentService.updateAcademic(academicId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

// ─── Parent ──────────────────────────────────────────────────────────────────

export function useAddParent(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateParentPayload) => studentService.addParent(studentId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useUpdateParent(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: number; data: Partial<CreateParentPayload> }) =>
      studentService.updateParent(parentId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useDeleteParent(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (parentId: number) => studentService.deleteParent(parentId),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

// ─── Medical ─────────────────────────────────────────────────────────────────

export function useAddMedical(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicalPayload) => studentService.addMedical(studentId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useUpdateMedical(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ medicalId, data }: { medicalId: number; data: Partial<CreateMedicalPayload> }) =>
      studentService.updateMedical(medicalId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useDeleteMedical(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (medicalId: number) => studentService.deleteMedical(medicalId),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

// ─── Address ─────────────────────────────────────────────────────────────────

export function useAddAddress(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressPayload) => studentService.addAddress(studentId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useUpdateAddress(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: number; data: Partial<CreateAddressPayload> }) =>
      studentService.updateAddress(addressId, data),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

export function useDeleteAddress(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: number) => studentService.deleteAddress(addressId),
    onSuccess: () => invalidateStudent(qc, studentId),
  });
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceKeys = {
  all: ['attendance'] as const,
  filter: (params: AttendanceFilterParams) => ['attendance', 'filter', params] as const,
};

export function useFilterAttendance(params: AttendanceFilterParams) {
  console.log("Attendance Filter params:", params);
  return useQuery({
    queryKey: attendanceKeys.filter(params),
    queryFn: () => studentService.filterAttendance(params),
    enabled: !!(params.classSectionId && params.classSectionId > 0 && params.date),

  });
}

export function useBulkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAttendancePayload) => studentService.bulkAttendance(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: number; data: Partial<AttendanceRecord> }) =>
      studentService.updateAttendance(recordId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

// ─── Birthdays ───────────────────────────────────────────────────────────────

export const birthdayKeys = {
  all: ['birthdays'] as const,
  filter: (classSectionId: number, date: string) => ['birthdays', 'filter', classSectionId, date] as const,
};

export function useBirthdays(classSectionId?: number, date?: string) {
  return useQuery({
    queryKey: birthdayKeys.filter(classSectionId!, date!),
    queryFn: () => studentService.getBirthdays(classSectionId!, date!),
    enabled: !!(classSectionId && classSectionId > 0 && date),
  });
}
