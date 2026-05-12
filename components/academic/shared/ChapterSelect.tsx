'use client';

import React from 'react';
import { useSubjectChapters } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';

interface Props {
  className?: string;
  subjectId?: string; // Subject Option ID
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export const ChapterSelect = ({ className, subjectId, value, onChange, error, disabled }: Props) => {
  const { data: chapters = [], isLoading } = useSubjectChapters(subjectId, CURRENT_SESSION);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Chapter *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading || !className}
        className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="">
          {isLoading ? 'Loading chapters...' : !className ? 'Select assignment first' : '— Select Chapter —'}
        </option>
        {chapters.map((ch) => (
          <option key={ch.id} value={String(ch.id)}>
            {ch.sequenceNo}. {ch.chapterName}
          </option>
        ))}
        {!isLoading && className && chapters.length === 0 && (
          <option disabled>No chapters found</option>
        )}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
