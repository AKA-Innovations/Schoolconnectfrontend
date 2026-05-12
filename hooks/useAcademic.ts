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
  UpdateClassworkPayload,
  StudyMaterial,
  UploadStudyMaterialPayload,
  UpdateStudyMaterialPayload,
  SubjectProgressSummary,
  ChapterProgressSummary,
} from '@/services/academic/types';

// ─── Query key factories ──────────────────────────────────────────────────────

export const academicKeys = {
  all: ['academic'] as const,
  chapters: (subjectId?: number | string, session?: string) => ['academic', 'chapters', subjectId, session] as const,
  topics: (chapterId?: number | string, subjectId?: number | string, session?: string) => ['academic', 'topics', chapterId, subjectId, session] as const,
  subjectProgress: (subjectId?: number | string, classSectionId?: number | string, session?: string) => ['academic', 'subject-progress', subjectId, classSectionId, session] as const,
  chapterProgress: (chapterId?: number | string, classSectionId?: number | string, session?: string) => ['academic', 'chapter-progress', chapterId, classSectionId, session] as const,
  homeworks: (className?: string) => ['academic', 'homeworks', className] as const,
  homeworkDocs: (hwId: number) => ['academic', 'hw-docs', hwId] as const,
  homeworkAttachments: (hwId: number) => ['academic', 'hw-attachments', hwId] as const,
  homeworkSubs: (hwId: number) => ['academic', 'hw-subs', hwId] as const,
  classworks: (classId?: string) => ['academic', 'classworks', classId] as const,
  materials: (classId?: string) => ['academic', 'materials', classId] as const,
};

// ─── Subject Chapters ─────────────────────────────────────────────────────────

export function useSubjectChapters(subjectId?: number | string, session?: string) {
  return useQuery({
    queryKey: academicKeys.chapters(subjectId, session),
    queryFn: () => academicService.getSubjectChapters(subjectId, session),
    placeholderData: (prev) => prev,
    enabled: !!subjectId && !!session,
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

export function useSubjectTopics(chapterId?: number | string, subjectId?: number | string, session?: string) {
  return useQuery({
    queryKey: academicKeys.topics(chapterId, subjectId, session),
    queryFn: () => academicService.getSubjectTopics(chapterId!, subjectId, session),
    placeholderData: (prev) => prev,
    enabled: !!chapterId && !!subjectId && !!session,
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

// ─── Subject & Chapter Progress (aggregated) ──────────────────────────────────

export function useSubjectProgress(subjectId?: number | string, classSectionId?: number | string, session?: string) {
  return useQuery({
    queryKey: academicKeys.subjectProgress(subjectId, classSectionId, session),
    queryFn: () => academicService.getSubjectProgress(subjectId!, classSectionId!, session),
    enabled: !!subjectId && !!classSectionId,
  });
}

export function useChapterProgress(chapterId?: number | string, classSectionId?: number | string, session?: string) {
  return useQuery({
    queryKey: academicKeys.chapterProgress(chapterId, classSectionId, session),
    queryFn: () => academicService.getChapterProgress(chapterId!, classSectionId!, session),
    enabled: !!chapterId && !!classSectionId,
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

export function useDeleteHomework(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => academicService.deleteHomework(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic', 'homeworks'] }),
  });
}

// ─── Homework Attachments ───────────────────────────────────────────────────

export function useHomeworkAttachments(homeworkId: number) {
  return useQuery({
    queryKey: academicKeys.homeworkAttachments(homeworkId),
    queryFn: () => academicService.getHomeworkAttachments(homeworkId),
    enabled: !!homeworkId,
  });
}

export function useUploadHomeworkAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { session: string; homeworkId: number; file: File }) =>
      academicService.uploadHomeworkAttachment(data),
    onSuccess: (_, variables) =>
      qc.invalidateQueries({ queryKey: academicKeys.homeworkAttachments(variables.homeworkId) }),
  });
}

export function useDeleteHomeworkAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, homeworkId }: { id: number; homeworkId: number }) =>
      academicService.deleteHomeworkAttachment(id),
    onSuccess: (_, variables) =>
      qc.invalidateQueries({ queryKey: academicKeys.homeworkAttachments(variables.homeworkId) }),
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

// ─── Study Material ──────────────────────────────────────────────────────────

export function useStudyMaterials() {
  return useQuery({
    queryKey: academicKeys.materials(),
    queryFn: () => academicService.getStudyMaterials(),
  });
}

export function useUploadStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadStudyMaterialPayload) => academicService.uploadStudyMaterial(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.materials() }),
  });
}

export function useUpdateStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudyMaterialPayload }) =>
      academicService.updateStudyMaterial(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.materials() }),
  });
}

export function useDeleteStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => academicService.deleteStudyMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: academicKeys.materials() }),
  });
}
