import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type { PrincipalSummary } from './types';

export const principalService = {
  getSummary: async (schoolId?: string): Promise<PrincipalSummary> => {
    // School-wide aggregation for Principal view
    const [teachersRes, studentsRes] = await Promise.all([
      api.get(API_ENDPOINTS.TEACHER.LIST, { params: { schoolId, pageSize: 5 } }),
      api.get(API_ENDPOINTS.STUDENT.LIST, { params: { schoolId, limit: 1 } }),
    ]);

    const teacherData = teachersRes.data?.data || teachersRes.data;
    const studentData = studentsRes.data?.data || studentsRes.data;

    const teacherCount = teacherData?.pagination?.totalItemsCount ?? teacherData?.totalItems ?? teacherData?.items?.length ?? 0;
    const studentCount = studentData?.pagination?.totalItemsCount ?? studentData?.totalItems ?? studentData?.items?.length ?? 0;

    return {
      kpis: [
        { label: 'Total Teachers', value: teacherCount, trendType: 'neutral', iconName: 'Users' },
        { label: 'Total Students', value: studentCount, trendType: 'neutral', iconName: 'GraduationCap' },
      ],
      teachers: (teacherData?.items || []).map((t: any) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        subject: t.subject || '—',
        attendance: '—', // Attendance stats not yet available in list view
      })),
      recentData: [],
    };
  },
};
