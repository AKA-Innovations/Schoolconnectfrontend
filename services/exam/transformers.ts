import { ExamMaster, ExamSchedule, ExamTypeEnum } from '@/types/exam.types';

/**
 * Transforms a multi-type exam creation form into an array of individual API payloads
 */
export const transformExamCreationToPayloads = (
  session: string,
  examName: string,
  examTypes: ExamTypeEnum[]
): Omit<ExamMaster, 'id' | 'schoolId' | 'status' | 'isPublished' | 'createdAt' | 'updatedAt'>[] => {
  return examTypes.map(type => ({
    session,
    examName,
    examType: type,
  }));
};

/**
 * Groups a flat list of exams by their examName
 */
export const groupExamsByName = (exams: ExamMaster[]) => {
  const grouped = exams.reduce((acc, exam) => {
    if (!acc[exam.examName]) {
      acc[exam.examName] = { examName: exam.examName, types: [] };
    }
    acc[exam.examName].types.push(exam);
    return acc;
  }, {} as Record<string, { examName: string; types: ExamMaster[] }>);
  
  return Object.values(grouped);
};

/**
 * Expands a single schedule rule into schedules for all sections
 */
export const expandScheduleToSections = (
  baseSchedule: Omit<ExamSchedule, 'id' | 'schoolId' | 'classSectionId' | 'status' | 'createdAt' | 'updatedAt'>, 
  sectionIds: number[]
): Omit<ExamSchedule, 'id' | 'schoolId' | 'status' | 'createdAt' | 'updatedAt'>[] => {
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
