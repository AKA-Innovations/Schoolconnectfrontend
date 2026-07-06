import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherLeaveService } from '@/services/teacher-leave/service';
import type {
  ApplyLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  InitializeBalanceDto,
  MarkAttendanceDto,
  AssignSubstituteDto,
  ListLeaveFilters,
} from '@/types/leave.types';

// ─── Query key factories ──────────────────────────────────────────────────────

export const leaveKeys = {
  all: ['teacher-leave'] as const,
  list: (filters?: ListLeaveFilters) => ['teacher-leave', 'list', filters] as const,
  balances: (session: string) => ['teacher-leave', 'balances', session] as const,
  substitutes: (date: string) => ['substitute-period', 'list', date] as const,
  availableTeachers: (date: string, periodId: number, session: string) =>
    ['substitute-period', 'available-teachers', date, periodId, session] as const,
  attendance: (teacherId?: string, year?: number, month?: number) =>
    ['teacher-attendance', teacherId, year, month] as const,
};

// ─── Leave Queries ────────────────────────────────────────────────────────────

export function useLeaveList(filters?: ListLeaveFilters) {
  return useQuery({
    queryKey: leaveKeys.list(filters),
    queryFn: () => teacherLeaveService.listLeaves(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLeaveBalances(session: string) {
  return useQuery({
    queryKey: leaveKeys.balances(session),
    queryFn: () => teacherLeaveService.getLeaveBalances(session),
    enabled: !!session,
  });
}

// ─── Substitute Queries ───────────────────────────────────────────────────────

export function useSubstitutePeriods(date: string) {
  return useQuery({
    queryKey: leaveKeys.substitutes(date),
    queryFn: () => teacherLeaveService.listSubstitutePeriods(date),
    enabled: !!date,
  });
}

export function useAvailableTeachers(date: string, periodId: number, session: string) {
  return useQuery({
    queryKey: leaveKeys.availableTeachers(date, periodId, session),
    queryFn: () => teacherLeaveService.findAvailableTeachers(date, periodId, session),
    enabled: !!date && !!periodId && !!session,
  });
}

// ─── Attendance Queries ───────────────────────────────────────────────────────

export function useTeacherAttendance(teacherId?: string, year?: number, month?: number) {
  return useQuery({
    queryKey: leaveKeys.attendance(teacherId, year, month),
    queryFn: () => teacherLeaveService.getAttendance({ teacherId, year, month }),
    enabled: !!year && !!month,
  });
}

export function useTeacherAttendanceForDay(date: string) {
  return useQuery({
    queryKey: ['teacher-attendance', 'day', date],
    queryFn: () => teacherLeaveService.getAttendanceForDay(date),
    enabled: !!date,
  });
}

// ─── Leave Mutations ──────────────────────────────────────────────────────────

export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ApplyLeaveDto) => teacherLeaveService.applyLeave(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto?: ApproveLeaveDto }) =>
      teacherLeaveService.approveLeave(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-leave'] });
      qc.invalidateQueries({ queryKey: ['substitute-period'] });
      qc.invalidateQueries({ queryKey: ['teacher-attendance'] });
    },
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: RejectLeaveDto }) =>
      teacherLeaveService.rejectLeave(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-leave'] });
      qc.invalidateQueries({ queryKey: ['substitute-period'] });
      qc.invalidateQueries({ queryKey: ['teacher-attendance'] });
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherLeaveService.cancelLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-leave'] });
      qc.invalidateQueries({ queryKey: ['substitute-period'] });
      qc.invalidateQueries({ queryKey: ['teacher-attendance'] });
    },
  });
}

export function useRevokeLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherLeaveService.revokeLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-leave'] });
      qc.invalidateQueries({ queryKey: ['substitute-period'] });
      qc.invalidateQueries({ queryKey: ['teacher-attendance'] });
    },
  });
}

export function useInitializeBalances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: InitializeBalanceDto) => teacherLeaveService.initializeBalances(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-leave'] });
    },
  });
}

// ─── Substitute Mutations ─────────────────────────────────────────────────────

export function useAssignSubstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: AssignSubstituteDto }) =>
      teacherLeaveService.assignSubstitute(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['substitute-period'] }),
  });
}

// ─── Attendance Mutations ─────────────────────────────────────────────────────

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: MarkAttendanceDto) => teacherLeaveService.markAttendance(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-attendance'] });
      qc.invalidateQueries({ queryKey: ['substitute-period'] });
    },
  });
}
