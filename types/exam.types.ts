export enum ExamStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ExamTypeEnum {
  UNIT_TEST = 'UNIT_TEST',
  HALF_YEARLY = 'HALF_YEARLY',
  ANNUAL = 'ANNUAL',
  PRACTICAL = 'PRACTICAL',
  INTERNAL = 'INTERNAL',
  MID_TERM = 'MID_TERM',
}

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

export enum GradingType {
  MARKS = 'MARKS',
  GRADE = 'GRADE',
  MARKS_AND_GRADE = 'MARKS_AND_GRADE',
}

export enum ResultStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  COMPARTMENT = 'COMPARTMENT',
  WITHHELD = 'WITHHELD',
}

export enum MarksEntryStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
  LOCKED = 'LOCKED',
}

// Exam Master
export interface ExamMaster {
  id: number;
  schoolId: string;
  session: string;
  examName: string;
  examType: ExamTypeEnum;
  startDate?: string;
  endDate?: string;
  comment?: string;
  status: ExamStatus;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Exam Type
export interface ExamType {
  id: number;
  schoolId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Exam Subject Detail
export interface ExamSubjectDetail {
  id: number;
  schoolId: string;
  examId: number;
  classId: number;
  subjectId: number;
  examType: string;
  totalMarks: number;
  passingMarks: number;
  weightage?: number;
  gradingType?: GradingType;
  includeInFinalResult?: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// Grade Master
export interface GradeConfig {
  id: number;
  schoolId: string;
  session: string;
  gradeName: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Exam Schedule
export interface ExamSchedule {
  id: number;
  schoolId: string;
  examId: number;
  classId: number;
  classSectionId: number;
  examSubjectDtlId: number;
  subjectId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNo?: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

// Marks Entry
export interface MarksEntry {
  id: number;
  schoolId: string;
  examId: number;
  classId: number;
  classSectionId: number;
  examSubjectDtlId: number;
  subjectId: number;
  studentId: string;
  marksObtained?: number;
  graceMarks?: number;
  isAbsent?: boolean;
  remarks?: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  enteredBy: string;
  createdAt: string;
  updatedAt: string;
}

// Result
export interface ExamResult {
  id: number;
  schoolId: string;
  session: string;
  examId: number;
  classId: number;
  classSectionId: number;
  studentId: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  grade: string;
  status: ResultStatus;
  rank?: number;
  teacherRemarks?: string;
  principalRemarks?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper frontend types (compatibility)
export interface ExamGroup {
  examName: string;
  types: ExamMaster[];
}

// DTOs for API requests
export interface CreateExamMasterDto {
  session: string;
  examName: string;
  examType: ExamTypeEnum;
  startDate?: string;
  endDate?: string;
  comment?: string;
}

export interface UpdateExamMasterDto {
  examName?: string;
  examType?: ExamTypeEnum;
  startDate?: string;
  endDate?: string;
  status?: ExamStatus;
  isPublished?: boolean;
  comment?: string;
}

export interface CreateExamTypeDto {
  name: string;
}

export interface UpdateExamTypeDto {
  name?: string;
}

export interface ExamSubjectItemDto {
  classId: number;
  subjectId: number;
  examType: string;
  totalMarks: number;
  passingMarks: number;
  weightage?: number;
  gradingType?: GradingType;
  includeInFinalResult?: boolean;
  displayOrder?: number;
}

export interface CreateExamSubjectDto {
  session: string;
  examId: number;
  subjects: ExamSubjectItemDto[];
}

export interface UpdateExamSubjectItemDto {
  totalMarks?: number;
  passingMarks?: number;
  weightage?: number;
  gradingType?: GradingType;
  includeInFinalResult?: boolean;
  displayOrder?: number;
}

export interface GradeMstrItemDto {
  gradeName: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint?: number;
  remarks?: string;
}

export interface CreateGradeMstrDto {
  session: string;
  grades: GradeMstrItemDto[];
}

export interface ExamScheduleItemDto {
  examId: number;
  classId: number;
  classSectionId: number;
  examSubjectDtlId: number;
  subjectId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNo?: string;
}

export interface CreateExamScheduleDto {
  session: string;
  schedules: ExamScheduleItemDto[];
}

export interface UpdateExamScheduleDto {
  examDate?: string;
  startTime?: string;
  endTime?: string;
  roomNo?: string;
  status?: ScheduleStatus;
}

export interface ExamScheduleQueryDto {
  session?: string;
  examId?: number;
  classId?: number;
  classSectionId?: number;
  subjectId?: number;
  status?: ScheduleStatus;
  page?: number;
  limit?: number;
}

export interface MarksEntryItemDto {
  studentId: string;
  examSubjectDtlId: number;
  subjectId: number;
  marksObtained?: number;
  graceMarks?: number;
  isAbsent?: boolean;
  remarks?: string;
}

export interface CreateMarksEntryDto {
  session: string;
  examId: number;
  classId: number;
  classSectionId: number;
  marks: MarksEntryItemDto[];
}

export interface UpdateMarksDto {
  marksObtained?: number;
  graceMarks?: number;
  isAbsent?: boolean;
  remarks?: string;
}

export interface LockMarksDto {
  examId: number;
  examSubjectDtlId: number;
  classId: number;
  classSectionId: number;
  subjectId: number;
}

export interface BulkAbsentDto {
  examId: number;
  examSubjectDtlId: number;
  classId: number;
  classSectionId: number;
  subjectId: number;
  studentIds: string[];
}

export interface GenerateResultDto {
  session: string;
  examIds: number[];
  classId: number;
  classSectionId: number;
}

export interface PublishResultDto {
  session: string;
  examId: number;
  classId: number;
  classSectionId: number;
}

export interface UpdateRemarksDto {
  remarks: string;
}

export interface AnalyticsQueryDto {
  session: string;
  examId?: number;
  classId?: number;
  classSectionId?: number;
  subjectId?: number;
  compareExamIds?: number[];
}
