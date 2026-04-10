export type {
  Address,
  ClassTeacherAssignmentDetails,
  SchoolRecord,
  Teacher,
  TeacherClass,
  TeacherFilterParams,
  TeacherRegistrationData,
  TeacherSummary,
  TeacherUpdateDetails,
} from '../../types/teacher.types';

export interface ClassTeacherAssignment {
  classTeacherId: string;
  className: string;
  sectionName: string;
  schoolId: string;
}

export interface CoordinatorClassMapping {
  id?: number;
  teacherId: string;
  classDtlsId: number;
  className?: string;
  sectionName?: string;
}
