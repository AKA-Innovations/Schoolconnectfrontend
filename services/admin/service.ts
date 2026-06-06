import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import { CURRENT_SESSION } from '../../lib/constants';
import type {
  AdminSummary,
  AdminStudentFilters,
  AdminStudentListResponse,
  AdminTeacherFilters,
  AdminTeacherListResponse,
  Class,
  Student,
  Teacher,
} from './types';

export const adminService = {
  getSummary: async (schoolId: string): Promise<AdminSummary> => {
    const [schoolRes, teachersRes, studentsRes, classesRes] = await Promise.all([
      api.get(API_ENDPOINTS.SCHOOL.BY_ID(schoolId)),
      api.get(API_ENDPOINTS.TEACHER.LIST, { params: { pageSize: 5 } }),
      api.get(API_ENDPOINTS.STUDENT.LIST, { params: { limit: 5 } }),
      api.get(API_ENDPOINTS.CLASS.CLASS_DTLS, { params: { schoolId, session: CURRENT_SESSION } }),
    ]);

    // Defensive data extraction: common in this backend to wrap objects in 'data'
    const schoolDataRaw = schoolRes.data?.data || schoolRes.data;
    const teacherDataRaw = teachersRes.data?.data || teachersRes.data;
    const studentDataRaw = studentsRes.data?.data || studentsRes.data;
    const classesDataRaw = classesRes.data?.data || classesRes.data;

    const teacherCount = teacherDataRaw?.pagination?.totalItemsCount ?? teacherDataRaw?.totalItems ?? teacherDataRaw?.items?.length ?? 0;
    const studentCount = studentDataRaw?.pagination?.totalItemsCount ?? studentDataRaw?.totalItems ?? studentDataRaw?.items?.length ?? 0;
    const classCount = Array.isArray(classesDataRaw) ? classesDataRaw.length : 0;

    const ownerName = schoolDataRaw?.ownerDetails
      ? `${schoolDataRaw.ownerDetails.firstName} ${schoolDataRaw.ownerDetails.lastName}`
      : '—';

    // Map backend teachers to Summary Teacher type
    const mappedTeachers = (teacherDataRaw?.items || []).map((t: any) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      subject: t.subject || 'Faculty',
      status: 'active',
    }));

    // Map backend students to Summary Student type
    const mappedStudents = (studentDataRaw?.items || []).map((s: any) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      grade: s.grade || '—',
      class: s.className || '—',
      status: 'active',
    }));

    return {
      kpis: [
        { label: 'Total Teachers', value: teacherCount, trendType: 'neutral', iconName: 'Users' },
        { label: 'Total Students', value: studentCount, trendType: 'neutral', iconName: 'GraduationCap' },
        // { label: 'Total Classes', value: classCount, trendType: 'neutral', iconName: 'Building2' },
      ],
      school: {
        id: schoolDataRaw?.id || schoolId,
        name: schoolDataRaw?.name || 'School Profile',
        principal: ownerName,
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalClasses: classCount,
      },
      teachers: mappedTeachers,
      students: mappedStudents,
      classes: Array.isArray(classesDataRaw) ? classesDataRaw.slice(0, 5) : [],
      recentData: [],
    };
  },

  getTeachers: async (
    page = 1,
    limit = 20,
    filters?: AdminTeacherFilters,
  ): Promise<AdminTeacherListResponse> => {
    const { schoolId, ...rest } = filters || {};
    const response = await api.get(API_ENDPOINTS.ADMIN.TEACHERS, {
      params: {
        page,
        pageSize: limit,
        ...rest,
      }
    });
    return response.data;
  },

  addTeacher: async (teacher: Omit<Teacher, 'id'>) => {
    const response = await api.post(API_ENDPOINTS.ADMIN.TEACHERS, teacher);
    return response.data;
  },

  updateTeacher: async (id: string, teacher: Partial<Teacher>) => {
    const response = await api.put(API_ENDPOINTS.ADMIN.TEACHER_BY_ID(id), teacher);
    return response.data;
  },

  deleteTeacher: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.ADMIN.TEACHER_BY_ID(id));
    return response.data;
  },

  assignClassesToTeacher: async (teacherId: string, classIds: string[]) => {
    const response = await api.put(API_ENDPOINTS.ADMIN.TEACHER_CLASSES(teacherId), { classIds });
    return response.data;
  },

  getStudents: async (
    page = 1,
    limit = 20,
    filters?: AdminStudentFilters,
  ): Promise<AdminStudentListResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters) {
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.class) params.append('class', filters.class);
      if (filters.status) params.append('status', filters.status);
    }
    const response = await api.get(`${API_ENDPOINTS.ADMIN.STUDENTS}?${params}`);
    return response.data;
  },

  addStudent: async (student: Omit<Student, 'id'>) => {
    const response = await api.post(API_ENDPOINTS.ADMIN.STUDENTS, student);
    return response.data;
  },

  updateStudent: async (id: string, student: Partial<Student>) => {
    const response = await api.put(API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id), student);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id));
    return response.data;
  },

  getClasses: async (schoolId?: string) => {
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_DTLS, { params: { schoolId, session: CURRENT_SESSION } });
    return response.data?.data || response.data?.items || response.data;
  },
};
