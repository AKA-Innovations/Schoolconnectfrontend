'use client';

import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useTeacherList } from '@/hooks/useTeachers';
import { Loader2, UserCheck } from 'lucide-react';

interface TeacherSelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  /** If editing an existing class, pass the currently selected teacher id to always include them in the list */
  currentTeacherId?: string;
  className?: string;
}

export function TeacherSelectDropdown({
  value,
  onChange,
  currentTeacherId,
  className,
}: TeacherSelectDropdownProps) {
  const { schoolId } = useAuthStore();

  const { data, isLoading } = useTeacherList({
    schoolId: schoolId ?? '',
    pageSize: 200,
  });

  // Show teachers who are NOT class teachers, plus the currently assigned one (if editing)
  const eligibleTeachers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(
      (t) => !t.isClassTeacher || t.id === currentTeacherId
    );
  }, [data?.data, currentTeacherId]);

  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
        Class Teacher
      </Label>

      {isLoading ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-muted/10 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading teachers…
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring focus:border-ring appearance-none cursor-pointer"
        >
          <option value="">— None (unassigned) —</option>
          {eligibleTeachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
              {t.employeeId ? ` (${t.employeeId})` : ''}
              {t.isClassTeacher ? ' ✓ assigned' : ''}
            </option>
          ))}
        </select>
      )}

      {!isLoading && eligibleTeachers.length === 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
          <UserCheck className="h-3.5 w-3.5" />
          All teachers are already assigned as class teachers.
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">
        Only teachers not yet assigned as a class teacher are shown.
      </p>
    </div>
  );
}
