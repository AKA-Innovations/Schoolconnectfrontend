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
  HomeworkAttachment,
  HomeworkDocument,
  HomeworkSubmission,
  CreateHomeworkSubmissionPayload,
  UpdateHomeworkSubmissionPayload,
  Classwork,
  CreateClassworkPayload,
  UpdateClassworkPayload,
  StudyMaterial,
  UploadStudyMaterialPayload,
  UpdateStudyMaterialPayload,
  SubjectProgressSummary,
  ChapterProgressSummary,
} from './types';

export const academicService = {
  // ─── Subject Chapters ──────────────────────────────────────────────────────

  getSubjectChapters: async (subjectId?: number | string, session?: string): Promise<SubjectChapter[]> => {
    if (!subjectId || !session) return [];
    const response = await api.get(API_ENDPOINTS.ACADEMIC.SUBJECT_CHAPTER, {
      params: { subjectId, session },
    });
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.chapters && Array.isArray(raw.chapters)) return raw.chapters;
    return [];
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

  getSubjectTopics: async (chapterId: number | string, subjectId?: number | string, session?: string): Promise<SubjectTopic[]> => {
    if (!chapterId || !subjectId || !session) return [];
    const response = await api.get(API_ENDPOINTS.ACADEMIC.SUBJECT_TOPIC, {
      params: { chapterId, subjectId, session },
    });

    const raw = response.data;
    console.log("raw", raw)
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.topics && Array.isArray(raw.topics)) return raw.topics;
    return [];
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

  getSubjectProgress: async (subjectId: number | string, classSectionId: number | string, session?: string): Promise<SubjectProgressSummary | null> => {
    if (!subjectId || !classSectionId) return null;
    const response = await api.get(API_ENDPOINTS.ACADEMIC.SUBJECT_PROGRESS, {
      params: { subjectId, classSectionId, session },
    });
    return response.data;
  },

  getChapterProgress: async (chapterId: number | string, classSectionId: number | string, session?: string): Promise<ChapterProgressSummary | null> => {
    if (!chapterId || !classSectionId) return null;
    const response = await api.get(API_ENDPOINTS.ACADEMIC.CHAPTER_PROGRESS, {
      params: { chapterId, classSectionId, session },
    });
    return response.data;
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
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.homeworks && Array.isArray(raw.homeworks)) return raw.homeworks;
    return [];
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

  // ─── Homework Attachments (Teacher uploads) ────────────────────────────────
  getHomeworkAttachments: async (homeworkId: number): Promise<HomeworkAttachment[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.HOMEWORK_ATTACHMENT, {
      params: { homeworkId }
    });
    return response.data ?? [];
  },

  uploadHomeworkAttachment: async (data: {
    session: string;
    homeworkId: number;
    file: File;
  }): Promise<HomeworkAttachment> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('session', data.session);
    formData.append('homeworkId', String(data.homeworkId));
    const response = await api.post(API_ENDPOINTS.ACADEMIC.HOMEWORK_ATTACHMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteHomeworkAttachment: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.HOMEWORK_ATTACHMENT_BY_ID(id));
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
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.classworks && Array.isArray(raw.classworks)) return raw.classworks;
    return [];
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

  // ─── Study Material ───────────────────────────────────────────────────────

  getStudyMaterials: async (): Promise<StudyMaterial[]> => {
    const response = await api.get(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL);
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.materials && Array.isArray(raw.materials)) return raw.materials;
    return [];
  },

  uploadStudyMaterial: async (data: UploadStudyMaterialPayload): Promise<StudyMaterial> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    const response = await api.post(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateStudyMaterial: async (id: number, data: UpdateStudyMaterialPayload): Promise<StudyMaterial> => {
    const response = await api.put(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL_BY_ID(id), data);
    return response.data;
  },

  deleteStudyMaterial: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ACADEMIC.STUDY_MATERIAL_BY_ID(id));
  },
};
