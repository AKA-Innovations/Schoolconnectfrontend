'use client';

import React from 'react';
import { useSubjectDetails } from '@/hooks/useClasses';
import { useAuthStore } from '@/store/authStore';
import { CURRENT_SESSION } from '@/lib/constants';
import type { SubjectDetail } from '@/types/class.types';

interface AssignmentValue {
  className: string;
  sectionName: string;
  subjectId: string; // Mapping ID
  teacherId: string;
  classId: number;
  classSectionId: number;
  subjectDtlsId: number;
}

interface Props {
  value: string; // "className|sectionName|subjectId"
  onChange: (val: string, detail: AssignmentValue | null) => void;
  error?: string;
}

export const AssignmentSelector = ({ value, onChange, error }: Props) => {
  const user = useAuthStore((s) => s.user);
  // If coordinator or admin, fetch all assignments for the school. If teacher, fetch only theirs.
  const isPowerUser = user?.role === 'subject_coordinator' || user?.role === 'school_admin' || user?.role === 'principal';
  const { data: allSubjectDetails = [], isLoading } = useSubjectDetails(
    isPowerUser ? undefined : user?.id, 
    'all'
  );

  const myAssignments = allSubjectDetails;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onChange('', null);
      return;
    }

    const [className, sectionName, subjectId] = val.split('|');
    // Find the actual assignment to get the correct IDs
    const selected = allSubjectDetails.find((sd) => sd.id === subjectId);
    
    onChange(val, {
      className,
      sectionName,
      subjectId,
      teacherId: selected?.teacherId || user?.id || '',
      classId: selected?.classId || 0,
      classSectionId: selected?.classDtlsId || (selected as any)?.classSectionId || 0,
      subjectDtlsId: selected?.subjectDtlsId || (selected as any)?.subjectId || 0,
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Class / Section / Subject *
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={isLoading}
        className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="">— {isLoading ? 'Loading assignments...' : 'Select your class'} —</option>
        {myAssignments.map((sd) => (
          <option key={sd.id} value={`${sd.className}|${sd.sectionName}|${sd.id}`}>
            Class {sd.className}-{sd.sectionName} | {sd.subjectName} ({sd.session})
          </option>
        ))}
        {!isLoading && myAssignments.length === 0 && (
          <option disabled>No assignments found for this session</option>
        )}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
