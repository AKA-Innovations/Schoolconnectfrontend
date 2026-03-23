import api from '../lib/api';
import { AdminSummary, Teacher, Student, Class } from '../types/roles';
import { mockAdminSummary } from '../lib/mockData';

const DEV_MODE = true; // Toggle for mock vs real API

export const adminService = {
  getSummary: async (): Promise<AdminSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockAdminSummary), 800));
    }
    const response = await api.get('/admin/dashboard-summary');
    return response.data;
  },

  // Teacher management
  getTeachers: async (page = 1, limit = 20, filters?: { schoolId?: string; subject?: string; status?: string }) => {
    if (DEV_MODE) {
      let teachers = [...mockAdminSummary.teachers];
      if (filters) {
        // Only filter by schoolId if it matches mock data OR explicitly skip if it's 'all'
        if (filters.schoolId && filters.schoolId !== 'all') {
          const filtered = teachers.filter(t => t.schoolId === filters.schoolId);
          if (filtered.length > 0) teachers = filtered; // Only apply if results exist, otherwise show all for mock
        }
        if (filters.subject) teachers = teachers.filter(t => t.subject?.toLowerCase().includes(filters.subject!.toLowerCase()));
        if (filters.status) teachers = teachers.filter(t => t.status === filters.status);
      }
      const start = (page - 1) * limit;
      const end = start + limit;
      return new Promise((resolve) => setTimeout(() => resolve({
        teachers: teachers.slice(start, end),
        total: teachers.length,
        page,
        limit
      }), 500));
    }
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters) {
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.status) params.append('status', filters.status);
    }
    const response = await api.get(`/admin/teachers?${params}`);
    return response.data;
  },

  addTeacher: async (teacher: Omit<Teacher, 'id'>) => {
    if (DEV_MODE) {
      const newTeacher = { ...teacher, id: Date.now().toString() } as Teacher;
      mockAdminSummary.teachers.push(newTeacher);
      return new Promise((resolve) => setTimeout(() => resolve(newTeacher), 500));
    }
    const response = await api.post('/admin/teachers', teacher);
    return response.data;
  },

  updateTeacher: async (id: string, teacher: Partial<Teacher>) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.teachers.findIndex(t => t.id === id);
      if (index !== -1) {
        mockAdminSummary.teachers[index] = { ...mockAdminSummary.teachers[index], ...teacher };
        return new Promise((resolve) => setTimeout(() => resolve(mockAdminSummary.teachers[index]), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.put(`/admin/teachers/${id}`, teacher);
    return response.data;
  },

  deleteTeacher: async (id: string) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.teachers.findIndex(t => t.id === id);
      if (index !== -1) {
        mockAdminSummary.teachers.splice(index, 1);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.delete(`/admin/teachers/${id}`);
    return response.data;
  },

  assignClassesToTeacher: async (teacherId: string, classIds: string[]) => {
    if (DEV_MODE) {
      const teacher = mockAdminSummary.teachers.find(t => t.id === teacherId);
      if (teacher) {
        const classNames = mockAdminSummary.classes
          .filter(c => classIds.includes(c.id))
          .map(c => c.name);
        // teacher.classes is now an array of objects, need to handle correctly
        // For mock simple update:
        return new Promise((resolve) => setTimeout(() => resolve(teacher), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.put(`/admin/teachers/${teacherId}/classes`, { classIds });
    return response.data;
  },

  // Student management
  getStudents: async (page = 1, limit = 20, filters?: { schoolId?: string; grade?: string; class?: string; status?: string }) => {
    if (DEV_MODE) {
      let students = [...mockAdminSummary.students];
      if (filters) {
        if (filters.schoolId && filters.schoolId !== 'all') {
          const filtered = students.filter(s => s.schoolId === filters.schoolId);
          if (filtered.length > 0) students = filtered;
        }
        if (filters.grade) students = students.filter(s => s.grade === filters.grade);
        if (filters.class) students = students.filter(s => s.class.toLowerCase().includes(filters.class.toLowerCase()));
        if (filters.status) students = students.filter(s => s.status === filters.status);
      }
      const start = (page - 1) * limit;
      const end = start + limit;
      return new Promise((resolve) => setTimeout(() => resolve({
        students: students.slice(start, end),
        total: students.length,
        page,
        limit
      }), 500));
    }
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters) {
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.class) params.append('class', filters.class);
      if (filters.status) params.append('status', filters.status);
    }
    const response = await api.get(`/admin/students?${params}`);
    return response.data;
  },

  addStudent: async (student: Omit<Student, 'id'>) => {
    if (DEV_MODE) {
      const newStudent = { ...student, id: Date.now().toString() };
      mockAdminSummary.students.push(newStudent);
      return new Promise((resolve) => setTimeout(() => resolve(newStudent), 500));
    }
    const response = await api.post('/admin/students', student);
    return response.data;
  },

  updateStudent: async (id: string, student: Partial<Student>) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.students.findIndex(s => s.id === id);
      if (index !== -1) {
        mockAdminSummary.students[index] = { ...mockAdminSummary.students[index], ...student };
        return new Promise((resolve) => setTimeout(() => resolve(mockAdminSummary.students[index]), 500));
      }
      throw new Error('Student not found');
    }
    const response = await api.put(`/admin/students/${id}`, student);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    if (DEV_MODE) {
      const index = mockAdminSummary.students.findIndex(s => s.id === id);
      if (index !== -1) {
        mockAdminSummary.students.splice(index, 1);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
      }
      throw new Error('Student not found');
    }
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  // Classes
  getClasses: async (schoolId?: string) => {
    if (DEV_MODE) {
      let classes = mockAdminSummary.classes;
      if (schoolId) classes = classes.filter(c => c.schoolId === schoolId);
      return new Promise((resolve) => setTimeout(() => resolve(classes), 500));
    }
    const params = schoolId ? `?schoolId=${schoolId}` : '';
    const response = await api.get(`/admin/classes${params}`);
    return response.data;
  }
};
