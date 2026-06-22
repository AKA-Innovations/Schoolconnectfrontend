'use client';

import React from 'react';
import { useSubjectTopics } from '@/hooks/useAcademic';
import { CURRENT_SESSION } from '@/lib/constants';

interface Props {
  chapterId?: string | number;
  subjectId?: string | number;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export const TopicSelect = ({ chapterId, subjectId, value, onChange, error, disabled }: Props) => {
  const { data: topics = [], isLoading } = useSubjectTopics(chapterId, subjectId, CURRENT_SESSION);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Topic *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading || !chapterId}
        className="w-full h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="">
          {isLoading ? 'Loading topics...' : !chapterId ? 'Select chapter first' : '— Select Topic —'}
        </option>
        {topics.map((tp) => (
          <option key={tp.id} value={String(tp.id)}>
            {tp.sequenceNo}. {tp.topicName}
          </option>
        ))}
        {!isLoading && chapterId && topics.length === 0 && (
          <option disabled>No topics found</option>
        )}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
