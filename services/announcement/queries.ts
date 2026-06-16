import { useQuery } from '@tanstack/react-query';
import { announcementService } from './service';
import type { ListAnnouncementParams } from './types';

export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (params?: ListAnnouncementParams) => [...announcementKeys.lists(), { params }] as const,
  detail: (id: number) => [...announcementKeys.all, 'detail', id] as const,
  readReceipts: (id: number) => [...announcementKeys.all, 'read-receipts', id] as const,
};

export const useAnnouncements = (params?: ListAnnouncementParams) => {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: () => announcementService.getAnnouncements(params),
    enabled: params?.session !== undefined ? !!params.session : true,
  });
};

export const useAnnouncementDetails = (id: number) => {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => announcementService.getAnnouncementDetails(id),
    enabled: !!id,
  });
};

export const useAnnouncementReadReceipts = (id: number) => {
  return useQuery({
    queryKey: announcementKeys.readReceipts(id),
    queryFn: () => announcementService.getReadReceipts(id),
    enabled: !!id,
  });
};
