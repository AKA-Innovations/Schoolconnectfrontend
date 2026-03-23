import api from '../lib/api';
import { 
  Teacher, 
  TeacherSummary, 
  TeacherRegistrationData, 
  TeacherUpdateDetails, 
  TeacherClass, 
  Address, 
  SchoolRecord,
  TeacherFilterParams
} from '../types/roles';
import { mockAdminSummary, mockTeacherSummary } from '../lib/mockData';

const DEV_MODE = true; // Set to true to use mock data

export const teacherService = {
  getSummary: async (): Promise<TeacherSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockTeacherSummary), 800));
    }
    const response = await api.get('/teacher/dashboard-summary');
    return response.data;
  },

  registerTeacher: async (data: TeacherRegistrationData): Promise<any> => {
    if (DEV_MODE) {
      const newTeacher: Teacher = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active',
        employeeEmail: data.employeeEmail || data.emailId,
        mobileNumber: data.mobileNumber || '',
        joiningDate: data.joiningDate || new Date().toISOString(),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        emailId: data.emailId || '',
        schoolId: data.schoolId || '1',
        employeeId: data.employeeId || 'EMP-NEW',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        isPrincipal: data.isPrincipal || false,
        isCoordinator: data.isCoordinator || false,
        isClassTeacher: data.isClassTeacher || false,
        isSubjectTeacher: data.isSubjectTeacher || false,
        classes: data.classes || [],
        addresses: [],
        schoolRecords: []
      };
      mockAdminSummary.teachers.push(newTeacher);
      return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: newTeacher }), 500));
    }
    const response = await api.post('/teacher/register', data);
    return response.data;
  },

  updateTeacherDetails: async (id: string, data: TeacherUpdateDetails): Promise<any> => {
    if (DEV_MODE) {
      const index = mockAdminSummary.teachers.findIndex(t => t.id === id);
      if (index !== -1) {
        mockAdminSummary.teachers[index] = { ...mockAdminSummary.teachers[index], ...data };
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockAdminSummary.teachers[index] }), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.put(`/teacher/${id}/details`, data);
    return response.data;
  },

  uploadProfileImage: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(`/teacher/${id}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfileImage: async (id: string): Promise<any> => {
    const response = await api.delete(`/teacher/${id}/profile-image`);
    return response.data;
  },

  deleteTeacher: async (id: string): Promise<any> => {
    if (DEV_MODE) {
      const index = mockAdminSummary.teachers.findIndex(t => t.id === id);
      if (index !== -1) {
        mockAdminSummary.teachers.splice(index, 1);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.delete(`/teacher/${id}`);
    return response.data;
  },

  addAddress: async (id: string, address: Omit<Address, 'id'>): Promise<any> => {
    const response = await api.post(`/teacher/${id}/address`, address);
    return response.data;
  },

  updateAddress: async (addressId: number, address: Omit<Address, 'id'>): Promise<any> => {
    const response = await api.put(`/teacher/address/${addressId}`, address);
    return response.data;
  },

  deleteAddress: async (addressId: number): Promise<any> => {
    const response = await api.delete(`/teacher/address/${addressId}`);
    return response.data;
  },

  addClass: async (id: string, classData: TeacherClass): Promise<any> => {
    const response = await api.post(`/teacher/${id}/class`, classData);
    return response.data;
  },

  updateClass: async (classId: number, classData: TeacherClass): Promise<any> => {
    const response = await api.put(`/teacher/class/${classId}`, classData);
    return response.data;
  },

  deleteClass: async (classId: number): Promise<any> => {
    const response = await api.delete(`/teacher/class/${classId}`);
    return response.data;
  },

  updateSchoolRecord: async (recordId: number, record: Partial<SchoolRecord>): Promise<any> => {
    const response = await api.put(`/teacher/school-record/${recordId}`, record);
    return response.data;
  },

  listTeachers: async (params: TeacherFilterParams): Promise<{ data: Teacher[], total: number }> => {
    if (DEV_MODE) {
      let teachers = [...mockAdminSummary.teachers];
      if (params.schoolId) teachers = teachers.filter(t => t.schoolId === params.schoolId);
      if (params.subjectName) teachers = teachers.filter(t => 
        t.classes.some(c => c.subjectName?.toLowerCase().includes(params.subjectName!.toLowerCase()))
      );
      if (params.firstName) teachers = teachers.filter(t => 
        t.firstName.toLowerCase().includes(params.firstName!.toLowerCase()) ||
        t.lastName.toLowerCase().includes(params.firstName!.toLowerCase())
      );
      
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return new Promise((resolve) => setTimeout(() => resolve({
        data: teachers.slice(start, end),
        total: teachers.length
      }), 500));
    }
    const response = await api.get('/teacher', { params });
    return response.data;
  },

  getTeacherById: async (id: string): Promise<Teacher> => {
    if (DEV_MODE) {
      const teacher = mockAdminSummary.teachers.find(t => t.id === id);
      if (teacher) {
        return new Promise((resolve) => setTimeout(() => resolve(teacher), 500));
      }
      throw new Error('Teacher not found');
    }
    const response = await api.get(`/teacher/${id}`);
    return response.data;
  }
};
