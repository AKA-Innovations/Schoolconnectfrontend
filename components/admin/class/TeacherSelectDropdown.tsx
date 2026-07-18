'use client';

import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { useAvailableClassTeachers, useTeacherBasicDetails } from '@/hooks/useTeachers';
import { Loader2 } from 'lucide-react';
import { CURRENT_SESSION } from '@/lib/constants';

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
  // Fetch available class teachers for the session
  const { data, isLoading } = useAvailableClassTeachers(CURRENT_SESSION);

  // Fetch current class teacher details if editing
  const { data: currentTeacherRes } = useTeacherBasicDetails(currentTeacherId ?? '');
  const currentTeacher = currentTeacherRes?.data ?? currentTeacherRes;

  const eligibleTeachers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((t: any) => t.teacherId !== currentTeacherId);
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
          
          {currentTeacherId && (
            <option value={currentTeacherId}>
              {currentTeacher
                ? `${currentTeacher.firstName} ${currentTeacher.lastName} (Current)`
                : 'Loading current teacher…'}
            </option>
          )}

          {eligibleTeachers.map((t: any) => (
            <option key={t.teacherId} value={t.teacherId}>
              {t.teacherName}
            </option>
          ))}
        </select>
      )}

      <p className="text-[11px] text-muted-foreground">
        Only available teachers who are not already a Principal, Coordinator, or Class Teacher are shown.
      </p>
    </div>
  );
}
