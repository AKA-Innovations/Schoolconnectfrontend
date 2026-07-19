import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CURRENT_SESSION } from '../lib/constants';
import {
  classService,
  ClassListResponse,
  ClassTeacherListResponse,
  ClassDetails,
  SchoolClass,
  SchoolSection,
  CreateSchoolClassPayload,
  CreateSchoolSectionPayload,
  UpdateSchoolSectionPayload,
  ClassTeacher,
  CreateClassPayload,
  CreateSubjectBulkPayload,
  CreateSubjectDetailPayload,
  CreateClassSubjectMappingPayload,
  CreateClassTeacherMappingPayload,
  CreatePeriodSlotPayload,
  CreateTimetablePayload,
  TimetableFilterParams,
  UpdateClassPayload,
  ClassSummary,
  ClassSectionItem,
} from '@/services/class.service';
import { teacherService } from '@/services/teacher.service';
import { teacherKeys } from '@/hooks/useTeachers';
import { useAuthStore } from '@/store/authStore';

// ─── Query key factories ──────────────────────────────────────────────────────

export const classKeys = {
  all: ['classes'] as const,
  list: (params?: any) => ['classes', 'list', params] as const,
  detail: (id: number) => ['classes', 'detail', id] as const,
  sections: (className: string) => ['classes', 'sections', className] as const,
  teachers: (params?: any) => ['classes', 'teachers', params] as const,
  summary: () => ['classes', 'summary'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useClasses(params?: { page?: number; limit?: number; className?: string }) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classService.getClasses({ ...params, schoolId: schoolId || '' }),
    enabled: !!schoolId,
    placeholderData: (prev) => prev,
  });
}

export function useClass(classDtlsId: number) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.detail(classDtlsId),
    queryFn: () => classService.getClass(classDtlsId, schoolId || ''),
    enabled: !!classDtlsId && !!schoolId,
  });
}

export function useSectionsByClassName(className: string) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.sections(className),
    queryFn: () => classService.getSectionsByClassName(className, schoolId || ''),
    enabled: !!className && !!schoolId,
  });
}

export function useClassTeachers(params?: { page?: number; limit?: number; className?: string; teacherName?: string }) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.teachers(params),
    queryFn: () => classService.getClassTeachers({ ...params, schoolId: schoolId || '' }),
    enabled: !!schoolId,
    placeholderData: (prev) => prev,
  });
}

export function useClassSummary() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classKeys.summary(),
    queryFn: () => classService.getClassSummary(schoolId || '', CURRENT_SESSION),
    enabled: !!schoolId,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassPayload) => classService.createClass(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}

export function useUpdateClass(classDtlsId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClassPayload) => classService.updateClass(classDtlsId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
      qc.invalidateQueries({ queryKey: classKeys.detail(classDtlsId) });
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classDtlsId: number) => classService.deleteClass(classDtlsId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
    },
  });
}

/**
 * Assign a teacher as class teacher.
 * 1. Updates the class record (classTeacherId).
 * 2. Updates the teacher record (isClassTeacher = true).
 * Both teacher list and class caches are invalidated.
 */
export function useAssignClassTeacher(classDtlsId: number) {
  const qc = useQueryClient();
  const schoolId = useAuthStore((s) => s.schoolId);
  return useMutation({
    mutationFn: async ({
      classTeacherId,
      previousTeacherId,
    }: {
      classTeacherId: string | undefined;
      previousTeacherId?: string;
    }) => {
      const currentClass = await classService.getClass(classDtlsId, schoolId || '');
      // Fetch all classes to detect cross-class conflicts
      const allClassesRes = await classService.getClasses({ schoolId: schoolId || '' });
      const allClasses = allClassesRes.items;

      // If the new teacher is already assigned to a DIFFERENT class, remove them from there first
      if (classTeacherId) {
        const previousClassOfNewTeacher = allClasses.find(
          (c) => c.classTeacherId === classTeacherId && c.id !== classDtlsId,
        );
        if (previousClassOfNewTeacher) {
          await classService.updateClass(previousClassOfNewTeacher.id, { classTeacherId: undefined });
          await teacherService.updateTeacherDetails(classTeacherId, { isClassTeacher: true });
        }
      }

      // Unmark the old teacher of THIS class as class teacher (if they're being replaced)
      if (previousTeacherId && previousTeacherId !== classTeacherId) {
        await teacherService.updateTeacherDetails(previousTeacherId, { isClassTeacher: false });
      }

      // Update this class with the new teacher (or undefined to unassign)
      await classService.updateClass(classDtlsId, { classTeacherId });
      // Mark the new teacher as class teacher
      if (classTeacherId) {
        await teacherService.updateTeacherDetails(classTeacherId, { isClassTeacher: true });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
      qc.invalidateQueries({ queryKey: classKeys.detail(classDtlsId) });
      // Invalidate entire teacher list so the dropdown refreshes
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
  });
}

// ─── Class Section Lists ────────────────────────────────────────────────────

export const classSectionKeys = {
  lists: (schoolId: string) => ['class-section-lists', schoolId] as const,
  classList: ['class-list'] as const,
};

const fetchClassSectionLists = async ({ queryKey }: { queryKey: readonly any[] }) => {
  const [_, schoolId] = queryKey;
  if (!schoolId) return [];

  // 1. Fetch both master structure and current mappings
  const [mSections, mapped] = await Promise.all([
    classService.getSchoolSections(schoolId),
    classService.getClassSectionLists(schoolId, CURRENT_SESSION)
  ]);
  console.log(mSections, mapped);

  // 2. Merge them. Master list is the baseline.
  const merged: ClassSectionItem[] = mSections.map(ms => {
    const matchingMapped = mapped.find(m =>
      m.className === ms.className &&
      m.sectionName === ms.sectionName &&
      (m.session === CURRENT_SESSION || !m.session)
    );

    return {
      id: matchingMapped?.id || -ms.id,
      masterSectionId: ms.id,
      mappingId: matchingMapped?.id,
      classId: ms.classId,
      className: ms.className,
      sectionName: ms.sectionName,
      classTeacherId: matchingMapped?.classTeacherId || null,
      classTeacherName: (matchingMapped as any)?.classTeacherName || null,
      classTeacherMobileNumber: (matchingMapped as any)?.classTeacherMobileNumber || null,
      classTeacherProfile: (matchingMapped as any)?.classTeacherProfile || null,
      maxLimit: matchingMapped?.maxLimit || null,
      schoolId: ms.schoolId || schoolId || '',
      session: matchingMapped?.session || CURRENT_SESSION,
      isMapped: !!matchingMapped
    } as ClassSectionItem;
  });

  // 3. Fallback: Add any mapped sections that might be missing from master list
  mapped.forEach(m => {
    if (!merged.some(mer => mer.className === m.className && mer.sectionName === m.sectionName)) {
      merged.push({ ...m, isMapped: true });
    }
  });

  return merged;
};

export function useClassSectionLists() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classSectionKeys.lists(schoolId || ''),
    queryFn: fetchClassSectionLists,
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useClassList() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: classSectionKeys.classList,
    queryFn: async () => {
      const classes = await classService.getSchoolClasses(schoolId || '');
      return classes.map(c => c.className).sort();
    },
    enabled: !!schoolId,
  });
}

// ─── Subject Options (subject-dtls master list) ─────────────────────────────

export const subjectOptionKeys = {
  all: ['subject-options'] as const,
};

export function useSubjectOptions(classIdOrName?: number | string, session?: string, searchText?: string) {
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: classes = [] } = useSchoolClasses();

  const resolvedClassId = useMemo(() => {
    if (!classIdOrName || classIdOrName === 'all') return undefined;
    if (typeof classIdOrName === 'number') return classIdOrName;
    const found = classes.find(c => c.className.toLowerCase() === classIdOrName.toLowerCase());
    return found ? found.id : undefined;
  }, [classIdOrName, classes]);

  return useQuery({
    queryKey: ['subject-options', schoolId, resolvedClassId || classIdOrName, session, searchText],
    queryFn: () => classService.getSubjectOptions(
      schoolId || '',
      resolvedClassId || (typeof classIdOrName === 'number' ? classIdOrName : undefined),
      session,
      searchText
    ),
    enabled: !!schoolId && (classIdOrName === undefined || classIdOrName === 'all' || typeof classIdOrName !== 'string' || classes.length > 0),
  });
}

export function useCreateSubjectBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectBulkPayload) => classService.createSubjectBulk(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subject-options'] });
    },
  });
}

// ─── Teacher-Subject Mapping (class-subject-dtls) ─────────────────────────

export const subjectDetailKeys = {
  all: ['subject-details'] as const,
};

export function useSubjectDetails(teacherId?: string, session?: string, classSectionId?: number) {
  return useQuery({
    queryKey: [...subjectDetailKeys.all, teacherId, session, classSectionId],
    queryFn: () => classService.getSubjectDetails({
      teacherId,
      session: session === 'all' ? undefined : (session !== undefined ? session : CURRENT_SESSION),
      classSectionId,
    }),
    enabled: teacherId === undefined || !!teacherId,
  });
}

export function useCreateClassSubjectMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassSubjectMappingPayload) => classService.createClassSubjectMapping(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subjectDetailKeys.all });
    },
  });
}

// ─── Class Teacher Mapping (class-dtls) ───────────────────────────────────

export function useCreateClassTeacherMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassTeacherMappingPayload) => classService.createClassTeacherMapping(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.all });
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
  });
}

// ─── Legacy hooks (pointing to correct new methods) ──────────────────────────

/** Creates a subject-master entry via subject-dtls bulk endpoint */
export function useCreateSubjectOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => classService.createSubjectBulk(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subject-options'] }),
  });
}

/** Creates a teacher-subject-class mapping via class-subject-dtls */
export function useCreateSubjectDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => classService.createSubjectDetail(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectDetailKeys.all }),
  });
}

export function useUpdateSubjectDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => classService.updateSubjectDetail(id as any, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectDetailKeys.all }),
  });
}

export function useDeleteSubjectDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => classService.deleteSubjectDetail(id as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectDetailKeys.all }),
  });
}

/** Updates a subject-master entry via subject-dtls PUT */
export function useUpdateSubjectOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => classService.updateSubjectOption(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subject-options'] }),
  });
}

/** Deletes a subject-master entry via subject-dtls DELETE */
export function useDeleteSubjectOption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteSubjectOption(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subject-options'] }),
  });
}

// ─── Period Slots ───────────────────────────────────────────────────────────

export const periodSlotKeys = {
  all: ['period-slots'] as const,
};

export function usePeriodSlots() {
  return useQuery({
    queryKey: periodSlotKeys.all,
    queryFn: () => classService.getPeriodSlots(),
  });
}

export function useCreatePeriodSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePeriodSlotPayload) => classService.createPeriodSlot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: periodSlotKeys.all }),
  });
}

export function useUpdatePeriodSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePeriodSlotPayload> }) =>
      classService.updatePeriodSlot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: periodSlotKeys.all }),
  });
}

export function useDeletePeriodSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deletePeriodSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: periodSlotKeys.all }),
  });
}

// ─── Timetable ──────────────────────────────────────────────────────────────

export const timetableKeys = {
  all: ['timetable'] as const,
  filtered: (params?: TimetableFilterParams) => ['timetable', 'list', params] as const,
  fetch: (params?: any) => ['timetable', 'fetch', params] as const,
};

export function useTimetable(params?: TimetableFilterParams) {
  return useQuery({
    queryKey: timetableKeys.filtered(params),
    queryFn: () => classService.getTimetable(params),
  });
}

export function useCreateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetablePayload) => classService.createTimetableEntry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useCreateTimetableBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetablePayload[]) => classService.createTimetableBulk(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useUpdateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<CreateTimetablePayload> }) =>
      classService.updateTimetableEntry(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useDeleteTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => classService.deleteTimetableEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: timetableKeys.all }),
  });
}

export function useFetchTimetable(params: any) {
  return useQuery({
    queryKey: timetableKeys.fetch(params),
    queryFn: () => classService.fetchTimetable(params),
    // Only enable when session is set. If teacherId is explicitly passed (teacher
    // dashboard), also wait for it to be defined before fetching.
    enabled: !!params?.session && (params?.teacherId !== undefined ? !!params.teacherId : true),
  });
}

// ─── School Classes & Sections (New) ────────────────────────────────────────

export const schoolClassKeys = {
  all: ['school-classes'] as const,
  sections: (classId?: number) => ['school-sections', classId] as const,
};

export function useSchoolClasses() {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: schoolClassKeys.all,
    queryFn: () => classService.getSchoolClasses(schoolId || ''),
    enabled: !!schoolId,
  });
}

export function useCreateSchoolClasses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchoolClassPayload) => classService.createSchoolClasses(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolClassKeys.all });
    },
  });
}

export function useSchoolSections(classId?: number) {
  const schoolId = useAuthStore((s) => s.schoolId);
  return useQuery({
    queryKey: schoolClassKeys.sections(classId),
    queryFn: () => classService.getSchoolSections(schoolId || '', classId),
    enabled: !!schoolId,
  });
}

export function useCreateSchoolSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchoolSectionPayload) => classService.createSchoolSections(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['school-sections'] });
    },
  });
}

export function useUpdateSchoolSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSchoolSectionPayload }) =>
      classService.updateSchoolSection(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['school-sections'] });
    },
  });
}

export function useDeleteSchoolSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteSchoolSection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['school-sections'] });
    },
  });
}

export function useUpdateSchoolClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, className }: { id: number; className: string }) =>
      classService.updateSchoolClass(id, className),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolClassKeys.all });
    },
  });
}

export function useDeleteSchoolClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteSchoolClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolClassKeys.all });
    },
  });
}

export function useTimetableCheckClash(params: {
  teacherId: string;
  dayOfWeek: string;
  periodId: number;
  session?: string;
  schoolId?: string;
  excludeTimetableId?: number;
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['timetable', 'check-clash', params],
    queryFn: () => classService.checkTimetableClash(params),
    enabled: options?.enabled ?? (!!params.teacherId && !!params.dayOfWeek && !!params.periodId),
  });
}
