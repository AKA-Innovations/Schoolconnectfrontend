'use client';

import React from 'react';
import { ResultMonitoring } from '@/components/admin/exams/ResultMonitoring';
import { CURRENT_SESSION } from '@/lib/constants';

export default function TeacherResultsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <React.Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading...</div>}>
        <ResultMonitoring session={CURRENT_SESSION} />
      </React.Suspense>
    </div>
  );
}
