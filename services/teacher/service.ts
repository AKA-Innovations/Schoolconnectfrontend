import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import { CURRENT_SESSION } from '../../lib/constants';
import type {
  Address,
  ClassTeacherAssignmentDetails,
  ClassTeacherAssignment,
  CoordinatorClassMapping,
  SchoolRecord,
  Teacher,
  TeacherClass,
  TeacherFilterParams,
  TeacherRegistrationData,
  TeacherSummary,
  TeacherUpdateDetails,
} from './types';

function mapClassTeacherAssignment(t: any): ClassTeacherAssignmentDetails | null {
  // Find the most detailed assignment source (preferring the one with classSectionsId)
  const sources = [
    t.classTeacherClasses?.[0],
    t.classTeacherClass,
    t.classTeacherAssignment
  ].filter(Boolean);

  const rawAssignment = sources.find(s => s.classSectionsId || s.classSectionId) || sources[0] || null;

  if (!rawAssignment) {
    return null;
  }

  const classDtlsId = rawAssignment.classSectionsId ?? rawAssignment.classSectionId ?? rawAssignment.classDtlsId ?? rawAssignment.id ?? rawAssignment.classId;

  if (typeof classDtlsId !== 'number') {
    return null;
  }

  return {
    classDtlsId,
    className: rawAssignment.className ?? rawAssignment.class?.className ?? '',
    sectionName: rawAssignment.sectionName ?? rawAssignment.section?.sectionName ?? rawAssignment.class?.sectionName ?? '',
    schoolId: rawAssignment.schoolId ?? t.schoolId ?? '',
  };
}

function mapBackendTeacher(t: any): Teacher & { role: 'teacher', name: string, username: string } {
  const schoolRecord = t.schoolRecord ?? {};
  const firstName = t.firstName ?? '';
  const lastName = t.lastName ?? '';

  return {
    id: t.id,
    role: 'teacher',
    name: `${firstName} ${lastName}`.trim() || t.username || 'Teacher',
    username: t.username || t.emailId || '',
    firstName,
    lastName,
    emailId: t.emailId,
    // ... existing fields ...
    employeeEmail: schoolRecord.employeeEmail ?? t.emailId,
    mobileNumber: t.mobileNumber,
    alternateMobileNumber: t.alternateMobileNumber,
    classes: (t.classes ?? []).map((c: any): TeacherClass => ({
      id: c.id,
      className: c.className,
      sectionName: c.sectionName,
      subjectName: c.subjectName,
    })),
    status: t.isActive === false ? 'inactive' : 'active',
    schoolId: t.schoolId,
    employeeId: t.employeeId,
    joiningDate: schoolRecord.joiningDate ?? '',
    dateOfBirth: t.dateOfBirth ?? '',
    gender: t.gender ?? '',
    isPrincipal: !!t.isPrincipal,
    isCoordinator: !!t.isCoordinator,
    isClassTeacher: !!t.isClassTeacher || (t.classTeacherClasses && t.classTeacherClasses.length > 0) || !!t.classTeacherAssignment || !!t.classTeacherClass,
    isSubjectTeacher: !!t.isSubjectTeacher || (t.classes && t.classes.length > 0),
    coordinatorMappings: (t.coordinatorClasses ?? t.coordinatorMappings ?? []).map((m: any): CoordinatorClassMapping => ({
      id: m.id,
      className: m.className ?? '',
      session: m.session ?? '',
      schoolId: m.schoolId,
    })),
    classTeacherClass: mapClassTeacherAssignment(t),
    profileImageUrl: t.profileImageUrl,
    addresses: (t.addresses ?? []).map((a: any): Address => ({
      id: a.id,
      isPermanent: a.isPermanent ?? false,
      address: a.address,
      state: a.state,
      city: a.city,
      country: a.country,
      pincode: a.pincode,
      googleAddressUrl: a.googleAddressUrl,
      latitude: a.latitude,
      longitude: a.longitude,
    })),
    schoolRecords: schoolRecord.id ? [{
      id: schoolRecord.id,
      employeeId: schoolRecord.employeeId,
      joiningDate: schoolRecord.joiningDate,
      employeeEmail: schoolRecord.employeeEmail,
    }] : [],
    teacherPersonalData: t.teacherPersonalData,
    teacherAcademicData: t.teacherAcademicData,
    teacherProfessionalData: t.teacherProfessionalData,
    teacherFamilyDetails: t.teacherFamilyDetails,
  };
}

export const teacherService = {
  getSummary: async (userId?: string): Promise<TeacherSummary> => {
    if (!userId) {
      throw new Error('User ID is required for teacher summary');
    }

    // Fetch teacher profile AND subject mappings in parallel
    const [teacherRes, subjectsRes] = await Promise.all([
      api.get(API_ENDPOINTS.TEACHER.BY_ID(userId)),
      api.get(API_ENDPOINTS.CLASS.CLASS_SUBJECT_DTLS, {
        params: { teacherId: userId, session: CURRENT_SESSION }
      })
    ]).catch(err => {
      console.error('Teacher Summary Parallel Fetch Error:', err);
      // Fallback to just teacher profile if subjects fetch fails
      return [api.get(API_ENDPOINTS.TEACHER.BY_ID(userId)), { data: [] }];
    });

    const teacherData = (teacherRes as any).data?.data || (teacherRes as any).data;
    const details = teacherData?.data || teacherData || {};

    const subjectMappingsRaw = (subjectsRes as any).data?.classSubjectDtls || (subjectsRes as any).data?.data || (subjectsRes as any).data || [];
    const subjectsList = Array.isArray(subjectMappingsRaw) ? subjectMappingsRaw : [];

    // The backend provides classes in several lists
    const coordinatorClasses = (details.coordinatorClasses || []).map((c: any) => ({
      id: `coord-${c.classSectionsId || c.classSectionId || c.id}`,
      name: c.className || 'Unnamed Class',
      subject: 'Coordinator',
      time: '—',
      room: '—',
    }));

    const classTeacherClasses = (details.classTeacherClasses || []).map((c: any) => ({
      id: `ct-${c.classSectionsId || c.classSectionId || c.id}`,
      name: `${c.className} ${c.sectionName}`,
      subject: 'Class Teacher',
      time: '—',
      room: '—',
    }));

    // Use fetched subjectsList if details.classes is empty
    const sourceSubjectClasses = subjectsList.length > 0 ? subjectsList : (details.classes || []);
    const subjectTeacherClasses = sourceSubjectClasses.map((c: any) => ({
      id: `sub-${c.id || Math.random()}`,
      name: `${c.className} ${c.sectionName}`,
      subject: c.subjectName || 'Subject Teacher',
      time: '—',
      room: '—',
    }));

    const mappedClasses = [...coordinatorClasses, ...classTeacherClasses, ...subjectTeacherClasses];

    // Calculate unique teaching classes
    const uniqueTeachingClasses = new Set(subjectTeacherClasses.map(c => c.name));

    return {
      kpis: [
        {
          label: 'Assigned Classes',
          value: uniqueTeachingClasses.size,
          trendType: 'neutral',
          iconName: 'Users'
        },
        {
          label: 'Total Mappings',
          value: subjectTeacherClasses.length,
          trendType: 'neutral',
          iconName: 'BookOpen'
        },
      ],
      classes: mappedClasses,
      recentData: [],
    };
  },

  registerTeacher: async (data: TeacherRegistrationData): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.TEACHER.REGISTER, data);
    return response.data;
  },

  updateTeacherDetails: async (id: string, data: TeacherUpdateDetails): Promise<any> => {
    const response = await api.put(API_ENDPOINTS.TEACHER.DETAILS(id), data);
    return response.data;
  },

  uploadProfileImage: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(API_ENDPOINTS.TEACHER.PROFILE_IMAGE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfileImage: async (id: string): Promise<any> => {
    const response = await api.delete(API_ENDPOINTS.TEACHER.PROFILE_IMAGE(id));
    return response.data;
  },

  deleteTeacher: async (id: string): Promise<any> => {
    const response = await api.put(API_ENDPOINTS.TEACHER.DETAILS(id), { isActive: false });
    return response.data;
  },

  addAddress: async (id: string, address: Omit<Address, 'id'>): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.TEACHER.ADDRESS_ADD(id), address);
    return response.data;
  },

  updateAddress: async (addressId: number, address: Omit<Address, 'id'>): Promise<any> => {
    const response = await api.put(API_ENDPOINTS.TEACHER.ADDRESS_UPDATE(addressId), address);
    return response.data;
  },

  deleteAddress: async (addressId: number): Promise<any> => {
    const response = await api.delete(API_ENDPOINTS.TEACHER.ADDRESS_DELETE(addressId));
    return response.data;
  },

  addClass: async (id: string, classData: TeacherClass): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.TEACHER.CLASS_ADD(id), classData);
    return response.data;
  },

  updateClass: async (classId: number, classData: TeacherClass): Promise<any> => {
    const response = await api.put(API_ENDPOINTS.TEACHER.CLASS_UPDATE(classId), classData);
    return response.data;
  },

  deleteClass: async (classId: number): Promise<any> => {
    const response = await api.delete(API_ENDPOINTS.TEACHER.CLASS_DELETE(classId));
    return response.data;
  },

  updateSchoolRecord: async (recordId: number, record: Partial<SchoolRecord>): Promise<any> => {
    const response = await api.put(API_ENDPOINTS.TEACHER.SCHOOL_RECORD(recordId), record);
    return response.data;
  },

  listTeachers: async (params: TeacherFilterParams): Promise<{ data: Teacher[], total: number }> => {
    // Remove schoolId from params as it's handled by the backend token
    const { schoolId, ...rest } = params;
    const response = await api.get(API_ENDPOINTS.TEACHER.LIST, { params: rest });
    const raw = response.data;
    return {
      data: (raw.items || []).map(mapBackendTeacher),
      total: raw.pagination?.totalItemsCount || 0,
    };
  },

  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = await api.get(API_ENDPOINTS.TEACHER.BY_ID(id));
    return mapBackendTeacher(response.data?.data ?? response.data);
  },

  // ─── Class Teacher Assignment ──────────────────────────────────────────────
  addClassTeacher: async (data: ClassTeacherAssignment): Promise<any> => {
    const response = await api.put(API_ENDPOINTS.TEACHER.ADD_CLASS_TEACHER, data);
    return response.data;
  },

  removeClassTeacher: async (data: ClassTeacherAssignment): Promise<any> => {
    const response = await api.delete(API_ENDPOINTS.TEACHER.REMOVE_CLASS_TEACHER, { data });
    return response.data;
  },

  // ─── Coordinator-Class Mapping ─────────────────────────────────────────────
  addCoordinatorClass: async (data: { session: string; teacherId: string; className: string }): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.TEACHER.COORDINATOR_CLASS, data);
    return response.data;
  },

  removeCoordinatorClass: async (mappingId: number): Promise<any> => {
    const response = await api.delete(API_ENDPOINTS.TEACHER.COORDINATOR_CLASS_DELETE(mappingId));
    return response.data;
  },
};
