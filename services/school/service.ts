import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  AdministratorDetails,
  AdministratorListResponse,
  SchoolContact,
  SchoolDetails,
  SchoolOwner,
  UpdateAdministratorPayload,
  UpdateSchoolPayload,
} from './types';

export const schoolService = {
  getSchool: async (id: string): Promise<SchoolDetails> => {
    const response = await api.get(API_ENDPOINTS.SCHOOL.BY_ID(id));
    return response.data;
  },

  updateSchool: async (id: string, data: UpdateSchoolPayload): Promise<SchoolDetails> => {
    const response = await api.put(API_ENDPOINTS.SCHOOL.BY_ID(id), data);
    return response.data;
  },

  uploadSchoolProfileImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.put(API_ENDPOINTS.SCHOOL.PROFILE_IMAGE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteSchoolProfileImage: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.SCHOOL.PROFILE_IMAGE(id));
  },

  uploadOwnerProfileImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.put(API_ENDPOINTS.SCHOOL.OWNER_PROFILE_IMAGE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteOwnerProfileImage: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.SCHOOL.OWNER_PROFILE_IMAGE(id));
  },

  updateAdministrator: async (id: string, data: UpdateAdministratorPayload): Promise<AdministratorDetails> => {
    const response = await api.put(API_ENDPOINTS.ADMINISTRATOR.BY_ID(id), data);
    return response.data;
  },

  uploadAdministratorProfileImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.put(API_ENDPOINTS.ADMINISTRATOR.PROFILE_IMAGE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAdministratorProfileImage: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMINISTRATOR.PROFILE_IMAGE(id));
  },

  getAdministrators: async (params?: {
    schoolCode?: string;
    administratorName?: string;
    administratorPhone?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AdministratorListResponse> => {
    const response = await api.get(API_ENDPOINTS.ADMINISTRATOR.LIST, { params });
    return response.data;
  },
};
