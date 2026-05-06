import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacher.service';
import { useAuthStore } from '../store/authStore';

export function useTeacherDashboard() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['teacher-summary', userId],
    queryFn: () => teacherService.getSummary(userId!),
    enabled: !!userId,
  });
}
