import api from '../lib/api';
import { StudentSummary } from '../types/roles';
import { mockStudentSummary } from '../lib/mockData';

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface StudentAcademic {
  id: number;
  className: string;
  sectionName: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  convenceMode: string;
  convenceModeNumber?: string;
}

export interface StudentParent {
  id: number;
  relation: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailId?: string;
  address?: string;
}

export interface StudentMedical {
  id: number;
  medicalHistory: string;
}

export interface StudentAddress {
  id: number;
  isPermanent?: boolean;
  address: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  googleAddressUrl?: string;
  latitude?: string;
  longitude?: string;
}

export interface StudentDetails {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailId: string;
  caste?: string;
  religion?: string;
  nationality?: string;
  status: string;
  profilePath?: string;
  profileImageUrl?: string;
  academics?: StudentAcademic[];
  parents?: StudentParent[];
  medicalHistories?: StudentMedical[];
  addresses?: StudentAddress[];
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailId: string;
  status: string;
  gender: string;
  schoolId: string;
  academics?: Pick<StudentAcademic, 'className' | 'sectionName' | 'rollNumber'>[];
}

export interface StudentListResponse {
  items: StudentListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalItemsCount: number;
  };
}

export interface StudentListFilters {
  firstName?: string;
  mobileNumber?: string;
  className?: string;
  sectionName?: string;
  page?: number;
  limit?: number;
}

export interface RegisterStudentPayload {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  emailId: string;
  caste?: string;
  religion?: string;
  nationality?: string;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  emailId?: string;
  caste?: string;
  religion?: string;
  nationality?: string;
}

export interface CreateAcademicPayload {
  className: string;
  sectionName: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  convenceMode: string;
  convenceModeNumber?: string;
}

export interface CreateParentPayload {
  relation: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailId?: string;
  address?: string;
}

export interface CreateMedicalPayload {
  medicalHistory: string;
}

export interface CreateAddressPayload {
  isPermanent?: boolean;
  address: string;
  state: string;
  city: string;
  country: string;
  pincode: string;
  googleAddressUrl?: string;
  latitude?: string;
  longitude?: string;
}

// ─── Attendance types ─────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id?: number;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'HalfDay';
  remarks?: string;
  firstName?: string;
  lastName?: string;
  rollNumber?: string;
  className?: string;
  sectionName?: string;
}

export interface BulkAttendancePayload {
  date: string;
  attendance: { studentId: string; attendanceStatus: string }[];
}

export interface AttendanceFilterParams {
  studentId?: string;
  className?: string;
  sectionName?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const studentService = {
  /** Legacy dashboard summary – kept for backward compat */
  getSummary: async (): Promise<StudentSummary> =>
    new Promise((resolve) => setTimeout(() => resolve(mockStudentSummary), 800)),

  register: async (data: RegisterStudentPayload) => {
    const res = await api.post('/student/register', data);
    return res.data;
  },

  list: async (filters: StudentListFilters = {}): Promise<StudentListResponse> => {
    const res = await api.get('/student', { params: filters });
    return res.data;
  },

  getById: async (id: string): Promise<{ message: string; data: StudentDetails }> => {
    const res = await api.get(`/student/${id}`);
    return res.data;
  },

  updateDetails: async (id: string, data: UpdateStudentPayload) => {
    const res = await api.put(`/student/${id}/details`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.put(`/student/${id}/status`, { status });
    return res.data;
  },

  uploadProfileImage: async (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.put(`/student/${id}/profile-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteProfileImage: async (id: string) => {
    const res = await api.delete(`/student/${id}/profile-image`);
    return res.data;
  },

  addAcademic: async (studentId: string, data: CreateAcademicPayload) => {
    const res = await api.post(`/student/${studentId}/academic`, data);
    return res.data;
  },

  updateAcademic: async (academicId: number, data: Partial<CreateAcademicPayload>) => {
    const res = await api.put(`/student/academic/${academicId}`, data);
    return res.data;
  },

  addParent: async (studentId: string, data: CreateParentPayload) => {
    const res = await api.post(`/student/${studentId}/parent`, data);
    return res.data;
  },

  updateParent: async (parentId: number, data: Partial<CreateParentPayload>) => {
    const res = await api.put(`/student/parent/${parentId}`, data);
    return res.data;
  },

  deleteParent: async (parentId: number) => {
    const res = await api.delete(`/student/parent/${parentId}`);
    return res.data;
  },

  addMedical: async (studentId: string, data: CreateMedicalPayload) => {
    const res = await api.post(`/student/${studentId}/medical`, data);
    return res.data;
  },

  updateMedical: async (medicalId: number, data: Partial<CreateMedicalPayload>) => {
    const res = await api.put(`/student/medical/${medicalId}`, data);
    return res.data;
  },

  deleteMedical: async (medicalId: number) => {
    const res = await api.delete(`/student/medical/${medicalId}`);
    return res.data;
  },

  addAddress: async (studentId: string, data: CreateAddressPayload) => {
    const res = await api.post(`/student/${studentId}/address`, data);
    return res.data;
  },

  updateAddress: async (addressId: number, data: Partial<CreateAddressPayload>) => {
    const res = await api.put(`/student/address/${addressId}`, data);
    return res.data;
  },

  deleteAddress: async (addressId: number) => {
    const res = await api.delete(`/student/address/${addressId}`);
    return res.data;
  },

  // ── Attendance ──────────────────────────────────────────────────────────────

  bulkAttendance: async (data: BulkAttendancePayload) => {
    const res = await api.post('/student/attendance/bulk', data);
    return res.data;
  },

  updateAttendance: async (recordId: number, data: Partial<AttendanceRecord>) => {
    const res = await api.put(`/student/attendance/${recordId}`, data);
    return res.data;
  },

  filterAttendance: async (params: AttendanceFilterParams): Promise<AttendanceRecord[]> => {
    const res = await api.get('/student/attendance/filter', { params });
    return res.data?.data ?? res.data ?? [];
  },
};