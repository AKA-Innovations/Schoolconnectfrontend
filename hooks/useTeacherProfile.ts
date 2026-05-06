import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { teacherService } from '../services/teacher.service';

/**
 * Hook to ensure the teacher's profile is synchronized with the backend.
 * This is crucial for class-teacher specific features where roles might not
 * be fully populated in the initial auth token/session.
 */
export function useTeacherProfile() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user?.id || !token) return;

    // Only sync if the current user profile might be stale (e.g., missing sub-roles)
    // or if we are on a page that explicitly requires high-integrity role data.
    const syncProfile = async () => {
      setIsSyncing(true);
      try {
        const updatedTeacher = await teacherService.getTeacherById(user.id);
        // Persist the updated teacher into the auth store
        setAuth({ user: updatedTeacher as any, token });
      } catch (err) {
        console.error('Teacher Profile Sync Error:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    syncProfile();
  }, [user?.id, token, setAuth]);

  return {
    user,
    isClassTeacher: user?.isClassTeacher ?? false,
    assignedClass: user?.classTeacherClass ?? null,
    isSyncing,
  };
}
