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
import { mockTeacherSummary } from '../lib/mockData';

const DEV_MODE = false; // Set to false to use real API

export const teacherService = {
  getSummary: async (): Promise<TeacherSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockTeacherSummary), 800));
    }
    const response = await api.get('/teacher/dashboard-summary');
    return response.data;
  },

  registerTeacher: async (data: TeacherRegistrationData): Promise<any> => {
    const response = await api.post('/teacher/register', data);
    return response.data;
  },

  updateTeacherDetails: async (id: string, data: TeacherUpdateDetails): Promise<any> => {
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
    const response = await api.get('/teacher', { params });
    return response.data;
  },

  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = await api.get(`/teacher/${id}`);
    return response.data;
  }
};
