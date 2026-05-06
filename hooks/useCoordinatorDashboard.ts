import { useQuery } from '@tanstack/react-query';
import { coordinatorService } from '../services/coordinator.service';
import { useAuthStore } from '../store/authStore';

export function useCoordinatorDashboard() {
  const schoolId = useAuthStore((state) => state.schoolId);
  return useQuery({
    queryKey: ['coordinator-summary', schoolId],
    queryFn: () => coordinatorService.getSummary(schoolId!),
    enabled: !!schoolId,
  });
}
