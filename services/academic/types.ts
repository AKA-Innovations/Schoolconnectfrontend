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
  className: string;
  sectionName: string;
  subjectId: string;
  chapterDetails: ChapterDetail[];
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
  className: string;
  sectionName: string;
  subjectId: string;
  chapterId: number;
  topicDetails: TopicDetail[];
}

export interface UpdateSubjectTopicPayload {
  topicName?: string;
  sequenceNo?: number;
}

// ─── TeachingProgress ───────────────────────────────────────────────────────

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface TeachingProgress {
  id: number;
  session: string;
  schoolId: string;
  className: string;
  sectionName: string;
  subjectId: string;
  chapterId: number;
  topicId: number;
  teacherId: string;
  status: string;
  completedOn: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeachingProgressPayload {
  session: string;
  className: string;
  sectionName: string;
  subjectId: string;
  chapterId: number;
  topicId: number;
  teacherId: string;
  status: string;
  completedOn?: string;
}

export interface UpdateTeachingProgressPayload {
  status?: string;
  completedOn?: string;
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
  className: string;
  sectionName: string;
  subjectId: string;
  chapterId?: number;
  topicId?: number;
  title: string;
  description: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
}

export interface UpdateHomeworkPayload {
  title?: string;
  description?: string;
  dueDate?: string;
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
  classId: string;
  sectionId: string;
  subjectId: string;
  chapterId?: number;
  topicId?: number;
  description: string;
  conductedOn: string;
  teacherId: string;
}

export interface UpdateClassworkPayload {
  description?: string;
  conductedOn?: string;
}

// ─── TeacherStudyMaterial ───────────────────────────────────────────────────

export interface TeacherStudyMaterial {
  id: number;
  session: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  chapterId: number | null;
  topicId: number | null;
  description: string;
  documentPath: string;
  signedUrl?: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadStudyMaterialPayload {
  session: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  chapterId?: number;
  topicId?: number;
  description: string;
  teacherId: string;
  file: File;
}

export interface UpdateStudyMaterialPayload {
  description?: string;
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
