import { useQuery } from '@tanstack/react-query';
import { principalService } from '../services/principal.service';

export function usePrincipalDashboard() {
  return useQuery({
    queryKey: ['principal-summary'],
    queryFn: () => principalService.getSummary(),
  });
}
