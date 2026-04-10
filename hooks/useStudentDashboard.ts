import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/student.service';

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student-summary'],
    queryFn: () => studentService.getSummary(),
  });
}