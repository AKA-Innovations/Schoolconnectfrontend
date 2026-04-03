import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { useAuthStore } from '../store/authStore';

export function useAdminDashboard() {
  const schoolId = useAuthStore((state) => state.schoolId);
  return useQuery({
    queryKey: ['admin-summary', schoolId],
    queryFn: () => adminService.getSummary(schoolId!),
    enabled: !!schoolId,
  });
}
