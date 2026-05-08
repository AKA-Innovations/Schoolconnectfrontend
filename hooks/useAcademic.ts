import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import type {
  CreateSubjectChapterPayload,
  UpdateSubjectChapterPayload,
  CreateSubjectTopicPayload,
  UpdateSubjectTopicPayload,
  CreateTeachingProgressPayload,
  UpdateTeachingProgressPayload,
  CreateHomeworkPayload,
  UpdateHomeworkPayload,
  CreateHomeworkSubmissionPayload,
  UpdateHomeworkSubmissionPayload,
  CreateClassworkPayload,
  UpdateClassworkPayload,
  UpdateStudyMaterialPayload,
} from '@/services/academic/types';

// ─── Query key factories ──────────────────────────────────────────────────────

export const academicKeys = {
  all: ['academic'] as const,
  chapters: (className?: string) => ['academic', 'chapters', className] as const,
  topics: (chapterId?: string) => ['academic', 'topics', chapterId] as const,
  progress: (teacherId?: string) => ['academic', 'progress', teacherId] as const,
  homeworks: (className?: string) => ['academic', 'homeworks', className] as const,
  homeworkDocs: (hwId: number) => ['academic', 'hw-docs', hwId] as const,
  homeworkSubs: (hwId: number) => ['academic', 'hw-subs', hwId] as const,
  classworks: (classId?: string) => ['academic', 'classworks', classId] as const,
  materials: (classId?: string) => ['academic', 'materials', classId] as const,
};

// ─── Subject Chapters ─────────────────────────────────────────────────────────

export function useSubjectChapters(className?: string) {
  return useQuery({
    queryKey: academicKeys.chapters(className),
    queryFn: () => academicService.getSubjectChapters(className),
    placeholderData: (prev) => prev,
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectChapterPayload) => academicService.createSubjectChapter(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'chapters'] }),
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubjectChapterPayload }) =>
      academicService.updateSubjectChapter(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'chapters'] }),
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteSubjectChapter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'chapters'] }),
  });
}

// ─── Subject Topics ───────────────────────────────────────────────────────────

export function useSubjectTopics(chapterId?: string) {
  return useQuery({
    queryKey: academicKeys.topics(chapterId),
    queryFn: () => academicService.getSubjectTopics(chapterId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectTopicPayload) => academicService.createSubjectTopic(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'topics'] }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubjectTopicPayload }) =>
      academicService.updateSubjectTopic(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'topics'] }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteSubjectTopic(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'topics'] }),
  });
}

// ─── Teaching Progress ────────────────────────────────────────────────────────

export function useTeachingProgress(teacherId?: string) {
  return useQuery({
    queryKey: academicKeys.progress(teacherId),
    queryFn: () => academicService.getTeachingProgress(teacherId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeachingProgressPayload) => academicService.createTeachingProgress(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'progress'] }),
  });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTeachingProgressPayload }) =>
      academicService.updateTeachingProgress(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'progress'] }),
  });
}

export function useDeleteProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteTeachingProgress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'progress'] }),
  });
}

// ─── Homework ─────────────────────────────────────────────────────────────────

export function useHomeworks(className?: string) {
  return useQuery({
    queryKey: academicKeys.homeworks(className),
    queryFn: () => academicService.getHomeworks(className),
    placeholderData: (prev) => prev,
  });
}

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHomeworkPayload) => academicService.createHomework(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'homeworks'] }),
  });
}

export function useUpdateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHomeworkPayload }) =>
      academicService.updateHomework(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'homeworks'] }),
  });
}

export function useDeleteHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteHomework(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'homeworks'] }),
  });
}

// ─── Homework Documents ───────────────────────────────────────────────────────

export function useHomeworkDocuments(homeworkId: number) {
  return useQuery({
    queryKey: academicKeys.homeworkDocs(homeworkId),
    queryFn: () => academicService.getHomeworkDocuments(homeworkId),
    enabled: homeworkId > 0,
  });
}

export function useUploadHomeworkDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { session: string; homeworkId: number; studentId: string; file: File }) =>
      academicService.uploadHomeworkDocument(data),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: academicKeys.homeworkDocs(vars.homeworkId) }),
  });
}

export function useDeleteHomeworkDocument(homeworkId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteHomeworkDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.homeworkDocs(homeworkId) }),
  });
}

// ─── Homework Submissions ─────────────────────────────────────────────────────

export function useHomeworkSubmissions(homeworkId: number) {
  return useQuery({
    queryKey: academicKeys.homeworkSubs(homeworkId),
    queryFn: () => academicService.getHomeworkSubmissions(homeworkId),
    enabled: homeworkId > 0,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHomeworkSubmissionPayload) => academicService.createHomeworkSubmission(data),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: academicKeys.homeworkSubs(vars.homeworkId) }),
  });
}

export function useUpdateSubmission(homeworkId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHomeworkSubmissionPayload }) =>
      academicService.updateHomeworkSubmission(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.homeworkSubs(homeworkId) }),
  });
}

export function useDeleteSubmission(homeworkId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteHomeworkSubmission(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.homeworkSubs(homeworkId) }),
  });
}

// ─── Classwork ────────────────────────────────────────────────────────────────

export function useClassworks(classId?: string) {
  return useQuery({
    queryKey: academicKeys.classworks(classId),
    queryFn: () => academicService.getClassworks(classId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateClasswork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassworkPayload) => academicService.createClasswork(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'classworks'] }),
  });
}

export function useUpdateClasswork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassworkPayload }) =>
      academicService.updateClasswork(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'classworks'] }),
  });
}

export function useDeleteClasswork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteClasswork(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'classworks'] }),
  });
}

// ─── Teacher Study Material ───────────────────────────────────────────────────

export function useStudyMaterials(classId?: string) {
  return useQuery({
    queryKey: academicKeys.materials(classId),
    queryFn: () => academicService.getStudyMaterials(classId),
    placeholderData: (prev) => prev,
  });
}

export function useUploadStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      session: string;
      classId: string;
      sectionId: string;
      subjectId: string;
      chapterId?: number;
      topicId?: number;
      description: string;
      teacherId: string;
      file: File;
    }) => academicService.uploadStudyMaterial(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'materials'] }),
  });
}

export function useUpdateStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudyMaterialPayload }) =>
      academicService.updateStudyMaterial(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'materials'] }),
  });
}

export function useDeleteStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteStudyMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'materials'] }),
  });
}
