// ─── Enums ──────────────────────────────────────────────────────────────────────

export enum LeaveType {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  EARNED = 'EARNED',
  HALF_DAY = 'HALF_DAY',
  EMERGENCY = 'EMERGENCY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
}

export enum SubstitutePeriodStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ─── Interfaces ─────────────────────────────────────────────────────────────────

export interface TeacherLeave {
  id: number;
  schoolId: string;
  teacherId: string;
  session: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Populated by join on list — teacher name fields */
  teacher?: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

export interface TeacherLeaveBalance {
  id: number;
  schoolId: string;
  teacherId: string;
  session: string;
  leaveType: LeaveType;
  totalAllowed: number;
  used: number;
  remaining: number;
}

export interface TeacherAttendanceRecord {
  id: number;
  schoolId: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  leaveId?: number;
  markedBy?: string;
}

export interface SubstitutePeriod {
  id: number;
  schoolId: string;
  session: string;
  date: string;
  originalTeacherId: string;
  substituteTeacherId?: string | null;
  timetableId: number;
  periodId: number;
  classSectionId: number;
  subjectId: number;
  status: SubstitutePeriodStatus;
  assignedBy?: string;
  assignedAt?: string;
  notes?: string;
  /** Populated via backend join / separate fetches */
  originalTeacher?: { firstName: string; lastName: string; employeeId?: string };
  substituteTeacher?: { firstName: string; lastName: string; employeeId?: string };
}

export interface AvailableTeacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────────────────

export interface ApplyLeaveDto {
  session: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  teacherId?: string;
}

export interface ApproveLeaveDto {
  notes?: string;
}

export interface RejectLeaveDto {
  rejectionReason: string;
}

export interface InitializeBalanceDto {
  session: string;
  casualLeaves: number;
  sickLeaves: number;
  earnedLeaves: number;
}

export interface MarkAttendanceDto {
  teacherId: string;
  date: string;
  status: AttendanceStatus;
}

export interface AssignSubstituteDto {
  substituteTeacherId: string;
  notes?: string;
}

export interface ListLeaveFilters {
  session?: string;
  status?: LeaveStatus;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
}
