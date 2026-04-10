import { AdminSummary, Teacher, Student, Class } from './roles';

export interface AdminTeacherFilters {
  schoolId?: string;
  subject?: string;
  status?: string;
}

export interface AdminTeacherListResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStudentFilters {
  schoolId?: string;
  grade?: string;
  class?: string;
  status?: string;
}

export interface AdminStudentListResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
}

export type { AdminSummary, Teacher, Student, Class };
