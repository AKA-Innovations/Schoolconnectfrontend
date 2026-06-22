'use client';

import React from 'react';
import { ResultMonitoring } from '@/components/admin/exams/ResultMonitoring';
import { CURRENT_SESSION } from '@/lib/constants';

export default function TeacherResultsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ResultMonitoring session={CURRENT_SESSION} />
    </div>
  );
}
