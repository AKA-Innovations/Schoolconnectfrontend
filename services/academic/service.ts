import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  SubjectChapter,
  CreateSubjectChapterPayload,
  UpdateSubjectChapterPayload,
  SubjectTopic,
  CreateSubjectTopicPayload,
  UpdateSubjectTopicPayload,
  TeachingProgress,
  CreateTeachingProgressPayload,
  UpdateTeachingProgressPayload,
  Homework,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  HomeworkDocument,
  HomeworkSubmission,
  CreateHomeworkSubmissionPayload,
  UpdateHomeworkSubmissionPayload,
  Classwork,
  CreateClassworkPayload,
  UpdateClassworkPayload,
  TeacherStudyMaterial,
  UpdateStudyMaterialPayload,
} from './types';

export const academicService = {
  // ─── Subject Chapters ──────────────────────────────────────────────────────

  getSubjectChapters: async (className?: string): Promise<SubjectChapter[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.SUBJECT_CHAPTER, {
      params: className ? { className } : undefined,
    });
    return response.data ?? [];
  },

  createSubjectChapter: async (data: CreateSubjectChapterPayload): Promise<SubjectChapter> => {
    const response = await api.post(API_ENDPOINTS.ACADEMIC.SUBJECT_CHAPTER, data);
    return response.data;
  },

  updateSubjectChapter: async (id: number, data: UpdateSubjectChapterPayload): Promise<SubjectChapter> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.SUBJECT_CHAPTER_BY_ID(id), data);
    return response.data;
  },

  deleteSubjectChapter: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.SUBJECT_CHAPTER_BY_ID(id));
  },

  // ─── Subject Topics ────────────────────────────────────────────────────────

  getSubjectTopics: async (chapterId?: string): Promise<SubjectTopic[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.SUBJECT_TOPIC, {
      params: chapterId ? { chapterId } : undefined,
    });
    return response.data ?? [];
  },

  createSubjectTopic: async (data: CreateSubjectTopicPayload): Promise<SubjectTopic> => {
    const response = await api.post(API_ENDPOINTS.ACADEMIC.SUBJECT_TOPIC, data);
    return response.data;
  },

  updateSubjectTopic: async (id: number, data: UpdateSubjectTopicPayload): Promise<SubjectTopic> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.SUBJECT_TOPIC_BY_ID(id), data);
    return response.data;
  },

  deleteSubjectTopic: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.SUBJECT_TOPIC_BY_ID(id));
  },

  // ─── Teaching Progress ─────────────────────────────────────────────────────

  getTeachingProgress: async (teacherId?: string): Promise<TeachingProgress[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.TEACHING_PROGRESS, {
      params: teacherId ? { teacherId } : undefined,
    });
    return response.data ?? [];
  },

  createTeachingProgress: async (data: CreateTeachingProgressPayload): Promise<TeachingProgress> => {
    const response = await api.post(API_ENDPOINTS.ACADEMIC.TEACHING_PROGRESS, data);
    return response.data;
  },

  updateTeachingProgress: async (id: number, data: UpdateTeachingProgressPayload): Promise<TeachingProgress> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.TEACHING_PROGRESS_BY_ID(id), data);
    return response.data;
  },

  deleteTeachingProgress: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.TEACHING_PROGRESS_BY_ID(id));
  },

  // ─── Homework ──────────────────────────────────────────────────────────────

  getHomeworks: async (className?: string): Promise<Homework[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.HOMEWORK, {
      params: className ? { className } : undefined,
    });
    return response.data ?? [];
  },

  createHomework: async (data: CreateHomeworkPayload): Promise<Homework> => {
    const response = await api.post(API_ENDPOINTS.ACADEMIC.HOMEWORK, data);
    return response.data;
  },

  updateHomework: async (id: number, data: UpdateHomeworkPayload): Promise<Homework> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.HOMEWORK_BY_ID(id), data);
    return response.data;
  },

  deleteHomework: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.HOMEWORK_BY_ID(id));
  },

  // ─── Homework Documents ────────────────────────────────────────────────────

  getHomeworkDocuments: async (homeworkId: number): Promise<HomeworkDocument[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.HOMEWORK_DOCUMENT_BY_HW_ID(homeworkId));
    return response.data ?? [];
  },

  uploadHomeworkDocument: async (data: {
    session: string;
    homeworkId: number;
    studentId: string;
    file: File;
  }): Promise<HomeworkDocument> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('session', data.session);
    formData.append('homeworkId', String(data.homeworkId));
    formData.append('studentId', data.studentId);
    const response = await api.post(API_ENDPOINTS.ACADEMIC.HOMEWORK_DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteHomeworkDocument: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.HOMEWORK_DOCUMENT_BY_ID(id));
  },

  // ─── Homework Submissions ──────────────────────────────────────────────────

  getHomeworkSubmissions: async (homeworkId: number): Promise<HomeworkSubmission[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.HOMEWORK_SUBMISSION_BY_HW_ID(homeworkId));
    return response.data ?? [];
  },

  createHomeworkSubmission: async (data: CreateHomeworkSubmissionPayload): Promise<HomeworkSubmission> => {
    const response = await api.post(API_ENDPOINTS.ACADEMIC.HOMEWORK_SUBMISSION, data);
    return response.data;
  },

  updateHomeworkSubmission: async (id: number, data: UpdateHomeworkSubmissionPayload): Promise<HomeworkSubmission> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.HOMEWORK_SUBMISSION_BY_ID(id), data);
    return response.data;
  },

  deleteHomeworkSubmission: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.HOMEWORK_SUBMISSION_BY_ID(id));
  },

  // ─── Classwork ─────────────────────────────────────────────────────────────

  getClassworks: async (classId?: string): Promise<Classwork[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.CLASSWORK, {
      params: classId ? { classId } : undefined,
    });
    return response.data ?? [];
  },

  createClasswork: async (data: CreateClassworkPayload): Promise<Classwork> => {
    const response = await api.post(API_ENDPOINTS.ACADEMIC.CLASSWORK, data);
    return response.data;
  },

  updateClasswork: async (id: number, data: UpdateClassworkPayload): Promise<Classwork> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.CLASSWORK_BY_ID(id), data);
    return response.data;
  },

  deleteClasswork: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.CLASSWORK_BY_ID(id));
  },

  // ─── Teacher Study Material ────────────────────────────────────────────────

  getStudyMaterials: async (classId?: string): Promise<TeacherStudyMaterial[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL, {
      params: classId ? { classId } : undefined,
    });
    return response.data ?? [];
  },

  uploadStudyMaterial: async (data: {
    session: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    chapterId?: number;
    topicId?: number;
    description: string;
    teacherId: string;
    file: File;
  }): Promise<TeacherStudyMaterial> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('session', data.session);
    formData.append('classId', data.classId);
    formData.append('sectionId', data.sectionId);
    formData.append('subjectId', data.subjectId);
    if (data.chapterId != null) formData.append('chapterId', String(data.chapterId));
    if (data.topicId != null) formData.append('topicId', String(data.topicId));
    formData.append('description', data.description);
    formData.append('teacherId', data.teacherId);
    const response = await api.post(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateStudyMaterial: async (id: number, data: UpdateStudyMaterialPayload): Promise<TeacherStudyMaterial> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL_BY_ID(id), data);
    return response.data;
  },

  deleteStudyMaterial: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL_BY_ID(id));
  },
};
