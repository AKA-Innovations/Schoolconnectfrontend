import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from './service';
import { announcementKeys } from './queries';
import type { CreateAnnouncementPayload, UpdateAnnouncementPayload } from './types';

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => announcementService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAnnouncementPayload }) =>
      announcementService.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.id) });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
};

export const useTogglePinAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: number; isPinned: boolean }) =>
      announcementService.togglePin(id, isPinned),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.id) });
    },
  });
};

export const useUploadAnnouncementAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      announcementService.uploadAttachment(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.id) });
    },
  });
};

export const useDeleteAnnouncementAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attachmentId, announcementId }: { attachmentId: number; announcementId: number }) =>
      announcementService.deleteAttachment(attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.announcementId) });
    },
  });
};
