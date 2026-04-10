import api from '../../lib/api';
import { mockAdminSummary } from '../../lib/mockData';
import { API_ENDPOINTS } from '../config';
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

const DEV_MODE = false; // Toggle for mock vs real API

export const adminService = {
  getSummary: async (schoolId: string): Promise<AdminSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockAdminSummary), 800));
    }
    const [schoolRes, teachersRes] = await Promise.all([
      api.get(API_ENDPOINTS.SCHOOL.BY_ID(schoolId)),
      api.get(API_ENDPOINTS.TEACHER.LIST, { params: { schoolId, pageSize: 1 } }),
    ]);

    const school = schoolRes.data;
    const teacherCount: number = teachersRes.data?.pagination?.totalItemsCount ?? 0;

    const ownerName = school.ownerDetails
      ? `${school.ownerDetails.firstName} ${school.ownerDetails.lastName}`
      : '—';

    return {
      kpis: [
        { label: 'Total Teachers', value: teacherCount, trendType: 'neutral', iconName: 'Users' },
      ],
      school: {
        id: school.id,
        name: school.name,
        principal: ownerName,
        totalStudents: 0,
        totalTeachers: teacherCount,
        totalClasses: 0,
      },
      teachers: [],
      students: [],
      classes: [],
      recentData: [],
    };
  },

  getTeachers: async (
    page = 1,
    limit = 20,
    filters?: AdminTeacherFilters,
  ): Promise<AdminTeacherListResponse> => {
    if (DEV_MODE) {
      let teachers = [...mockAdminSummary.teachers];
      if (filters) {
        if (filters.schoolId && filters.schoolId !== 'all') {
          const filtered = teachers.filter((t) => t.schoolId === filters.schoolId);
          if (filtered.length > 0) teachers = filtered;
        }
        if (filters.subject) teachers = teachers.filter((t) => t.subject?.toLowerCase().includes(filters.subject!.toLowerCase()));
        if (filters.status) teachers = teachers.filter((t) => t.status === filters.status);
      }
      const start = (page - 1) * limit;
      const end = start + limit;
      return new Promise((resolve) => setTimeout(() => resolve({
        teachers: teachers.slice(start, end),
        total: teachers.length,
        page,
        limit,
      }), 500));
    }
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters) {
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.status) params.append('status', filters.status);
    }
    const response = await api.get(`${API_ENDPOINTS.ADMIN.TEACHERS}?${params}`);
    return response.data;
  },

  addTeacher: async (teacher: Omit<Teacher, 'id'>) => {
    if (DEV_MODE) {
      const newTeacher = { ...teacher, id: Date.now().toString() } as Teacher;
      mockAdminSummary.teachers.push(newTeacher);
      return new Promise((resolve) => setTimeout(() => resolve(newTeacher), 500));
    }
    const response = await api.post(API_ENDPOINTS.ADMIN.TEACHERS, teacher);
    return response.data;
  },

  updateTeacher: async (id: string, teacher: Partial<Teacher>) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.teachers.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockAdminSummary.teachers[index] = { ...mockAdminSummary.teachers[index], ...teacher };
        return new Promise((resolve) => setTimeout(() => resolve(mockAdminSummary.teachers[index]), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.put(API_ENDPOINTS.ADMIN.TEACHER_BY_ID(id), teacher);
    return response.data;
  },

  deleteTeacher: async (id: string) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.teachers.findIndex((t) => t.id === id);
      if (index !== -1) {
        mockAdminSummary.teachers.splice(index, 1);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.delete(API_ENDPOINTS.ADMIN.TEACHER_BY_ID(id));
    return response.data;
  },

  assignClassesToTeacher: async (teacherId: string, classIds: string[]) => {
    if (DEV_MODE) {
      const teacher = mockAdminSummary.teachers.find((t) => t.id === teacherId);
      if (teacher) {
        mockAdminSummary.classes.filter((c) => classIds.includes(c.id)).map((c) => c.name);
        return new Promise((resolve) => setTimeout(() => resolve(teacher), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.put(API_ENDPOINTS.ADMIN.TEACHER_CLASSES(teacherId), { classIds });
    return response.data;
  },

  getStudents: async (
    page = 1,
    limit = 20,
    filters?: AdminStudentFilters,
  ): Promise<AdminStudentListResponse> => {
    if (DEV_MODE) {
      let students = [...mockAdminSummary.students];
      if (filters) {
        if (filters.schoolId && filters.schoolId !== 'all') {
          const filtered = students.filter((s) => s.schoolId === filters.schoolId);
          if (filtered.length > 0) students = filtered;
        }
        if (filters.grade) students = students.filter((s) => s.grade === filters.grade);
        if (filters.class) students = students.filter((s) => s.class.toLowerCase().includes(filters.class!.toLowerCase()));
        if (filters.status) students = students.filter((s) => s.status === filters.status);
      }
      const start = (page - 1) * limit;
      const end = start + limit;
      return new Promise((resolve) => setTimeout(() => resolve({
        students: students.slice(start, end),
        total: students.length,
        page,
        limit,
      }), 500));
    }
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters) {
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.class) params.append('class', filters.class);
      if (filters.status) params.append('status', filters.status);
    }
    const response = await api.get(`${API_ENDPOINTS.ADMIN.STUDENTS}?${params}`);
    return response.data;
  },

  addStudent: async (student: Omit<Student, 'id'>) => {
    if (DEV_MODE) {
      const newStudent = { ...student, id: Date.now().toString() };
      mockAdminSummary.students.push(newStudent);
      return new Promise((resolve) => setTimeout(() => resolve(newStudent), 500));
    }
    const response = await api.post(API_ENDPOINTS.ADMIN.STUDENTS, student);
    return response.data;
  },

  updateStudent: async (id: string, student: Partial<Student>) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.students.findIndex((s) => s.id === id);
      if (index !== -1) {
        mockAdminSummary.students[index] = { ...mockAdminSummary.students[index], ...student };
        return new Promise((resolve) => setTimeout(() => resolve(mockAdminSummary.students[index]), 500));
      }
      throw new Error('Student not found');
    }
    const response = await api.put(API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id), student);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.students.findIndex((s) => s.id === id);
      if (index !== -1) {
        mockAdminSummary.students.splice(index, 1);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
      }
      throw new Error('Student not found');
    }
    const response = await api.delete(API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id));
    return response.data;
  },

  getClasses: async (schoolId?: string) => {
    if (DEV_MODE) {
      let classes = mockAdminSummary.classes;
      if (schoolId) classes = classes.filter((c) => c.schoolId === schoolId);
      return new Promise((resolve) => setTimeout(() => resolve(classes), 500));
    }
    const params = schoolId ? `?schoolId=${schoolId}` : '';
    const response = await api.get(`${API_ENDPOINTS.ADMIN.CLASSES}${params}`);
    return response.data;
  },
};
