export interface Exam {
  id?: number;
  session: string;
  examName: string;
  examType: 'Theory' | 'Practical' | 'Viva' | 'Internal' | 'Oral' | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamSchedule {
  id?: number;
  examId: number;
  classSectionId: number;
  subjectId: number;
  examDate: string; // ISO String
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface ExamSchedulePayload {
  session: string;
  schedules: ExamSchedule[];
}

export interface ExamResult {
  id?: number;
  examId: number;
  classSectionId: number;
  subjectId: number;
  studentId: string;
  marksObtained?: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  status?: 'AB' | 'ML' | 'EXEMPT' | 'PRESENT';
}

export interface ExamResultPayload {
  session: string;
  results: ExamResult[];
}

// Frontend grouping helper type
export interface ExamGroup {
  examName: string;
  types: Exam[];
}
