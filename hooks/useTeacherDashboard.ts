import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacher.service';

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ['teacher-summary'],
    queryFn: () => teacherService.getSummary(),
  });
}
