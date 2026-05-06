import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type { CoordinatorSummary } from './types';

export const coordinatorService = {
  getSummary: async (schoolId?: string): Promise<CoordinatorSummary> => {
    // Aggregate data from subject details since no dedicated summary endpoint exists
    const response = await api.get(API_ENDPOINTS.CLASS.SUBJECT_DTLS, { params: { schoolId } });
    const rawData = response.data?.data || response.data;
    const subjects = Array.isArray(rawData) ? rawData : (rawData?.items || []);
    
    // Group subjects to get a count of unique ones and their teachers
    const mappedSubjects = subjects.slice(0, 5).map((s: any) => ({
      id: s.id?.toString(),
      name: s.subjectName || 'Unnamed Subject',
      teacherCount: s.teacherName ? 1 : 0, // Simplified: one mapping per entry in subject-dtls
      progress: 0,
    })) : [];

    return {
      kpis: [
        { label: 'Managed Subjects', value: Array.isArray(subjects) ? subjects.length : 0, trendType: 'neutral', iconName: 'BookOpen' },
        { label: 'Active Mappings', value: Array.isArray(subjects) ? subjects.filter((s:any) => s.teacherId).length : 0, trendType: 'neutral', iconName: 'Users' },
      ],
      subjects: mappedSubjects,
      recentData: [],
    };
  },
};
