'use client';

import React from 'react';
import { MarksEntryManager } from '@/components/admin/exams/MarksEntryManager';
import { CURRENT_SESSION } from '@/lib/constants';

export default function ResultEntryPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <MarksEntryManager session={CURRENT_SESSION} />
    </div>
  );
}
