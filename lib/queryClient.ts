import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes
      gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
      refetchOnWindowFocus: true, // Auto-refetch when user focuses tab
      refetchOnMount: 'always', // Always re-evaluate on component mount
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
