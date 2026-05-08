import api from '../../lib/api';
import { API_ENDPOINTS } from '../config';
import type {
  ClassDetails,
  ClassTeacher,
  ClassSectionItem,
  CreateClassPayload,
  CreatePeriodSlotPayload,
  CreateSubjectDetailPayload,
  CreateSubjectOptionPayload,
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
  // ─── School Classes (via /school routes used by class overview) ──────────────

  getClasses: async (params?: {
    page?: number;
    limit?: number;
    className?: string;
    schoolId?: string;
  }): Promise<ClassListResponse> => {
    // Uses class-section-lists which returns all class+section combos with teacher info
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_SECTION_LISTS, {
      params: { schoolId: params?.schoolId },
    });
    const rawClasses = response.data;
    let all: ClassDetails[] = Array.isArray(rawClasses)
      ? rawClasses
      : Array.isArray(rawClasses?.data)
        ? rawClasses.data
        : [];

    if (params?.className) {
      const q = params.className.toLowerCase();
      all = all.filter((r) => r.className.toLowerCase().includes(q));
    }

    return buildPage(all, params?.page, params?.limit);
  },

  getClass: async (classDtlsId: number, schoolId?: string): Promise<ClassDetails> => {
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_SECTION_LISTS, {
      params: { schoolId },
    });
    const raw = response.data;
    const all: ClassDetails[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const found = all.find((r) => r.id === classDtlsId);
    if (!found) throw new Error('Class not found');
    return found;
  },

  createClass: async (data: CreateClassPayload): Promise<ClassDetails> => {
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

  getSectionsByClassName: async (className: string, schoolId?: string): Promise<string[]> => {
    const response = await api.get(API_ENDPOINTS.CLASS.SECTIONS, {
      params: { className, schoolId },
    });
    const raw = response.data;
    return Array.isArray(raw) ? raw : raw?.sections ?? raw?.data ?? [];
  },

  getClassTeachers: async (params?: {
    page?: number;
    limit?: number;
    className?: string;
    teacherName?: string;
    schoolId?: string;
  }): Promise<ClassTeacherListResponse> => {
    const response = await api.get(API_ENDPOINTS.CLASS.CLASS_SECTION_LISTS, {
      params: { schoolId: params?.schoolId },
    });
    const raw = response.data;
    const all: any[] = Array.isArray(raw)
      ? raw
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
        teacherName: c.classTeacherName ?? null,
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

  getClassSummary: async (schoolId?: string): Promise<ClassSummary> => {
    const classesRes = await classService.getClasses({ schoolId });

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

  // ─── Class API endpoints (new /class/* routes) ─────────────────────────────

  /** Returns distinct class names: string[] */
  getClassList: async (schoolId?: string): Promise<string[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.CLASSES, {
      params: { schoolId },
    });
    const raw = res.data;
    // Backend returns { classes: string[] }
    if (raw?.classes && Array.isArray(raw.classes)) return raw.classes;
    if (Array.isArray(raw)) return raw;
    return raw?.data ?? [];
  },

  /** Returns distinct section names for a class: string[] */
  getSections: async (className: string, schoolId?: string): Promise<string[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.SECTIONS, {
      params: { className, schoolId },
    });
    const raw = res.data;
    // Backend returns { sections: string[] }
    if (raw?.sections && Array.isArray(raw.sections)) return raw.sections;
    if (Array.isArray(raw)) return raw;
    return raw?.data ?? [];
  },

  /** Returns { className: string[] } map */
  getCombinations: async (schoolId?: string): Promise<any[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.COMBINATIONS, {
      params: { schoolId },
    });
    const raw = res.data;
    // Backend returns { combinations: {...} }
    if (raw?.combinations) return raw.combinations;
    if (Array.isArray(raw)) return raw;
    return raw?.data ?? [];
  },

  /** Returns ClassSectionItem[] (full class+section objects with id) */
  getClassSectionLists: async (schoolId?: string): Promise<ClassSectionItem[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.CLASS_SECTION_LISTS, {
      params: { schoolId },
    });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  },

  // ─── Subject Options ──────────────────────────────────────────────────────

  getSubjectOptions: async (schoolId?: string, className?: string): Promise<SubjectOption[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.SUBJECT_OPTIONS, {
      params: { schoolId, className },
    });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  },

  createSubjectOption: async (data: CreateSubjectOptionPayload): Promise<SubjectOption> => {
    const res = await api.post(API_ENDPOINTS.CLASS.SUBJECT_OPTIONS, data);
    return res.data;
  },

  updateSubjectOption: async (id: number, data: Partial<CreateSubjectOptionPayload>): Promise<SubjectOption> => {
    const res = await api.put(API_ENDPOINTS.CLASS.SUBJECT_OPTIONS_BY_ID(id), data);
    return res.data;
  },

  deleteSubjectOption: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.SUBJECT_OPTIONS_BY_ID(id));
  },

  // ─── Teacher-Subject Mapping (subject-dtls) ───────────────────────────────

  // getSubjectDetails: async (options?: { schoolId?: string; teacherId?: string }): Promise<SubjectDetail[]> => {
  //   const res = await api.get(API_ENDPOINTS.CLASS.SUBJECT_DTLS, {
  //     params: { schoolId: options?.schoolId, teacherId: options?.teacherId },
  //   });
  //   console.log('Raw Subject Details Response:', res.data);
  //   const raw = res.data;
  //   if (Array.isArray(raw)) return raw;
  //   if (raw?.data && Array.isArray(raw.data)) return raw.data;
  //   return [];
  // },
getSubjectDetails: async (
    options?: { schoolId?: string; teacherId?: string; session?: string }
  ): Promise<SubjectDetail[]> => {

    console.log('Teacher ID:', options?.teacherId);
    console.log('Session:', options?.session);

    if (options?.teacherId) {
      console.log('Teacher ID is being passed');
    } else {
      console.log('Teacher ID is NOT being passed');
    }

    const res = await api.get(API_ENDPOINTS.CLASS.SUBJECT_DTLS, {
      params: {
        schoolId: options?.schoolId,
        teacherId: options?.teacherId,
        session: options?.session,
      },
    });

  console.log('Raw Subject Details Response:', res.data);

  const raw = res.data;

  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;

  return [];
},
  createSubjectDetail: async (data: CreateSubjectDetailPayload): Promise<SubjectDetail> => {
    const res = await api.post(API_ENDPOINTS.CLASS.SUBJECT_DTLS, data);
    return res.data;
  },

  updateSubjectDetail: async (id: number, data: Partial<CreateSubjectDetailPayload>): Promise<SubjectDetail> => {
    const res = await api.put(API_ENDPOINTS.CLASS.SUBJECT_DTLS_BY_ID(id), data);
    return res.data;
  },

  deleteSubjectDetail: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.SUBJECT_DTLS_BY_ID(id));
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
    const res = await api.post(API_ENDPOINTS.CLASS.PERIOD_SLOTS, data);
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
    const res = await api.get(API_ENDPOINTS.CLASS.TIMETABLE, { params });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
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

  updateTimetableEntry: async (id: number, data: Partial<CreateTimetablePayload>): Promise<TimetableEntry> => {
    const res = await api.put(API_ENDPOINTS.CLASS.TIMETABLE_BY_ID(id), data);
    return res.data;
  },

  deleteTimetableEntry: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS.TIMETABLE_BY_ID(id));
  },

  fetchTimetable: async (params: any): Promise<TimetableEntry[]> => {
    const res = await api.get(API_ENDPOINTS.CLASS.TIMETABLE_FETCH, { params });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  },
};
