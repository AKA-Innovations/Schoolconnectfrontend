export type {
  Address,
  ClassTeacherAssignmentDetails,
  CoordinatorClassMapping,
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
