import React from 'react';
import { ResultMonitoring } from '@/components/admin/exams/ResultMonitoring';
import { CURRENT_SESSION } from '@/lib/constants';

export default function ResultMonitoringPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading...</div>}>
      <ResultMonitoring session={CURRENT_SESSION} />
    </React.Suspense>
  );
}
