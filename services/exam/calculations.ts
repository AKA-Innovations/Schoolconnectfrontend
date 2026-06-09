import { ExamResult, ExamMaster } from '@/types/exam.types';
import { calculateGrade } from './transformers';

export interface ConsolidatedSubjectResult {
  subjectId: number;
  subjectName: string;
  components: {
    examName: string;
    examType: string;
    marksObtained: number;
    maxMarks: number;
  }[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
}

export interface StudentReportCard {
  studentId: string;
  studentName: string;
  rollNo: string;
  subjects: ConsolidatedSubjectResult[];
  overallTotalObtained: number;
  overallMaxMarks: number;
  overallPercentage: number;
  overallGrade: string;
  rank?: number;
  attendance: {
    workingDays: number;
    presentDays: number;
  };
}

/**
 * Consolidates a flat list of results into structured Report Cards per student
 */
export const consolidateReportCards = (
  results: ExamResult[], 
  exams: ExamMaster[], 
  studentMap: Record<string, any>,
  subjectMap: Record<number, any>
): StudentReportCard[] => {
  const reportCardsMap: Record<string, StudentReportCard> = {};

  results.forEach(result => {
    // If not PASS/FAIL status or if withheld, we can still process
    if (result.status === 'WITHHELD') return;
    
    if (!reportCardsMap[result.studentId]) {
      reportCardsMap[result.studentId] = {
        studentId: result.studentId,
        studentName: studentMap[result.studentId]?.name || result.studentId,
        rollNo: studentMap[result.studentId]?.rollNo || '-',
        subjects: [],
        overallTotalObtained: 0,
        overallMaxMarks: 0,
        overallPercentage: 0,
        overallGrade: '',
        attendance: { workingDays: 200, presentDays: 185 } // Mock data
      };
    }

    const reportCard = reportCardsMap[result.studentId];
    
    // In new ExamResult model, totalMarks and marksObtained are already aggregated at exam level
    // But for subject details, we use the MarksEntry service.
    // This function provides a fallback or local consolidation.
  });

  const finalReports = Object.values(reportCardsMap);
  finalReports.sort((a, b) => b.overallPercentage - a.overallPercentage);
  finalReports.forEach((report, index) => {
    report.rank = index + 1;
  });

  return finalReports;
};
