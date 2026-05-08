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
  id: string; // UUID from backend
  subjectName: string;
  subjectCode?: string;
  className?: string;
  session?: string;
  schoolId?: string;
}

export interface CreateSubjectOptionPayload {
  session: string;
  className: string;
  subjects: { subjectName: string; subjectCode: string }[];
}

// ─── Teacher-Subject Mapping (subject-dtls) ──────────────────────────────────

export interface SubjectDetail {
  id: string; // UUID from backend
  session: string;
  teacherId: string;
  className: string;
  sectionName: string;
  subjectName: string;
  subjectId: string;
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
  session: string;
  teacherClassId: string;   // ClassSubjectDtls.id (string UUID)
  periodId: number;          // PeriodSlots.id
  dayOfWeek: string;
  schoolId?: string;
  // Fields returned by the enriched /class/timetable/fetch endpoint
  subjectName?: string;
  className?: string;
  sectionName?: string;
  teacherName?: string;
  periodNumber?: number;
}

export interface CreateTimetablePayload {
  session: string;
  teacherClassId: string;   // ClassSubjectDtls.id (string UUID)
  periodId: number;
  dayOfWeek: string;
}

export interface TimetableFilterParams {
  session?: string;
  teacherClassId?: string;
  dayOfWeek?: string;
  schoolId?: string;
}

// ─── Class Section Lists ─────────────────────────────────────────────────────

export interface ClassSectionItem {
  id: number;
  className: string;
  sectionName: string;
  classTeacherId?: string | null;
  classTeacherName?: string | null;
  classTeacherMobileNumber?: string | null;
  classTeacherProfileUrl?: string | null;
  session?: string;
}
