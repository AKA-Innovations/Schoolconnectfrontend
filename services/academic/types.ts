// ─── SubjectChapter ─────────────────────────────────────────────────────────

export interface SubjectChapter {
  id: number;
  session: string;
  schoolId: string;
  className: string;
  subjectId: string;
  chapterName: string;
  sequenceNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDetail {
  chapterName: string;
  sequenceNo: number;
}

export interface CreateSubjectChapterPayload {
  session: string;
  subjectId: number;
  chapters: ChapterDetail[];
}

export interface UpdateSubjectChapterPayload {
  chapterName?: string;
  sequenceNo?: number;
}

// ─── SubjectTopic ───────────────────────────────────────────────────────────

export interface SubjectTopic {
  id: number;
  session: string;
  schoolId: string;
  className: string;
  subjectId: string;
  chapterId: number;
  topicName: string;
  sequenceNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicDetail {
  topicName: string;
  sequenceNo: number;
}

export interface CreateSubjectTopicPayload {
  session: string;
  subjectId: number;
  chapterId: number;
  topics: TopicDetail[];
}

export interface UpdateSubjectTopicPayload {
  topicName?: string;
  sequenceNo?: number;
}

// ─── TeachingProgress ───────────────────────────────────────────────────────

export type ProgressStatus = 'not_started' | 'IN_PROGRESS' | 'completed';

export interface TeachingProgress {
  id: number;
  session: string;
  schoolId: string;
  classSectionId: number;
  subjectId: number;
  chapterId: number;
  topicId: number;
  status: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeachingProgressPayload {
  session: string;
  classSectionId: number;
  subjectId: number;
  chapterId: number;
  topicId?: number;
  status: string;
  completionPercentage: number;
}

export interface UpdateTeachingProgressPayload {
  status?: string;
  completionPercentage?: number;
  completedOn?: string;
}

// ─── Progress Summaries ─────────────────────────────────────────────────────

export interface SubjectProgressSummary {
  totalTopics: number;
  completedTopics: number;
  overallPercentage: number;
  completedSubjects?: number;
  chapters?: {
    chapterId: number;
    chapterName: string;
    totalTopics: number;
    completedTopics: number;
    completionPercentage: number;
  }[];
}

export interface TopicProgressSummary {
  id?: number;
  topicId: number;
  topicName: string;
  status: string;
  completionPercentage: number;
  completedOn?: string;
}

export interface ChapterProgressSummary {
  id?: number;
  chapterId: number;
  chapterName?: string;
  status: string;
  completionPercentage: number;
  topicsCount: number;
  topics?: TopicProgressSummary[];
}

// ─── Homework ───────────────────────────────────────────────────────────────

export interface Homework {
  id: number;
  session: string;
  schoolId: string;
  className: string;
  sectionName: string;
  subjectId: string;
  chapterId: number | null;
  topicId: number | null;
  title: string;
  description: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeworkPayload {
  session: string;
  classSectionId: number;
  subjectId: number;
  chapterId?: number;
  topicId?: number;
  title: string;
  description: string;
  dueDate: string;
}

export interface UpdateHomeworkPayload {
  title?: string;
  description?: string;
  dueDate?: string;
}

// ─── HomeworkAttachment ─────────────────────────────────────────────────────
export interface HomeworkAttachment {
  id: number;
  session: string;
  homeworkId: number;
  documentPath: string;
  signedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── HomeworkDocument ───────────────────────────────────────────────────────

export interface HomeworkDocument {
  id: number;
  session: string;
  homeworkId: number;
  studentId: string;
  documentUrl: string;
  signedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadHomeworkDocumentPayload {
  session: string;
  homeworkId: number;
  studentId: string;
  file: File;
}

// ─── HomeworkSubmission ─────────────────────────────────────────────────────

export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed' | 'late';

export enum HomeworkStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  LATE = 'late',
  NOT_SUBMITTED = 'not_submitted',
}

export interface HomeworkSubmission {
  id: number;
  session: string;
  homeworkId: number;
  studentId: string;
  remarks: string | null;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeworkSubmissionPayload {
  session: string;
  homeworkId: number;
  studentId: string;
  remarks?: string;
  status: string;
  submittedAt?: string;
}

export interface UpdateHomeworkSubmissionPayload {
  remarks?: string;
  status?: string;
  submittedAt?: string;
}

// ─── Classwork ──────────────────────────────────────────────────────────────

export interface Classwork {
  id: number;
  session: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  chapterId: number | null;
  topicId: number | null;
  description: string;
  conductedOn: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassworkPayload {
  session: string;
  classSectionId: number;
  subjectId: number;
  chapterId?: number;
  topicId?: number;
  description: string;
}

export interface UpdateClassworkPayload {
  description?: string;
  conductedOn?: string;
}

// ─── StudyMaterial ──────────────────────────────────────────────────────────
export interface StudyMaterial {
  id: number;
  session: string;
  classId: number;
  classSectionId: number;
  subjectId: number;
  chapterId?: number;
  topicId?: number;
  teacherId?: string;
  description: string;
  documentPath: string;
  signedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadStudyMaterialPayload {
  session: string;
  classId: number;
  classSectionId: number;
  subjectId: number;
  chapterId?: number;
  topicId?: number;
  title: string;
  description: string;
  file: File;
}

export interface UpdateStudyMaterialPayload {
  title?: string;
  description?: string;
  classId?: number;
  classSectionId?: number;
  subjectId?: number;
  chapterId?: number | null;
  topicId?: number | null;
  file?: File;
}

// ─── Filter Params ──────────────────────────────────────────────────────────

export interface AcademicFilterParams {
  className?: string;
  sectionName?: string;
  subjectId?: string;
  chapterId?: string;
  teacherId?: string;
  classId?: string;
  search?: string;
}
