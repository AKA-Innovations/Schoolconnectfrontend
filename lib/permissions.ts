import { useAuthStore } from '@/store/authStore';

export interface TeacherRoles {
  isPrincipal: boolean;
  isCoordinator: boolean;
  isClassTeacher: boolean;
  isSubjectTeacher: boolean;
}

/**
 * Hook that returns the teacher sub-role flags stored on the user object.
 * Falls back to all-false if the user is not a teacher or data is missing.
 */
export function useTeacherRoles(): TeacherRoles {
  const user = useAuthStore((s) => s.user);
  return {
    isPrincipal: (user as any)?.isPrincipal ?? false,
    isCoordinator: (user as any)?.isCoordinator ?? false,
    isClassTeacher: (user as any)?.isClassTeacher ?? false,
    isSubjectTeacher: (user as any)?.isSubjectTeacher ?? false,
  };
}

/**
 * Check whether the current user has any of the given teacher sub-roles.
 */
export function useHasTeacherRole(...roles: (keyof TeacherRoles)[]): boolean {
  const teacherRoles = useTeacherRoles();
  return roles.some((r) => teacherRoles[r]);
}
