import api from '../lib/api';
import { StudentSummary } from '../types/roles';
import { mockStudentSummary } from '../lib/mockData';

const DEV_MODE = true;

export const studentService = {
  getSummary: async (): Promise<StudentSummary> => {
    if (DEV_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(mockStudentSummary), 800));
    }
    const response = await api.get('/student/dashboard-summary');
    return response.data;
  }
};