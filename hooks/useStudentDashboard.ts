import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/student.service';
import { useAuthStore } from '../store/authStore';

export function useStudentDashboard() {
  const studentId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['student-summary', studentId],
    queryFn: () => studentService.getSummary(studentId!),
    enabled: !!studentId,
  });
}