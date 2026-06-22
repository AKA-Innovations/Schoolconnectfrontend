import { useQuery } from '@tanstack/react-query';
import { searchService, SearchResult } from '../services/search.service';

export function useGlobalSearch(query: string, schoolId: string | null, role: string | null) {
  return useQuery<SearchResult[]>({
    queryKey: ['global-search', schoolId, role, query],
    queryFn: () => searchService.globalSearch(query, schoolId!, role),
    enabled: !!schoolId && query.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });
}
