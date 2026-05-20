import { ExamResult, Exam } from '@/types/exam.types';

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

import { calculateGrade } from './transformers';

/**
 * Consolidates a flat list of results into structured Report Cards per student
 */
export const consolidateReportCards = (
  results: ExamResult[], 
  exams: Exam[], 
  // In reality, you'd pass student mapping and subject mappings to resolve names
  studentMap: Record<string, any>,
  subjectMap: Record<number, any>
): StudentReportCard[] => {
  
  const reportCardsMap: Record<string, StudentReportCard> = {};

  results.forEach(result => {
    // Skip absent records for calculation, or handle them specifically
    if (result.status !== 'PRESENT') return;
    
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
    
    let subjectEntry = reportCard.subjects.find(s => s.subjectId === result.subjectId);
    if (!subjectEntry) {
      subjectEntry = {
        subjectId: result.subjectId,
        subjectName: subjectMap[result.subjectId]?.name || `Subject ${result.subjectId}`,
        components: [],
        totalMarksObtained: 0,
        totalMaxMarks: 0,
        percentage: 0,
        grade: ''
      };
      reportCard.subjects.push(subjectEntry);
    }

    const exam = exams.find(e => e.id === result.examId);
    if (!exam) return;

    // Add component
    subjectEntry.components.push({
      examName: exam.examName,
      examType: exam.examType,
      marksObtained: result.marksObtained || 0,
      maxMarks: result.maxMarks || 0
    });

    // Update Subject Totals
    subjectEntry.totalMarksObtained += (result.marksObtained || 0);
    subjectEntry.totalMaxMarks += (result.maxMarks || 0);
    subjectEntry.percentage = (subjectEntry.totalMarksObtained / subjectEntry.totalMaxMarks) * 100;
    subjectEntry.grade = calculateGrade(subjectEntry.totalMarksObtained, subjectEntry.totalMaxMarks);

    // Update Overall Totals
    reportCard.overallTotalObtained += (result.marksObtained || 0);
    reportCard.overallMaxMarks += (result.maxMarks || 0);
  });

  // Final Calculations and Ranking
  const finalReports = Object.values(reportCardsMap).map(report => {
    report.overallPercentage = (report.overallTotalObtained / report.overallMaxMarks) * 100;
    report.overallGrade = calculateGrade(report.overallTotalObtained, report.overallMaxMarks);
    return report;
  });

  // Sort by percentage descending to assign ranks
  finalReports.sort((a, b) => b.overallPercentage - a.overallPercentage);
  
  finalReports.forEach((report, index) => {
    report.rank = index + 1;
  });

  return finalReports;
};
