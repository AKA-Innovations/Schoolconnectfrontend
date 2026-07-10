import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  ClassDetails,
  SchoolClass,
  SchoolSection,
  CreateSchoolClassPayload,
  CreateSchoolSectionPayload,
  UpdateSchoolSectionPayload,
  ClassTeacherMapping,
  ClassSubjectMapping,
  CreateClassTeacherMappingPayload,
  CreateClassSubjectMappingPayload,
  CreateSubjectBulkPayload,
  ClassTeacher,
  ClassSectionItem,
  CreateClassPayload,
  CreatePeriodSlotPayload,
  CreateSubjectDetailPayload,
  CreateTimetablePayload,
  UpdateClassPayload,
  ClassListResponse,
  ClassTeacherListResponse,
  ClassSummary,
  PeriodSlot,
  SubjectDetail,
  SubjectOption,
  TimetableEntry,
  TimetableFilterParams,
} from './types';

function buildPage<T>(
  all: T[],
  page = 1,
  limit?: number,
): { items: T[]; pagination: ClassListResponse['pagination'] } {
  const effectiveLimit = limit ?? all.length;
  const start = (page - 1) * effectiveLimit;
  const items = effectiveLimit < all.length ? all.slice(start, start + effectiveLimit) : all;
  const totalPages = effectiveLimit < all.length ? Math.ceil(all.length / effectiveLimit) : 1;
  return {
    items,
    pagination: {
      totalItemsCount: all.length,
      currentPage: page,
      pageSize: effectiveLimit,
      totalPages,
    },
  };
}

export const classService = {
  // ─── Class Details (class-dtls) ───────────────────────────────────────────

  getClasses: async (params?: {
    page?: number;
    limit?: number;
    className?: string;
    schoolId?: string;
    session?: string;
  }): Promise<ClassListResponse> => {
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_DTLS, {
      params: { schoolId: params?.schoolId, session: params?.session },
    });
    const rawClasses = response.data;
    let all: ClassDetails[] = [];
    if (Array.isArray(rawClasses)) {
      all = rawClasses;
    } else if (Array.isArray(rawClasses?.classDtls)) {
      all = rawClasses.classDtls;
    } else if (Array.isArray(rawClasses?.data)) {
      all = rawClasses.data;
    } else if (Array.isArray(rawClasses?.items)) {
      all = rawClasses.items;
    }

    if (params?.className) {
      const q = params.className.toLowerCase();
      all = all.filter((r) => r.className.toLowerCase().includes(q));
    }

    return buildPage(all, params?.page, params?.limit);
  },

  getClass: async (classDtlsId: number, schoolId?: string): Promise<ClassDetails> => {
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_DTLS, {
      params: { schoolId },
    });
    const raw = response.data;
    const all: ClassDetails[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.classDtls)
        ? raw.classDtls
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
    const found = all.find((r) => r.id === classDtlsId);
    if (!found) throw new Error('Class mapping not found');
    return found;
  },

  createClass: async (data: CreateClassPayload): Promise<ClassDetails> => {
    const response = await api.post(API_ENDPOINTS.CLASS.CLASS_DTLS, data);
    return response.data;
  },

  createClassTeacherMapping: async (data: CreateClassTeacherMappingPayload): Promise<ClassTeacherMapping> => {
    const response = await api.post(API_ENDPOINTS.CLASS.CLASS_DTLS, data);
    return response.data;
  },

  updateClass: async (classDtlsId: number, data: UpdateClassPayload): Promise<ClassDetails> => {
    const response = await api.put(API_ENDPOINTS.CLASS.CLASS_DTLS_BY_ID(classDtlsId), data);
    return response.data;
  },

  deleteClass: async (classDtlsId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.CLASS_DTLS_BY_ID(classDtlsId));
  },

  /** Returns class-dtls records as ClassSectionItem[] (full class+section objects with id) */
  getClassSectionLists: async (schoolId?: string, session?: string, classId?: number): Promise<ClassSectionItem[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.CLASS_DTLS, {
      params: { schoolId, session, classId },
    });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.classDtls && Array.isArray(raw.classDtls)) return raw.classDtls;
    if (raw?.sections && Array.isArray(raw.sections)) return raw.sections;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    return [];
  },

  /** Returns distinct section names for a class from master list */
  getSectionsByClassName: async (className: string, schoolId?: string): Promise<string[]> => {
    // 1. Get classId from master classes
    const classes = await classService.getSchoolClasses(schoolId || '');
    const cls = classes.find((c) => c.className === className);
    if (!cls) return [];

    // 2. Get sections for that classId
    const sections = await classService.getSchoolSections(schoolId || '', cls.id);
    return sections.map((s) => s.sectionName);
  },

  /** Returns distinct class names from school/fetch/classes */
  getClassList: async (schoolId?: string): Promise<string[]> => {
    const res = await api.get(API_ENDPOINTS.SCHOOL.FETCH_CLASSES, {
      params: { schoolId },
    });
    const raw = res.data;
    if (raw?.classes && Array.isArray(raw.classes)) {
      return raw.classes.map((c: any) => c.className || c);
    }
    if (Array.isArray(raw)) return raw.map((c: any) => c.className || c);
    return [];
  },

  getClassTeachers: async (params?: {
    page?: number;
    limit?: number;
    className?: string;
    teacherName?: string;
    schoolId?: string;
  }): Promise<ClassTeacherListResponse> => {
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_DTLS, {
      params: { schoolId: params?.schoolId },
    });
    const raw = response.data;
    const all: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.classDtls)
        ? raw.classDtls
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
            ? raw.data
            : [];

    // Only entries that have a class teacher assigned
    let teacherEntries: ClassTeacher[] = all
      .filter((c) => c.classTeacherId)
      .map((c) => ({
        className: c.className,
        sectionName: c.sectionName,
        maxLimit: c.maxLimit ?? null,
        classTeacherId: c.classTeacherId,
        teacherName: c.classTeacherName ?? c.teacherName ?? null,
        teacherMobile: c.classTeacherMobileNumber ?? null,
      }));

    if (params?.className) {
      const q = params.className.toLowerCase();
      teacherEntries = teacherEntries.filter((r) => r.className.toLowerCase().includes(q));
    }

    if (params?.teacherName) {
      const q = params.teacherName.toLowerCase();
      teacherEntries = teacherEntries.filter((r) => r.teacherName?.toLowerCase().includes(q));
    }

    return buildPage(teacherEntries, params?.page, params?.limit);
  },

  getClassSummary: async (schoolId?: string, session?: string): Promise<ClassSummary> => {
    const classesRes = await classService.getClasses({ schoolId, session });

    const allClasses = classesRes.items;
    const uniqueClassNames = new Set(allClasses.map((c) => c.className));
    const teachersRes = await classService.getClassTeachers({ schoolId });

    return {
      totalClasses: uniqueClassNames.size,
      totalSections: allClasses.length,
      totalClassTeachersAssigned: allClasses.filter((c) => c.classTeacherId !== null).length,
      classes: allClasses,
      classTeachers: teachersRes.items,
    };
  },

  // ─── Subject Master (subject-dtls) ─────────────────────────────────────────

  /** Returns all subjects filtered by class & session */
  getSubjectOptions: async (schoolId?: string, classId?: number, session?: string, searchText?: string): Promise<SubjectOption[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.SUBJECT_DTLS, {
      params: { 
        schoolId, 
        classId, 
        session, 
        searchText: searchText || '' 
      },
    });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.subjects && Array.isArray(raw.subjects)) return raw.subjects;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  },

  createSubjectBulk: async (data: CreateSubjectBulkPayload): Promise<any> => {
    const res = await api.post(API_ENDPOINTS.CLASS.SUBJECT_DTLS, data);
    return res.data;
  },

  updateSubjectOption: async (id: number, data: Partial<{ subjectName: string; subjectCode: string }>): Promise<SubjectOption> => {
    const res = await api.put(API_ENDPOINTS.CLASS.SUBJECT_DTLS_BY_ID(id), data);
    return res.data;
  },

  deleteSubjectOption: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.SUBJECT_DTLS_BY_ID(id));
  },

  // ─── Teacher-Subject Mapping (class-subject-dtls) ─────────────────────────

  getSubjectDetails: async (
    options?: { schoolId?: string; teacherId?: string; session?: string; classSectionId?: number }
  ): Promise<SubjectDetail[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.CLASS_SUBJECT_DTLS, {
      params: {
        schoolId: options?.schoolId,
        teacherId: options?.teacherId,
        session: options?.session,
        classSectionId: options?.classSectionId,
      },
    });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.classSubjectDtls && Array.isArray(raw.classSubjectDtls)) return raw.classSubjectDtls;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.entries && Array.isArray(raw.entries)) return raw.entries;
    if (raw?.mappings && Array.isArray(raw.mappings)) return raw.mappings;
    return [];
  },

  createClassSubjectMapping: async (data: CreateClassSubjectMappingPayload): Promise<any> => {
    const res = await api.post(API_ENDPOINTS.CLASS.CLASS_SUBJECT_DTLS, data);
    return res.data;
  },

  /** Legacy: create a single teacher-subject-class mapping */
  createSubjectDetail: async (data: any): Promise<SubjectDetail> => {
    // If it's already in { entries: [...] } format, send as is. Otherwise wrap.
    const payload = (data && typeof data === 'object' && 'entries' in data) ? data : { entries: [data] };
    const res = await api.post(API_ENDPOINTS.CLASS.CLASS_SUBJECT_DTLS, payload);
    return res.data;
  },

  updateSubjectDetail: async (id: number, data: Partial<CreateSubjectDetailPayload>): Promise<SubjectDetail> => {
    const res = await api.put(API_ENDPOINTS.CLASS.CLASS_SUBJECT_DTLS_BY_ID(id), data);
    return res.data;
  },

  deleteSubjectDetail: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.CLASS_SUBJECT_DTLS_BY_ID(id));
  },

  getStudentSubjectDetails: async (): Promise<SubjectDetail[]> => {
    const res = await api.get('/class/subject-dtls/student');
    const raw = res.data;
    return Array.isArray(raw) ? raw : (raw?.subjects || raw?.data || []);
  },

  // ─── Period Slots ─────────────────────────────────────────────────────────

  getPeriodSlots: async (schoolId?: string): Promise<PeriodSlot[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.PERIOD_SLOTS, {
      params: { schoolId },
    });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  },

  createPeriodSlot: async (data: CreatePeriodSlotPayload): Promise<PeriodSlot> => {
    const res = await api.post(API_ENDPOINTS.CLASS.PERIOD_SLOTS, [data]);
    return res.data;
  },

  updatePeriodSlot: async (id: number, data: Partial<CreatePeriodSlotPayload>): Promise<PeriodSlot> => {
    const res = await api.put(API_ENDPOINTS.CLASS.PERIOD_SLOTS_BY_ID(id), data);
    return res.data;
  },

  deletePeriodSlot: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.PERIOD_SLOTS_BY_ID(id));
  },

  // ─── Timetable ────────────────────────────────────────────────────────────

  getTimetable: async (params?: TimetableFilterParams): Promise<TimetableEntry[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.TIMETABLE_FETCH, { params });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.timetable && Array.isArray(raw.timetable)) return raw.timetable;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    return [];
  },

  createTimetableEntry: async (data: CreateTimetablePayload): Promise<TimetableEntry> => {
    // Backend expects an array even for single entries
    const res = await api.post(API_ENDPOINTS.CLASS.TIMETABLE, [data]);
    return Array.isArray(res.data) ? res.data[0] : res.data;
  },

  createTimetableBulk: async (data: CreateTimetablePayload[]): Promise<TimetableEntry[]> => {
    const res = await api.post(API_ENDPOINTS.CLASS.TIMETABLE, data);
    return res.data;
  },

  updateTimetableEntry: async (id: number | string, data: Partial<CreateTimetablePayload>): Promise<TimetableEntry> => {
    const res = await api.put(API_ENDPOINTS.CLASS.TIMETABLE_BY_ID(id as any), data);
    return res.data;
  },

  deleteTimetableEntry: async (id: number | string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.TIMETABLE_BY_ID(id as any));
  },

  fetchTimetable: async (params: any): Promise<TimetableEntry[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.TIMETABLE_FETCH, { params });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.timetable && Array.isArray(raw.timetable)) return raw.timetable;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    return [];
  },

  // ─── School Classes & Sections ─────────────────────────────────────────────

  getSchoolClasses: async (schoolId: string): Promise<SchoolClass[]> => {
    const res = await api.get(API_ENDPOINTS.SCHOOL.FETCH_CLASSES, {
      params: { schoolId },
    });
    const raw = res.data;
    if (raw?.classes && Array.isArray(raw.classes)) return raw.classes;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  },

  createSchoolClasses: async (data: CreateSchoolClassPayload): Promise<any> => {
    const res = await api.post(API_ENDPOINTS.SCHOOL.CLASSES, data);
    return res.data;
  },

  getSchoolSections: async (schoolId: string, classId?: number): Promise<SchoolSection[]> => {
    const res = await api.get(API_ENDPOINTS.SCHOOL.FETCH_SECTIONS, {
      params: { schoolId, classId },
    });
    const raw = res.data;
    if (raw?.sections && Array.isArray(raw.sections)) return raw.sections;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  },

  createSchoolSections: async (data: CreateSchoolSectionPayload): Promise<any> => {
    const res = await api.post(API_ENDPOINTS.SCHOOL.SECTIONS, data);
    return res.data;
  },

  updateSchoolSection: async (id: number, data: UpdateSchoolSectionPayload): Promise<any> => {
    const res = await api.put(API_ENDPOINTS.SCHOOL.SECTION_UPDATE(id), data);
    return res.data;
  },

  deleteSchoolSection: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.SCHOOL.SECTION_DELETE(id));
  },

  updateSchoolClass: async (id: number, className: string): Promise<any> => {
    const res = await api.put(API_ENDPOINTS.SCHOOL.CLASS_UPDATE(id), { className });
    return res.data;
  },

  deleteSchoolClass: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.SCHOOL.CLASS_DELETE(id));
  },
};
