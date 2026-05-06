import { useQuery } from '@tanstack/react-query';
import { principalService } from '../services/principal.service';
import { useAuthStore } from '../store/authStore';

export function usePrincipalDashboard() {
  const schoolId = useAuthStore((state) => state.schoolId);
  return useQuery({
    queryKey: ['principal-summary', schoolId],
    queryFn: () => principalService.getSummary(schoolId!),
    enabled: !!schoolId,
  });
}
