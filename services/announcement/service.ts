import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  Announcement,
  AnnouncementListResponse,
  CreateAnnouncementPayload,
  ListAnnouncementParams,
  ReadReceipt,
  UpdateAnnouncementPayload,
} from './types';

export const announcementService = {
  getAnnouncements: async (params?: ListAnnouncementParams): Promise<AnnouncementListResponse> => {
    const response = await api.get(API_ENDPOINTS.ANNOUNCEMENT.BASE, { params });
    return response.data;
  },

  getAnnouncementDetails: async (id: number): Promise<Announcement> => {
    const response = await api.get(API_ENDPOINTS.ANNOUNCEMENT.BY_ID(id));
    return response.data;
  },

  createAnnouncement: async (data: CreateAnnouncementPayload): Promise<Announcement> => {
    const response = await api.post(API_ENDPOINTS.ANNOUNCEMENT.BASE, data);
    return response.data;
  },

  updateAnnouncement: async (id: number, data: UpdateAnnouncementPayload): Promise<Announcement> => {
    const response = await api.put(API_ENDPOINTS.ANNOUNCEMENT.BY_ID(id), data);
    return response.data;
  },

  deleteAnnouncement: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ANNOUNCEMENT.BY_ID(id));
  },

  togglePin: async (id: number, isPinned: boolean): Promise<Announcement> => {
    const response = await api.patch(API_ENDPOINTS.ANNOUNCEMENT.TOGGLE_PIN(id), { isPinned });
    return response.data;
  },

  uploadAttachment: async (id: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(API_ENDPOINTS.ANNOUNCEMENT.ATTACHMENT(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAttachment: async (attachmentId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ANNOUNCEMENT.REMOVE_ATTACHMENT(attachmentId));
  },

  getReadReceipts: async (id: number): Promise<ReadReceipt[]> => {
    const response = await api.get(API_ENDPOINTS.ANNOUNCEMENT.READ_RECEIPTS(id));
    return response.data;
  },
};
