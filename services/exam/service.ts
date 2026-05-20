import api from '@/lib/api';
import { API_ENDPOINTS } from '../config';
import { Exam, ExamSchedulePayload, ExamResultPayload, ExamSchedule, ExamResult } from '@/types/exam.types';

export const examService = {
  // --- Exam APIs ---
  createExam: async (data: Omit<Exam, 'id'>) => {
    const response = await api.post<Exam>(API_ENDPOINTS.ACADEMIC.EXAM, data);
    return response.data;
  },

  getExams: async (session: string) => {
    const response = await api.get<Exam[]>(API_ENDPOINTS.ACADEMIC.EXAM, {
      params: { session }
    });
    return response.data;
  },

  updateExam: async (id: number, data: Partial<Exam>) => {
    const response = await api.put<Exam>(API_ENDPOINTS.ACADEMIC.EXAM_BY_ID(id), data);
    return response.data;
  },

  // --- Schedule APIs ---
  createBulkSchedules: async (payload: ExamSchedulePayload) => {
    const response = await api.post<{ message: string; count: number }>(
      API_ENDPOINTS.ACADEMIC.EXAM_SCHEDULE,
      payload
    );
    return response.data;
  },

  getSchedules: async (session?: string) => {
    const response = await api.get<ExamSchedule[]>(API_ENDPOINTS.ACADEMIC.EXAM_SCHEDULE, {
      params: { session }
    });
    return response.data;
  },

  updateSchedule: async (id: number, data: Partial<ExamSchedule>) => {
    const response = await api.put<ExamSchedule>(API_ENDPOINTS.ACADEMIC.EXAM_SCHEDULE_BY_ID(id), data);
    return response.data;
  },

  // --- Result APIs ---
  createBulkResults: async (payload: ExamResultPayload) => {
    const response = await api.post<{ message: string; count: number }>(
      API_ENDPOINTS.ACADEMIC.EXAM_RESULT,
      payload
    );
    return response.data;
  },

  getResults: async (filters: { session?: string; examId?: number; classSectionId?: number; subjectId?: number }) => {
    const response = await api.get<ExamResult[]>(API_ENDPOINTS.ACADEMIC.EXAM_RESULT, {
      params: filters
    });
    return response.data;
  },

  updateResult: async (id: number, data: Partial<ExamResult>) => {
    const response = await api.put<ExamResult>(API_ENDPOINTS.ACADEMIC.EXAM_RESULT_BY_ID(id), data);
    return response.data;
  }
};
