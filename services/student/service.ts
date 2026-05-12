import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  AttendanceFilterParams,
  AttendanceRecord,
  BulkAttendancePayload,
  CreateAcademicPayload,
  CreateAddressPayload,
  CreateMedicalPayload,
  CreateParentPayload,
  RegisterStudentPayload,
  StudentAcademic,
  StudentAddress,
  StudentDetails,
  StudentListFilters,
  StudentListItem,
  StudentListResponse,
  StudentMedical,
  StudentParent,
  StudentSummary,
  UpdateStudentPayload,
} from './types';

export const studentService = {
  getSummary: async (studentId?: string): Promise<StudentSummary> => {
    if (!studentId) throw new Error('Student ID is required');

    // Fetch recent attendance
    const attendance = await studentService.filterAttendance({ studentId, limit: 10 });
    
    return {
      kpis: [
        { label: 'Attendance Rate', value: '—', trendType: 'neutral', iconName: 'Calendar' },
        { label: 'Upcoming Tasks', value: 0, trendType: 'neutral', iconName: 'ClipboardList' },
      ],
      assignments: [], // Academic tasks not yet centralized in one endpoint
      attendance: attendance.map(a => ({
        date: a.date,
        status: a.status.toLowerCase() as any,
        subject: a.subjectName || 'General',
      })),
      recentData: [],
    };
  },

  register: async (data: RegisterStudentPayload) => {
    const res = await api.post(API_ENDPOINTS.STUDENT.REGISTER, data);
    return res.data;
  },

  list: async (filters: StudentListFilters = {}): Promise<StudentListResponse> => {
    const { schoolId, ...rest } = filters;
    const res = await api.get(API_ENDPOINTS.STUDENT.LIST, { params: rest });
    
    // Normalize backend 'academicDtls' to frontend 'academics'
    if (res.data?.items) {
      res.data.items = res.data.items.map((item: any) => ({
        ...item,
        academics: item.academicDtls ?? item.academics ?? [],
      }));
    }
    
    return res.data;
  },

  getById: async (id: string): Promise<{ message: string; data: StudentDetails }> => {
    const res = await api.get(API_ENDPOINTS.STUDENT.BY_ID(id));
    return res.data;
  },

  getBasicDetails: async (): Promise<any> => {
    const res = await api.get(API_ENDPOINTS.STUDENT.BASIC_DETAILS);
    return res.data;
  },

  updateDetails: async (id: string, data: UpdateStudentPayload) => {
    const res = await api.put(API_ENDPOINTS.STUDENT.DETAILS(id), data);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.put(API_ENDPOINTS.STUDENT.STATUS(id), { status });
    return res.data;
  },

  uploadProfileImage: async (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.put(API_ENDPOINTS.STUDENT.PROFILE_IMAGE(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteProfileImage: async (id: string) => {
    const res = await api.delete(API_ENDPOINTS.STUDENT.PROFILE_IMAGE(id));
    return res.data;
  },

  addAcademic: async (studentId: string, data: CreateAcademicPayload) => {
    const res = await api.post(API_ENDPOINTS.STUDENT.ACADEMIC_ADD(studentId), data);
    return res.data;
  },

  updateAcademic: async (academicId: number, data: Partial<CreateAcademicPayload>) => {
    const res = await api.put(API_ENDPOINTS.STUDENT.ACADEMIC_UPDATE(academicId), data);
    return res.data;
  },

  addParent: async (studentId: string, data: CreateParentPayload) => {
    const res = await api.post(API_ENDPOINTS.STUDENT.PARENT_ADD(studentId), data);
    return res.data;
  },

  updateParent: async (parentId: number, data: Partial<CreateParentPayload>) => {
    const res = await api.put(API_ENDPOINTS.STUDENT.PARENT_UPDATE(parentId), data);
    return res.data;
  },

  deleteParent: async (parentId: number) => {
    const res = await api.delete(API_ENDPOINTS.STUDENT.PARENT_DELETE(parentId));
    return res.data;
  },

  addMedical: async (studentId: string, data: CreateMedicalPayload) => {
    const res = await api.post(API_ENDPOINTS.STUDENT.MEDICAL_ADD(studentId), data);
    return res.data;
  },

  updateMedical: async (medicalId: number, data: Partial<CreateMedicalPayload>) => {
    const res = await api.put(API_ENDPOINTS.STUDENT.MEDICAL_UPDATE(medicalId), data);
    return res.data;
  },

  deleteMedical: async (medicalId: number) => {
    const res = await api.delete(API_ENDPOINTS.STUDENT.MEDICAL_DELETE(medicalId));
    return res.data;
  },

  addAddress: async (studentId: string, data: CreateAddressPayload) => {
    const res = await api.post(API_ENDPOINTS.STUDENT.ADDRESS_ADD(studentId), data);
    return res.data;
  },

  updateAddress: async (addressId: number, data: Partial<CreateAddressPayload>) => {
    const res = await api.put(API_ENDPOINTS.STUDENT.ADDRESS_UPDATE(addressId), data);
    return res.data;
  },

  deleteAddress: async (addressId: number) => {
    const res = await api.delete(API_ENDPOINTS.STUDENT.ADDRESS_DELETE(addressId));
    return res.data;
  },

  bulkAttendance: async (data: BulkAttendancePayload) => {
    const res = await api.post(API_ENDPOINTS.STUDENT.ATTENDANCE_BULK, data);
    return res.data;
  },

  updateAttendance: async (recordId: number, data: Partial<AttendanceRecord>) => {
    // Backend expects { status: "string" } for individual updates
    const status = data.status || data.attendanceStatus || 'Present';
    const res = await api.put(API_ENDPOINTS.STUDENT.ATTENDANCE_UPDATE(recordId), { status });
    return res.data;
  },

  filterAttendance: async (params: AttendanceFilterParams): Promise<AttendanceRecord[]> => {
    const { schoolId, ...rest } = params;
    const res = await api.get(API_ENDPOINTS.STUDENT.ATTENDANCE_FILTER, { params: rest });
    const rawData = res.data?.data ?? res.data;
    
    console.log('Raw Attendance API Response:', res.data);

    // Note: Backend has a misspelling 'attendence'. We handle both 'attendence' and 'attendance'
    const records = Array.isArray(rawData) 
      ? rawData 
      : (rawData?.attendence || rawData?.attendance || rawData?.data?.attendence || rawData?.items || []);

    return records.map((r: any) => {
      const rawStatus = r.attendanceStatus || r.status || 'Present';
      const normalizedStatus = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()) as any;
      
      const mappedRecord = {
        id: r.recordId || r.id,
        recordId: r.recordId || r.id,
        studentId: r.studentId, // May be undefined in some GET responses
        date: params.date || r.attendanceDate || '',
        status: normalizedStatus,
        attendanceStatus: rawStatus,
        studentName: r.studentName,
        studentRollNumber: r.studentRollNumber,
        firstName: r.studentName?.split(' ')[0] || '',
        lastName: r.studentName?.split(' ').slice(1).join(' ') || '',
        rollNumber: r.studentRollNumber || '—',
      };

      console.log(`[Mapping] Record ${mappedRecord.recordId}: Roll ${mappedRecord.studentRollNumber}, Status ${mappedRecord.status}`);
      return mappedRecord;
    });
  },
};
