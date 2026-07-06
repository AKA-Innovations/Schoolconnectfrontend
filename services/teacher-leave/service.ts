import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  TeacherLeave,
  TeacherLeaveBalance,
  TeacherAttendanceRecord,
  SubstitutePeriod,
  AvailableTeacher,
  ApplyLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  InitializeBalanceDto,
  MarkAttendanceDto,
  AssignSubstituteDto,
  ListLeaveFilters,
} from '../../types/leave.types';

export const teacherLeaveService = {
  // ─── Leave Requests ─────────────────────────────────────────────────────────

  applyLeave: async (dto: ApplyLeaveDto): Promise<TeacherLeave> => {
    const response = await api.post(API_ENDPOINTS.TEACHER_LEAVE.BASE, dto);
    return response.data;
  },

  listLeaves: async (filters?: ListLeaveFilters): Promise<TeacherLeave[]> => {
    const response = await api.get(API_ENDPOINTS.TEACHER_LEAVE.BASE, { params: filters });
    return response.data;
  },

  approveLeave: async (id: number, dto?: ApproveLeaveDto): Promise<TeacherLeave> => {
    const response = await api.put(API_ENDPOINTS.TEACHER_LEAVE.APPROVE(id), dto || {});
    return response.data;
  },

  rejectLeave: async (id: number, dto: RejectLeaveDto): Promise<TeacherLeave> => {
    const response = await api.put(API_ENDPOINTS.TEACHER_LEAVE.REJECT(id), dto);
    return response.data;
  },

  cancelLeave: async (id: number): Promise<TeacherLeave> => {
    const response = await api.put(API_ENDPOINTS.TEACHER_LEAVE.CANCEL(id), {});
    return response.data;
  },

  revokeLeave: async (id: number): Promise<TeacherLeave> => {
    const response = await api.put(API_ENDPOINTS.TEACHER_LEAVE.REVOKE(id), {});
    return response.data;
  },

  // ─── Leave Balances ─────────────────────────────────────────────────────────

  getLeaveBalances: async (session: string): Promise<TeacherLeaveBalance[]> => {
    const response = await api.get(API_ENDPOINTS.TEACHER_LEAVE.BALANCE, { params: { session } });
    return response.data;
  },

  initializeBalances: async (dto: InitializeBalanceDto): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.TEACHER_LEAVE.BALANCE_INITIALIZE, dto);
    return response.data;
  },

  // ─── Substitute Periods ─────────────────────────────────────────────────────

  listSubstitutePeriods: async (date: string): Promise<SubstitutePeriod[]> => {
    const response = await api.get(API_ENDPOINTS.SUBSTITUTE_PERIOD.BASE, { params: { date } });
    return response.data;
  },

  findAvailableTeachers: async (date: string, periodId: number, session: string): Promise<AvailableTeacher[]> => {
    const response = await api.get(API_ENDPOINTS.SUBSTITUTE_PERIOD.AVAILABLE_TEACHERS, {
      params: { date, periodId, session },
    });
    return response.data;
  },

  assignSubstitute: async (id: number, dto: AssignSubstituteDto): Promise<SubstitutePeriod> => {
    const response = await api.put(API_ENDPOINTS.SUBSTITUTE_PERIOD.ASSIGN(id), dto);
    return response.data;
  },

  // ─── Teacher Attendance ─────────────────────────────────────────────────────

  markAttendance: async (dto: MarkAttendanceDto): Promise<TeacherAttendanceRecord> => {
    const response = await api.post(API_ENDPOINTS.TEACHER_ATTENDANCE.MARK, dto);
    return response.data;
  },

  getAttendance: async (params: {
    teacherId?: string;
    year?: number;
    month?: number;
  }): Promise<TeacherAttendanceRecord[]> => {
    const response = await api.get(API_ENDPOINTS.TEACHER_ATTENDANCE.BASE, { params });
    return response.data;
  },

  getAttendanceForDay: async (date: string): Promise<TeacherAttendanceRecord[]> => {
    const response = await api.get(API_ENDPOINTS.TEACHER_ATTENDANCE.DAY, { params: { date } });
    return response.data;
  },
};
