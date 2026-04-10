import { useQuery } from '@tanstack/react-query';
import { coordinatorService } from '../services/coordinator.service';

export function useCoordinatorDashboard() {
  return useQuery({
    queryKey: ['coordinator-summary'],
    queryFn: () => coordinatorService.getSummary(),
  });
}
