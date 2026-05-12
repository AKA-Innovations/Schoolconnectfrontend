export interface ClassDetails {
  id: number;
  classId: number;
  className: string;
  sectionName: string;
  classTeacherId: string | null;
  maxLimit: number | null;
  schoolId: string;
}

export interface SchoolClass {
  id: number;
  className: string;
}

export interface SchoolSection {
  id: number;
  classId: number;
  className: string;
  sectionName: string;
}

export interface CreateSchoolClassPayload {
  classes: { className: string }[];
}

export interface CreateSchoolSectionPayload {
  sections: { classId: number; sectionName: string }[];
}

export interface UpdateSchoolSectionPayload {
  sectionName: string;
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

export interface ClassTeacherMapping {
  id: number;
  session: string;
  classSectionsId: number;
  classTeacherId: string;
  maxLimit: number;
  // Enriched fields from GET if any
  className?: string;
  sectionName?: string;
  teacherName?: string;
}

export interface CreateClassTeacherMappingPayload {
  session: string;
  classSectionsId: number;
  classTeacherId: string;
  maxLimit: number;
}

export interface ClassSubjectMapping {
  id: string;
  classDtlsId: number;
  subjectDtlsId: number;
  teacherId: string;
  // Enriched fields from GET
  teacherName?: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  subjectCode?: string;
  session?: string;
}

export interface CreateClassSubjectMappingPayload {
  entries: {
    session: string;
    teacherId: string;
    classId: number;
    classSectionId: number;
    subjectId: number;
  }[];
}

// ─── Subject Master ──────────────────────────────────────────────────────────

export interface SubjectOption {
  id: number;
  subjectName: string;
  subjectCode: string;
  session?: string;
}

export interface CreateSubjectBulkPayload {
  session: string;
  subjects: { subjectName: string; subjectCode: string }[];
}

// ─── Legacy/Old mappings (keep for compatibility if needed) ──────────────────

export interface SubjectDetail {
  id: string; 
  classDtlsId: number;
  subjectDtlsId: number;
  teacherId: string;
  // Enriched fields from GET
  className?: string;
  sectionName?: string;
  classId?: number;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
  session?: string;
}

export interface CreateSubjectDetailPayload {
  session: string;
  teacherId: string;
  classId: number;
  classSectionId: number;
  subjectId: number;
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
  id: number | string;
  session: string;
  classSubjectId: string;   // ClassSubjectDtls.id (string UUID)
  periodId: number;          // PeriodSlots.id
  dayOfWeek: string;
  schoolId?: string;
  // Fields returned by the enriched /class/timetable/fetch endpoint
  subjectName?: string;
  className?: string;
  sectionName?: string;
  teacherName?: string;
  periodNumber?: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateTimetablePayload {
  session: string;
  classSubjectId: string;   // ClassSubjectDtls.id (string UUID)
  periodId: number;
  dayOfWeek: string;
}

export interface TimetableFilterParams {
  session?: string;
  classId?: number;
  classSectionId?: number;
  teacherId?: string;
  periodId?: number;
  dayOfWeek?: string;
  schoolId?: string;
}

// ─── Class Section Lists ─────────────────────────────────────────────────────

export interface ClassSectionItem {
  id: number;
  masterSectionId: number;
  mappingId?: number;
  classId: number;
  className: string;
  sectionName: string;
  classTeacherId?: string | null;
  classTeacherName?: string | null;
  classTeacherMobileNumber?: string | null;
  classTeacherProfileUrl?: string | null;
  maxLimit?: number | null;
  session?: string;
  isMapped?: boolean;
}
