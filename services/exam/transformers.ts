import { Exam, ExamSchedule, ExamSchedulePayload, ExamResultPayload, ExamResult } from '@/types/exam.types';

/**
 * Transforms a multi-type exam creation form into an array of individual API payloads
 * e.g., First Term + [Theory, Practical] -> [{First Term, Theory}, {First Term, Practical}]
 */
export const transformExamCreationToPayloads = (session: string, examName: string, examTypes: string[]): Omit<Exam, 'id'>[] => {
  return examTypes.map(type => ({
    session,
    examName,
    examType: type
  }));
};

/**
 * Groups a flat list of exams by their examName
 * e.g., [{First Term, Theory}, {First Term, Practical}] -> [{examName: 'First Term', types: [...]}]
 */
export const groupExamsByName = (exams: Exam[]) => {
  const grouped = exams.reduce((acc, exam) => {
    if (!acc[exam.examName]) {
      acc[exam.examName] = { examName: exam.examName, types: [] };
    }
    acc[exam.examName].types.push(exam);
    return acc;
  }, {} as Record<string, { examName: string; types: Exam[] }>);
  
  return Object.values(grouped);
};

/**
 * Expands a single schedule rule (e.g. Class 10 Maths on 10 Sep) into schedules for all sections
 */
export const expandScheduleToSections = (
  baseSchedule: Omit<ExamSchedule, 'id' | 'classSectionId'>, 
  sectionIds: number[]
): ExamSchedule[] => {
  return sectionIds.map(sectionId => ({
    ...baseSchedule,
    classSectionId: sectionId
  }));
};

/**
 * Auto-calculates grade based on marks
 */
export const calculateGrade = (marksObtained: number, maxMarks: number): string => {
  if (maxMarks <= 0) return '';
  const percentage = (marksObtained / maxMarks) * 100;
  
  if (percentage >= 90) return 'A1';
  if (percentage >= 80) return 'A2';
  if (percentage >= 70) return 'B1';
  if (percentage >= 60) return 'B2';
  if (percentage >= 50) return 'C1';
  if (percentage >= 40) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E'; // Fail
};
