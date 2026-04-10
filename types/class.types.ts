export interface ClassDetails {
  id: number;
  className: string;
  sectionName: string;
  classTeacherId: string | null;
  maxLimit: number | null;
  schoolId: string;
}

export interface ClassTeacher {
  className: string;
  sectionName: string;
  maxLimit: number | null;
  classTeacherId: string | null;
  teacherName: string | null;
  teacherMobile: string | null;
}

export interface CreateClassPayload {
  className: string;
  sectionName: string;
  maxLimit?: number;
  classTeacherId?: string;
}

export interface UpdateClassPayload {
  className?: string;
  sectionName?: string;
  maxLimit?: number;
  classTeacherId?: string;
}

export interface ClassListResponse {
  items: ClassDetails[];
  pagination: {
    totalItemsCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ClassTeacherListResponse {
  items: ClassTeacher[];
  pagination: {
    totalItemsCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ClassSummary {
  totalClasses: number;
  totalSections: number;
  totalClassTeachersAssigned: number;
  classes: ClassDetails[];
  classTeachers: ClassTeacher[];
}

// ─── Subject Options ─────────────────────────────────────────────────────────

export interface SubjectOption {
  id: number;
  subjectName: string;
  className?: string;
  session?: string;
  schoolId?: string;
}

export interface CreateSubjectOptionPayload {
  session: string;
  className: string;
  subjectName: string;
}

// ─── Teacher-Subject Mapping (subject-dtls) ──────────────────────────────────

export interface SubjectDetail {
  id: number;
  session: string;
  teacherId: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName?: string;
}

export interface CreateSubjectDetailPayload {
  session: string;
  teacherId: string;
  className: string;
  sectionName: string;
  subjectName: string;
}

// ─── Period Slots ────────────────────────────────────────────────────────────

export interface PeriodSlot {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  schoolId?: string;
}

export interface CreatePeriodSlotPayload {
  periodNumber: number;
  startTime: string;
  endTime: string;
}

// ─── Timetable ───────────────────────────────────────────────────────────────

export interface TimetableEntry {
  id: number;
  classDtlsId: number;
  periodSlotId: number;
  subjectDtlsId?: number;
  dayOfWeek: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  teacherName?: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateTimetablePayload {
  classDtlsId: number;
  periodSlotId: number;
  subjectDtlsId?: number;
  dayOfWeek: string;
}

// ─── Class Section Lists ─────────────────────────────────────────────────────

export interface ClassSectionItem {
  id: number;
  className: string;
  sectionName: string;
}
