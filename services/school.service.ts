import api from '../lib/api';

export interface SchoolContact {
  id?: number;
  phone: string;
  alternatePhone?: string;
  fax?: string;
  email: string;
}

export interface SchoolOwner {
  id?: string;
  firstName: string;
  lastName: string;
  address: string;
  email?: string;
  phone: string;
  profileUrl?: string;
}

export interface SchoolDetails {
  id: string;
  schoolCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  schoolAffiliation: string;
  schoolBoard: string;
  isActive: boolean;
  profileUrl?: string;
  contactDetails?: SchoolContact;
  ownerDetails?: SchoolOwner;
}

export interface UpdateSchoolPayload {
  schoolCode?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  schoolAffiliation?: string;
  schoolBoard?: string;
  contactDetails?: Partial<SchoolContact>;
  ownerDetails?: Partial<SchoolOwner>;
}

export interface UpdateAdministratorPayload {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface AdministratorDetails {
  id: string;
  schoolId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  address?: string;
  email?: string;
  phone: string;
  profileUrl?: string;
}

export interface AdministratorListResponse {
  items: AdministratorDetails[];
  pagination: {
    totalItemsCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export const schoolService = {
  getSchool: async (id: string): Promise<SchoolDetails> => {
    const response = await api.get(`/school/${id}`);
    return response.data;
  },

  updateSchool: async (id: string, data: UpdateSchoolPayload): Promise<SchoolDetails> => {
    const response = await api.put(`/school/${id}`, data);
    return response.data;
  },

  uploadSchoolProfileImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.put(`/school/${id}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteSchoolProfileImage: async (id: string): Promise<void> => {
    await api.delete(`/school/${id}/profile-image`);
  },

  uploadOwnerProfileImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.put(`/school/${id}/owner-profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteOwnerProfileImage: async (id: string): Promise<void> => {
    await api.delete(`/school/${id}/owner-profile-image`);
  },

  updateAdministrator: async (id: string, data: UpdateAdministratorPayload): Promise<AdministratorDetails> => {
    const response = await api.put(`/administrator/${id}`, data);
    return response.data;
  },

  uploadAdministratorProfileImage: async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.put(`/administrator/${id}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteAdministratorProfileImage: async (id: string): Promise<void> => {
    await api.delete(`/administrator/${id}/profile-image`);
  },

  getAdministrators: async (params?: {
    schoolCode?: string;
    administratorName?: string;
    administratorPhone?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AdministratorListResponse> => {
    const response = await api.get('/administrator', { params });
    return response.data;
  },
};
