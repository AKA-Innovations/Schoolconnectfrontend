import api from '@/lib/api';

// ─── Class Interfaces ────────────────────────────────────────────────────────

/** Matches the ClassDtls Prisma model returned by GET /school/classes */
export interface ClassDetails {
  id: number;
  className: string;
  sectionName: string;
  classTeacherId: string | null;
  maxLimit: number | null;
  schoolId: string;
}

/** Matches the response item from GET /school/class-teachers */
export interface ClassTeacher {
  className: string;
  sectionName: string;
  maxLimit: number | null;
  classTeacherId: string | null;
  teacherName: string | null;
  teacherMobile: string | null;
}

/** POST /school/class body – matches CreateClassDtlsDto */
export interface CreateClassPayload {
  className: string;
  sectionName: string;
  maxLimit?: number;
  classTeacherId?: string;
}

/** PUT /school/class/:id body – matches UpdateClassDtlsDto */
export interface UpdateClassPayload {
  className?: string;
  sectionName?: string;
  maxLimit?: number;
  classTeacherId?: string;
}

export interface ClassListResponse {
  items: ClassDetails[];
  pagination: {
    totalItemsCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ClassTeacherListResponse {
  items: ClassTeacher[];
  pagination: {
    totalItemsCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ClassSummary {
  totalClasses: number;
  totalSections: number;
  totalClassTeachersAssigned: number;
  classes: ClassDetails[];
  classTeachers: ClassTeacher[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Class Service ──────────────────────────────────────────────────────────

export const classService = {
  /** GET /school/classes – returns all class-section records for the school.
   *  Backend accepts no query params; filtering and pagination are done client-side. */
  getClasses: async (params?: {
    page?: number;
    limit?: number;
    className?: string;
  }): Promise<ClassListResponse> => {
    const response = await api.get('/school/classes/details');
    const rawClasses = response.data;
    let all: ClassDetails[] = Array.isArray(rawClasses) ? rawClasses : Array.isArray(rawClasses?.data) ? rawClasses.data : [];

    if (params?.className) {
      const q = params.className.toLowerCase();
      all = all.filter((r) => r.className.toLowerCase().includes(q));
    }

    return buildPage(all, params?.page, params?.limit);
  },

  /** No single-record endpoint exists; fetch all and find by id. */
  getClass: async (classDtlsId: number): Promise<ClassDetails> => {
    const response = await api.get('/school/classes');
    const raw = response.data;
    const all: ClassDetails[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const found = all.find((r) => r.id === classDtlsId);
    if (!found) throw new Error('Class not found');
    return found;
  },

  /** POST /school/class */
  createClass: async (data: CreateClassPayload): Promise<ClassDetails> => {
    const response = await api.post('/school/class/add', data);
    return response.data;
  },

  /** PUT /school/class/:classDtlsId */
  updateClass: async (classDtlsId: number, data: UpdateClassPayload): Promise<ClassDetails> => {
    const response = await api.put(`/school/class/update/${classDtlsId}`, data);
    return response.data;
  },

  /** DELETE /school/class/:classDtlsId */
  deleteClass: async (classDtlsId: number): Promise<void> => {
    await api.delete(`/school/class/${classDtlsId}`);
  },

  /** GET /school/classes/:className/sections */
  getSectionsByClassName: async (className: string): Promise<ClassDetails[]> => {
    const response = await api.get(
      `/school/classes/${encodeURIComponent(className)}/sections`,
    );
    const raw = response.data;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  },

  /** GET /school/class-teachers – no query params accepted by backend;
   *  filtering and pagination are done client-side. */
  getClassTeachers: async (params?: {
    page?: number;
    limit?: number;
    className?: string;
    teacherName?: string;
  }): Promise<ClassTeacherListResponse> => {
    const response = await api.get('/school/class-teachers');
    // Backend returns a plain array; guard against any unexpected wrapper
    const raw = response.data;
    let all: ClassTeacher[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

    if (params?.className) {
      const q = params.className.toLowerCase();
      all = all.filter((r) => r.className.toLowerCase().includes(q));
    }
    if (params?.teacherName) {
      const q = params.teacherName.toLowerCase();
      all = all.filter((r) => r.teacherName?.toLowerCase().includes(q) ?? false);
    }

    return buildPage(all, params?.page, params?.limit);
  },

  /** Aggregate summary from GET /school/classes and GET /school/class-teachers */
  getClassSummary: async (): Promise<ClassSummary> => {
    const [classesRes, teachersRes] = await Promise.all([
      classService.getClasses(),
      classService.getClassTeachers(),
    ]);

    const allClasses = classesRes.items;
    const uniqueClassNames = new Set(allClasses.map((c) => c.className));

    return {
      totalClasses: uniqueClassNames.size,
      totalSections: allClasses.length,
      totalClassTeachersAssigned: allClasses.filter((c) => c.classTeacherId !== null).length,
      classes: allClasses,
      classTeachers: teachersRes.items,
    };
  },
};
