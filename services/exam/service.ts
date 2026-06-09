import api from '@/lib/api';
import { API_ENDPOINTS } from '../config';
import {
  ExamMaster,
  ExamType,
  ExamSubjectDetail,
  GradeConfig,
  ExamSchedule,
  MarksEntry,
  ExamResult,
  CreateExamMasterDto,
  UpdateExamMasterDto,
  CreateExamTypeDto,
  UpdateExamTypeDto,
  CreateExamSubjectDto,
  UpdateExamSubjectItemDto,
  CreateGradeMstrDto,
  CreateExamScheduleDto,
  UpdateExamScheduleDto,
  ExamScheduleQueryDto,
  CreateMarksEntryDto,
  UpdateMarksDto,
  LockMarksDto,
  BulkAbsentDto,
  GenerateResultDto,
  PublishResultDto,
  AnalyticsQueryDto,
} from '@/types/exam.types';

export const examService = {
  // --- Exam Master ---
  createExam: async (data: CreateExamMasterDto) => {
    const response = await api.post<ExamMaster>(API_ENDPOINTS.EXAMINATION.EXAM, data);
    return response.data;
  },

  updateExam: async (id: number, data: UpdateExamMasterDto) => {
    const response = await api.put<ExamMaster>(API_ENDPOINTS.EXAMINATION.EXAM_BY_ID(id), data);
    return response.data;
  },

  deleteExam: async (id: number) => {
    const response = await api.delete<void>(API_ENDPOINTS.EXAMINATION.EXAM_BY_ID(id));
    return response.data;
  },

  getExamById: async (id: number) => {
    const response = await api.get<ExamMaster>(API_ENDPOINTS.EXAMINATION.EXAM_BY_ID(id));
    return response.data;
  },

  getExams: async (page?: number, limit?: number) => {
    const response = await api.get<{ items: ExamMaster[]; total: number } | ExamMaster[]>(
      API_ENDPOINTS.EXAMINATION.EXAMS,
      { params: { page, limit } }
    );
    // Handle array or paginated response format gracefully
    const body = response.data;
    if (Array.isArray(body)) return body;
    if (body && Array.isArray((body as any).data)) return (body as any).data;
    if (body && Array.isArray((body as any).items)) return (body as any).items;
    return [];
  },

  // --- Exam Subjects ---
  createExamSubjects: async (data: CreateExamSubjectDto) => {
    const response = await api.post<ExamSubjectDetail[]>(API_ENDPOINTS.EXAMINATION.EXAM_SUBJECT, data);
    return response.data;
  },

  updateExamSubject: async (id: number, data: UpdateExamSubjectItemDto) => {
    const response = await api.put<ExamSubjectDetail>(API_ENDPOINTS.EXAMINATION.EXAM_SUBJECT_BY_ID(id), data);
    return response.data;
  },

  deleteExamSubject: async (id: number) => {
    const response = await api.delete<void>(API_ENDPOINTS.EXAMINATION.EXAM_SUBJECT_BY_ID(id));
    return response.data;
  },

  getExamSubjects: async (session: string, examId: number, classId?: number) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.EXAM_SUBJECTS, {
      params: { session, examId, classId },
    });
    const body = response.data;
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.data)) return body.data;
    if (body && Array.isArray(body.items)) return body.items;
    return [];
  },

  // --- Grade Master ---
  configureGrades: async (data: CreateGradeMstrDto) => {
    const response = await api.post<GradeConfig[]>(API_ENDPOINTS.EXAMINATION.GRADE_CONFIG, data);
    return response.data;
  },

  getGrades: async (session: string) => {
    const response = await api.get<GradeConfig[]>(API_ENDPOINTS.EXAMINATION.GRADE_CONFIG, {
      params: { session },
    });
    return response.data;
  },

  deleteGrade: async (id: number) => {
    const response = await api.delete<void>(API_ENDPOINTS.EXAMINATION.GRADE_CONFIG_BY_ID(id));
    return response.data;
  },

  // --- Exam Type ---
  createExamType: async (data: CreateExamTypeDto) => {
    const response = await api.post<ExamType>(API_ENDPOINTS.EXAMINATION.EXAM_TYPE, data);
    return response.data;
  },

  updateExamType: async (id: number, data: UpdateExamTypeDto) => {
    const response = await api.put<ExamType>(API_ENDPOINTS.EXAMINATION.EXAM_TYPE_BY_ID(id), data);
    return response.data;
  },

  getExamTypeById: async (id: number) => {
    const response = await api.get<ExamType>(API_ENDPOINTS.EXAMINATION.EXAM_TYPE_BY_ID(id));
    return response.data;
  },

  deleteExamType: async (id: number) => {
    const response = await api.delete<void>(API_ENDPOINTS.EXAMINATION.EXAM_TYPE_BY_ID(id));
    return response.data;
  },

  getExamTypes: async (page?: number, limit?: number) => {
    const response = await api.get<any>(
      API_ENDPOINTS.EXAMINATION.EXAM_TYPES,
      { params: { page, limit } }
    );
    const body = response.data;
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.data)) return body.data;
    if (body && Array.isArray(body.items)) return body.items;
    return [];
  },

  // --- Schedules ---
  createSchedules: async (data: CreateExamScheduleDto) => {
    const response = await api.post<ExamSchedule[]>(API_ENDPOINTS.EXAMINATION.SCHEDULE, data);
    return response.data;
  },

  updateSchedule: async (id: number, data: UpdateExamScheduleDto) => {
    const response = await api.put<ExamSchedule>(API_ENDPOINTS.EXAMINATION.SCHEDULE_BY_ID(id), data);
    return response.data;
  },

  deleteSchedule: async (id: number) => {
    const response = await api.delete<void>(API_ENDPOINTS.EXAMINATION.SCHEDULE_BY_ID(id));
    return response.data;
  },

  getSchedules: async (query: ExamScheduleQueryDto) => {
    const response = await api.get<{ items: ExamSchedule[]; total: number } | ExamSchedule[]>(
      API_ENDPOINTS.EXAMINATION.SCHEDULE,
      { params: query }
    );
    return Array.isArray(response.data) ? response.data : (response.data as any).items || [];
  },

  getStudentSchedule: async (session: string) => {
    const response = await api.get<ExamSchedule[]>(API_ENDPOINTS.EXAMINATION.SCHEDULE_STUDENT, {
      params: { session },
    });
    return response.data;
  },

  // --- Marks Entry ---
  enterMarks: async (data: CreateMarksEntryDto) => {
    const response = await api.post<MarksEntry[]>(API_ENDPOINTS.EXAMINATION.MARKS, data);
    return response.data;
  },

  updateMark: async (id: number, data: UpdateMarksDto) => {
    const response = await api.put<MarksEntry>(API_ENDPOINTS.EXAMINATION.MARKS_BY_ID(id), data);
    return response.data;
  },

  markAbsent: async (data: BulkAbsentDto) => {
    const response = await api.put<MarksEntry[]>(API_ENDPOINTS.EXAMINATION.MARKS_BULK_ABSENT, data);
    return response.data;
  },

  lockMarks: async (data: LockMarksDto) => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.EXAMINATION.MARKS_LOCK, data);
    return response.data;
  },

  unlockMarks: async (data: LockMarksDto) => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.EXAMINATION.MARKS_UNLOCK, data);
    return response.data;
  },

  getMarks: async (examId: number, classId: number, classSectionId: number, subjectId?: number) => {
    const response = await api.get<MarksEntry[]>(API_ENDPOINTS.EXAMINATION.MARKS, {
      params: { examId, classId, classSectionId, subjectId },
    });
    return response.data;
  },

  getCompletionStatus: async (examId: number, session: string) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.MARKS_COMPLETION, {
      params: { examId, session },
    });
    return response.data;
  },

  getStudentMarks: async (studentId: string, session: string) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.MARKS_STUDENT(studentId), {
      params: { session },
    });
    return response.data;
  },

  // --- Results ---
  generateResults: async (data: GenerateResultDto) => {
    const response = await api.post<any>(API_ENDPOINTS.EXAMINATION.RESULT_GENERATE, data);
    return response.data;
  },

  getClassResults: async (examId: number, classId: number, classSectionId: number) => {
    const response = await api.get<ExamResult[]>(API_ENDPOINTS.EXAMINATION.RESULT_CLASS, {
      params: { examId, classId, classSectionId },
    });
    return response.data;
  },

  updateTeacherRemarks: async (id: number, remarks: string) => {
    const response = await api.put<ExamResult>(API_ENDPOINTS.EXAMINATION.RESULT_TEACHER_REMARKS(id), { remarks });
    return response.data;
  },

  updatePrincipalRemarks: async (id: number, remarks: string) => {
    const response = await api.put<ExamResult>(API_ENDPOINTS.EXAMINATION.RESULT_PRINCIPAL_REMARKS(id), { remarks });
    return response.data;
  },

  publishResults: async (data: PublishResultDto) => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.EXAMINATION.RESULT_PUBLISH, data);
    return response.data;
  },

  unpublishResults: async (data: PublishResultDto) => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.EXAMINATION.RESULT_UNPUBLISH, data);
    return response.data;
  },

  getReportCard: async (studentId: string, examId: number, session: string) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.RESULT_REPORT_CARD(studentId), {
      params: { examId, session },
    });
    return response.data;
  },

  // --- Analytics ---
  getStudentPerformance: async (studentId: string, query: AnalyticsQueryDto) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.ANALYTICS_STUDENT(studentId), { params: query });
    return response.data;
  },

  getClassOverview: async (query: AnalyticsQueryDto) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.ANALYTICS_CLASS, { params: query });
    return response.data;
  },

  getSubjectAnalysis: async (query: AnalyticsQueryDto) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.ANALYTICS_SUBJECT, { params: query });
    return response.data;
  },

  getToppers: async (query: AnalyticsQueryDto) => {
    const response = await api.get<any>(API_ENDPOINTS.EXAMINATION.ANALYTICS_TOPPERS, { params: query });
    return response.data;
  },
};
